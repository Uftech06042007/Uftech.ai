// All functions here are impure (Math.random) and must only ever run
// client-side, after mount — never during SSR/hydration — to avoid
// hydration mismatches. Components call these inside useEffect.

export function rnd(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/* ---------- page-wide ambient background ---------- */

function hexOutlineSVG(w: number, h: number, count: number): string {
  const uid = Math.random().toString(36).slice(2, 8);
  let shapes = "";
  for (let i = 0; i < count; i++) {
    const cx = rnd(0, w),
      cy = rnd(0, h),
      r = rnd(Math.min(w, h) * 0.07, Math.min(w, h) * 0.18);
    const pts = [
      [cx, cy - r],
      [cx + r * 0.87, cy - r / 2],
      [cx + r * 0.87, cy + r / 2],
      [cx, cy + r],
      [cx - r * 0.87, cy + r / 2],
      [cx - r * 0.87, cy - r / 2],
    ]
      .map((p) => p.map((n) => n.toFixed(1)).join(","))
      .join(" ");
    shapes += `<polygon points="${pts}" fill="none" stroke="color-mix(in srgb, var(--ink) 7%, transparent)" stroke-width="1"></polygon>`;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="fr${uid}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".6" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="mk${uid}"><rect width="${w}" height="${h}" fill="url(#fr${uid})"/></mask></defs>
    <g mask="url(#mk${uid})">${shapes}</g>
  </svg>`;
}

// The single, static background wash used behind every section — a faint,
// neutral-toned dot grid with slowly drifting hex-line outlines. No orange,
// no filled shapes — just texture.
export function ambientField(w: number, h: number): string {
  return `<div class="fdot" style="position:absolute;inset:0"></div>${hexOutlineSVG(w, h, 5).replace(
    "<svg ",
    '<svg style="position:absolute;inset:0;animation:drift 18s ease-in-out infinite" '
  )}`;
}
