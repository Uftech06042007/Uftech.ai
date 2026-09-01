// Vars the site can genuinely run without — the corresponding feature just
// degrades (see AGENTS.md's "Grounding and guardrails" / lib/leads.ts), so
// they're never required, only ever recommended.
const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "ANTHROPIC_API_KEY",
  "DATABASE_URL",
] as const;

function isSet(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

/**
 * Fails the server startup in production when a variable the site cannot
 * meaningfully run without is missing — a misconfigured deploy should refuse
 * to come up, not silently serve a broken chatbot or a contact form that
 * eats every submission. Outside production this only warns, since local
 * dev and CI routinely run with partial config by design.
 */
export function validateEnv(): void {
  const missing = REQUIRED_IN_PRODUCTION.filter((name) => !isSet(name));

  if (missing.length > 0) {
    const message = `Missing required environment variable(s): ${missing.join(", ")}. See README.md#environment-variables.`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(`[env] ${message}`);
  }

  if (
    process.env.NODE_ENV === "production" &&
    isSet("NEXT_PUBLIC_SITE_URL") &&
    /^https?:\/\/localhost(:|\/|$)/.test(process.env.NEXT_PUBLIC_SITE_URL!.trim())
  ) {
    console.warn(
      "[env] NEXT_PUBLIC_SITE_URL is set to localhost in a production build — Open Graph tags, the sitemap and robots.txt will point at the wrong host.",
    );
  }
}
