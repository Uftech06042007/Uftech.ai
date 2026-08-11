"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CONTACT_HELP_OPTIONS } from "@/lib/data";
import { sendContactMessage, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn primary" type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send message →"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState);

  return (
    <form className="cform" action={formAction}>
      <label className="ffield">
        <span className="mono flabel">Name</span>
        <input type="text" name="name" required />
      </label>
      <label className="ffield">
        <span className="mono flabel">Email</span>
        <input type="email" name="email" required />
      </label>
      <label className="ffield">
        <span className="mono flabel">Company</span>
        <input type="text" name="company" />
      </label>
      <label className="ffield">
        <span className="mono flabel">What can we help with?</span>
        <select name="help" defaultValue={CONTACT_HELP_OPTIONS[0]}>
          {CONTACT_HELP_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="ffield ffield-wide">
        <span className="mono flabel">Tell us more</span>
        <textarea rows={5} name="message" required />
      </label>
      <SubmitButton />
      {state.status === "success" && (
        <p className="fnote">Thanks — we&apos;ll be in touch within one business day.</p>
      )}
      {state.status === "error" && <p className="fnote fnote-error">{state.message}</p>}
    </form>
  );
}
