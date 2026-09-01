import { cookies } from "next/headers";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ATTRIBUTION_LABELS: Record<string, string> = {
  referrer: "Referrer",
  landingPage: "Landing page",
  utm_source: "UTM source",
  utm_medium: "UTM medium",
  utm_campaign: "UTM campaign",
  utm_term: "UTM term",
  utm_content: "UTM content",
};

export interface LeadInput {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
}

/** Where the lead came from, as human-readable lines for the notification email. */
function attributionLines(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Record<string, string>;
    return Object.entries(data).map(([k, v]) => `${ATTRIBUTION_LABELS[k] ?? k}: ${v}`);
  } catch {
    return [];
  }
}

// Links this submission back to the anonymous Visitor row created when this
// same browser accepted cookies, if one still exists. A stale/tampered
// cookie just means the lead is saved unlinked — never blocks the save.
async function persistLead(lead: LeadInput, visitorId: string | undefined) {
  try {
    const visitor = visitorId
      ? await prisma.visitor.findUnique({ where: { visitorId } })
      : null;

    // One lead per visitor cookie — a repeat submission from a browser
    // that already converted is a duplicate, not a new inquiry.
    if (visitor) {
      const alreadyConverted = await prisma.lead.findFirst({
        where: { visitorId: visitor.visitorId },
      });
      if (alreadyConverted) return;
    }

    await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        company: lead.company || null,
        topic: lead.topic,
        message: lead.message,
        visitorId: visitor?.visitorId,
      },
    });

    if (visitor) {
      await prisma.visitor.update({
        where: { visitorId: visitor.visitorId },
        data: { convertedAt: new Date() },
      });
    }
  } catch (err) {
    console.error("Failed to persist lead", err);
  }
}

async function emailLead(lead: LeadInput, attribution: string[], source: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return false;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "UFTECH.AI Website <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL ?? "info@uftech.com",
    replyTo: lead.email,
    subject: `${lead.topic} — inquiry from ${lead.name}`,
    text: [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Company: ${lead.company || "—"}`,
      `What can we help with: ${lead.topic}`,
      `Source: ${source}`,
      "",
      lead.message,
      ...(attribution.length ? ["", "How they found us:", ...attribution.map((l) => `  ${l}`)] : []),
    ].join("\n"),
  });

  if (error) {
    console.error("Failed to send lead notification", error);
    return false;
  }
  return true;
}

/**
 * Save a lead and notify the team. Shared by the contact form and the chatbot so
 * both honour the same dedupe, attribution and delivery rules.
 *
 * Storage happens first and independently of the email: if Resend is down we
 * still keep the lead rather than losing it with the failed send.
 */
export async function submitLead(
  lead: LeadInput,
  source: "contact form" | "chatbot",
): Promise<{ emailed: boolean }> {
  const cookieStore = await cookies();
  const attribution = attributionLines(cookieStore.get("uft_attribution")?.value);

  await persistLead(lead, cookieStore.get("uft_visitor_id")?.value);
  const emailed = await emailLead(lead, attribution, source);

  return { emailed };
}
