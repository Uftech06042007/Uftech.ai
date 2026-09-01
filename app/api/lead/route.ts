import { CONTACT_HELP_OPTIONS } from "@/lib/data";
import { EMAIL_RE, submitLead } from "@/lib/leads";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Submissions from the chat's inline form. Kept separate from the model: the
 * visitor's own typed details go straight to validation and delivery rather
 * than being relayed through a tool call.
 */
export async function POST(req: Request) {
  const { limited, retryAfterSeconds } = rateLimit(req);
  if (limited) {
    return Response.json(
      { error: "That's a lot all at once — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const company = String(data.company ?? "").trim();
  const topicRaw = String(data.topic ?? "").trim();
  const message = String(data.message ?? "").trim();

  if (!name || !email) {
    return Response.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const topic = CONTACT_HELP_OPTIONS.includes(topicRaw) ? topicRaw : "General inquiry";
  const { emailed } = await submitLead(
    {
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      company: company.slice(0, 200),
      topic,
      message: message.slice(0, 4000) || "(Sent from the site assistant without further detail.)",
    },
    "chatbot",
  );

  // The lead is stored either way — a failed notification is a delivery
  // problem, not a reason to tell the visitor their details were lost.
  return Response.json({ ok: true, emailed });
}
