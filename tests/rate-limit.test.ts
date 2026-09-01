import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit, rateLimitConvertedVisitor } from "@/lib/rate-limit";

function req(ip: string): Request {
  return new Request("http://localhost/api/chat", {
    headers: { "x-forwarded-for": ip },
  });
}

// Turn the limiter on with a small, test-friendly budget.
function enable(max = 2, windowMs = 1000) {
  vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
  vi.stubEnv("CHAT_RATE_LIMIT_MAX", String(max));
  vi.stubEnv("CHAT_RATE_LIMIT_WINDOW_MS", String(windowMs));
}

const PASS = { limited: false, retryAfterSeconds: 0 };

describe("rateLimit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("lets requests through below the limit", () => {
    enable(3, 1000);
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(req("1.2.3.4"))).toEqual(PASS);
    }
  });

  it("blocks once the window budget is spent", () => {
    enable(3, 1000);
    for (let i = 0; i < 3; i++) rateLimit(req("5.6.7.8"));
    const blocked = rateLimit(req("5.6.7.8"));
    expect(blocked.limited).toBe(true);
    // The whole window is still ahead of the visitor.
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("rolls the window over once old hits expire", () => {
    vi.useFakeTimers();
    enable(2, 1000);
    rateLimit(req("9.9.9.9"));
    rateLimit(req("9.9.9.9"));
    expect(rateLimit(req("9.9.9.9")).limited).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(rateLimit(req("9.9.9.9"))).toEqual(PASS);
  });

  it("tracks visitors independently by IP", () => {
    enable(2, 1000);
    rateLimit(req("10.0.0.1"));
    rateLimit(req("10.0.0.1"));
    expect(rateLimit(req("10.0.0.2")).limited).toBe(false);
    expect(rateLimit(req("10.0.0.1")).limited).toBe(true);
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "1");
    const r = new Request("http://localhost/api/chat", {
      headers: { "x-real-ip": "10.1.1.1" },
    });
    expect(rateLimit(r).limited).toBe(false);
    expect(rateLimit(r).limited).toBe(true);
  });

  it("passes everything when explicitly disabled", () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "false");
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(req("10.2.2.2"))).toEqual(PASS);
    }
  });

  it("defaults to off outside production", () => {
    // NODE_ENV is "test" under vitest, so the default is off.
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(req("10.3.3.3"))).toEqual(PASS);
    }
  });

  it("defaults to on when NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "1");
    const first = rateLimit(req("10.4.4.4"));
    expect(first).toEqual(PASS);
    // A second request comes straight back with limited:true.
    expect(rateLimit(req("10.4.4.4")).limited).toBe(true);
  });

  it("falls back to sane limits when env values are nonsense", () => {
    vi.stubEnv("CHAT_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_RATE_LIMIT_MAX", "banana");
    vi.stubEnv("CHAT_RATE_LIMIT_WINDOW_MS", "-7");
    // Defaults apply: 30 requests per minute.
    for (let i = 0; i < 30; i++) {
      expect(rateLimit(req("10.5.5.5")).limited).toBe(false);
    }
    expect(rateLimit(req("10.5.5.5")).limited).toBe(true);
  });
});

describe("rateLimitConvertedVisitor", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("trips the burst cap independently of the sustained cap", () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_BURST_MAX", "3");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_BURST_WINDOW_MS", "60000");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "10");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_WINDOW_MS", "3600000");

    for (let i = 0; i < 3; i++) {
      expect(rateLimitConvertedVisitor("visitor-burst").limited).toBe(false);
    }
    const blocked = rateLimitConvertedVisitor("visitor-burst");
    expect(blocked.limited).toBe(true);
    expect(blocked.reason).toBe("burst");
  });

  it("trips the sustained cap once the burst window has rolled over enough times", () => {
    vi.useFakeTimers();
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "true");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_BURST_MAX", "1");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_BURST_WINDOW_MS", "1000");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_MAX", "2");
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_WINDOW_MS", "3600000");

    // One request per burst window, spaced out so burst never trips —
    // only the sustained cap of 2 across the (much longer) hour window can.
    expect(rateLimitConvertedVisitor("visitor-sustained").limited).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(rateLimitConvertedVisitor("visitor-sustained").limited).toBe(false);
    vi.advanceTimersByTime(1000);
    const blocked = rateLimitConvertedVisitor("visitor-sustained");
    expect(blocked.limited).toBe(true);
    expect(blocked.reason).toBe("sustained");

    vi.useRealTimers();
  });

  it("passes everything when disabled", () => {
    vi.stubEnv("CHAT_CONVERTED_RATE_LIMIT_ENABLED", "false");
    for (let i = 0; i < 20; i++) {
      expect(rateLimitConvertedVisitor("visitor-disabled").limited).toBe(false);
    }
  });
});