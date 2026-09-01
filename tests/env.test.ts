import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnv } from "@/lib/env";

const REQUIRED = {
  NEXT_PUBLIC_SITE_URL: "https://uftech.ai",
  RESEND_API_KEY: "re_test",
  CONTACT_TO_EMAIL: "info@uftech.com",
  ANTHROPIC_API_KEY: "sk-test",
  DATABASE_URL: "postgresql://user:pass@host:5432/db",
};

function stubAllRequired() {
  for (const [key, value] of Object.entries(REQUIRED)) vi.stubEnv(key, value);
}

describe("validateEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("throws in production when a required variable is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    stubAllRequired();
    vi.stubEnv("DATABASE_URL", "");

    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });

  it("does not throw in production once every required variable is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    stubAllRequired();

    expect(() => validateEnv()).not.toThrow();
  });

  it("only warns outside production when variables are missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // NODE_ENV is "test" under vitest — nothing stubbed as required.

    expect(() => validateEnv()).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("warns when NEXT_PUBLIC_SITE_URL still points at localhost in production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    stubAllRequired();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    validateEnv();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("localhost"));
  });
});
