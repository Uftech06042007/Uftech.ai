"use client";

import { useEffect, useRef } from "react";

export default function CardVideo({ src, zoom = 1 }: { src: string; zoom?: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Belt-and-suspenders for autoplay: some browsers only honor a muted
    // autoplay if the property (not just the attribute) is set before
    // play() is requested, and silently reject the play() promise instead
    // of throwing — reject it explicitly so it never surfaces as an
    // unhandled rejection.
    el.muted = true;
    el.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="card-video"
      style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
}
