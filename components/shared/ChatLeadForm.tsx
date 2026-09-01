"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT_HELP_OPTIONS } from "@/lib/data";

export interface LeadPrefill {
  name?: string;
  email?: string;
  company?: string;
  topic?: string;
  message?: string;
}

type FieldName = "name" | "company" | "email" | "topic" | "message";

interface Field {
  name: FieldName;
  question: string;
  placeholder: string;
  kind: "text" | "email" | "select" | "textarea";
  optional?: boolean;
}

// Asked one at a time, in the order a person would volunteer them.
const FIELDS: Field[] = [
  { name: "name", question: "What's your name?", placeholder: "Your name", kind: "text" },
  {
    name: "company",
    question: "Which company are you with?",
    placeholder: "Company name",
    kind: "text",
    optional: true,
  },
  {
    name: "email",
    question: "What email should we reply to?",
    placeholder: "you@company.com",
    kind: "email",
  },
  {
    name: "topic",
    question: "What's this about?",
    placeholder: "",
    kind: "select",
  },
  {
    name: "message",
    question: "Anything else we should know?",
    placeholder: "A line or two about what you need",
    kind: "textarea",
    optional: true,
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChatLeadForm({
  prefill,
  onDone,
}: {
  prefill: LeadPrefill;
  /** Reports the outcome; the parent renders the confirmation and retires the form. */
  onDone: (outcome: "sent" | "failed", firstName: string) => void;
}) {
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: prefill.name?.trim() ?? "",
    company: prefill.company?.trim() ?? "",
    email: prefill.email?.trim() ?? "",
    topic: prefill.topic?.trim() || CONTACT_HELP_OPTIONS[0],
    message: prefill.message?.trim() ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Skip anything the assistant already gathered, so nobody is asked twice.
  // Topic is excluded — it always has a default, so it is only worth asking
  // when the assistant couldn't infer one.
  const steps = useMemo(
    () =>
      FIELDS.filter((f) => {
        if (f.name === "topic") return !prefill.topic?.trim();
        return !prefill[f.name]?.trim();
      }),
    [prefill],
  );

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];

  useEffect(() => {
    inputRef.current?.focus();
  }, [stepIdx]);

  // Nothing left to ask — everything arrived pre-filled.
  const allAnswered = stepIdx >= steps.length;

  const submit = async (final: Record<FieldName, string>) => {
    setSending(true);
    setError(null);
    const firstName = final.name.trim().split(/\s+/)[0] ?? "";
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });
      if (!res.ok) {
        // A validation rejection is recoverable — keep the form up so they can fix it.
        const body: { error?: string } = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again.");
        setSending(false);
        return;
      }
      onDone("sent", firstName);
    } catch {
      onDone("failed", firstName);
    } finally {
      setSending(false);
    }
  };

  const advance = () => {
    if (!step) return;
    const value = values[step.name].trim();

    if (!value && !step.optional) {
      setError("This one's needed.");
      return;
    }
    if (step.name === "email" && value && !EMAIL_RE.test(value)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);

    const next = stepIdx + 1;
    if (next >= steps.length) void submit(values);
    else setStepIdx(next);
  };

  const setValue = (v: string) => {
    if (!step) return;
    setValues((prev) => ({ ...prev, [step.name]: v }));
  };

  return (
    <div className="chatform">
      <div className="chatformtop">
        <div className="mono chatformkicker">[ Talk to the team ]</div>
        {steps.length > 0 && (
          <span className="mono chatformstep">
            {Math.min(stepIdx + 1, steps.length)}/{steps.length}
          </span>
        )}
      </div>

      {allAnswered ? (
        <>
          <p className="chatformq">Ready to send this over?</p>
          <button
            className="btn sm primary chatformsend"
            type="button"
            onClick={() => void submit(values)}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send to the team →"}
          </button>
        </>
      ) : (
        <>
          <p className="chatformq">
            {step.question}
            {step.optional && <span className="chatformopt"> — optional</span>}
          </p>

          {step.kind === "select" ? (
            <select
              className="chatformfield"
              value={values.topic}
              onChange={(e) => setValue(e.target.value)}
            >
              {CONTACT_HELP_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : step.kind === "textarea" ? (
            <textarea
              ref={(el) => {
                inputRef.current = el;
              }}
              className="chatformfield"
              rows={3}
              value={values[step.name]}
              placeholder={step.placeholder}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <input
              ref={(el) => {
                inputRef.current = el;
              }}
              className="chatformfield"
              type={step.kind}
              value={values[step.name]}
              placeholder={step.placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  advance();
                }
              }}
            />
          )}

          {error && <p className="chatformerr">{error}</p>}

          <div className="chatformactions">
            {stepIdx > 0 && (
              <button
                className="btn sm"
                type="button"
                onClick={() => {
                  setError(null);
                  setStepIdx(stepIdx - 1);
                }}
              >
                Back
              </button>
            )}
            <button className="btn sm primary" type="button" onClick={advance} disabled={sending}>
              {sending
                ? "Sending…"
                : stepIdx === steps.length - 1
                  ? "Send to the team →"
                  : step.optional && !values[step.name].trim()
                    ? "Skip →"
                    : "Next →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
