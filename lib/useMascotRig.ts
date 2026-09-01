"use client";

import { useCallback, useEffect, useRef } from "react";

export type Mood =
  | "idle"
  | "exploring"
  | "thinking"
  | "joy"
  | "curious"
  | "lonely"
  | "love"
  | "fear"
  | "surprise"
  | "anger"
  | "confusion"
  | "excited"
  | "sadness"
  | "pride"
  | "embarrassment";

/**
 * Every channel the rig can drive. One emotion is one row of this, and an
 * expression only reads if the eyes, brows, head angle and body posture all
 * say the same thing at once — so a pose sets all of them together rather
 * than leaning on the eyes alone.
 *
 * Two channels are drawn as mirrored pairs, which means a single rotation
 * sign swings the two sides opposite ways in screen space. Each therefore has
 * one honest convention below and the render negates whichever side needs it
 * (all the negating happens in one place, at the bottom of the frame loop):
 *
 *   browRotL/R positive = that brow's inner end driven down (stern, angry) —
 *              folded into the arc eye's own rotation, since the companion's
 *              eye anatomy has no separate brow element.
 *   armL/R     positive = that arm flared out and up
 *
 * The last six channels drive the hover and the sideways patrol.
 */
type Pose = {
  /** Lid sweep across the eye, 0..1. Per-eye, so lids can be uneven. Folded
   * into the arc eye's squash rather than a separate lid element. */
  topL: number;
  topR: number;
  botL: number;
  botR: number;
  /** Brow angle, folded into the arc eye's own rotation. Positive drives the
   * inner end down. */
  browRotL: number;
  browRotR: number;
  /** Head on its neck: rotation, and vertical (negative is craned up). */
  tilt: number;
  lift: number;
  /** Torso: sideways lean, and vertical (negative is chest lifted). */
  lean: number;
  bodyY: number;
  /** Arm rotation at the shoulder. Positive flares out and up. */
  armL: number;
  armR: number;
  /** Iris scale — dilated with delight, pinned small with fright. */
  pupilSX: number;
  pupilSY: number;
  /** Where the eyes sit independently of the cursor, -1..1. */
  pupilBiasX: number;
  pupilBiasY: number;
  /** Pulls the two irises in opposite directions — unfocused, confused. */
  pupilSkew: number;
  /** How much cursor tracking survives, 0..1. Low means "looking away". */
  gazeWeight: number;
  /** Resting height, and the bob around it. */
  hoverBase: number;
  hoverAmp: number;
  hoverSpeed: number;
  /** How far and how fast it patrols sideways. */
  driftAmp: number;
  driftSpeed: number;
  /** Arms rise as well as swing. */
  armY: number;
};

const BASE: Pose = {
  topL: 0, topR: 0, botL: 0, botR: 0,
  browRotL: 0, browRotR: 0,
  tilt: 0, lift: 0, lean: 0, bodyY: 0,
  armL: 0, armR: 0,
  pupilSX: 1, pupilSY: 1, pupilBiasX: 0, pupilBiasY: 0, pupilSkew: 0,
  gazeWeight: 1,
  hoverBase: 0, hoverAmp: 1.7, hoverSpeed: 0.0016,
  driftAmp: 2.2, driftSpeed: 0.0006, armY: 0,
};
/** Only the channels that differ from rest need listing. */
const pose = (p: Partial<Pose>): Pose => ({ ...BASE, ...p });

const POSE: Record<Mood, Pose> = {
  // Resting state: deliberately the joy pose with the hands left out of it —
  // bright, lifted and pleased to be here, but not permanently mid-celebration.
  idle: pose({
    botL: 0.38, botR: 0.38, browRotL: -7, browRotR: -7,
    tilt: -3, lift: -2, lean: -1.5, bodyY: -0.8,
    pupilSX: 1.12, pupilSY: 1.12,
  }),
  // Never read directly — resolves to curious/idle/lonely in the frame loop
  // depending on how long the pointer has been still.
  exploring: pose({}),

  // 1. Joy — wide bright eyes, brows up, body lifted, arms open, energetic.
  joy: pose({
    botL: 0.42, botR: 0.42, browRotL: -9, browRotR: -9,
    tilt: -4, lift: -2.5, lean: -2, bodyY: -1,
    armL: 50, armR: 62, pupilSX: 1.15, pupilSY: 1.15,
    hoverBase: -3, hoverAmp: 2.6, hoverSpeed: 0.0048, driftAmp: 5.5, driftSpeed: 0.0026, armY: -5,
  }),
  // 2. Curiosity — one brow up, head hard over, leaning in at whatever it found.
  curious: pose({
    browRotL: -2, browRotR: -20,
    tilt: -13, lift: -2, lean: -5,
    armL: -4, armR: 20, pupilSX: 1.2, pupilSY: 1.2,
    hoverBase: -1, hoverAmp: 2, hoverSpeed: 0.0021, driftAmp: 3.6, driftSpeed: 0.0011, armY: -1,
  }),
  // 3. Loneliness — brows drooping, eyes down and away, collapsed inward.
  lonely: pose({
    topL: 0.48, topR: 0.48, browRotL: -14, browRotR: -14,
    tilt: 11, lift: 4, lean: 4, bodyY: 2,
    armL: -10, armR: -10, pupilSX: 0.9, pupilSY: 0.9,
    pupilBiasX: -0.45, pupilBiasY: 0.35, gazeWeight: 0.3,
    hoverBase: 4, hoverAmp: 1, hoverSpeed: 0.0009, driftAmp: 0.9, driftSpeed: 0.00028, armY: 3,
  }),
  // 4. Love — soft big eyes, inner brows relaxed up, leaning in, arms open.
  love: pose({
    topL: 0.2, topR: 0.2, botL: 0.26, botR: 0.26,
    browRotL: -12, browRotR: -12,
    tilt: -8, lift: -1, lean: -3, bodyY: -0.5,
    armL: 32, armR: 36, pupilSX: 1.25, pupilSY: 1.25,
    hoverBase: -1.5, hoverAmp: 1.9, hoverSpeed: 0.0015, driftAmp: 2.4, driftSpeed: 0.0008, armY: -1,
  }),
  // 5. Fear — eyes thrown wide with pinned irises, head back, arms clamped in.
  fear: pose({
    browRotL: -14, browRotR: -14,
    tilt: 2, lift: 5, lean: 5, bodyY: 1,
    armL: -30, armR: -30, pupilSX: 0.55, pupilSY: 0.55, pupilBiasY: -0.15,
    hoverBase: 2, hoverAmp: 0.7, hoverSpeed: 0.004, driftAmp: 0.5, driftSpeed: 0.0012, armY: -3,
  }),
  // 6. Surprise — eyes at their widest, brows at their highest, snapped upright.
  surprise: pose({
    browRotL: -4, browRotR: -4,
    tilt: 0, lift: -5, bodyY: -2,
    armL: 55, armR: 58, pupilSX: 1.3, pupilSY: 1.3,
    hoverBase: -5, hoverAmp: 2.2, hoverSpeed: 0.003, driftAmp: 1.5, driftSpeed: 0.0008, armY: -5,
  }),
  // 7. Anger — eyes narrowed, brows down to a hard V, pushed forward, rigid.
  anger: pose({
    topL: 0.34, topR: 0.34, botL: 0.1, botR: 0.1,
    browRotL: 22, browRotR: 22,
    tilt: 0, lift: 2, lean: -1, bodyY: 0.5,
    armL: -14, armR: -14, pupilSX: 0.8, pupilSY: 0.8, gazeWeight: 0.9,
    hoverBase: 1, hoverAmp: 0.8, hoverSpeed: 0.0022, driftAmp: 1.2, driftSpeed: 0.0016, armY: -1,
  }),
  // 8. Confusion — brows at odds, eyes drifting apart, one arm up uncertainly.
  confusion: pose({
    topL: 0.1, topR: 0.3, browRotL: 14, browRotR: -16,
    tilt: -16, lean: -7,
    armL: -2, armR: 28, pupilSkew: 0.35, gazeWeight: 0.75,
    hoverAmp: 1.6, hoverSpeed: 0.0018, driftAmp: 3, driftSpeed: 0.0009,
  }),
  // 9. Excitement — the click reaction's payoff: brightest eyes, arms flung out.
  excited: pose({
    botL: 0.3, botR: 0.3, browRotL: -11, browRotR: -11,
    tilt: -3, lift: -4, lean: -2, bodyY: -1.5,
    armL: 58, armR: 70, pupilSX: 1.22, pupilSY: 1.22,
    hoverBase: -4, hoverAmp: 2.8, hoverSpeed: 0.005, driftAmp: 6.4, driftSpeed: 0.0029, armY: -6,
  }),
  // 10. Sadness — eyes soft and cast down, inner brows up, everything drooping.
  sadness: pose({
    topL: 0.4, topR: 0.4, browRotL: -18, browRotR: -18,
    tilt: 9, lift: 3.5, lean: 2, bodyY: 1.5,
    armL: -8, armR: -8, pupilSX: 0.9, pupilSY: 0.95,
    pupilBiasY: 0.5, gazeWeight: 0.4,
    hoverBase: 3.5, hoverAmp: 1, hoverSpeed: 0.001, driftAmp: 0.8, driftSpeed: 0.0003, armY: 3,
  }),
  // 11. Pride — steady eyes, brows just lowered, head up, chest lifted, planted.
  pride: pose({
    topL: 0.18, topR: 0.18, botL: 0.1, botR: 0.1,
    browRotL: 8, browRotR: 8,
    tilt: 0, lift: -4, bodyY: -1.5,
    armL: 10, armR: 10, pupilBiasY: -0.25,
    hoverBase: -3, hoverAmp: 1.6, hoverSpeed: 0.0014, driftAmp: 1.6, driftSpeed: 0.0006, armY: -2,
  }),
  // 12. Embarrassment — looking anywhere but at you, brows uneven, turned away.
  embarrassment: pose({
    topL: 0.3, topR: 0.3, botL: 0.18, botR: 0.18,
    browRotL: -6, browRotR: -14,
    tilt: 12, lift: 2.5, lean: 5, bodyY: 0.5,
    armL: -24, armR: -20, pupilSX: 0.95, pupilSY: 0.95,
    pupilBiasX: 0.6, pupilBiasY: 0.3, gazeWeight: 0.15,
    hoverBase: 1, hoverAmp: 1.2, hoverSpeed: 0.0016, driftAmp: 2, driftSpeed: 0.0007, armY: 1,
  }),

  // Not one of the twelve — a working state the widget genuinely has, for
  // while a reply is streaming. Focused, eyes up and off to one side.
  thinking: pose({
    topL: 0.32, topR: 0.32, botL: 0.06, botR: 0.06,
    browRotL: 9, browRotR: -9,
    tilt: 4,
    pupilBiasX: 0.35, pupilBiasY: -0.4, gazeWeight: 0.35,
    hoverAmp: 1.4, hoverSpeed: 0.0013, driftAmp: 1.4, driftSpeed: 0.0005,
  }),
};

const POSE_KEYS = Object.keys(BASE) as (keyof Pose)[];
const LID_KEYS = new Set<keyof Pose>(["topL", "topR", "botL", "botR"]);

const PUPIL_TRAVEL = 3.4; // how far an iris may drift inside its eye
const HEAD_ROT = 7; // max head rotation in degrees
const GAZE_RADIUS = 420; // px from the mascot at which gaze saturates
const EXPLORE_WINDOW = 900; // ms of pointer inactivity before "exploring" drops from curious to idle
const LONELY_WINDOW = 45_000; // ms of pointer inactivity before "exploring" sinks further into lonely
const JUMP_HEIGHT = 8; // % of the mascot's own height it lifts at the peak of a hop

// The kitten peeks up out of its pocket and settles back on its own
// schedule, unrelated to mood or gaze — an ambient tic, not an expression.
// "Very rare" means minutes apart, and randomised so a visitor watching for
// it can never predict the next one.
const PEEK_MS = 1300; // duration of one rise-and-settle arc
const PEEK_MIN_GAP = 25_000; // ms, shortest wait before the next peek
const PEEK_MAX_GAP = 75_000; // ms, longest wait before the next peek
const PEEK_RISE = 3.4; // how far up the kitten climbs, in viewBox units

// The head is drawn *behind* the torso, so sinking it far enough hides it
// completely — which is what lets the reveal read as rising up from behind the
// body rather than fading in on top of it. 24 units plus the shrink is enough
// to tuck it inside the chassis.
const HEAD_RETRACT_DROP = 24;
const HEAD_RETRACT_SHRINK = 0.75; // fraction of head scale lost when fully withdrawn
const ARM_TUCK = 50; // deg both arms rotate inward when fully withdrawn
// Fear pulls the head back without posting it out of sight — it should read as
// flinching into the shell, not as the head having left.
const FEAR_RETRACT_MAX = 0.45;

// The reveal is deliberately unhurried and has no overshoot: the head rises out
// from behind the body, then the arms unfold, then the eyes open. Staged rather
// than simultaneous, because everything moving at once is what makes an
// entrance feel rushed.
const INTRO_MS = 1500;
const INTRO_RISE = [0, 0.62] as const;
const INTRO_ARMS = [0.34, 0.88] as const;
const INTRO_EYES = [0.52, 0.92] as const;

// A click on something actionable gets a two-beat reaction: it notices
// (curiosity), then it reacts (excitement). Beat one runs to CURIOSITY_END and
// crossfades out over CURIOSITY_FADE; beat two starts at EXCITEMENT_START and
// carries the hop and the sway.
const REACTION_MS = 1100;
const CURIOSITY_END = 0.34;
const CURIOSITY_FADE = 0.26;
const EXCITEMENT_START = 0.3;
// Hovering reads as interest, not commitment, so it only blends most of the way
// into curiosity — the click is what completes the thought.
const HOVER_CURIOSITY = 0.85;

// Only something that actually does something earns a reaction — plain clicks
// on background or body text would otherwise fire it constantly.
const ACTIONABLE_SELECTOR =
  'button, a[href], input, select, textarea, summary, label, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
/** Normalised progress within a sub-window of a timeline. */
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  for (const k of POSE_KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
};

/**
 * Drives the mascot's gaze, blink, expression, torso, arms, hover and
 * sideways patrol.
 *
 * Everything is written straight to the DOM inside one rAF loop rather than
 * through React state: a mousemove-driven setState would re-render the whole
 * chat panel on every pointer event. Each animated property has exactly one
 * owner here, so nothing fights CSS for control of the same transform.
 *
 * Pass `introOnceKey` to play the reveal on a visitor's first ever load. The
 * key names a localStorage entry, and the check lives here rather than in the
 * calling component on purpose — it is client-only animation state, so routing
 * it through React would mean a setState inside an effect and a cascading
 * render for something no render depends on.
 */
export function useMascotRig(
  mood: Mood,
  active: boolean,
  {
    introOnceKey,
    pupilTravel = PUPIL_TRAVEL,
  }: {
    introOnceKey?: string;
    /** How far the iris may drift inside its eye. */
    pupilTravel?: number;
  } = {},
) {
  const rootRef = useRef<SVGSVGElement | null>(null);
  const hoverRef = useRef<SVGGElement | null>(null);
  const leanRef = useRef<SVGGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const pupilLRef = useRef<SVGGElement | null>(null);
  const pupilRRef = useRef<SVGGElement | null>(null);
  const armLRef = useRef<SVGGElement | null>(null);
  const armRRef = useRef<SVGGElement | null>(null);
  const thrusterRef = useRef<SVGEllipseElement | null>(null);
  const kittenRef = useRef<SVGGElement | null>(null);

  // Mirrored into a ref so the rAF loop can read the current mood without the
  // effect tearing down and re-subscribing every time the expression changes.
  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  // Imperative handles, so a preview surface can retrigger the animations that
  // are otherwise driven by a first visit or a real click.
  const cueRef = useRef<{ intro: () => void; react: () => void }>({
    intro: () => {},
    react: () => {},
  });
  const replayIntro = useCallback(() => cueRef.current.intro(), []);
  const triggerReaction = useCallback(() => cueRef.current.react(), []);

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Cached so the rAF loop never reads layout; pointer maths would otherwise
    // force a reflow on every frame.
    let cx = 0;
    let cy = 0;
    const measure = () => {
      const r = root.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    };
    measure();
    // Scale for the hop should read as leaving from and landing on the ground,
    // not growing out of the top-left corner of the SVG box.
    root.style.transformOrigin = "50% 100%";

    let targetX = 0;
    let targetY = 0;
    let gazeX = 0;
    let gazeY = 0;
    let blink = 0;
    let hasPointer = false;
    // Starts "now" rather than -Infinity so a fresh page load reads as curious,
    // not instantly lonely before the visitor has had a chance to move at all.
    let lastMoveAt = performance.now();
    let hoverEase = 0;
    let pointerOnTarget = false;
    let driftPhase = 0;
    let hoverPhase = 0;
    let lastFrame = 0;

    // Smoothed copy of every channel, chasing the active pose.
    const cur = { ...POSE.idle };

    const onPointer = (e: PointerEvent) => {
      hasPointer = true;
      lastMoveAt = performance.now();
      const dx = (e.clientX - cx) / GAZE_RADIUS;
      const dy = (e.clientY - cy) / GAZE_RADIUS;
      // Clamp into the unit circle so diagonal gaze doesn't overshoot the lens.
      const len = Math.hypot(dx, dy);
      const k = len > 1 ? 1 / len : 1;
      targetX = dx * k;
      targetY = dy * k;
    };
    const onLeave = () => {
      hasPointer = false;
      pointerOnTarget = false;
      targetX = 0;
      targetY = 0;
    };

    // Curiosity on hover: the moment the pointer settles on the mascot itself
    // or on anything clickable, it leans in and looks — so noticing precedes
    // the click reaction instead of the two being unrelated.
    const onOver = (e: PointerEvent) => {
      const t = e.target;
      pointerOnTarget =
        t instanceof Element && (root.contains(t) || t.closest(ACTIONABLE_SELECTOR) !== null);
    };

    let reacting = false;
    let reactStart = 0;
    let introStarted = false;
    let introStart = 0;
    const startIntro = () => {
      if (reduced) return;
      introStarted = true;
      introStart = performance.now();
    };
    const startReaction = () => {
      if (reduced) return;
      reacting = true;
      reactStart = performance.now();
    };
    cueRef.current = { intro: startIntro, react: startReaction };

    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element) || !t.closest(ACTIONABLE_SELECTOR)) return;
      startReaction();
    };

    // First ever visit? Claim the flag now so a later remount — closing the
    // chat panel puts the launcher back — never replays the reveal. A failure
    // to reach localStorage (private mode, storage disabled) just means no
    // intro, never a broken widget.
    if (introOnceKey) {
      try {
        if (!localStorage.getItem(introOnceKey)) {
          localStorage.setItem(introOnceKey, "1");
          startIntro();
        }
      } catch {
        // No intro this time.
      }
    }

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    // Blinks are scheduled rather than periodic, with the occasional double,
    // because a metronome blink reads as broken rather than alive.
    let blinkUntil = 0;
    let nextBlink = performance.now() + 1200 + Math.random() * 2600;
    let queuedBlink = 0;

    // Scheduled the same way as blinks, just on a much longer, wider-random
    // clock — the first one waits a full gap too, so it never fires moments
    // after mount.
    let peekStart = -Infinity;
    let nextPeek = performance.now() + PEEK_MIN_GAP + Math.random() * (PEEK_MAX_GAP - PEEK_MIN_GAP);

    let fearRetractEase = 0;
    let raf = 0;
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      // Clamped so a backgrounded tab returning doesn't advance the hover and
      // patrol phases by a whole second in one step.
      const dt = lastFrame ? Math.min(64, now - lastFrame) : 16;
      lastFrame = now;

      if (!reduced && now >= nextBlink) {
        blinkUntil = now + 130;
        if (queuedBlink > 0) {
          queuedBlink -= 1;
          nextBlink = now + 190;
        } else {
          queuedBlink = Math.random() < 0.22 ? 1 : 0;
          nextBlink = now + 2200 + Math.random() * 4200;
        }
      }
      const blinkTarget = now < blinkUntil ? 1 : 0;
      blink = lerp(blink, blinkTarget, blinkTarget === 1 ? 0.55 : 0.3);

      if (!reduced && now >= nextPeek) {
        peekStart = now;
        nextPeek = now + PEEK_MS + PEEK_MIN_GAP + Math.random() * (PEEK_MAX_GAP - PEEK_MIN_GAP);
      }

      // Idle drift keeps it alive on touch devices and whenever the pointer has
      // never entered the window.
      if (!hasPointer && !reduced) {
        const t = now / 1000;
        targetX = Math.sin(t * 0.42) * 0.32;
        targetY = Math.sin(t * 0.31 + 1.1) * 0.18;
      }

      const ease = reduced ? 1 : 0.12;
      gazeX = lerp(gazeX, reduced ? 0 : targetX, ease);
      gazeY = lerp(gazeY, reduced ? 0 : targetY, ease);
      hoverEase = lerp(hoverEase, pointerOnTarget && !reduced ? 1 : 0, 0.09);

      // The two-beat click reaction: notice it, then react to it.
      let curiosityW = 0;
      let excitementW = 0;
      let hopArc = 0;
      let anticipation = 0;
      let sway = 0;
      if (reacting) {
        const r = (now - reactStart) / REACTION_MS;
        if (r >= 1) {
          reacting = false;
        } else {
          curiosityW =
            r < CURIOSITY_END
              ? easeOutCubic(r / CURIOSITY_END)
              : Math.max(0, 1 - (r - CURIOSITY_END) / CURIOSITY_FADE);
          const e = clamp01((r - EXCITEMENT_START) / (1 - EXCITEMENT_START));
          // A single arc rather than a spring, so it lands as one deliberate
          // beat instead of a wobble.
          excitementW = e > 0 ? Math.sin(e * Math.PI) : 0;
          hopArc = excitementW;
          // Crouches while it notices, which sells the leap that follows.
          anticipation = r < CURIOSITY_END ? Math.sin((r / CURIOSITY_END) * Math.PI) : 0;
          // One gentle weight shift through the leap — body language, not a
          // vibration. A second oscillation here is what would look frantic.
          sway = Math.sin(e * Math.PI * 2) * excitementW;
        }
      }

      // Staged reveal. `introRemaining` is 1 while the head is still hidden
      // behind the body and 0 once it has fully risen; the arms and eyes follow
      // on their own windows so the entrance unfolds instead of snapping.
      let introRemaining = 0;
      let introArms = 0;
      let introEyes = 0;
      if (introStarted) {
        const p = (now - introStart) / INTRO_MS;
        if (p >= 1) {
          introStarted = false;
        } else {
          introRemaining = 1 - easeInOutCubic(seg(p, INTRO_RISE[0], INTRO_RISE[1]));
          introArms = 1 - easeOutCubic(seg(p, INTRO_ARMS[0], INTRO_ARMS[1]));
          introEyes = 1 - easeOutCubic(seg(p, INTRO_EYES[0], INTRO_EYES[1]));
        }
      }

      const currentMood = moodRef.current;
      fearRetractEase = lerp(
        fearRetractEase,
        currentMood === "fear" ? FEAR_RETRACT_MAX : 0,
        0.08,
      );
      // How far the head is tucked behind the body right now — shared by the
      // reveal and by a startled flinch, so the two read as one physical idea
      // rather than two unrelated effects.
      const headTuck = Math.max(introRemaining, fearRetractEase);
      const armTuckW = Math.max(introArms, fearRetractEase);

      const sinceMove = now - lastMoveAt;
      const basePose =
        currentMood === "exploring"
          ? sinceMove < EXPLORE_WINDOW
            ? POSE.curious
            : sinceMove < LONELY_WINDOW
              ? POSE.idle
              : POSE.lonely
          : POSE[currentMood];
      let target = basePose;
      if (hoverEase > 0.001) target = blendPose(target, POSE.curious, hoverEase * HOVER_CURIOSITY);
      if (curiosityW > 0) target = blendPose(target, POSE.curious, curiosityW);
      if (excitementW > 0) target = blendPose(target, POSE.excited, excitementW);

      // Channels normally settle slowly, so a mood change lands as a movement
      // rather than a jump cut — but a reaction is over in about a second, so
      // while one is live everything chases its target fast enough to actually
      // be seen instead of being damped into a flicker.
      const quick = excitementW > 0.02 || curiosityW > 0.02;
      const poseEase = quick ? 0.5 : 0.12;
      const lidEase = quick ? 0.55 : 0.3;
      for (const k of POSE_KEYS) {
        cur[k] = lerp(cur[k], target[k], LID_KEYS.has(k) ? lidEase : poseEase);
      }

      // A small multi-frequency wobble while properly afraid — the stutter the
      // withdrawal alone doesn't convey.
      const jitterX =
        fearRetractEase > 0.02 && !reduced
          ? (Math.sin(now * 0.09) * 1.1 + Math.sin(now * 0.23) * 0.6) *
            (fearRetractEase / FEAR_RETRACT_MAX)
          : 0;

      // Hover and patrol run on integrated phases, so a mood change alters
      // their rate and reach without the position ever jumping.
      let driftX = 0;
      let bank = 0;
      let floatY = 0;
      if (!reduced) {
        driftPhase += dt * cur.driftSpeed;
        hoverPhase += dt * cur.hoverSpeed;
        driftX = Math.sin(driftPhase) * cur.driftAmp;
        bank = Math.cos(driftPhase) * cur.driftAmp * 0.85;
        floatY = Math.sin(hoverPhase) * cur.hoverAmp + cur.hoverBase;
      } else {
        floatY = cur.hoverBase;
      }

      // --- write transforms; from here down each property has one owner ---

      // The hop moves the whole character, so it reads as a jump rather than a
      // nod. Percentages, not px, so the same rig looks right at both the
      // launcher's full-body size and the small head-only crop in the header.
      root.style.transform =
        `translateY(${(-hopArc * JUMP_HEIGHT).toFixed(2)}%) ` +
        `scale(${(1 - hopArc * 0.1).toFixed(3)}, ${(1 + hopArc * 0.13).toFixed(3)})`;

      // Carries the vertical hover and the sideways patrol, above the lean.
      if (hoverRef.current)
        hoverRef.current.style.transform =
          `translate(${(driftX + jitterX + sway * 1.6).toFixed(2)}px, ${(
            floatY +
            cur.bodyY +
            anticipation * 2
          ).toFixed(2)}px)`;

      // Torso.
      if (leanRef.current)
        leanRef.current.style.transform = `rotate(${(cur.lean + bank + sway * 3).toFixed(2)}deg)`;

      if (headRef.current)
        headRef.current.style.transform =
          `translate(${(gazeX * 2.6).toFixed(2)}px, ${(
            gazeY * 2 +
            cur.lift +
            headTuck * HEAD_RETRACT_DROP
          ).toFixed(2)}px) ` +
          // The head is a sibling of the hull rather than a child, so it takes
          // only a third of the bank: it stays near level and holds your gaze
          // while the body slides.
          `rotate(${(gazeX * HEAD_ROT + cur.tilt + bank * 0.34).toFixed(2)}deg) ` +
          `scale(${(1 - headTuck * HEAD_RETRACT_SHRINK).toFixed(3)})`;

      // One sine arc from 0 up to -PEEK_RISE and back to 0 — a rise and a
      // settle in a single smooth motion, no separate ease-in/ease-out needed.
      if (kittenRef.current) {
        const p = now - peekStart;
        const peekY = p >= 0 && p < PEEK_MS ? -Math.sin((p / PEEK_MS) * Math.PI) * PEEK_RISE : 0;
        kittenRef.current.style.transform = `translateY(${peekY.toFixed(2)}px)`;
      }

      if (thrusterRef.current) {
        const heat = 0.5 + Math.abs(floatY - cur.hoverBase) * 0.16 + hopArc * 0.45;
        thrusterRef.current.style.opacity = Math.min(1, heat).toFixed(3);
        thrusterRef.current.style.transform = `scale(${(0.82 + heat * 0.45).toFixed(3)}, ${(
          0.72 + heat * 0.55
        ).toFixed(3)})`;
      }

      // Mirrored pair: positive flares out and up, so the right is negated.
      // The reveal and fear add the same inward tuck, fading as they finish.
      const armTuck = -armTuckW * ARM_TUCK;
      if (armLRef.current)
        armLRef.current.style.transform =
          `translateY(${cur.armY.toFixed(2)}px) rotate(${(cur.armL + armTuck).toFixed(2)}deg)`;
      if (armRRef.current)
        armRRef.current.style.transform =
          `translateY(${cur.armY.toFixed(2)}px) rotate(${(-(cur.armR + armTuck)).toFixed(2)}deg)`;

      // Cursor tracking, weighted down for the moods that look away, plus a
      // per-mood bias and a skew that pulls the two eyes apart.
      const px = clamp1(gazeX * cur.gazeWeight + cur.pupilBiasX);
      const py = clamp1(gazeY * cur.gazeWeight + cur.pupilBiasY);
      const shut = Math.max(blink, introEyes);

      // A glowing arc has no lids to slide: shutting it *is* squashing the
      // stroke flat, and its brow angle is its own rotation. So the lid and
      // brow channels fold into the eye transform here rather than driving
      // separate elements.
      const openL = clamp01(1 - Math.max(cur.topL, shut) - cur.botL);
      const openR = clamp01(1 - Math.max(cur.topR, shut) - cur.botR);
      const writeEye = (
        el: SVGGElement | null,
        skew: number,
        open: number,
        browRot: number,
      ) => {
        if (!el) return;
        el.style.transform =
          `translate(${(clamp1(px + skew) * pupilTravel).toFixed(2)}px, ${(
            py * pupilTravel
          ).toFixed(2)}px) rotate(${browRot.toFixed(2)}deg) ` +
          `scale(${cur.pupilSX.toFixed(3)}, ${(cur.pupilSY * open).toFixed(3)})`;
      };
      writeEye(pupilLRef.current, cur.pupilSkew, openL, cur.browRotL);
      writeEye(pupilRRef.current, -cur.pupilSkew, openR, -cur.browRotR);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Don't burn frames on a tab nobody is looking at.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        measure();
        lastFrame = 0;
        nextBlink = performance.now() + 800;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cueRef.current = { intro: () => {}, react: () => {} };
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // Deliberately narrow: `mood` is read through a ref so an expression change
    // never tears down the rAF loop and its listeners. Everything else here is
    // fixed for the life of a mount.
  }, [active, introOnceKey, pupilTravel]);

  return {
    rootRef,
    hoverRef,
    leanRef,
    headRef,
    pupilLRef,
    pupilRRef,
    armLRef,
    armRRef,
    thrusterRef,
    kittenRef,
    replayIntro,
    triggerReaction,
  };
}
