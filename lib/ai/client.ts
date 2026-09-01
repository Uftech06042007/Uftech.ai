import Anthropic from "@anthropic-ai/sdk";

/**
 * The endpoint is Anthropic-compatible but is not necessarily Anthropic — today it
 * points at DeepSeek. Both the base URL and the model come from env so switching
 * provider is a config change, not a code change.
 *
 * Consequence: never send provider-specific parameters (`thinking`,
 * `output_config.effort`, task budgets, beta headers) — the compatibility layer
 * may reject them. See AGENTS.md for the full contract.
 */
export function getAiClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not configured");
    return null;
  }
  return new Anthropic({
    apiKey,
    // Undefined falls back to the SDK default (api.anthropic.com).
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

export function getModel(): string {
  return process.env.AI_MODEL || "claude-sonnet-5";
}

// The model emits reasoning blocks unprompted, and they are billed against
// max_tokens — too small a budget yields a reply that is all reasoning and no
// answer. Keep this generous even though visitor-facing replies are short.
export const MAX_TOKENS = 2048;

// A bounded loop: model turn → tool call → model turn. Four iterations is ample
// for one capture and stops a misbehaving model from spinning.
export const MAX_TOOL_ITERATIONS = 4;

// Cap history sent upstream so cost per request stays bounded.
export const MAX_HISTORY_MESSAGES = 20;
