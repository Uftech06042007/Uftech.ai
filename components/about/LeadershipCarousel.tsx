"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { LEADERSHIP, type LeadershipMember } from "@/lib/data";

const AUTO_INTERVAL = 4200;

const LINKEDIN_PATH =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z";

// The zoomed photo is larger than its circular window, so it needs to be
// pinned to an edge rather than re-centered — centering a zoomed-in image
// just crops further into whatever was already at the middle.
function zoomWrapperStyle(m: LeadershipMember): CSSProperties {
  const size = `${(m.imgZoom ?? 1) * 100}%`;
  const anchor = m.imgAnchor ?? "center";
  if (anchor === "top") return { width: size, height: size, top: 0, left: "50%", transform: "translateX(-50%)" };
  if (anchor === "bottom") return { width: size, height: size, bottom: 0, left: "50%", transform: "translateX(-50%)" };
  return { width: size, height: size, top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
}

export default function LeadershipCarousel() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const go = (target: number) => {
    setIndex(((target % LEADERSHIP.length) + LEADERSHIP.length) % LEADERSHIP.length);
  };

  // A single long-lived timer (not reset by index changes) so autoplay
  // keeps a steady beat instead of restarting the clock on every click.
  useEffect(() => {
    const t = setInterval(() => go(indexRef.current + 1), AUTO_INTERVAL);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const card = cardRefs.current[index];
    const track = trackRef.current;
    if (!card || !track) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [index]);

  return (
    <div className="leadcarousel">
      <div className="leadrow">
      <button className="leadnav prev" onClick={() => go(index - 1)} aria-label="Previous leader">
        ‹
      </button>
      <div className="leadtrack" ref={trackRef}>
        {LEADERSHIP.map((m, i) => (
          <div
            key={m.name}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`leadcard${i === index ? " active" : ""}`}
            onClick={() => go(i)}
          >
            <div className="leadcard-top">
              <div className="leadphoto">
                <div className="leadphoto-zoom" style={zoomWrapperStyle(m)}>
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    sizes={`${Math.round(140 * (m.imgZoom ?? 1))}px`}
                    quality={90}
                    style={{ objectFit: "cover", objectPosition: m.imgPos ?? "center 20%" }}
                  />
                </div>
              </div>
              <div className="leadname">
                <h4>{m.name}</h4>
                <span className="role mono">{m.role}</span>
              </div>
            </div>
            <div className="leadcard-bottom">
              <p>{m.bio}</p>
              <a
                className="leadlinkedin"
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${m.name} on LinkedIn`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={LINKEDIN_PATH} />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
      <button className="leadnav next" onClick={() => go(index + 1)} aria-label="Next leader">
        ›
      </button>
      </div>
      <div className="leaddots">
        {LEADERSHIP.map((m, i) => (
          <button
            key={m.name}
            className={`leaddot${i === index ? " active" : ""}`}
            onClick={() => go(i)}
            aria-label={`Go to ${m.name}`}
          />
        ))}
      </div>
    </div>
  );
}
