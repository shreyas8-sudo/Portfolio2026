"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import Plane from "./Plane";
import { WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/world-pixels";

/* ─── constants ─── */
const CELL = 10;
const DOT  = 5;
const MAP_TOP = 96;

/* flight path in the 1440px coordinate frame */
const PATH_D =
  "M 695 129 C 720 60 1000 60 1034 338" +
  " C 1050 100 230 100 247 272" +
  " C 250 100 500 80 502 185";

const PATH_SEGS = [
  "M 695 129 C 720 60 1000 60 1034 338",
  "M 1034 338 C 1050 100 230 100 247 272",
  "M 247 272 C 250 100 500 80 502 185",
] as const;

/* scroll thresholds -- 0.05 hold at each pin */
const P0     = 0.08;
const P1_ARR = 0.30;   const P1_DEP = 0.35;
const P2_ARR = 0.60;   const P2_DEP = 0.65;
const P3_ARR = 0.88;   // holds to 1.0

/* scaleX when parked: +1 = facing right, -1 = facing left */
const PIN_FLIP: [1 | -1, 1 | -1, 1 | -1] = [1, -1, 1];

const PINS = [
  { num: 1, x: 1034, y: 338, color: "#6c9fde", label: "Previously in Hyderabad" },
  { num: 2, x: 247,  y: 272, color: "#d97a2a", label: "Now in Los Angeles" },
  { num: 3, x: 502,  y: 185, color: "#3d6bc4", label: "Looking for what's next" },
] as const;

/* ease-move CSS bezier string */
const EASE_MOVE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_FADE_CSS = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ─── ease-move LUT for canvas ─── */
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
const EASE_MV = makeLUT(0.22, 1, 0.36, 1);

function lerp(a: number, b: number, t: number) { return a + (b-a)*t; }

/* ─── canvas dot data ─── */
interface Dot { fx:number; fy:number; sx:number; sy:number; flyStart:number; flyDur:number; blinks:number[]; }
let _dots: Dot[] | null = null;
function buildDots(): Dot[] {
  if (_dots) return _dots;
  _dots = [];
  for (let row = 0; row < WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col = 0; col < WORLD_COLS; col++) {
      if (rs[col] !== "1") continue;
      _dots.push({
        fx: col*CELL + (CELL-DOT)/2, fy: row*CELL + (CELL-DOT)/2,
        sx: Math.random()*1440, sy: Math.random()*720,
        flyStart: Math.random()*1000, flyDur: 1200 + Math.random()*400,
        blinks: Array.from({length:2+Math.floor(Math.random()*2)}, ()=>Math.random()*600).sort((a,b)=>a-b),
      });
    }
  }
  return _dots;
}

/* ─── intro link ─── */
function IntroLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = "font-bold text-[#211f1c] underline underline-offset-2 decoration-[#211f1c]/50 " +
    "transition-colors duration-[--dur-quick] ease-[--ease-fade] hover:text-[#3d6bc4] hover:decoration-[#3d6bc4]";
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/* ─── rotation math ─────────────────────────────────────────────────────────
   Plane SVG faces right by default.
   For angle θ (atan2 in SVG coords: 0=right, 90=down, ±180=left):
   - Going right (|θ| ≤ 90): scaleX=+1, rotate(θ)
   - Going left  (|θ| > 90): scaleX=−1, rotate(θ±180) so rot ∈ [−90,90]
   Never uses scaleY. ──────────────────────────────────────────────────────── */
function flightTransform(angle: number): { rot: number; flip: 1 | -1 } {
  if (Math.abs(angle) <= 90) return { rot: angle, flip: 1 };
  return { rot: angle > 0 ? angle - 180 : angle + 180, flip: -1 };
}

/* ─── hero ─── */
export default function Hero() {
  const outerRef     = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const pathRef      = useRef<SVGPathElement>(null);
  const clipPathRef  = useRef<SVGPathElement>(null);

  /* plane: outer = position (instant), inner = rotation/scale (transitioned) */
  const planeOuterRef = useRef<HTMLDivElement>(null);
  const planeInnerRef = useRef<HTMLDivElement>(null);

  const metricsRef   = useRef<{ total: number; seg: [number,number,number] } | null>(null);
  const scrollPinRef = useRef(0);
  const loadDoneRef  = useRef(false);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasParkedRef = useRef(true);  // starts parked at rest

  /* react state (only for rendering) */
  const [activePin,  setActivePin]  = useState<number | null>(null);
  const [pinLabel,   setPinLabel]   = useState("");
  const [labelDone,  setLabelDone]  = useState(false);
  const [pulsingPin, setPulsingPin] = useState<number | null>(null);
  const [hoverPin,   setHoverPin]   = useState<number | null>(null);
  const [s,          setS]          = useState(1);

  const reduced = useReducedMotion() ?? false;

  /* ── stage scale ── */
  useEffect(() => {
    const fit = () => setS(Math.min(window.innerWidth / 1440, window.innerHeight / 720, 1.25));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* ── path metrics ── */
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const ns = "http://www.w3.org/2000/svg";
    const temps = PATH_SEGS.map(d => {
      const el = document.createElementNS(ns, "path");
      el.setAttribute("d", d);
      svgEl.appendChild(el);
      return el;
    });
    const lens = temps.map(el => el.getTotalLength()) as [number,number,number];
    temps.forEach(el => svgEl.removeChild(el));
    metricsRef.current = { total: lens[0]+lens[1]+lens[2], seg: lens };
  }, []);

  /* ── canvas scatter / settle ── */
  useEffect(() => {
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
      for (let r=0;r<WORLD_ROWS;r++) {
        const rs=WORLD_ROWS_DATA[r];
        for (let c=0;c<WORLD_COLS;c++)
          if (rs[c]==="1") ctx!.fillRect(c*CELL+(CELL-DOT)/2, r*CELL+(CELL-DOT)/2, DOT, DOT);
      }
    }
    if (reduced) { drawFinal(); return; }

    const dots = buildDots();
    const t0 = performance.now();
    let raf = 0;
    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle="#888888";
      for (const d of dots) {
        let op = 0;
        for (let b=0;b<d.blinks.length;b++) { if (e<d.blinks[b]) break; op=(b&1)===0?1:0; }
        const end = d.flyStart+d.flyDur;
        if (e>=end) op=1;
        if (op===0) continue;
        let x:number,y:number;
        if (e<d.flyStart)      { x=d.sx; y=d.sy; }
        else if (e>=end)       { x=d.fx; y=d.fy; }
        else { const p=EASE_MV((e-d.flyStart)/d.flyDur); x=d.sx+p*(d.fx-d.sx); y=d.sy+p*(d.fy-d.sy); }
        ctx!.globalAlpha=op;
        ctx!.fillRect(x,y,DOT,DOT);
      }
      ctx!.globalAlpha=1;
      if (e<3000) raf=requestAnimationFrame(frame); else drawFinal();
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* ── load sequence: plane appears + LA pin shown after settle ── */
  useEffect(() => {
    if (reduced) {
      if (planeOuterRef.current) planeOuterRef.current.style.opacity = "1";
      setActivePin(2);
      loadDoneRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      if (planeOuterRef.current) planeOuterRef.current.style.opacity = "1";
      setActivePin(2);
      loadDoneRef.current = true;
    }, 5200);
    return () => clearTimeout(t);
  }, [reduced]);

  /* ── typewriter helper ── */
  function typeLabel(text: string) {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    let i = 0;
    setPinLabel(""); setLabelDone(false);
    typeTimerRef.current = setInterval(() => {
      i++;
      setPinLabel(text.slice(0,i));
      if (i >= text.length) { clearInterval(typeTimerRef.current!); setLabelDone(true); }
    }, 25);
  }

  /* ── scroll: spring-smoothed progress → DOM updates ── */
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start","end end"] });
  /* critically damped spring: no overshoot, no bounce */
  const smoothP = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 1 });

  useMotionValueEvent(smoothP, "change", (p) => {
    const pathEl  = pathRef.current;
    const m       = metricsRef.current;
    const outerEl = planeOuterRef.current;
    const innerEl = planeInnerRef.current;
    if (!pathEl || !m || !outerEl || !innerEl) return;

    const { total, seg } = m;

    /* ── distance + parked state ── */
    let dist: number;
    let parked = false;
    let parkedPin = 0; // 0 = at rest, 1/2/3 = at pin

    if (p <= P0) {
      dist = 0; parked = true; parkedPin = 0;
    } else if (p <= P1_ARR) {
      dist = lerp(0, seg[0], (p - P0) / (P1_ARR - P0));
    } else if (p <= P1_DEP) {
      dist = seg[0]; parked = true; parkedPin = 1;
    } else if (p <= P2_ARR) {
      dist = seg[0] + lerp(0, seg[1], (p - P1_DEP) / (P2_ARR - P1_DEP));
    } else if (p <= P2_DEP) {
      dist = seg[0] + seg[1]; parked = true; parkedPin = 2;
    } else if (p <= P3_ARR) {
      dist = seg[0] + seg[1] + lerp(0, seg[2], (p - P2_DEP) / (P3_ARR - P2_DEP));
    } else {
      dist = total; parked = true; parkedPin = 3;
    }

    /* ── position (instant, on outer) ── */
    const pt = pathEl.getPointAtLength(dist);
    outerEl.style.left = `${pt.x}px`;
    outerEl.style.top  = `${pt.y}px`;

    /* ── rotation + flip (transitioned, on inner) ── */
    const justParked    = parked && !wasParkedRef.current;
    const justDeparted  = !parked && wasParkedRef.current;
    wasParkedRef.current = parked;

    if (parked) {
      /* landing: slow transition for smooth level-out */
      if (justParked) {
        innerEl.style.transition = `transform 480ms ${EASE_MOVE_CSS}`;
      }
      const flip = parkedPin === 0 ? 1 : PIN_FLIP[parkedPin - 1];
      innerEl.style.transform = `translate(-50%, -50%) rotate(0deg) scaleX(${flip})`;
    } else {
      /* flight: quick tracking, or slightly longer right after departure */
      const flyDur = justDeparted ? "320ms" : "160ms";
      innerEl.style.transition = `transform ${flyDur} ${EASE_MOVE_CSS}`;

      const D   = 3;
      const pt1 = pathEl.getPointAtLength(Math.max(0, dist - D));
      const pt2 = pathEl.getPointAtLength(Math.min(total, dist + D));
      const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180 / Math.PI;
      const { rot, flip } = flightTransform(angle);
      innerEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scaleX(${flip})`;
    }

    /* ── trail: reveals exactly up to current dist ── */
    if (clipPathRef.current)
      clipPathRef.current.setAttribute("stroke-dasharray", `${dist} ${total - dist}`);

    /* ── pin arrival events ── */
    const arrived = p >= P3_ARR ? 3 : p >= P2_ARR ? 2 : p >= P1_ARR ? 1 : 0;
    if (arrived !== scrollPinRef.current) {
      scrollPinRef.current = arrived;
      if (arrived > 0) {
        setActivePin(arrived);
        typeLabel(PINS[arrived-1].label);
        setPulsingPin(arrived);
        setTimeout(() => setPulsingPin(null), 480);
      } else {
        setActivePin(loadDoneRef.current ? 2 : null);
        setPinLabel(""); setLabelDone(false);
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      }
    }
  });

  const ease: [number,number,number,number] = [0.22, 1, 0.36, 1];

  const displayPin   = scrollPinRef.current > 0 ? activePin : (hoverPin ?? activePin);
  const displayLabel = scrollPinRef.current > 0
    ? pinLabel
    : (displayPin != null ? PINS.find(p=>p.num===displayPin)?.label ?? "" : "");
  const showCaret = scrollPinRef.current > 0 && !labelDone;

  return (
    <div ref={outerRef} style={{ height: "300vh" }}>

      <section
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh", backgroundColor: "#e9e9e6" }}
      >
        {/* flat blue wash */}
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: "rgba(108,159,222,0.20)" }} />
        {/* edge gradient */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(108,159,222,0.12) 100%)",
        }} />

        {/* 1440×720 stage, scaled to fit viewport */}
        <div className="absolute left-1/2 top-1/2" style={{
          width: 1440, height: 720,
          transform: `translate(-50%, -50%) scale(${s})`,
          transformOrigin: "center",
        }}>
          {/* pixel map */}
          <canvas ref={canvasRef} className="absolute" aria-hidden="true" style={{
            top: MAP_TOP, left: 0, zIndex: 1,
            WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
          }} />

          {/* white glow */}
          <div className="pointer-events-none absolute" style={{
            width: 1540, height: 642, left: -50, top: 10, zIndex: 2,
            background: "radial-gradient(closest-side, rgba(255,255,255,0.82), rgba(255,255,255,0))",
          }} />

          {/* ── trail SVG ── */}
          <svg
            ref={svgRef}
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, width: 1440, height: 720, zIndex: 5, overflow: "visible" }}
            viewBox="0 0 1440 720"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="hero-trail-clip">
                <path
                  ref={clipPathRef}
                  d={PATH_D}
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="0 9999"
                />
              </clipPath>
            </defs>
            <path ref={pathRef} d={PATH_D} fill="none" stroke="none" />
            <path
              d={PATH_D}
              fill="none"
              stroke="#a8a8a3"
              strokeWidth="1.5"
              strokeDasharray="3 5"
              clipPath="url(#hero-trail-clip)"
            />
          </svg>

          {/* ── plane: outer = position (instant), inner = rotation+flip (transitioned) ── */}
          <div
            ref={planeOuterRef}
            className="absolute pointer-events-none"
            style={{
              left: 695, top: 129,
              zIndex: 10,
              opacity: 0,
              transition: "opacity 0.8s ease",
            }}
          >
            <div
              ref={planeInnerRef}
              style={{
                transform: "translate(-50%, -50%) rotate(0deg) scaleX(1)",
                transition: `transform 480ms ${EASE_MOVE_CSS}`,
              }}
            >
              <Plane width={132} />
            </div>
          </div>

          {/* ── pins ── */}
          {PINS.map((pin, idx) => (
            <motion.button
              key={pin.num}
              className="pointer-events-auto absolute grid place-items-center"
              style={{
                left: pin.x, top: pin.y, width: 44, height: 44,
                transform: "translate(-50%,-50%)",
                background: "none", border: "none", cursor: "default", padding: 0, zIndex: 20,
              }}
              initial={reduced ? false : { scale: 0.6, opacity: 0 }}
              animate={reduced ? {} : { scale: 1, opacity: 1 }}
              transition={reduced ? {} : { duration: 0.6, delay: 3.8 + idx*0.12, ease }}
              onMouseEnter={() => scrollPinRef.current === 0 && setHoverPin(pin.num)}
              onMouseLeave={() => setHoverPin(null)}
              aria-label={pin.label}
            >
              {/* pulse ring on arrival */}
              <motion.span
                className="absolute rounded-full"
                animate={
                  pulsingPin === pin.num
                    ? { scale: [1, 1.6], opacity: [0.35, 0] }
                    : { scale: 1, opacity: 0.35 }
                }
                transition={
                  pulsingPin === pin.num
                    ? { duration: 0.48, ease: EASE_FADE_CSS }
                    : { duration: 0 }
                }
                style={{ width: 30, height: 30, border: `1px solid ${pin.color}` }}
              />
              {/* number: white */}
              <span className="relative grid place-items-center rounded-full" style={{
                width: 22, height: 22, backgroundColor: pin.color,
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
                letterSpacing: "0.1em", color: "#ffffff", zIndex: 1,
              }}>
                {pin.num}
              </span>
            </motion.button>
          ))}

          {/* ── pin labels: no triangle, 14px below bottom of outer ring ── */}
          {PINS.map(pin => displayPin !== pin.num ? null : (
            <div
              key={`lbl-${pin.num}`}
              className="pointer-events-none absolute"
              style={{
                left: pin.x,
                top: pin.y + 29,  /* 15px ring radius + 14px gap */
                transform: "translateX(-50%)",
                zIndex: 30,
              }}
            >
              <div style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                border: "1px solid #d6d6d2",
                padding: "6px 11px",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
                lineHeight: 1.5, color: "#211f1c",
              }}>
                {displayLabel}
                {showCaret && (
                  <span style={{
                    display: "inline-block",
                    width: 1,
                    animation: "hero-caret 0.7s step-end infinite",
                  }}>|</span>
                )}
              </div>
            </div>
          ))}

          {/* ── name block ── */}
          <div className="pointer-events-none absolute w-full text-center" style={{ top: 230, zIndex: 20 }}>
            <motion.h1
              style={{
                fontFamily: "var(--font-sans)", fontSize: 64, fontWeight: 600,
                lineHeight: 1.04, letterSpacing: "-0.03em", color: "#211f1c",
              }}
              initial={reduced ? false : { opacity: 0 }}
              animate={reduced ? {} : { opacity: 1 }}
              transition={reduced ? {} : { duration: 0.8, delay: 3.0, ease: [0.4,0,0.2,1] }}
            >
              Shreya Shanmugam.
            </motion.h1>

            <motion.p
              style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 18, lineHeight: 1.6 }}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={reduced ? {} : { opacity: 1, y: 0 }}
              transition={reduced ? {} : { duration: 0.9, delay: 3.8, ease }}
            >
              <span style={{ fontWeight: 400, color: "#211f1c" }}>Designing to make complex systems feel </span>
              <span style={{ fontWeight: 700, color: "#3d6bc4" }}>simple</span>
              <span style={{ fontWeight: 700, color: "#b3c3e5" }}>.</span>
            </motion.p>

            <motion.p
              className="pointer-events-auto"
              style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.6, color: "#434343" }}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={reduced ? {} : { opacity: 1, y: 0 }}
              transition={reduced ? {} : { duration: 0.9, delay: 4.0, ease }}
            >
              <span style={{ fontWeight: 400 }}>Currently</span>{" "}
              <span style={{ fontWeight: 700 }}>@</span>{" "}
              <IntroLink href="/about">USC Iovine and Young Academy</IntroLink>{" "}
              <span style={{ fontWeight: 400 }}>and</span>{" "}
              <IntroLink href="/about">Marshall</IntroLink>
              <span style={{ fontWeight: 700 }}>.</span><br />
              <span style={{ fontWeight: 400 }}>Consulting</span>{" "}
              <span style={{ fontWeight: 700 }}>@</span>{" "}
              <IntroLink href="#disney">Disney Experiences</IntroLink>{" "}
              <span style={{ fontWeight: 400 }}>with ProductSC, previously</span>{" "}
              <span style={{ fontWeight: 700 }}>@</span>{" "}
              <IntroLink href="#synechron">Synechron</IntroLink>
              <span style={{ fontWeight: 700 }}>.</span>
            </motion.p>
          </div>

        </div>{/* end stage */}
      </section>
    </div>
  );
}
