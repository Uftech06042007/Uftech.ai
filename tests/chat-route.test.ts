import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { visitor: { findUnique } } }));

import { POST } from "@/app/api/chat/route";

function chatReq(body: unknown, ip: string, visitorId?: string): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-forwarded-for": ip,
  };
  if (visitorId) headers.cookie = `uft_visitor_id=${visitorId}`;
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const VALID_BODY = { messages: [{ role: "user", content: "hello" }] };

describe("POST /api/chat rate limiting", () => {
  beforeEach(() => {
    // These tests exercise the guards, not the model: without a key any
    // request that passes the limiter bails to 503, fast and offline.
    vi.stubEnv("ANTHROPIC_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects with 429 + Retry-After once the window budget is spent", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "2");
    vi.stubEnv("CHAT_RATE_LIMIT_WINDOW_MS", "60000");

    const first = await POST(chatReq(VALID_BODY, "10.0.0.51"));
    const second = await POST(chatReq(VALID_BODY, "10.0.0.51"));
    expect(first.status).not.toBe(429);
    expect(second.status).not.toBe(429);

    const blocked = await POST(chatReq(VALID_BODY, "10.0.0.51"));
    expect(blocked.status).toBe(429);
    const retryAfter = Number(blocked.headers.get("retry-after"));
    expect(Number.isFinite(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("rate-limits before parsing the body", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "1");

    // First request spends the budget (and passes through to 503, no key).
    await POST(chatReq(VALID_BODY, "10.0.0.52"));
    const blocked = await POST(chatReq({ malformed: true }, "10.0.0.52"));
    expect(blocked.status).toBe(429);
  });

  it("returns 400 for a malformed body when not limited", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    const res = await POST(chatReq({ nope: true }, "10.0.0.53"));
    expect(res.status).toBe(400);
  });

  it("falls back to 503 when the model is unconfigured", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    const res = await POST(chatReq(VALID_BODY, "10.0.0.54"));
    expect(res.status).toBe(503);
  });

  it("stays open under repeated hits when rate limiting is disabled", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    for (let i = 0; i < 10; i++) {
      const res = await POST(chatReq({ nope: true }, "10.0.0.55"));
      expect(res.status).toBe(400);
    }
  });
});

describe("POST /api/chat converted-visitor throttle", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    // Isolate this from the general per-IP limiter so only the
    // converted-visitor window is under test.
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    findUnique.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throttles a visitor who already has a Lead on file", async () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "1");
    findUnique.mockResolvedValue({ convertedAt: new Date() });

    const first = await POST(chatReq(VALID_BODY, "10.0.1.1", "visitor-converted-a"));
    expect(first.status).not.toBe(429);

    const blocked = await POST(chatReq(VALID_BODY, "10.0.1.1", "visitor-converted-a"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  it("does not throttle a visitor cookie with no Lead on file", async () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "1");
    findUnique.mockResolvedValue({ convertedAt: null });

    for (let i = 0; i < 3; i++) {
      const res = await POST(chatReq(VALID_BODY, "10.0.1.2", "visitor-not-converted"));
      expect(res.status).not.toBe(429);
    }
  });

  it("does not query the database when there is no visitor cookie", async () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "1");

    await POST(chatReq(VALID_BODY, "10.0.1.3"));
    await POST(chatReq(VALID_BODY, "10.0.1.3"));
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("fails open when the conversion lookup errors", async () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "1");
    findUnique.mockRejectedValue(new Error("db unreachable"));

    const res = await POST(chatReq(VALID_BODY, "10.0.1.4", "visitor-db-down"));
    expect(res.status).not.toBe(429);
  });

  it("stays open when the converted-visitor limiter is disabled", async () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "false");
    findUnique.mockResolvedValue({ convertedAt: new Date() });

    for (let i = 0; i < 5; i++) {
      const res = await POST(chatReq(VALID_BODY, "10.0.1.5", "visitor-converted-b"));
      expect(res.status).not.toBe(429);
    }
  });
});