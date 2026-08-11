"use server";

import { Resend } from "resend";
import { CONTACT_HELP_OPTIONS } from "@/lib/data";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly instead.",
    };
  }

  const resend = new Resend(apiKey);
  const topic = CONTACT_HELP_OPTIONS.includes(help) ? help : "General inquiry";

  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "UFTECH.AI Website <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL ?? "info@uftech.com",
    replyTo: email,
    subject: `${topic} — inquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "—"}`,
      `What can we help with: ${topic}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("Failed to send contact message", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly instead.",
    };
  }

  return { status: "success" };
}
