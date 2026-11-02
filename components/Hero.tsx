"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { easeFade } from "@/lib/motion";
import Plane from "./Plane";
import { WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/world-pixels";

/* ────────── layout constants ────────── */
const CELL    = 10;
const DOT     = 5;
const MAP_TOP = 96;

/* ────────── pin data ────────── */
const PINS = [
  { num: 1, x: 1034, y: 338, color: "#6c9fde" },
  { num: 2, x: 247,  y: 272, color: "#d97a2a" },
  { num: 3, x: 502,  y: 185, color: "#3d6bc4" },
] as const;

const PIN_CELLS = [
  { col: 103, row: 24 },
  { col: 25,  row: 18 },
  { col: 50,  row: 9  },
] as const;

/* ────────── stage definitions ────────── */
const STAGES_DESKTOP = [
  { x: 720,  y: 124, flip:  1 as 1 | -1 },
  { x: 1038, y: 308, flip:  1 as 1 | -1 },
  { x: 269,  y: 232, flip: -1 as 1 | -1 },
  { x: 524,  y: 145, flip:  1 as 1 | -1 },
];

const MOB_COL_START = 20;
const MOB_COL_END   = 108;
const MOB_COL_COUNT = MOB_COL_END - MOB_COL_START + 1;

function getMobileStages(mw: number) {
  const cell = mw / MOB_COL_COUNT;
  const mS   = mw / 890;
  const pins = PIN_CELLS.map(pc => ({
    cx: (pc.col - MOB_COL_START + 0.5) * cell,
    cy: pc.row * cell + cell * 0.5,
  }));
  return [
    { x: mw / 2,             y: pins[1].cy - 40*mS, flip:  1 as 1 | -1 },
    { x: pins[0].cx + 4*mS,  y: pins[0].cy - 30*mS, flip:  1 as 1 | -1 },
    { x: pins[1].cx + 22*mS, y: pins[1].cy - 40*mS, flip: -1 as 1 | -1 },
    { x: pins[2].cx + 22*mS, y: pins[2].cy - 40*mS, flip:  1 as 1 | -1 },
  ];
}

const STAGE_LABELS = [
  { text: "Now in Los Angeles",       pinIdx: 1, placement: "below" as const, dark: false },
  { text: "Previously in Hyderabad",  pinIdx: 0, placement: "right" as const, dark: false },
  { text: "Currently in Los Angeles", pinIdx: 1, placement: "below" as const, dark: false },
  { text: "Looking for what's next!", pinIdx: 2, placement: "right" as const, dark: true  },
];

function progressToStage(p: number): number {
  if (p < 0.20) return 0;
  if (p < 0.45) return 1;
  if (p < 0.70) return 2;
  return 3;
}

/* ────────── bezier utilities ────────── */
function makeLUT(p1x: number, p1y: number, p2x: number, p2y: number, n = 200) {
  const xs = new Float64Array(n+1), ys = new Float64Array(n+1);
  for (let i = 0; i <= n; i++) {
    const t = i/n, u = 1-t;
    xs[i] = 3*u*u*t*p1x + 3*u*t*t*p2x + t*t*t;
    ys[i] = 3*u*u*t*p1y + 3*u*t*t*p2y + t*t*t;
  }
  return (x: number) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = n;
    while (lo < hi-1) { const m=(lo+hi)>>1; if (xs[m]<x) lo=m; else hi=m; }
    return ys[lo] + (x-xs[lo])/(xs[hi]-xs[lo])*(ys[hi]-ys[lo]);
  };
}
const EASE_MV  = makeLUT(0.22, 1, 0.36, 1);
const EASE_FLY = makeLUT(0.65, 0, 0.35, 1);

function lerp(a: number, b: number, t: number) { return a+(b-a)*t; }
function qBezPt(t: number, p0: number, c: number, p1: number) {
  const u = 1-t; return u*u*p0 + 2*u*t*c + t*t*p1;
}
function qBezTan(t: number, p0: number, c: number, p1: number) {
  return 2*(1-t)*(c-p0) + 2*t*(p1-c);
}

/* ────────── canvas dot builders ────────── */
interface Dot { fx:number;fy:number;sx:number;sy:number;flyStart:number;flyDur:number;blinks:number[]; }
let _dotsDesktop: Dot[] | null = null;
function buildDesktopDots(): Dot[] {
  if (_dotsDesktop) return _dotsDesktop;
  _dotsDesktop = [];
  const W = WORLD_COLS*CELL, H = WORLD_ROWS*CELL;
  for (let row=0; row<WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col=0; col<WORLD_COLS; col++) {
      if (rs[col]!=="1") continue;
      _dotsDesktop.push({
        fx: col*CELL+(CELL-DOT)/2, fy: row*CELL+(CELL-DOT)/2,
        sx: Math.random()*W, sy: Math.random()*H,
        flyStart: Math.random()*600, flyDur: 800+Math.random()*400,
        blinks: Array.from({length:2+Math.floor(Math.random()*2)},()=>Math.random()*400).sort((a,b)=>a-b),
      });
    }
  }
  return _dotsDesktop;
}
function buildMobileDots(mw: number): Dot[] {
  const cell = mw/MOB_COL_COUNT, dot = cell/2, H = WORLD_ROWS*cell;
  const dots: Dot[] = [];
  for (let row=0; row<WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col=MOB_COL_START; col<=MOB_COL_END; col++) {
      if (!rs || rs[col]!=="1") continue;
      dots.push({
        fx: (col-MOB_COL_START)*cell+(cell-dot)/2, fy: row*cell+(cell-dot)/2,
        sx: Math.random()*mw, sy: Math.random()*H,
        flyStart: Math.random()*600, flyDur: 800+Math.random()*400,
        blinks: Array.from({length:2+Math.floor(Math.random()*2)},()=>Math.random()*400).sort((a,b)=>a-b),
      });
    }
  }
  return dots;
}

/* ────────── IntroLink ────────── */
function IntroLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = "font-bold text-[#211f1c] underline underline-offset-2 decoration-[#211f1c]/50 " +
    "transition-colors duration-[--dur-quick] ease-[--ease-fade] hover:text-[#3d6bc4] hover:decoration-[#3d6bc4]";
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/* ────────── animation state ────────── */
type Phase = "parked" | "flip_wait" | "flying";
interface AnimState {
  phase: Phase;
  x: number; y: number; flip: 1|-1;
  parkedStage: number;
  fromX: number; fromY: number;
  toX: number; toY: number;
  ctrlX: number; ctrlY: number;
  startTime: number; duration: number;
  destStage: number;
  flipStartTime: number; nextStage: number;
}

/* ────────── shared animation hook ────────── */
type Stage = { x:number; y:number; flip: 1|-1 };
type ScrollProgress = ReturnType<typeof useScroll>["scrollYProgress"];

function useHeroAnimation({
  active,
  reduced,
  stagesRef,
  planeOuterRef,
  planeFlipRef,
  planeInnerRef,
  scrollYProgress,
}: {
  active: boolean;
  reduced: boolean;
  stagesRef: React.MutableRefObject<Stage[]>;
  planeOuterRef: React.RefObject<HTMLDivElement | null>;
  planeFlipRef: React.RefObject<HTMLDivElement | null>;
  planeInnerRef: React.RefObject<HTMLDivElement | null>;
  scrollYProgress: ScrollProgress;
}) {
  const animRef = useRef<AnimState>({
    phase: "parked", x: 720, y: 30, flip: 1,
    parkedStage: -1,
    fromX: 0, fromY: 0, toX: 0, toY: 0, ctrlX: 0, ctrlY: 0,
    startTime: 0, duration: 1800,
    destStage: 0, flipStartTime: 0, nextStage: 0,
  });

  const targetStageRef = useRef(0);

  const [labelStage,   setLabelStage]   = useState<number>(-1);
  const [typedText,    setTypedText]    = useState("");
  const [labelDone,    setLabelDone]    = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [pulsingPin,   setPulsingPin]   = useState<number | null>(null);
  const [activePinStage, setActivePinStage] = useState(-1);
  const [loadDone,     setLoadDone]     = useState(false);

  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labelFadeRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const rafRef       = useRef<number>(0);

  const typeLabel = useRef((text: string, stage: number) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (labelFadeRef.current) clearTimeout(labelFadeRef.current);
    setTypedText("");
    setLabelDone(false);
    setLabelStage(stage);
    setLabelVisible(true);
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i));
      if (i >= text.length) { clearInterval(typeTimerRef.current!); setLabelDone(true); }
    }, 25);
  });

  const fadeLabel = useRef(() => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    setLabelVisible(false);
    if (labelFadeRef.current) clearTimeout(labelFadeRef.current);
    labelFadeRef.current = setTimeout(() => setLabelStage(-1), 200);
  });

  const startFlight = useRef((targetStage: number, now: number) => {
    const anim = animRef.current;
    const tgt  = stagesRef.current[targetStage];
    const cx   = (anim.x + tgt.x) / 2;
    const cy   = (anim.y + tgt.y) / 2 - 120;
    anim.phase     = "flying";
    anim.fromX     = anim.x; anim.fromY = anim.y;
    anim.toX       = tgt.x;  anim.toY   = tgt.y;
    anim.ctrlX     = cx;     anim.ctrlY = cy;
    anim.startTime = now;
    anim.duration  = 1800;
    anim.destStage = targetStage;
    const inner = planeInnerRef.current;
    if (inner) inner.style.transition = "none";
  });

  const onArrived = useRef((stage: number) => {
    const anim    = animRef.current;
    const flipDiv = planeFlipRef.current;
    const inner   = planeInnerRef.current;
    anim.phase       = "parked";
    anim.parkedStage = stage;
    const pFlip = stagesRef.current[stage].flip;
    if (flipDiv) { flipDiv.style.transition = "none"; flipDiv.style.transform = `scaleX(${pFlip})`; }
    anim.flip = pFlip;
    if (inner) {
      inner.style.transition = "transform 400ms cubic-bezier(0.65,0,0.35,1)";
      inner.style.transform  = "translate(-50%,-50%) rotate(0deg)";
    }
    setActivePinStage(stage);
    // Only show label when this is the final destination
    if (targetStageRef.current === stage) {
      typeLabel.current(STAGE_LABELS[stage].text, stage);
      const pinNum = STAGE_LABELS[stage].pinIdx + 1;
      setPulsingPin(pinNum);
      setTimeout(() => setPulsingPin(null), 480);
    }
  });

  /* rAF tick with reconciler */
  const tickFnRef = useRef<(now: number) => void>(() => {});
  tickFnRef.current = (now: number) => {
    if (!active) return;
    const anim  = animRef.current;
    const outer = planeOuterRef.current;
    const inner = planeInnerRef.current;
    if (!outer || !inner) return;

    if (anim.phase === "flying") {
      const elapsed = now - anim.startTime;
      const rawT    = Math.min(elapsed / anim.duration, 1);
      const t       = EASE_FLY(rawT);
      const x  = qBezPt(t, anim.fromX, anim.ctrlX, anim.toX);
      const y  = qBezPt(t, anim.fromY, anim.ctrlY, anim.toY);
      const dx = qBezTan(t, anim.fromX, anim.ctrlX, anim.toX);
      const dy = qBezTan(t, anim.fromY, anim.ctrlY, anim.toY);
      const angle   = Math.atan2(dy, dx) * 180 / Math.PI;
      const clamped = Math.max(-20, Math.min(20, angle));
      anim.x = x; anim.y = y;
      outer.style.left = `${x}px`;
      outer.style.top  = `${y}px`;
      inner.style.transform = `translate(-50%,-50%) rotate(${clamped}deg)`;
      if (rawT >= 1) {
        anim.x = anim.toX; anim.y = anim.toY;
        outer.style.left = `${anim.toX}px`;
        outer.style.top  = `${anim.toY}px`;
        onArrived.current(anim.destStage);
      }
    } else if (anim.phase === "flip_wait") {
      if (now - anim.flipStartTime >= 600) {
        startFlight.current(anim.nextStage, now);
      }
    } else if (anim.phase === "parked") {
      /* reconciler: step one stage at a time toward targetStageRef */
      const target = targetStageRef.current;
      if (anim.parkedStage !== target) {
        const nextStep = anim.parkedStage + Math.sign(target - anim.parkedStage);
        const flipDiv = planeFlipRef.current;
        if (!flipDiv) return;
        fadeLabel.current();
        const tgt = stagesRef.current[nextStep];
        const cx  = (anim.x + tgt.x) / 2;
        const cy  = (anim.y + tgt.y) / 2 - 120;
        const dx  = qBezTan(0, anim.x, cx, tgt.x);
        const departFlip: 1 | -1 = dx >= 0 ? 1 : -1;
        if (departFlip !== anim.flip) {
          anim.phase         = "flip_wait";
          anim.flipStartTime = now;
          anim.nextStage     = nextStep;
          anim.flip          = departFlip;
          flipDiv.style.transition = "transform 600ms cubic-bezier(0.65,0,0.35,1)";
          flipDiv.style.transform  = `scaleX(${departFlip})`;
        } else {
          startFlight.current(nextStep, now);
        }
      }
    }
  };

  useEffect(() => {
    const loop = (now: number) => { tickFnRef.current(now); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* load sequence */
  useEffect(() => {
    if (!active) return;
    const sp  = stagesRef.current[0];
    const anim = animRef.current;

    if (reduced) {
      anim.x = sp.x; anim.y = sp.y; anim.parkedStage = 0;
      const outer   = planeOuterRef.current;
      const flipDiv = planeFlipRef.current;
      if (outer)   { outer.style.left = `${sp.x}px`; outer.style.top = `${sp.y}px`; outer.style.opacity = "1"; }
      if (flipDiv) { flipDiv.style.transition = "none"; flipDiv.style.transform = `scaleX(${sp.flip})`; }
      anim.flip = sp.flip;
      setActivePinStage(0);
      setLoadDone(true);
      typeLabel.current(STAGE_LABELS[0].text, 0);
      return;
    }

    const startY = sp.y - 80;
    anim.x = sp.x; anim.y = startY; anim.phase = "parked"; anim.parkedStage = -1;
    const outer   = planeOuterRef.current;
    const flipDiv = planeFlipRef.current;
    if (outer)   { outer.style.left = `${sp.x}px`; outer.style.top = `${startY}px`; outer.style.opacity = "0"; }
    if (flipDiv) { flipDiv.style.transition = "none"; flipDiv.style.transform = "scaleX(1)"; }

    const t = setTimeout(() => {
      if (planeOuterRef.current) planeOuterRef.current.style.opacity = "1";
      setLoadDone(true);
      const a = animRef.current;
      a.phase = "flying"; a.fromX = sp.x; a.fromY = sp.y - 80;
      a.toX = sp.x; a.toY = sp.y; a.ctrlX = sp.x; a.ctrlY = sp.y - 110;
      a.startTime = performance.now(); a.duration = 600; a.destStage = 0;
      const inner = planeInnerRef.current;
      if (inner) inner.style.transition = "none";
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);

  /* sync scroll position when load completes */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!loadDone) return;
    targetStageRef.current = progressToStage(p);
  });
  useEffect(() => {
    if (!loadDone) return;
    targetStageRef.current = progressToStage(scrollYProgress.get());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDone]);

  return { labelStage, typedText, labelDone, labelVisible, pulsingPin, activePinStage };
}

/* ────────── PinRing helper ────────── */
function PinRow({
  pin, activeStage, pulsingPin, dotSize, ringSize, idx, reduced,
  ease,
}: {
  pin: typeof PINS[number];
  activeStage: number;
  pulsingPin: number | null;
  dotSize: number;
  ringSize: number;
  idx: number;
  reduced: boolean;
  ease: [number,number,number,number];
}) {
  const isActive  = activeStage === pin.num;
  const isPulsing = pulsingPin === pin.num;
  const fontSize  = Math.round(dotSize * 0.5);
  return (
    <motion.span className="absolute" style={{
      width: ringSize, height: ringSize,
      left: "50%", top: "50%",
      transform: "translate(-50%,-50%)",
      display: "grid", placeItems: "center",
    }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 1.8+idx*0.1, ease }}
    >
      {/* base ring — always visible */}
      <span className="absolute rounded-full" style={{
        width: ringSize, height: ringSize,
        border: `1px solid ${pin.color}`,
        opacity: isActive ? 1 : 0.35,
        transition: "opacity 300ms ease",
        position: "absolute", left: 0, top: 0,
      }} />
      {/* pulse ring — arrival only */}
      {isPulsing && (
        <motion.span className="absolute rounded-full"
          key={`pulse-${pin.num}-${Date.now()}`}
          initial={{ scale: 1, opacity: 0.35 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.48, ease: easeFade }}
          style={{
            width: ringSize, height: ringSize,
            border: `1px solid ${pin.color}`,
            position: "absolute", left: 0, top: 0,
          }}
        />
      )}
      {/* dot */}
      <span className="relative grid place-items-center rounded-full" style={{
        width: dotSize, height: dotSize, backgroundColor: pin.color,
        fontFamily: "var(--font-mono)", fontSize, fontWeight: 500,
        letterSpacing: "0.1em", color: "#ffffff", zIndex: 1,
      }}>{pin.num}</span>
    </motion.span>
  );
}

/* ────────── LabelBox helper ────────── */
function LabelBox({
  lbl, labelVisible, typedText, labelDone, padding, fontSize,
}: {
  lbl: typeof STAGE_LABELS[number];
  labelVisible: boolean;
  typedText: string;
  labelDone: boolean;
  padding: string;
  fontSize: number;
}) {
  return (
    <div style={{
      backgroundColor: lbl.dark ? "#273142" : "rgba(255,255,255,0.92)",
      border: `1px solid ${lbl.dark ? "transparent" : "#d6d6d2"}`,
      padding,
      whiteSpace: "nowrap",
      fontFamily: "var(--font-sans)", fontSize, fontWeight: 500,
      lineHeight: 1.5, color: lbl.dark ? "#fcfcfb" : "#211f1c",
      opacity: labelVisible ? 1 : 0,
      transition: "opacity 160ms ease",
    }}>
      {typedText}
      {!labelDone && (
        <span style={{ display:"inline-block", width:1, animation:"hero-caret 0.7s step-end infinite" }}>|</span>
      )}
    </div>
  );
}

/* ────────── IntroText helper ────────── */
function IntroText({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const ease: [number,number,number,number] = [0.22, 1, 0.36, 1];
  const h1Size = mobile ? 34 : 64;
  const pSize  = mobile ? 16 : 18;
  const p2Size = mobile ? 15 : 16;
  return (
    <>
      <motion.h1
        style={{ fontFamily:"var(--font-sans)", fontSize:h1Size, fontWeight:600,
                 lineHeight: mobile ? 1.1 : 1.04, letterSpacing:"-0.03em", color:"#211f1c" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.2, ease:[0.4,0,0.2,1] }}
      >Shreya Shanmugam.</motion.h1>

      <motion.p
        style={{ marginTop: mobile ? 8 : 10, fontFamily:"var(--font-sans)", fontSize:pSize, lineHeight:1.6 }}
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 1.7, ease }}
      >
        <span style={{ fontWeight:400, color:"#211f1c" }}>Designing to make complex systems feel </span>
        <span style={{ fontWeight:700, color:"#3d6bc4" }}>simple</span>
        <span style={{ fontWeight:700, color:"#b3c3e5" }}>.</span>
      </motion.p>

      <motion.p className="pointer-events-auto"
        style={{ marginTop: mobile ? 8 : 10, fontFamily:"var(--font-sans)", fontSize:p2Size,
                 lineHeight:1.6, color:"#434343" }}
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 2.0, ease }}
      >
        <span style={{ fontWeight:400 }}>Currently</span>{" "}
        <span style={{ fontWeight:700 }}>@</span>{" "}
        <IntroLink href="/about">USC Iovine and Young Academy</IntroLink>{" "}
        <span style={{ fontWeight:400 }}>and</span>{" "}
        <IntroLink href="/about">Marshall</IntroLink>
        <span style={{ fontWeight:700 }}>.</span><br />
        <span style={{ fontWeight:400 }}>Consulting</span>{" "}
        <span style={{ fontWeight:700 }}>@</span>{" "}
        <IntroLink href="#disney">Disney Experiences</IntroLink>{" "}
        <span style={{ fontWeight:400 }}>with ProductSC, previously</span>{" "}
        <span style={{ fontWeight:700 }}>@</span>{" "}
        <IntroLink href="#synechron">Synechron</IntroLink>
        <span style={{ fontWeight:700 }}>.</span>
      </motion.p>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   DESKTOP HERO
═══════════════════════════════════════════════════════ */
function HeroDesktop() {
  const [active, setActive] = useState(false);
  const [s, setS] = useState(1);
  const reduced = useReducedMotion() ?? false;
  const ease: [number,number,number,number] = [0.22, 1, 0.36, 1];

  const outerRef      = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const planeOuterRef = useRef<HTMLDivElement>(null);
  const planeFlipRef  = useRef<HTMLDivElement>(null);
  const planeInnerRef = useRef<HTMLDivElement>(null);

  const stagesRef = useRef(STAGES_DESKTOP.map(s => ({ x:s.x, y:s.y, flip:s.flip })));

  /* matchMedia gate */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = (matches: boolean) => setActive(matches);
    sync(mq.matches);
    const h = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* viewport scale */
  useEffect(() => {
    if (!active) return;
    const update = () => {
      setS(Math.min(window.innerWidth / 1440, window.innerHeight / 720, 1.25));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);

  /* desktop canvas */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = WORLD_COLS*CELL, H = WORLD_ROWS*CELL;
    canvas.width = W*dpr; canvas.height = H*dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    function drawFinal() {
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888"; ctx!.globalAlpha=1;
      for (let r=0; r<WORLD_ROWS; r++) {
        const rs=WORLD_ROWS_DATA[r];
        for (let c=0; c<WORLD_COLS; c++)
          if (rs[c]==="1") ctx!.fillRect(c*CELL+(CELL-DOT)/2, r*CELL+(CELL-DOT)/2, DOT, DOT);
      }
    }
    if (reduced) { drawFinal(); return; }

    const dots = buildDesktopDots();
    const t0 = performance.now(); let raf = 0;
    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888";
      for (const d of dots) {
        let op=0;
        for (let b=0;b<d.blinks.length;b++) { if (e<d.blinks[b]) break; op=(b&1)===0?1:0; }
        if (e>=d.flyStart+d.flyDur) op=1;
        if (op===0) continue;
        let x:number, y:number;
        if (e<d.flyStart) { x=d.sx; y=d.sy; }
        else if (e>=d.flyStart+d.flyDur) { x=d.fx; y=d.fy; }
        else { const p=EASE_MV((e-d.flyStart)/d.flyDur); x=lerp(d.sx,d.fx,p); y=lerp(d.sy,d.fy,p); }
        ctx!.globalAlpha=op; ctx!.fillRect(x,y,DOT,DOT);
      }
      ctx!.globalAlpha=1;
      if (e<2000) raf=requestAnimationFrame(frame); else drawFinal();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start","end end"] });

  const { labelStage, typedText, labelDone, labelVisible, pulsingPin, activePinStage } =
    useHeroAnimation({ active, reduced, stagesRef, planeOuterRef, planeFlipRef, planeInnerRef, scrollYProgress });

  const lbl    = labelStage >= 0 ? STAGE_LABELS[labelStage] : null;
  const lblPin = lbl != null ? PINS[lbl.pinIdx] : null;

  return (
    <div ref={outerRef} style={{ height:"500vh" }}>
      <section className="sticky top-0 w-full overflow-hidden"
        style={{ height:"100vh", backgroundColor:"#e9e9e6" }}>

        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundColor:"rgba(108,159,222,0.20)" }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background:"radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(108,159,222,0.12) 100%)",
        }} />

        {/* 1440×720 stage */}
        <div className="absolute left-1/2 top-1/2" style={{
          width:1440, height:720,
          transform:`translate(-50%,-50%) scale(${s})`,
          transformOrigin:"center",
        }}>
          {/* pixel map */}
          <canvas ref={canvasRef} className="absolute" aria-hidden="true" style={{
            top:MAP_TOP, left:0, zIndex:1,
            WebkitMaskImage:"linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
            maskImage:"linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
          }} />

          {/* white glow */}
          <div className="pointer-events-none absolute" style={{
            width:1540, height:642, left:-50, top:10, zIndex:2,
            background:"radial-gradient(closest-side, rgba(255,255,255,0.82), rgba(255,255,255,0))",
          }} />

          {/* plane */}
          <div ref={planeOuterRef} className="absolute pointer-events-none"
            style={{ left:720, top:44, zIndex:10, opacity:0, transition:"opacity 0.8s ease" }}>
            <div ref={planeFlipRef}
              style={{ transform:"scaleX(1)", transition:"transform 600ms cubic-bezier(0.65,0,0.35,1)" }}>
              <div ref={planeInnerRef}
                style={{ transform:"translate(-50%,-50%) rotate(0deg)", transition:"none" }}>
                <Plane width={132} />
              </div>
            </div>
          </div>

          {/* pins */}
          {PINS.map((pin, idx) => (
            <div key={pin.num} className="pointer-events-auto absolute"
              style={{ left:pin.x, top:pin.y, width:30, height:30,
                       transform:"translate(-50%,-50%)", zIndex:20 }}
              aria-label={STAGE_LABELS[idx+1]?.text}
            >
              <PinRow pin={pin} activeStage={activePinStage} pulsingPin={pulsingPin}
                dotSize={22} ringSize={30} idx={idx} reduced={reduced} ease={ease} />
            </div>
          ))}

          {/* label */}
          {lbl && lblPin && (
            <div className="pointer-events-none absolute" style={{
              ...(lbl.placement === "below" ? {
                left: lblPin.x, top: lblPin.y + 23,
                transform: "translateX(-50%)",
              } : {
                left: lblPin.x + 22, top: lblPin.y,
                transform: "translateY(-50%)",
              }),
              zIndex: 30,
            }}>
              <LabelBox lbl={lbl} labelVisible={labelVisible}
                typedText={typedText} labelDone={labelDone}
                padding="6px 11px" fontSize={14} />
            </div>
          )}

          {/* name block */}
          <div className="pointer-events-none absolute w-full text-center" style={{ top:230, zIndex:20 }}>
            <IntroText reduced={reduced} mobile={false} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MOBILE HERO
═══════════════════════════════════════════════════════ */
function HeroMobile() {
  const [active, setActive]   = useState(false);
  const [mobileW, setMobileW] = useState(375);
  const reduced = useReducedMotion() ?? false;

  const outerRef      = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const planeOuterRef = useRef<HTMLDivElement>(null);
  const planeFlipRef  = useRef<HTMLDivElement>(null);
  const planeInnerRef = useRef<HTMLDivElement>(null);

  const stagesRef = useRef(getMobileStages(375));

  /* matchMedia gate */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = (matches: boolean) => setActive(matches);
    sync(mq.matches);
    const h = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* ResizeObserver for canvas width — ignores height-only resizes */
  useEffect(() => {
    if (!active) return;
    const el = containerRef.current; if (!el) return;
    let lastW = 0;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = Math.round(e.contentRect.width);
        if (w !== lastW && w > 0) {
          lastW = w;
          setMobileW(w);
          stagesRef.current = getMobileStages(w);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  /* mobile canvas */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr  = window.devicePixelRatio || 1;
    const mw   = mobileW;
    const cell = mw / MOB_COL_COUNT;
    const dot  = cell / 2;
    const W = mw, H = WORLD_ROWS * cell;
    canvas.width = W*dpr; canvas.height = H*dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    function drawFinal() {
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888"; ctx!.globalAlpha=1;
      for (let r=0; r<WORLD_ROWS; r++) {
        const rs=WORLD_ROWS_DATA[r];
        for (let c=MOB_COL_START; c<=MOB_COL_END; c++) {
          if (!rs || rs[c]!=="1") continue;
          ctx!.fillRect((c-MOB_COL_START)*cell+(cell-dot)/2, r*cell+(cell-dot)/2, dot, dot);
        }
      }
    }
    if (reduced) { drawFinal(); return; }

    const dots = buildMobileDots(mw);
    const t0 = performance.now(); let raf = 0;
    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888";
      for (const d of dots) {
        let op=0;
        for (let b=0;b<d.blinks.length;b++) { if (e<d.blinks[b]) break; op=(b&1)===0?1:0; }
        if (e>=d.flyStart+d.flyDur) op=1;
        if (op===0) continue;
        let x:number, y:number;
        if (e<d.flyStart) { x=d.sx; y=d.sy; }
        else if (e>=d.flyStart+d.flyDur) { x=d.fx; y=d.fy; }
        else { const p=EASE_MV((e-d.flyStart)/d.flyDur); x=lerp(d.sx,d.fx,p); y=lerp(d.sy,d.fy,p); }
        ctx!.globalAlpha=op; ctx!.fillRect(x,y,dot,dot);
      }
      ctx!.globalAlpha=1;
      if (e<2000) raf=requestAnimationFrame(frame); else drawFinal();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, mobileW, reduced]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start","end end"] });

  const { labelStage, typedText, labelDone, labelVisible, pulsingPin, activePinStage } =
    useHeroAnimation({ active, reduced, stagesRef, planeOuterRef, planeFlipRef, planeInnerRef, scrollYProgress });

  const mw     = mobileW;
  const cell   = mw / MOB_COL_COUNT;
  const mapH   = WORLD_ROWS * cell;
  const mobPins = PIN_CELLS.map((pc, i) => ({
    ...PINS[i],
    cx: (pc.col - MOB_COL_START + 0.5) * cell,
    cy: pc.row * cell + cell * 0.5,
  }));

  const lbl       = labelStage >= 0 ? STAGE_LABELS[labelStage] : null;
  const mobLblPin = lbl != null ? mobPins[lbl.pinIdx] : null;
  const ease: [number,number,number,number] = [0.22, 1, 0.36, 1];

  return (
    <div ref={outerRef} style={{ height:"400vh" }}>
      <section className="sticky top-0 w-full overflow-hidden"
        style={{ height:"100vh", backgroundColor:"#e9e9e6", display:"flex", flexDirection:"column" }}>

        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundColor:"rgba(108,159,222,0.20)" }} />

        {/* map strip */}
        <div ref={containerRef}
          style={{ position:"relative", width:"100%", overflow:"hidden", flexShrink:0, height:mapH }}>
          <div className="pointer-events-none absolute inset-0" style={{ zIndex:2,
            background:"radial-gradient(closest-side, rgba(255,255,255,0.65), rgba(255,255,255,0))",
          }} />

          <canvas ref={canvasRef} aria-hidden="true"
            style={{ position:"absolute", top:0, left:0, zIndex:1 }} />

          {/* plane */}
          <div ref={planeOuterRef} className="absolute pointer-events-none"
            style={{ left:mw/2, top:mobPins[1].cy - 40*(mw/890), zIndex:10,
                     opacity:0, transition:"opacity 0.8s ease" }}>
            <div ref={planeFlipRef} style={{ transform:"scaleX(1)" }}>
              <div ref={planeInnerRef} style={{ transform:"translate(-50%,-50%) rotate(0deg)" }}>
                <Plane width={48} />
              </div>
            </div>
          </div>

          {/* pins */}
          {mobPins.map((pin, idx) => (
            <div key={pin.num} className="absolute"
              style={{ left:pin.cx, top:pin.cy, width:20, height:20,
                       transform:"translate(-50%,-50%)", zIndex:20 }}>
              <PinRow pin={pin} activeStage={activePinStage} pulsingPin={pulsingPin}
                dotSize={18} ringSize={20} idx={idx} reduced={reduced} ease={ease} />
            </div>
          ))}

          {/* label */}
          {lbl && mobLblPin && (
            <div className="pointer-events-none absolute" style={{
              ...(lbl.placement === "below" ? {
                left: Math.max(8, Math.min(mw - 168, mobLblPin.cx - 80)),
                top: mobLblPin.cy + 14,
              } : {
                left: Math.min(mobLblPin.cx + 12, mw - 168),
                top: mobLblPin.cy,
                transform: "translateY(-50%)",
              }),
              zIndex: 30,
              maxWidth: `calc(${mw}px - 8px)`,
            }}>
              <LabelBox lbl={lbl} labelVisible={labelVisible}
                typedText={typedText} labelDone={labelDone}
                padding="4px 8px" fontSize={12} />
            </div>
          )}
        </div>

        {/* text block */}
        <div className="pointer-events-auto flex-1 flex flex-col justify-center px-6"
          style={{ zIndex:10, position:"relative" }}>
          <IntroText reduced={reduced} mobile={true} />
        </div>
      </section>
    </div>
  );
}

/* ────────── default export ────────── */
export default function Hero() {
  return (
    <>
      <div className="md:hidden"><HeroMobile /></div>
      <div className="hidden md:block"><HeroDesktop /></div>
    </>
  );
}
