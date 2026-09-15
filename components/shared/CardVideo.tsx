"use client";

import { useEffect, useRef, useState } from "react";

interface CardVideoProps {
  src: string;
  zoom?: number;
  /**
   * Still frame shown until the video can play, and the thing a visitor on a
   * slow link, a metered connection or reduced motion sees instead of it.
   *
   * On the hero this is the whole point. A `<video>` is an LCP candidate, and
   * without a poster the candidate is its first decoded frame — so Largest
   * Contentful Paint waited on a 2.7 MB download and measured 4.8s. With one,
   * the candidate is a 13 KB image.
   */
  poster?: string;
  /**
   * Set on a video that is on screen at first paint. It waits for the browser
   * to go idle before fetching anything, so the poster paints and the critical
   * requests finish before 2.7 MB of decoration joins the queue.
   *
   * Leave it off for a video that mounts in response to a click: the visitor
   * is already waiting for it, so it loads immediately.
   */
  deferred?: boolean;
}

/** Runs before anything is fetched, so a "no" here costs nothing. */
function prefersStill(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  // Non-standard and absent in Safari and Firefox, hence the loose read. When
  // a visitor has explicitly asked their browser to save data, a decorative
  // 2.7 MB loop is the first thing that should go.
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (conn?.saveData) return true;
  return conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
}

/** Next idle moment, or a deadline — whichever comes first. */
function whenIdle(run: () => void): () => void {
  const ric = (window as unknown as { requestIdleCallback?: typeof requestIdleCallback })
    .requestIdleCallback;
  if (ric) {
    const handle = ric(run, { timeout: 2500 });
    return () =>
      (
        window as unknown as { cancelIdleCallback?: typeof cancelIdleCallback }
      ).cancelIdleCallback?.(handle);
  }
  const t = window.setTimeout(run, 1200);
  return () => window.clearTimeout(t);
}

export default function CardVideo({ src, zoom = 1, poster, deferred = false }: CardVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // The `src` is withheld until this flips. An element with no source fetches
  // nothing, which `preload="none"` alone does not reliably guarantee.
  const [armed, setArmed] = useState(!deferred);

  useEffect(() => {
    if (armed) return;
    if (prefersStill()) return; // poster only, forever — by request
    return whenIdle(() => setArmed(true));
  }, [armed]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !armed) return;
    // Belt-and-suspenders for autoplay: some browsers only honor a muted
    // autoplay if the property (not just the attribute) is set before
    // play() is requested, and silently reject the play() promise instead
    // of throwing — reject it explicitly so it never surfaces as an
    // unhandled rejection.
    el.muted = true;
    el.play().catch(() => {});
  }, [armed]);

  return (
    <video
      ref={ref}
      className="card-video"
      style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
      // Omitted rather than set empty: a `src=""` resolves against the page URL
      // and re-requests the document itself.
      {...(armed ? { src } : {})}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload={deferred ? "none" : "auto"}
      // Decorative in every position it is used: the copy beside it says what
      // the page means, and a screen reader gains nothing from a silent loop.
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
