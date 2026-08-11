"use client";

import { useEffect, useState } from "react";

export interface ThreeColors {
  pg: string;
  pg2: string;
  pg3: string;
  ink: string;
  acc: string;
  accSoft: string;
  line: string;
}

const FALLBACK: ThreeColors = {
  pg: "#242b31",
  pg2: "#1f262b",
  pg3: "#1a2126",
  ink: "#f1f3f5",
  acc: "#e2a06c",
  accSoft: "#e2a06c",
  line: "#3a4148",
};

// color-mix()/rgba() custom properties can't be fed straight to a Three.js
// material — this resolves each one to a flat color the browser has already
// computed, by reading it off a hidden probe element.
function resolve(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("div");
  probe.style.color = `var(${varName})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return value || fallback;
}

function readColors(): ThreeColors {
  return {
    pg: resolve("--pg", FALLBACK.pg),
    pg2: resolve("--pg2", FALLBACK.pg2),
    pg3: resolve("--pg3", FALLBACK.pg3),
    ink: resolve("--ink", FALLBACK.ink),
    acc: resolve("--acc", FALLBACK.acc),
    accSoft: resolve("--acc", FALLBACK.accSoft),
    line: resolve("--ink3", FALLBACK.line),
  };
}

// Tracks the site's light/dark theme so 3D scenes stay in sync with it.
export function useThreeColors(): ThreeColors {
  const [colors, setColors] = useState<ThreeColors>(FALLBACK);

  useEffect(() => {
    // Deliberate: colors depend on getComputedStyle, which only exists in
    // the browser — this can't run during SSR without mismatching.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(readColors());
    const root = document.documentElement;
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
