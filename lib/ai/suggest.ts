import type Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS, SERVICES } from "@/lib/data";

const TOPICS = [...SERVICES.map((s) => s.t), ...PRODUCTS.map((p) => p.t)].join(", ");

const SYSTEM = `You write follow-up questions for a visitor chatting with UFTECH.AI, an enterprise AI company.

Given the last exchange, propose three questions the visitor might realistically ask next:
- Two that go deeper into what they just asked about.
- One that opens an adjacent area they haven't explored.

UFTECH.AI covers: ${TOPICS}, delivery stages from diagnosis through ongoing support, and industries including BFSI, healthcare, manufacturing and pharma.

Rules:
- Write each as the visitor would type it, first person, under 60 characters.
- Only suggest things UFTECH.AI can actually speak to.
- Never suggest asking for prices or timelines — those need a human.
- Reply with a JSON array of exactly three strings and nothing else.`;

/**
 * Best-effort contextual follow-ups, generated after the reply is already on
 * screen so it never delays the answer. Runs on the cheaper model — this is a
 * garnish, and a failure here must never surface to the visitor.
 */
export async function suggestFollowUps(
  client: Anthropic,
  lastUserMessage: string,
  assistantReply: string,
): Promise<string[]> {
  try {
    const response = await client.messages.create({
      model: process.env.AI_MODEL_FAST || process.env.AI_MODEL || "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Visitor asked: ${lastUserMessage}\n\nAssistant answered: ${assistantReply}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // The model may wrap the array in prose or a code fence despite instructions.
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end <= start) return [];

    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((s): s is string => typeof s === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 90)
      .slice(0, 3);
  } catch (err) {
    console.error("Follow-up suggestion generation failed", err);
    return [];
  }
}
