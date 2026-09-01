"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CONSENT_COOKIE = "uft_consent";
const ATTRIBUTION_COOKIE = "uft_attribution";
const VISITOR_COOKIE = "uft_visitor_id";
const CONSENT_MAX_AGE_DAYS = 365;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; samesite=lax`;
}

function captureAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {
    referrer: document.referrer || "direct",
    landingPage: window.location.pathname,
  };
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) attribution[key] = v;
  }
  return attribution;
}

// Best-effort — records the anonymous visitor in the database and stores
// the ID it's given in a cookie, so a later contact form submission from
// this same browser can be linked back to this visit.
async function persistVisitor(attribution: Record<string, string>) {
  try {
    const res = await fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attribution),
    });
    if (!res.ok) return;
    const data: { visitorId?: string } = await res.json();
    if (data.visitorId) setCookie(VISITOR_COOKIE, data.visitorId, CONSENT_MAX_AGE_DAYS);
  } catch {
    // Not tracked this visit — the contact form will just go out unlinked.
  }
}

// No external event to subscribe to — consent only ever changes via this
// component's own button clicks, which are tracked through `dismissed`
// below instead of by re-subscribing.
function subscribe() {
  return () => {};
}
// Assume already-consented for the server-rendered/pre-hydration pass, so
// returning visitors don't see the banner flash in before hydration checks
// the real cookie.
function getServerSnapshot() {
  return true;
}
function getSnapshot() {
  return getCookie(CONSENT_COOKIE) !== null;
}

export default function CookieConsent() {
  const hasConsented = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const visible = !hasConsented && !dismissed;

  // Publish the banner's height so fixed-position UI in the same corner (the
  // chat launcher) can sit above it instead of being buried underneath.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty("--cookiebar-offset");
      return;
    }
    const apply = () => {
      const h = barRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--cookiebar-offset", `${h + 12}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--cookiebar-offset");
    };
  }, [visible]);

  const accept = () => {
    setCookie(CONSENT_COOKIE, "accepted", CONSENT_MAX_AGE_DAYS);
    // First-touch attribution — don't overwrite on later visits/accepts.
    if (!getCookie(ATTRIBUTION_COOKIE)) {
      const attribution = captureAttribution();
      setCookie(ATTRIBUTION_COOKIE, JSON.stringify(attribution), CONSENT_MAX_AGE_DAYS);
      void persistVisitor(attribution);
    }
    setDismissed(true);
  };

  const decline = () => {
    setCookie(CONSENT_COOKIE, "declined", CONSENT_MAX_AGE_DAYS);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="cookiebar" ref={barRef}>
      <p>
        We use cookies to improve your experience, analyze site traffic, and understand where our
        visitors come from. By clicking &quot;Accept&quot;, you consent to our use of cookies.
      </p>
      <div className="cookiebar-actions">
        <button className="btn sm" type="button" onClick={decline}>
          Decline
        </button>
        <button className="btn sm primary" type="button" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
