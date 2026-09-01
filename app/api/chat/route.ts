import type Anthropic from "@anthropic-ai/sdk";
import {
  MAX_HISTORY_MESSAGES,
  MAX_TOKENS,
  MAX_TOOL_ITERATIONS,
  getAiClient,
  getModel,
} from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { suggestFollowUps } from "@/lib/ai/suggest";
import { OPEN_LEAD_FORM, chatTools } from "@/lib/ai/tools";
import { CONTACT_HELP_OPTIONS } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitConvertedVisitor } from "@/lib/rate-limit";

// A reply can span several tool-loop iterations of a streaming model, which
// outlives the 10s default a serverless host gives a function. 60s is the
// ceiling every Vercel plan allows, so this is portable as well as generous.
export const maxDuration = 60;

const RATE_LIMITED_ERROR =
  "You're sending messages a bit fast — hang on a moment and try again.";

const CONVERTED_BURST_RATE_LIMITED_ERROR =
  "You're chatting a little faster than we can keep up with — give it about a minute and try again. If it's urgent, email info@uftech.com.";

const CONVERTED_SUSTAINED_RATE_LIMITED_ERROR =
  "Looks like we've already got your details on file, and you've reached the chat limit for now — the team will follow up soon. If it's urgent, email info@uftech.com.";

const FALLBACK_ERROR =
  "Sorry — I'm having trouble responding right now. Please email info@uftech.com and the team will pick it up.";

/** Reads the visitor cookie straight off the request — no Next.js request-scope needed. */
function getVisitorId(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === "uft_visitor_id") {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

/** Fails open: a lookup error means "not converted", never a broken conversation. */
async function isConvertedVisitor(visitorId: string): Promise<boolean> {
  try {
    const visitor = await prisma.visitor.findUnique({
      where: { visitorId },
      select: { convertedAt: true },
    });
    return Boolean(visitor?.convertedAt);
  } catch (err) {
    console.error("Failed to check visitor conversion status", err);
    return false;
  }
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

/** Only user/assistant text survives — the system prompt is never client-supplied. */
function parseHistory(body: unknown): ClientMessage[] | null {
  if (!body || typeof body !== "object" || !("messages" in body)) return null;
  const raw = (body as { messages: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const messages: ClientMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const text = content.trim();
    if (text) messages.push({ role, content: text.slice(0, 4000) });
  }
  if (!messages.length) return null;
  return messages.slice(-MAX_HISTORY_MESSAGES);
}

/** Prefill for the inline form, from whatever the model already gathered. */
function readPrefill(input: unknown) {
  const data = (input ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max = 400) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const topic = str(data.topic);

  return {
    name: str(data.name, 200),
    email: str(data.email, 200),
    company: str(data.company, 200),
    topic: CONTACT_HELP_OPTIONS.includes(topic) ? topic : "",
    message: str(data.message, 2000),
  };
}

export async function POST(req: Request) {
  const { limited, retryAfterSeconds } = rateLimit(req);
  if (limited) {
    return Response.json(
      { error: RATE_LIMITED_ERROR },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const visitorId = getVisitorId(req);
  if (visitorId && (await isConvertedVisitor(visitorId))) {
    const converted = rateLimitConvertedVisitor(visitorId);
    if (converted.limited) {
      const error =
        converted.reason === "burst" ? CONVERTED_BURST_RATE_LIMITED_ERROR : CONVERTED_SUSTAINED_RATE_LIMITED_ERROR;
      return Response.json(
        { error },
        { status: 429, headers: { "Retry-After": String(converted.retryAfterSeconds) } },
      );
    }
  }

  const history = parseHistory(await req.json().catch(() => null));
  if (!history) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = getAiClient();
  if (!client) {
    return Response.json({ error: FALLBACK_ERROR }, { status: 503 });
  }

  const system = buildSystemPrompt();
  const model = getModel();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const lastUserMessage = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));

      let replyText = "";
      let formOpened = false;

      try {
        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
          const turn = client.messages.stream({
            model,
            max_tokens: MAX_TOKENS,
            system,
            tools: chatTools,
            messages,
          });

          // Forward text only. The model also emits reasoning blocks, which are
          // internal and must never reach the visitor.
          for await (const event of turn) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              replyText += event.delta.text;
              send({ type: "text", value: event.delta.text });
            }
          }

          const reply = await turn.finalMessage();
          if (reply.stop_reason !== "tool_use") break;

          const toolUses = reply.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
          );
          if (!toolUses.length) break;

          // Echo the assistant turn back unchanged — reasoning blocks included —
          // so the provider can match the tool results to their calls.
          messages.push({ role: "assistant", content: reply.content });

          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const toolUse of toolUses) {
            if (toolUse.name === OPEN_LEAD_FORM) {
              formOpened = true;
              send({ type: "form", prefill: readPrefill(toolUse.input) });
              results.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content:
                  "The form is now open in the chat and will confirm delivery itself. Say one short line telling them to fill it in — do not ask for their details and do not say anything has been sent yet.",
              });
            } else {
              results.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: `Unknown tool: ${toolUse.name}`,
                is_error: true,
              });
            }
          }

          messages.push({ role: "user", content: results });
        }

        // Suggestions come after the reply so they never delay it, and are
        // pointless while the visitor is working through the form.
        if (!formOpened && replyText.trim()) {
          const suggestions = await suggestFollowUps(client, lastUserMessage, replyText);
          if (suggestions.length) send({ type: "suggestions", value: suggestions });
        }
      } catch (err) {
        console.error("Chat request failed", err);
        send({ type: "error", value: FALLBACK_ERROR });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
