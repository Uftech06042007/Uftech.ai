"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A self-contained HTML reel dropped into a card's visual slot, in place of a
 * screen-capture video.
 *
 * It goes in an iframe rather than being inlined as JSX because these reels are
 * whole documents: they define `:root` tokens, a `*` box-sizing reset and
 * `html,body{height:100%}` of their own. Inlined, that would either fight the
 * site's stylesheet or have to be rewritten by hand every time the reel changes.
 * The iframe gives it its own document, its own cascade and its own fonts, and
 * the reel keeps working as a standalone page you can open on its own.
 *
 * The reel sizes itself: it authors at a fixed canvas and scales to whatever box
 * it lands in, measuring its own parent through a ResizeObserver. So this needs
 * to do nothing but fill the slot.
 */
export default function CardEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  /**
   * `loading="lazy"` was not enough. Chrome's lazy threshold scales with
   * connection speed and reaches thousands of pixels, so all three reels —
   * 157 KB of HTML plus a webfont each — were fetched within 300ms of
   * navigation, competing with the hero for a throttled link they had no
   * business being on. An observer defers them until they are genuinely near.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No support fallback: IntersectionObserver has been in every browser
    // since 2019, and a browser without it cannot run the reel's own
    // ResizeObserver or the WebGL on the rest of this page either.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setVisible(true);
        io.disconnect();
      },
      // Half a viewport of warning: enough for the reel to be running by the
      // time it is scrolled to, not so much that it loads on arrival.
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="card-embed-slot">
      {visible && (
        <iframe
          className="card-embed"
          src={src}
          title={title}
          /* A reel, not a control: nothing inside it is clickable, so swallowing
             pointer events would only cost the card its own hover and let the
             iframe eat a touch-scroll that started on top of it. Out of the tab
             order for the same reason — there is nothing in there to reach. */
          tabIndex={-1}
          /* First-party file, but it has no business reaching the parent document,
             so give it scripts and nothing else. Without allow-same-origin it runs
             in an opaque origin of its own. */
          sandbox="allow-scripts"
          loading="lazy"
        />
      )}
    </div>
  );
}
