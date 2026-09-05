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
  return (
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
      /* 86KB plus a webfont for a card that is usually below the fold. */
      loading="lazy"
    />
  );
}
