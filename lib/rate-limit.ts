/**
 * Sliding-window rate limiting for the chatbot endpoints. Two independent
 * limiters share the same window mechanics but guard different things:
 *
 * 1. `rateLimit` — a general per-IP guard on `/api/chat` and `/api/lead`,
 *    so a single misbehaving visitor can't hammer the paid LLM endpoint.
 *
 * | Variable                     | Purpose                                   | Default            |
 * | ---------------------------- | ----------------------------------------- | ------------------ |
 * | `CHAT_RATE_LIMIT_ENABLED`    | Force on (`true`) or off (`false`)        | `true` in prod,     |
 * |                              |                                           | `false` in dev      |
 * | `CHAT_RATE_LIMIT_MAX`        | Max requests per window, per visitor      | `30`               |
 * | `CHAT_RATE_LIMIT_WINDOW_MS`  | Window length in milliseconds             | `60000` (1 minute) |
 *
 * 2. `rateLimitConvertedVisitor` — a stricter, separate throttle applied only
 *    to visitors who already have a Lead on file (see `Visitor.convertedAt`
 *    in `prisma/schema.prisma`). It exists to discourage repeated chatbot use
 *    after someone has already been captured as a lead, not to guard cost —
 *    the general limiter above already does that for everyone. Keyed by the
 *    `uft_visitor_id` cookie rather than IP, so it only affects the visitor
 *    who actually converted.
 *
 *    It's two independent windows, both checked on every request — a short
 *    "burst" cap and a longer "sustained" cap. Either can trip on its own: a
 *    visitor sending 4 messages in ten seconds hits the burst cap long before
 *    the sustained one, while a visitor sending one message every ten minutes
 *    never trips burst but eventually hits sustained.
 *
 * | Variable                                     | Purpose                                | Default              |
 * | --------------------------------------------- | --------------------------------------- | -------------------- |
 * | `CHAT_CONVERTED_RATE_LIMIT_ENABLED`           | Force on (`true`) or off (`false`)      | `true` in prod,       |
 * |                                                |                                          | `false` in dev        |
 * | `CHAT_CONVERTED_RATE_LIMIT_BURST_MAX`         | Max chat requests per burst window      | `3`                   |
 * | `CHAT_CONVERTED_RATE_LIMIT_BURST_WINDOW_MS`   | Burst window length in milliseconds     | `60000` (1 minute)    |
 * | `CHAT_CONVERTED_RATE_LIMIT_MAX`               | Max chat requests per sustained window  | `10`                  |
 * | `CHAT_CONVERTED_RATE_LIMIT_WINDOW_MS`         | Sustained window length in milliseconds | `3600000` (1 hour)    |
 *
 * When either `_ENABLED` flag is unset, production limits and development
 * does not — each environment opts in separately, and the flag exists to
 * override whichever default the deployment landed on.
 *
 * Both stores are in-memory. On a serverless deployment that makes them
 * per-instance rather than shared across cold starts — a coarse guard, not a
 * hard quota across all instances. Deliberately dependency-free and
 * fail-open: a rate limiting bug must never break the conversation (see the
 * failure philosophy in AGENTS.md).
 */

/** Timestamps of recent requests, oldest first, for one key. */
type Bucket = number[];

// Expired keys are swept periodically so a busy key can't grow its map
// without bound. Sweeps only run when a request actually passes the limiter.
const SWEEP_INTERVAL_MS = 60_000;

interface Limits {
  enabled: boolean;
  max: number;
  windowMs: number;
}

function readBool(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  return value === "true" || value === "1" || value === "yes" || value === "on";
}

/** A sliding-window counter over string keys, with its own isolated storage. */
function createWindow() {
  const hits = new Map<string, Bucket>();
  let lastSweep = 0;

  return function check(key: string, { max, windowMs }: Limits): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const bucket = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    // Insert before counting so the current request is part of the window's cost.
    bucket.push(now);
    hits.set(key, bucket);

    if (bucket.length > max) {
      return { allowed: false, retryAfterMs: bucket[0] + windowMs - now };
    }

    if (now - lastSweep > SWEEP_INTERVAL_MS) {
      lastSweep = now;
      for (const [k, b] of hits) {
        if (b.length === 0 || now - b[b.length - 1] >= windowMs) hits.delete(k);
      }
    }

    return { allowed: true, retryAfterMs: 0 };
  };
}

/** A stable key per visitor. First `x-forwarded-for` hop is the client. */
function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Parses a positive integer from env, falling back on anything absent, non-numeric or <= 0. */
function readPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function config(): Limits {
  return {
    enabled: readBool(process.env.CHAT_RATE_LIMIT_ENABLED) ?? process.env.NODE_ENV === "production",
    max: readPositiveInt(process.env.CHAT_RATE_LIMIT_MAX, 30),
    windowMs: readPositiveInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000),
  };
}

const checkGeneral = createWindow();

/**
 * Decide whether this request may proceed. When `limited` is true,
 * `retryAfterSeconds` is the suggested `Retry-After` for the 429 response.
 */
export function rateLimit(req: Request): { limited: boolean; retryAfterSeconds: number } {
  const limits = config();
  if (!limits.enabled) return { limited: false, retryAfterSeconds: 0 };

  const { allowed, retryAfterMs } = checkGeneral(clientKey(req), limits);
  return {
    limited: !allowed,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(retryAfterMs / 1000)),
  };
}

interface ConvertedLimits {
  enabled: boolean;
  burst: Limits;
  sustained: Limits;
}

function convertedConfig(): ConvertedLimits {
  const enabled =
    readBool(process.env.CHAT_CONVERTED_RATE_LIMIT_ENABLED) ?? process.env.NODE_ENV === "production";

  return {
    enabled,
    burst: {
      enabled,
      max: readPositiveInt(process.env.CHAT_CONVERTED_RATE_LIMIT_BURST_MAX, 3),
      windowMs: readPositiveInt(process.env.CHAT_CONVERTED_RATE_LIMIT_BURST_WINDOW_MS, 60_000),
    },
    sustained: {
      enabled,
      max: readPositiveInt(process.env.CHAT_CONVERTED_RATE_LIMIT_MAX, 10),
      windowMs: readPositiveInt(process.env.CHAT_CONVERTED_RATE_LIMIT_WINDOW_MS, 3_600_000),
    },
  };
}

const checkConvertedBurst = createWindow();
const checkConvertedSustained = createWindow();

/**
 * Stricter throttle for a visitor who already has a Lead on file, keyed by
 * their `uft_visitor_id` cookie. Independent of `rateLimit` — this is not a
 * cost guard, it's a "you've already reached out" nudge, so it's checked
 * only after the caller has confirmed the visitor converted.
 *
 * Both the burst and sustained windows see every request — they're separate
 * budgets, not a fallback chain — so whichever trips first is reported via
 * `reason`, and the caller can word the two cases differently.
 */
export function rateLimitConvertedVisitor(
  visitorId: string,
): { limited: boolean; retryAfterSeconds: number; reason?: "burst" | "sustained" } {
  const limits = convertedConfig();
  if (!limits.enabled) return { limited: false, retryAfterSeconds: 0 };

  const burst = checkConvertedBurst(visitorId, limits.burst);
  const sustained = checkConvertedSustained(visitorId, limits.sustained);

  if (!burst.allowed) {
    return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil(burst.retryAfterMs / 1000)), reason: "burst" };
  }
  if (!sustained.allowed) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil(sustained.retryAfterMs / 1000)),
      reason: "sustained",
    };
  }
  return { limited: false, retryAfterSeconds: 0 };
}
