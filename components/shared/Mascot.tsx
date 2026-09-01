"use client";

import { useEffect } from "react";
import { type Mood, useMascotRig } from "@/lib/useMascotRig";

export type { Mood };

/**
 * The companion body over the shared rig: a glossy white chibi with an
 * oversized helmet head, a near-black faceplate and glowing arc eyes.
 *
 * Two structural rules make the rig's poses possible:
 *
 *   The head is drawn *before* the torso, so sinking it hides it behind the
 *   body. That is what lets the reveal read as the head rising up from behind
 *   the chassis rather than fading in on top of it.
 *
 *   The base sits outside the lean group, so the body can shift its weight
 *   above treads — or here, a hover glow — that stays put.
 */
export default function Mascot({
  mood = "idle",
  variant = "full",
  active = true,
  introOnceKey,
  className = "",
  onReady,
}: {
  mood?: Mood;
  /** "full" shows the whole body; "head" crops to the eyes for small sizes. */
  variant?: "full" | "head";
  /** Pause the rig when the mascot isn't on screen. */
  active?: boolean;
  /** localStorage key gating the one-time reveal, played on a visitor's first
   * ever load. Omit for no reveal. */
  introOnceKey?: string;
  className?: string;
  /** Receives the rig's imperative cues, for a surface that needs to replay
   * the reveal or fire the click reaction without a real click. */
  onReady?: (cues: { replayIntro: () => void; triggerReaction: () => void }) => void;
}) {
  const rig = useMascotRig(mood, active, { introOnceKey, pupilTravel: 2.6 });
  const {
    rootRef, hoverRef, leanRef, headRef,
    pupilLRef, pupilRRef, armLRef, armRRef, thrusterRef,
    kittenRef,
    replayIntro, triggerReaction,
  } = rig;

  const head = variant === "head";

  // replayIntro and triggerReaction are useCallback-stable, so this hands the
  // cues up once per mount rather than on every render.
  useEffect(() => {
    onReady?.({ replayIntro, triggerReaction });
  }, [onReady, replayIntro, triggerReaction]);

  // The torso leans about the top of its base, so the lean reads as the body
  // shifting weight rather than the whole robot rotating in mid-air. Cropped
  // to the head, the pivot sits just below frame for a subtle sway instead.
  const leanOrigin = head ? "50px 46px" : "50px 93px";
  const shoulder = { l: "33px 62px", r: "67px 62px" };
  const eye = { l: 39.8, r: 60.2, cy: 27.5 };

  return (
    <svg
      ref={rootRef}
      className={`mascot mascot-${variant} ${className}`}
      // The head crop leaves headroom above the eyes, because a fully raised
      // brow arc travels above the top of the housing.
      viewBox={head ? "18 3 64 52" : "0 0 100 100"}
      role="img"
      aria-label="UFTECH.AI assistant"
      data-mood={mood}
    >
      <defs>
        {/* Cuts the kitten off at the pocket's opening, so only what has
            actually peeped out is drawn. Masking it this way means the pocket
            needs no opaque front panel to hide the rest. */}
        <clipPath id="c-peek">
          <path d="M34 60 L66 60 L66 76.2 Q50 78.2 34 76.2 Z" />
        </clipPath>
        {/* The faceplate, so the blush can reach the cheek edge without
            bleeding onto the white shell. */}
        <clipPath id="c-face">
          <rect x="26" y="13" width="48" height="34" rx="16" />
        </clipPath>
        {/* Glossy injection-moulded white: a bright highlight across the top
            of each shell, falling to a soft shadowed underside. */}
        <linearGradient id="c-shell" x1="0.25" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#f2f5f7" />
          <stop offset="0.8" stopColor="#d5dde3" />
          <stop offset="1" stopColor="#bcc6cf" />
        </linearGradient>
        {/* The faceplate is near-black but not flat — it catches the room. */}
        <linearGradient id="c-visor" x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#3b4450" />
          <stop offset="0.35" stopColor="#151a21" />
          <stop offset="1" stopColor="#0b0e12" />
        </linearGradient>
      </defs>

      {/* The whole silhouette rides this group: it carries the hover and the
          sideways drift. */}
      <g ref={hoverRef} className="mascot-hover">
        {/* What it hovers over: a cool glow pool beneath the shell. */}
        {!head && <ellipse ref={thrusterRef} cx="50" cy="96" rx="12" ry="3" className="c-glowpool" />}

        {/* Arms sit behind the torso, each in its own group so the rig can
            flare and tuck them independently of everything else. */}
        {!head && (
          <>
            <g ref={armLRef} style={{ transformOrigin: shoulder.l }}>
              <ellipse cx="30.5" cy="76" rx="6" ry="11.5" className="c-arm" />
            </g>
            <g ref={armRRef} style={{ transformOrigin: shoulder.r }}>
              <ellipse cx="69.5" cy="76" rx="6" ry="11.5" className="c-arm" />
            </g>
          </>
        )}

        {/* Head, drawn BEFORE the torso so sinking it tucks it out of sight
            behind the body. */}
        <g ref={headRef} className="mascot-head">
          {/* Oversized rounded helmet — the head is most of the character. */}
          <rect x="20" y="6" width="60" height="48" rx="23" fill="url(#c-shell)" className="c-shell" />
          {/* Glossy faceplate wrapping most of the front. */}
          <rect x="26" y="13" width="48" height="34" rx="16" fill="url(#c-visor)" className="c-visor" />
          {/* A single soft specular streak, kept off the eyes so it never
              cuts across them. */}
          <ellipse cx="63" cy="20" rx="9" ry="4" className="c-gloss" transform="rotate(-24 63 20)" />

          {/* Blush: a soft pink patch with three short vertical ticks over it,
              one pair of cheeks. Clipped to the faceplate so the patch can sit
              right out on the cheek without bleeding onto the white shell. On
              the dark plate it glows rather than merely tinting. */}
          <g clipPath="url(#c-face)">
            {[-1, 1].map((s) => {
              const bx = 50 + s * 15.5;
              return (
                <g key={s}>
                  <ellipse cx={bx} cy="37.6" rx="5.4" ry="4" className="c-blushpatch" />
                  <g className="c-blush">
                    {[-1, 0, 1].map((i) => (
                      <line
                        key={i}
                        x1={bx + i * 2.5 - 0.35}
                        y1={35.9}
                        x2={bx + i * 2.5 + 0.35}
                        y2={39.3}
                      />
                    ))}
                  </g>
                </g>
              );
            })}
          </g>

          {/* Arc eyes. Each is one stroked curve that is eye and brow at once:
              the rig squashes it flat to blink and rotates it for the brow
              angle, so there are no lids to render. */}
          {(["l", "r"] as const).map((side) => {
            const cx = side === "l" ? eye.l : eye.r;
            return (
              // No inline transform-origin: .m-pupil is transform-box:
              // fill-box, and the fill box's centre is already the arc's own
              // centre — which is exactly what a squash and a brow rotation
              // should pivot about. A user-space origin here would be read as
              // fill-box coordinates and throw the eye clear off the face.
              <g key={side} ref={side === "l" ? pupilLRef : pupilRRef} className="m-pupil c-eye">
                <path d={`M${cx - 5.1} ${eye.cy + 2.9} Q${cx} ${eye.cy - 4.8} ${cx + 5.1} ${eye.cy + 2.9}`} />
              </g>
            );
          })}
        </g>

        {/* Torso, drawn last so the tucked head hides behind it. */}
        {!head && (
          <g ref={leanRef} className="mascot-lean" style={{ transformOrigin: leanOrigin }}>
            {/* Small rounded body — a little wider at the base, so the
                character sits rather than stands. */}
            <path
              d="M50 56 C38 56 32 64 31.5 75 C31 86 39.5 93.5 50 93.5 C60.5 93.5 69 86 68.5 75 C68 64 62 56 50 56 Z"
              fill="url(#c-shell)"
              className="c-shell"
            />
            {/* The belly pocket, holding the UFT mark. Sized wider than the
                peek window on purpose — only its top edge shows at rest, and
                the rig's rare, random peek lifts kittenRef to reveal the
                rest. The shell here stays light in both themes, so the
                mark's own navy reads clearly without a theme switch. */}
            <g clipPath="url(#c-peek)">
              <g ref={kittenRef}>
                <image
                  href="/images/uft-mark.png"
                  x="38"
                  y="67.25"
                  width="24"
                  height="7.53"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>

            {/* Collar seam and its glow, right where the head meets the
                body — the reference's brightest single detail. */}
            <ellipse cx="50" cy="56.5" rx="14" ry="3.6" className="c-collarhalo" />
            <ellipse cx="50" cy="56" rx="11.5" ry="2.6" className="c-collar" />
          </g>
        )}
      </g>
    </svg>
  );
}
