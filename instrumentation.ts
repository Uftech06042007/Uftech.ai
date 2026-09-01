export async function register() {
  // Env validation touches process.env only — no Edge-incompatible APIs —
  // but it's still the kind of one-time startup check that belongs behind
  // this guard, per Next.js's own instrumentation conventions.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    validateEnv();
  }
}
