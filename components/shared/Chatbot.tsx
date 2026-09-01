"use client";

import { useEffect, useRef, useState } from "react";
import ChatLeadForm, { type LeadPrefill } from "@/components/shared/ChatLeadForm";
import ChatMarkdown from "@/components/shared/ChatMarkdown";
import Mascot, { type Mood } from "@/components/shared/Mascot";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING = `Hi — I can help you get a feel for what we do here. Ask me about:

- **Services** — agents, GenAI, copilots, automation
- **Products** — AI Talent & CRM, AI HRMS
- **How we work** — from first pilot through ongoing support

Or I can put you in touch with the team. What would you like to know?`;

const OPENING_PROMPTS = [
  "What AI services do you offer?",
  "How do you support what you build?",
  "I'd like someone to contact me",
];

// Shown after the contact form is done, when there is no reply to base
// generated suggestions on.
const FOLLOW_UP_PROMPTS = [
  "What products do you build?",
  "How does a project usually start?",
  "Which industries do you work with?",
];

// Gates the launcher's one-time reveal to a visitor's very first load — not
// every close of the panel back to the launcher. The rig owns the check; see
// useMascotRig's introOnceKey.
const INTRO_SEEN_KEY = "uftechai-mascot-intro-seen";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(OPENING_PROMPTS);
  const [form, setForm] = useState<LeadPrefill | null>(null);
  const [errored, setErrored] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pin to the newest content as replies stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, suggestions, form]);

  useEffect(() => {
    if (open && !form) inputRef.current?.focus();
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setSuggestions([]);
    // Asking something new abandons a half-finished form.
    setForm(null);
    setErrored(false);
    setBusy(true);

    const appendToLast = (chunk: string) =>
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: next[next.length - 1].content + chunk,
        };
        return next;
      });

    // Generated suggestions are best-effort; fall back so an answer is never
    // left without somewhere to go next.
    let gotSuggestions = false;
    let openedForm = false;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Drop the canned greeting — it isn't part of the real conversation.
        body: JSON.stringify({ messages: history.slice(1) }),
      });

      if (!res.ok) {
        // Every non-2xx from this endpoint (429 rate limited, 400 bad
        // request, 503 model unconfigured) carries a user-safe `error`
        // string — show it in place as the assistant's own reply rather
        // than a generic failure.
        const body: { error?: string } = await res.json().catch(() => ({}));
        setErrored(true);
        appendToLast(
          body.error ?? "Sorry — something went wrong. Please email info@uftech.com and the team will pick it up.",
        );
        return;
      }

      if (!res.body) throw new Error("Chat response had no body");

      // Newline-delimited JSON: one event per line, so a chunk may hold several
      // events and may split mid-line.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: {
            type?: string;
            value?: string | string[];
            prefill?: LeadPrefill;
          };
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          if (event.type === "text" && typeof event.value === "string") {
            appendToLast(event.value);
          } else if (event.type === "form") {
            openedForm = true;
            setForm(event.prefill ?? {});
          } else if (event.type === "suggestions" && Array.isArray(event.value)) {
            gotSuggestions = true;
            setSuggestions(event.value);
          } else if (event.type === "error" && typeof event.value === "string") {
            setErrored(true);
            appendToLast(event.value);
          }
        }
      }
    } catch {
      setErrored(true);
      appendToLast(
        "Sorry — something went wrong. Please email info@uftech.com and the team will pick it up.",
      );
    } finally {
      if (!gotSuggestions && !openedForm) setSuggestions(FOLLOW_UP_PROMPTS);
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  // Expression follows whatever the widget is actually doing. Ordered by
  // precedence: a failure outranks a success, which outranks in-flight work.
  const lastMessage = messages[messages.length - 1];
  const mood: Mood = errored
    ? "fear"
    : celebrating
      ? "love"
      : busy
        ? "thinking"
        : form
          ? "curious"
          : input.trim() || (lastMessage?.role === "assistant" && messages.length > 1)
            ? "curious"
            : "idle";

  if (!open) {
    return (
      <button
        className="chatfab"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the UFTECH.AI assistant"
      >
        <Mascot mood="exploring" variant="full" introOnceKey={INTRO_SEEN_KEY} />
      </button>
    );
  }

  return (
    <div className="chatpanel" role="dialog" aria-label="UFTECH.AI assistant">
      <div className="chathead">
        <Mascot mood={mood} variant="head" className="chatheadmascot" />
        <div className="chatheadtext">
          <div className="mono chatkicker">[ UFTECH.AI Assistant ]</div>
          <div className="chattitle">Ask about our services</div>
        </div>
        <button
          className="btn sm"
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
        >
          ✕
        </button>
      </div>

      <div className="chatlog" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chatmsg chatmsg-${m.role}`}>
            {m.content ? (
              m.role === "assistant" ? (
                <ChatMarkdown text={m.content} />
              ) : (
                m.content
              )
            ) : busy && i === messages.length - 1 ? (
              <span className="chatdots" />
            ) : null}
          </div>
        ))}

        {form && (
          <ChatLeadForm
            prefill={form}
            onDone={(outcome, firstName) => {
              // Retire the form and leave the outcome in the log as a normal
              // message, so the conversation (and its suggestions) can continue.
              setForm(null);
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content:
                    outcome === "sent"
                      ? `Thanks${firstName ? `, ${firstName}` : ""} — your details are with the team and they reply within one business day. Anything else you'd like to know?`
                      : "That didn't go through, sorry. Please email **info@uftech.com** and the team will pick it up.",
                },
              ]);
              setSuggestions(FOLLOW_UP_PROMPTS);
              if (outcome === "sent") {
                setCelebrating(true);
                window.setTimeout(() => setCelebrating(false), 4000);
              } else {
                setErrored(true);
              }
            }}
          />
        )}

        {!busy && !form && suggestions.length > 0 && (
          <div className="chatsuggest">
            <div className="mono chatsuggestlabel">Suggested</div>
            {suggestions.map((s) => (
              <button
                key={s}
                className="chatprompt"
                type="button"
                onClick={() => void send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chatinput">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          placeholder={form ? "Finish the form above…" : "Ask a question…"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
        />
        <button
          className="btn sm primary"
          type="button"
          onClick={() => void send(input)}
          disabled={busy || !input.trim()}
        >
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
