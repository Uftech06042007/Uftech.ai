"use client";

import { useEffect, useRef, useState } from "react";
import { ambientField } from "@/lib/art";

// The subtle, static page-wide background pattern behind Services/Products/
// Approach/Industries.
export default function FieldLayer() {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const paint = () => {
      const w = el.clientWidth || 900;
      const h = el.clientHeight || 500;
      setHtml(ambientField(w, h));
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return <div ref={ref} className="fieldlyr" dangerouslySetInnerHTML={{ __html: html }} />;
}
