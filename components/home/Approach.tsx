"use client";

import { useEffect, useRef, useState } from "react";
import { STAGES } from "@/lib/data";
import FieldLayer from "@/components/shared/FieldLayer";

export default function Approach() {
  const [stageIdx, setStageIdx] = useState(0);
  const heldRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const go = (i: number) => {
    heldRef.current = true;
    setStageIdx(i);
  };
  const holdStage = () => {
    heldRef.current = true;
  };
  const resumeStage = () => {
    heldRef.current = false;
  };
  // Scrolling the page can slide a hover target under a stationary cursor;
  // Chrome then fires a synthetic mouseenter (movementX/Y both 0) to sync
  // :hover state, which would otherwise pause autoplay the instant this
  // section scrolls into view. Only genuine pointer motion should hold it.
  const isRealMove = (e: React.MouseEvent) => e.movementX !== 0 || e.movementY !== 0;

  // Autoplay, paused while held (hover/click/scroll-in-view).
  useEffect(() => {
    const t = setInterval(() => {
      if (!heldRef.current) setStageIdx((i) => (i + 1) % STAGES.length);
    }, 1100);
    return () => clearInterval(t);
  }, []);

  // Scroll-driven progression: as the section travels through the viewport
  // (top entering at the bottom, to bottom leaving at the top), map that
  // full traversal to the 4 stages — so a normal scroll from top to bottom
  // of the section flows through all of them in order.
  useEffect(() => {
    let raf: number | null = null;

    const check = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const inView = rect.bottom > 0 && rect.top < vh;
      if (inView) {
        const total = rect.height + vh;
        const progressed = Math.min(Math.max(vh - rect.top, 0), total);
        const idx = Math.min(STAGES.length - 1, Math.floor((progressed / total) * STAGES.length));
        heldRef.current = true;
        setStageIdx((prev) => (prev === idx ? prev : idx));
      } else {
        heldRef.current = false;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        check();
        raf = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="approach" ref={sectionRef}>
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ How we work ]</div>
          <h2>From first pilot to always-on AI — five stages, in order.</h2>
        </div>
      </div>

      <div
        onMouseEnter={(e) => isRealMove(e) && holdStage()}
        onMouseMove={(e) => isRealMove(e) && holdStage()}
        onMouseLeave={resumeStage}
      >
        <div className="stages" style={{ paddingTop: 8 }}>
          <div className="stagebar" />
          <div className="stagefill" style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }} />
          <div className="tracer" />
          <div className="stagerow">
            {STAGES.map((s, i) => (
              <div
                key={s.t}
                className={`stage${i === stageIdx ? " active" : ""}${i < stageIdx ? " done" : ""}`}
                onClick={() => go(i)}
                onMouseEnter={(e) => isRealMove(e) && go(i)}
              >
                <div className="stagedot" />
                <div className="tick" />
                <div className="frame">
                  <div className="mono num">{s.num}</div>
                  <h4>{s.t}</h4>
                  <p>{s.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
