"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { easeFade } from "@/lib/motion";
import Plane from "./Plane";
import { WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/world-pixels";

/* ────────────────── layout constants ────────────────── */
const CELL    = 10;
const DOT     = 5;
const MAP_TOP = 96;   // canvas top offset in the 1440-px stage

/* ────────────────── pin data ────────────────── */
const PINS = [
  { num: 1, x: 1034, y: 338, color: "#6c9fde" },
  { num: 2, x: 247,  y: 272, color: "#d97a2a" },
  { num: 3, x: 502,  y: 185, color: "#3d6bc4" },
] as const;

/* World-pixel cell coords for each pin (col from left, row from top) */
const PIN_CELLS = [
  { col: 103, row: 24 }, // pin1 Hyderabad  x=1034→col103  y=338-96=242→row24
  { col: 25,  row: 18 }, // pin2 LA         x=247 →col24   y=272-96=176→row18
  { col: 50,  row: 9  }, // pin3 NY         x=502 →col50   y=185-96=89 →row9
] as const;

/* ────────────────── stage definitions ────────────────── */
/* Desktop positions in 1440-px frame */
const STAGES_DESKTOP = [
  { x: 720,  y: 124, flip:  1 as 1 | -1 }, // Rest  (106px above name top 230)
  { x: 1038, y: 308, flip:  1 as 1 | -1 }, // Stage 1
  { x: 269,  y: 232, flip: -1 as 1 | -1 }, // Stage 2
  { x: 524,  y: 145, flip:  1 as 1 | -1 }, // Stage 3
];

/* Mobile stage positions computed from pin cells (mw = mobile width) */
const MOB_COL_START = 20;
const MOB_COL_END   = 108;
const MOB_COL_COUNT = MOB_COL_END - MOB_COL_START + 1; // 89

function getMobileStages(mw: number) {
  const cell  = mw / MOB_COL_COUNT;
  const mS    = mw / 890; // offset scale (desktop offsets are in 890px unit)
  const pins  = PIN_CELLS.map(pc => ({
    cx: (pc.col - MOB_COL_START + 0.5) * cell,
    cy: pc.row * cell + cell * 0.5,
  }));
  return [
    { x: mw / 2,                          y: pins[1].cy - 40 * mS, flip:  1 as 1 | -1 }, // Rest
    { x: pins[0].cx + 4 * mS,             y: pins[0].cy - 30 * mS, flip:  1 as 1 | -1 }, // Stage 1
    { x: pins[1].cx + 22 * mS,            y: pins[1].cy - 40 * mS, flip: -1 as 1 | -1 }, // Stage 2
    { x: pins[2].cx + 22 * mS,            y: pins[2].cy - 40 * mS, flip:  1 as 1 | -1 }, // Stage 3
  ];
}

/* Label data per stage */
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

/* ────────────────── bezier utilities ────────────────── */
function makeLUT(p1x: number, p1y: number, p2x: number, p2y: number, n = 200) {
  const xs = new Float64Array(n + 1), ys = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    xs[i] = 3*u*u*t*p1x + 3*u*t*t*p2x + t*t*t;
    ys[i] = 3*u*u*t*p1y + 3*u*t*t*p2y + t*t*t;
  }
  return (x: number) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = n;
    while (lo < hi - 1) { const m = (lo+hi)>>1; if (xs[m]<x) lo=m; else hi=m; }
    return ys[lo] + (x-xs[lo])/(xs[hi]-xs[lo])*(ys[hi]-ys[lo]);
  };
}
const EASE_MV  = makeLUT(0.22, 1, 0.36, 1); // scatter
const EASE_FLY = makeLUT(0.65, 0, 0.35, 1); // plane arc

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function qBezPt(t: number, p0: number, c: number, p1: number) {
  const u = 1 - t;
  return u*u*p0 + 2*u*t*c + t*t*p1;
}
function qBezTan(t: number, p0: number, c: number, p1: number) {
  return 2*(1-t)*(c - p0) + 2*t*(p1 - c);
}

/* ────────────────── canvas dot builders ────────────────── */
interface Dot { fx:number; fy:number; sx:number; sy:number; flyStart:number; flyDur:number; blinks:number[]; }
let _dotsDesktop: Dot[] | null = null;

function buildDesktopDots(): Dot[] {
  if (_dotsDesktop) return _dotsDesktop;
  _dotsDesktop = [];
  const W = WORLD_COLS * CELL, H = WORLD_ROWS * CELL;
  for (let row = 0; row < WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col = 0; col < WORLD_COLS; col++) {
      if (rs[col] !== "1") continue;
      _dotsDesktop.push({
        fx: col*CELL + (CELL-DOT)/2, fy: row*CELL + (CELL-DOT)/2,
        sx: Math.random()*W, sy: Math.random()*H,
        flyStart: Math.random()*600, flyDur: 800+Math.random()*400,
        blinks: Array.from({length:2+Math.floor(Math.random()*2)},()=>Math.random()*400).sort((a,b)=>a-b),
      });
    }
  }
  return _dotsDesktop;
}

function buildMobileDots(mw: number): Dot[] {
  const cell = mw / MOB_COL_COUNT;
  const dot  = cell / 2;
  const H    = WORLD_ROWS * cell;
  const dots: Dot[] = [];
  for (let row = 0; row < WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col = MOB_COL_START; col <= MOB_COL_END; col++) {
      if (!rs || rs[col] !== "1") continue;
      dots.push({
        fx: (col - MOB_COL_START)*cell + (cell-dot)/2,
        fy: row*cell + (cell-dot)/2,
        sx: Math.random()*mw, sy: Math.random()*H,
        flyStart: Math.random()*600, flyDur: 800+Math.random()*400,
        blinks: Array.from({length:2+Math.floor(Math.random()*2)},()=>Math.random()*400).sort((a,b)=>a-b),
      });
    }
  }
  return dots;
}

/* ────────────────── IntroLink ────────────────── */
function IntroLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = "font-bold text-[#211f1c] underline underline-offset-2 decoration-[#211f1c]/50 " +
    "transition-colors duration-[--dur-quick] ease-[--ease-fade] hover:text-[#3d6bc4] hover:decoration-[#3d6bc4]";
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/* ────────────────── animation state ────────────────── */
type Phase = "parked" | "flip_wait" | "flying";
interface AnimState {
  phase:       Phase;
  x:           number;
  y:           number;
  flip:        1 | -1;
  parkedStage: number;
  fromX: number; fromY: number;
  toX:   number; toY:   number;
  ctrlX: number; ctrlY: number;
  startTime:   number;
  duration:    number;
  destStage:   number;
  queuedStage: number;      // -1 = none
  flipStartTime: number;
  nextStage:   number;
}

/* ────────────────── Hero ────────────────── */
export default function Hero() {
  const outerRef      = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const planeOuterRef = useRef<HTMLDivElement>(null);
  const planeFlipRef  = useRef<HTMLDivElement>(null);
  const planeInnerRef = useRef<HTMLDivElement>(null);
  const rafRef        = useRef<number>(0);
  const isMobileRef   = useRef(false);

  const animRef = useRef<AnimState>({
    phase: "parked", x: 720, y: 30, flip: 1,
    parkedStage: -1,
    fromX: 720, fromY: 30, toX: 720, toY: 124, ctrlX: 720, ctrlY: 50,
    startTime: 0, duration: 1800,
    destStage: 0, queuedStage: -1,
    flipStartTime: 0, nextStage: 0,
  });

  /* active stage positions (desktop or mobile), updated on viewport change */
  const stagesRef = useRef(STAGES_DESKTOP.map(s => ({ x: s.x, y: s.y, flip: s.flip })));

  /* label react state */
  const [labelStage,   setLabelStage]   = useState<number>(-1);
  const [typedText,    setTypedText]    = useState("");
  const [labelDone,    setLabelDone]    = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [pulsingPin,   setPulsingPin]   = useState<number | null>(null);

  /* viewport state */
  const [isMobile, setIsMobile] = useState(false);
  const [mobileW,  setMobileW]  = useState(375);
  const [s,        setS]        = useState(1);
  const [loadDone, setLoadDone] = useState(false);

  const reduced = useReducedMotion() ?? false;

  /* timers */
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labelFadeRef = useRef<ReturnType<typeof setTimeout>  | null>(null);

  /* ── action functions via ref so rAF can call them ── */
  const typeLabel = useRef((text: string, stage: number) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
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
    anim.ctrlX     = cx;     anim.ctrlY  = cy;
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
    if (stage > 0) {
      typeLabel.current(STAGE_LABELS[stage].text, stage);
      const pinNum = STAGE_LABELS[stage].pinIdx + 1;
      setPulsingPin(pinNum);
      setTimeout(() => setPulsingPin(null), 480);
    }
    if (anim.queuedStage !== -1 && anim.queuedStage !== stage) {
      const q = anim.queuedStage;
      anim.queuedStage = -1;
      requestDepart.current(q);
    }
  });

  const requestDepart = useRef((targetStage: number) => {
    const anim    = animRef.current;
    const flipDiv = planeFlipRef.current;
    if (!flipDiv) return;
    // Step one stage at a time toward targetStage so every intermediate stop is visited
    const nextStep = anim.parkedStage + Math.sign(targetStage - anim.parkedStage);
    if (nextStep === anim.parkedStage) return;
    if (nextStep !== targetStage) anim.queuedStage = targetStage;
    fadeLabel.current();
    const tgt = stagesRef.current[nextStep];
    const cx  = (anim.x + tgt.x) / 2;
    const cy  = (anim.y + tgt.y) / 2 - 120;
    const dx  = qBezTan(0, anim.x, cx, tgt.x);
    const departFlip: 1 | -1 = dx >= 0 ? 1 : -1;
    if (departFlip !== anim.flip) {
      anim.phase         = "flip_wait";
      anim.flipStartTime = performance.now();
      anim.nextStage     = nextStep;
      anim.flip          = departFlip;
      flipDiv.style.transition = "transform 600ms cubic-bezier(0.65,0,0.35,1)";
      flipDiv.style.transform  = `scaleX(${departFlip})`;
    } else {
      startFlight.current(nextStep, performance.now());
    }
  });

  /* ── rAF tick ── */
  const tickFnRef = useRef<(now: number) => void>(() => {});
  tickFnRef.current = (now: number) => {
    const anim    = animRef.current;
    const outer   = planeOuterRef.current;
    const inner   = planeInnerRef.current;
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
    }
  };

  useEffect(() => {
    const loop = (now: number) => { tickFnRef.current(now); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── viewport detection ── */
  useEffect(() => {
    const check = () => {
      const mob = window.innerWidth < 768;
      const mw  = window.innerWidth;
      isMobileRef.current = mob;
      setIsMobile(mob);
      setMobileW(mw);
      if (!mob) {
        setS(Math.min(mw / 1440, window.innerHeight / 720, 1.25));
        stagesRef.current = STAGES_DESKTOP.map(s => ({ x: s.x, y: s.y, flip: s.flip }));
      } else {
        stagesRef.current = getMobileStages(mw);
      }
      /* Re-snap plane to current parked stage if not flying */
      const anim = animRef.current;
      if (anim.phase === "parked" && anim.parkedStage >= 0) {
        const sp = stagesRef.current[anim.parkedStage];
        anim.x = sp.x; anim.y = sp.y;
        const outer = planeOuterRef.current;
        if (outer) { outer.style.left = `${sp.x}px`; outer.style.top = `${sp.y}px`; }
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── desktop canvas (scatter + settle) ── */
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
    const t0 = performance.now();
    let raf = 0;
    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888";
      for (const d of dots) {
        let op=0;
        for (let b=0;b<d.blinks.length;b++) { if (e<d.blinks[b]) break; op=(b&1)===0?1:0; }
        if (e>=d.flyStart+d.flyDur) op=1;
        if (op===0) continue;
        let x:number, y:number;
        if (e<d.flyStart)               { x=d.sx; y=d.sy; }
        else if (e>=d.flyStart+d.flyDur){ x=d.fx; y=d.fy; }
        else { const p=EASE_MV((e-d.flyStart)/d.flyDur); x=lerp(d.sx,d.fx,p); y=lerp(d.sy,d.fy,p); }
        ctx!.globalAlpha=op; ctx!.fillRect(x,y,DOT,DOT);
      }
      ctx!.globalAlpha=1;
      if (e<2000) raf=requestAnimationFrame(frame); else drawFinal();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, reduced]);

  /* ── mobile canvas ── */
  useEffect(() => {
    if (!isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr  = window.devicePixelRatio || 1;
    const mw   = window.innerWidth;
    const cell = mw / MOB_COL_COUNT;
    const dot  = cell / 2;
    const W    = mw;
    const H    = WORLD_ROWS * cell;
    canvas.width  = W*dpr; canvas.height = H*dpr;
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
    const t0 = performance.now();
    let raf = 0;
    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888";
      for (const d of dots) {
        let op=0;
        for (let b=0;b<d.blinks.length;b++) { if (e<d.blinks[b]) break; op=(b&1)===0?1:0; }
        if (e>=d.flyStart+d.flyDur) op=1;
        if (op===0) continue;
        let x:number, y:number;
        if (e<d.flyStart)               { x=d.sx; y=d.sy; }
        else if (e>=d.flyStart+d.flyDur){ x=d.fx; y=d.fy; }
        else { const p=EASE_MV((e-d.flyStart)/d.flyDur); x=lerp(d.sx,d.fx,p); y=lerp(d.sy,d.fy,p); }
        ctx!.globalAlpha=op; ctx!.fillRect(x,y,dot,dot);
      }
      ctx!.globalAlpha=1;
      if (e<2000) raf=requestAnimationFrame(frame); else drawFinal();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, mobileW, reduced]);

  /* ── load sequence: plane flies into Rest ── */
  useEffect(() => {
    if (reduced) {
      const sp = stagesRef.current[0];
      const anim = animRef.current;
      anim.x = sp.x; anim.y = sp.y;
      anim.parkedStage = 0;
      const outer = planeOuterRef.current;
      const flipDiv = planeFlipRef.current;
      if (outer) { outer.style.left=`${sp.x}px`; outer.style.top=`${sp.y}px`; outer.style.opacity="1"; }
      if (flipDiv) { flipDiv.style.transition="none"; flipDiv.style.transform=`scaleX(${sp.flip})`; }
      animRef.current.flip = sp.flip;
      setLoadDone(true);
      return;
    }

    /* Start above rest; fade in at 0.8s and fly down */
    const sp = stagesRef.current[0];
    const startY = sp.y - 80;
    const anim   = animRef.current;
    anim.x = sp.x; anim.y = startY; anim.phase = "parked"; anim.parkedStage = -1;

    const outer   = planeOuterRef.current;
    const flipDiv = planeFlipRef.current;
    if (outer) { outer.style.left=`${sp.x}px`; outer.style.top=`${startY}px`; outer.style.opacity="0"; }
    if (flipDiv) { flipDiv.style.transition="none"; flipDiv.style.transform="scaleX(1)"; }

    const t = setTimeout(() => {
      const outer2   = planeOuterRef.current;
      if (outer2) outer2.style.opacity = "1";
      setLoadDone(true);
      /* fly from above to rest */
      const a = animRef.current;
      const sp2 = stagesRef.current[0];
      a.phase     = "flying";
      a.fromX     = sp2.x;  a.fromY = sp2.y - 80;
      a.toX       = sp2.x;  a.toY   = sp2.y;
      a.ctrlX     = sp2.x;  a.ctrlY = sp2.y - 110;
      a.startTime = performance.now();
      a.duration  = 600;
      a.destStage = 0;
      const inner = planeInnerRef.current;
      if (inner) inner.style.transition = "none";
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* ── scroll → stages ── */
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start","end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!loadDone) return;
    const target = progressToStage(p);
    const anim   = animRef.current;

    if (anim.phase === "parked") {
      if (target !== anim.parkedStage) requestDepart.current(target);
    } else {
      if (target !== anim.destStage) anim.queuedStage = target;
    }
  });

  /* Re-check scroll position the moment load completes (user may have scrolled before loadDone) */
  useEffect(() => {
    if (!loadDone) return;
    const p = scrollYProgress.get();
    const target = progressToStage(p);
    if (target > 0) animRef.current.queuedStage = target;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDone]);

  /* ── label render data ── */
  const lbl    = labelStage >= 0 ? STAGE_LABELS[labelStage] : null;
  const lblPin = lbl != null ? PINS[lbl.pinIdx] : null;
  const ease: [number,number,number,number] = [0.22, 1, 0.36, 1];

  /* ─────────────────────────────────────────────
     MOBILE LAYOUT (<768px)
  ──────────────────────────────────────────────── */
  if (isMobile) {
    const mw     = mobileW;
    const cell   = mw / MOB_COL_COUNT;
    const mapH   = WORLD_ROWS * cell;
    const mobPins = PIN_CELLS.map((pc, i) => ({
      ...PINS[i],
      cx: (pc.col - MOB_COL_START + 0.5) * cell,
      cy: pc.row * cell + cell * 0.5,
    }));

    const mobLblPin = lbl != null ? mobPins[lbl.pinIdx] : null;

    return (
      <div ref={outerRef} style={{ height: "400vh" }}>
        <section className="sticky top-0 w-full overflow-hidden"
          style={{ height:"100vh", backgroundColor:"#e9e9e6", display:"flex", flexDirection:"column" }}>

          <div className="pointer-events-none absolute inset-0"
            style={{ backgroundColor:"rgba(108,159,222,0.20)" }} />

          {/* map strip */}
          <div style={{ position:"relative", width:"100%", overflow:"hidden", flexShrink:0, height:mapH }}>
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
            {mobPins.map((pin) => (
              <div key={pin.num} className="absolute"
                style={{ left:pin.cx, top:pin.cy, zIndex:20, transform:"translate(-50%,-50%)" }}>
                <motion.span className="absolute rounded-full"
                  animate={pulsingPin===pin.num ? {scale:[1,1.6],opacity:[0.35,0]} : {scale:1,opacity:0}}
                  transition={pulsingPin===pin.num ? {duration:0.48,ease:easeFade} : {duration:0}}
                  style={{ width:20, height:20, border:`1px solid ${pin.color}`,
                           position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)" }}
                />
                <span className="relative grid place-items-center rounded-full" style={{
                  width:18, height:18, backgroundColor:pin.color,
                  fontFamily:"var(--font-mono)", fontSize:9, fontWeight:500,
                  letterSpacing:"0.1em", color:"#ffffff", zIndex:1,
                }}>{pin.num}</span>
              </div>
            ))}

            {/* mobile label */}
            {lbl && mobLblPin && (
              <div className="pointer-events-none absolute" style={{
                ...(lbl.placement === "below" ? {
                  /* clamp so label never overflows either edge (assume ≤160px wide at 12px) */
                  left: Math.max(8, Math.min(mw - 168, mobLblPin.cx - 80)),
                  top: mobLblPin.cy + 14,
                } : {
                  left: Math.min(mobLblPin.cx + 12, mw - 168),
                  top: mobLblPin.cy,
                  transform: "translateY(-50%)",
                }),
                zIndex:30,
                opacity: labelVisible ? 1 : 0,
                transition: "opacity 160ms ease",
                maxWidth: `calc(${mw}px - 8px)`,
              }}>
                <div style={{
                  backgroundColor: lbl.dark ? "#273142" : "rgba(255,255,255,0.92)",
                  border: `1px solid ${lbl.dark ? "transparent" : "#d6d6d2"}`,
                  padding: "4px 8px",
                  whiteSpace: "nowrap",
                  fontFamily:"var(--font-sans)", fontSize:12, fontWeight:500,
                  color: lbl.dark ? "#fcfcfb" : "#211f1c",
                  lineHeight:1.5,
                }}>
                  {typedText}
                  {!labelDone && <span style={{display:"inline-block",width:1,animation:"hero-caret 0.7s step-end infinite"}}>|</span>}
                </div>
              </div>
            )}
          </div>

          {/* text block */}
          <div className="pointer-events-auto flex-1 flex flex-col justify-center px-6"
            style={{ zIndex:10, position:"relative" }}>
            <motion.h1
              style={{ fontFamily:"var(--font-sans)", fontSize:34, fontWeight:600,
                       lineHeight:1.1, letterSpacing:"-0.02em", color:"#211f1c" }}
              initial={reduced ? false : { opacity:0 }}
              animate={reduced ? {} : { opacity:1 }}
              transition={reduced ? {} : { duration:0.6, delay:1.2, ease:[0.4,0,0.2,1] }}
            >Shreya Shanmugam.</motion.h1>

            <motion.p
              style={{ marginTop:8, fontFamily:"var(--font-sans)", fontSize:16, lineHeight:1.6 }}
              initial={reduced ? false : { opacity:0, y:12 }}
              animate={reduced ? {} : { opacity:1, y:0 }}
              transition={reduced ? {} : { duration:0.6, delay:1.6, ease }}
            >
              <span style={{ fontWeight:400, color:"#211f1c" }}>Designing to make complex systems feel </span>
              <span style={{ fontWeight:700, color:"#3d6bc4" }}>simple</span>
              <span style={{ fontWeight:700, color:"#b3c3e5" }}>.</span>
            </motion.p>

            <motion.p className="pointer-events-auto"
              style={{ marginTop:8, fontFamily:"var(--font-sans)", fontSize:15, lineHeight:1.6, color:"#434343" }}
              initial={reduced ? false : { opacity:0, y:12 }}
              animate={reduced ? {} : { opacity:1, y:0 }}
              transition={reduced ? {} : { duration:0.6, delay:1.9, ease }}
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
          </div>
        </section>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     DESKTOP LAYOUT (≥768px)
  ──────────────────────────────────────────────── */
  return (
    <div ref={outerRef} style={{ height:"500vh" }}>
      <section className="sticky top-0 w-full overflow-hidden"
        style={{ height:"100vh", backgroundColor:"#e9e9e6" }}>

        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundColor:"rgba(108,159,222,0.20)" }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background:"radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(108,159,222,0.12) 100%)",
        }} />

        {/* 1440×720 stage, scaled to fit viewport */}
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
            <motion.button key={pin.num}
              className="pointer-events-auto absolute grid place-items-center"
              style={{ left:pin.x, top:pin.y, width:44, height:44,
                       transform:"translate(-50%,-50%)",
                       background:"none", border:"none", cursor:"default", padding:0, zIndex:20 }}
              initial={reduced ? false : { scale:0.6, opacity:0 }}
              animate={reduced ? {} : { scale:1, opacity:1 }}
              transition={reduced ? {} : { duration:0.4, delay:1.8+idx*0.1, ease }}
              aria-label={STAGE_LABELS[idx+1]?.text}
            >
              <motion.span className="absolute rounded-full"
                animate={pulsingPin===pin.num ? {scale:[1,1.6],opacity:[0.35,0]} : {scale:1,opacity:0}}
                transition={pulsingPin===pin.num ? {duration:0.48,ease:easeFade} : {duration:0}}
                style={{ width:30, height:30, border:`1px solid ${pin.color}` }}
              />
              <span className="relative grid place-items-center rounded-full" style={{
                width:22, height:22, backgroundColor:pin.color,
                fontFamily:"var(--font-mono)", fontSize:11, fontWeight:500,
                letterSpacing:"0.1em", color:"#ffffff", zIndex:1,
              }}>{pin.num}</span>
            </motion.button>
          ))}

          {/* label */}
          {lbl && lblPin && (
            <div className="pointer-events-none absolute" style={{
              ...(lbl.placement === "below" ? {
                left: lblPin.x,
                top:  lblPin.y + 23,          // 15px ring radius + 8px gap
                transform: "translateX(-50%)",
              } : {
                left: lblPin.x + 22,
                top:  lblPin.y,
                transform: "translateY(-50%)",
              }),
              zIndex: 30,
              opacity: labelVisible ? 1 : 0,
              transition: "opacity 160ms ease",
            }}>
              <div style={{
                backgroundColor: lbl.dark ? "#273142" : "rgba(255,255,255,0.92)",
                border: `1px solid ${lbl.dark ? "transparent" : "#d6d6d2"}`,
                padding: "6px 11px",
                whiteSpace: "nowrap",
                fontFamily:"var(--font-sans)", fontSize:14, fontWeight:500,
                lineHeight:1.5, color: lbl.dark ? "#fcfcfb" : "#211f1c",
              }}>
                {typedText}
                {!labelDone && <span style={{display:"inline-block",width:1,animation:"hero-caret 0.7s step-end infinite"}}>|</span>}
              </div>
            </div>
          )}

          {/* name block */}
          <div className="pointer-events-none absolute w-full text-center" style={{ top:230, zIndex:20 }}>
            <motion.h1
              style={{ fontFamily:"var(--font-sans)", fontSize:64, fontWeight:600,
                       lineHeight:1.04, letterSpacing:"-0.03em", color:"#211f1c" }}
              initial={reduced ? false : { opacity:0 }}
              animate={reduced ? {} : { opacity:1 }}
              transition={reduced ? {} : { duration:0.7, delay:1.2, ease:[0.4,0,0.2,1] }}
            >Shreya Shanmugam.</motion.h1>

            <motion.p
              style={{ marginTop:10, fontFamily:"var(--font-sans)", fontSize:18, lineHeight:1.6 }}
              initial={reduced ? false : { opacity:0, y:16 }}
              animate={reduced ? {} : { opacity:1, y:0 }}
              transition={reduced ? {} : { duration:0.6, delay:1.7, ease }}
            >
              <span style={{ fontWeight:400, color:"#211f1c" }}>Designing to make complex systems feel </span>
              <span style={{ fontWeight:700, color:"#3d6bc4" }}>simple</span>
              <span style={{ fontWeight:700, color:"#b3c3e5" }}>.</span>
            </motion.p>

            <motion.p className="pointer-events-auto"
              style={{ marginTop:10, fontFamily:"var(--font-sans)", fontSize:16, lineHeight:1.6, color:"#434343" }}
              initial={reduced ? false : { opacity:0, y:16 }}
              animate={reduced ? {} : { opacity:1, y:0 }}
              transition={reduced ? {} : { duration:0.6, delay:2.0, ease }}
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
          </div>

        </div>{/* end stage */}
      </section>
    </div>
  );
}
