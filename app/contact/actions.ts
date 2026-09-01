"use server";

import { CONTACT_HELP_OPTIONS } from "@/lib/data";
import { EMAIL_RE, submitLead } from "@/lib/leads";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const help = String(formData.get("help") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in your name, email and message." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const topic = CONTACT_HELP_OPTIONS.includes(help) ? help : "General inquiry";
  const { emailed } = await submitLead(
    { name, email, company, topic, message },
    "contact form",
  );

  if (!emailed) {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly instead.",
    };
  }

  return { status: "success" };
}
