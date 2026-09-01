vi.mock("@/lib/leads", () => ({
  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  submitLead: vi.fn(async () => ({ emailed: true })),
}));

import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/lead/route";
import { submitLead } from "@/lib/leads";

const mockSubmit = vi.mocked(submitLead);

function leadReq(body: unknown, ip: string): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const VALID = {
  name: "Ada",
  email: "ada@example.com",
  company: "",
  topic: "General inquiry",
  message: "",
};

describe("POST /api/lead rate limiting", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockSubmit.mockClear();
  });

  it("delivers the first lead, then rejects repeats with 429", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "1");

    const first = await POST(leadReq(VALID, "10.0.0.61"));
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ ok: true, emailed: true });

    const blocked = await POST(leadReq(VALID, "10.0.0.61"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });

  it("has different budgets for different visitors", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "1");

    await POST(leadReq(VALID, "10.0.0.70")); // 10.0.0.70 spends its budget
    const other = await POST(leadReq(VALID, "10.0.0.71"));
    expect(other.status).toBe(200);
    const same = await POST(leadReq(VALID, "10.0.0.70"));
    expect(same.status).toBe(429);
  });

  it("validates before delivering when not limited", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    const res = await POST(leadReq({ name: "Ada", email: "not-an-email" }, "10.0.0.62"));
    expect(res.status).toBe(400);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("delivers a valid lead when not limited", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    const res = await POST(leadReq(VALID, "10.0.0.63"));
    expect(await res.json()).toEqual({ ok: true, emailed: true });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][1]).toBe("chatbot");
  });

  it("stays open under repeated hits when disabled", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    for (let i = 0; i < 5; i++) {
      mockSubmit.mockClear();
      const res = await POST(leadReq(VALID, "10.0.0.64"));
      expect(res.status).toBe(200);
    }
  });
});