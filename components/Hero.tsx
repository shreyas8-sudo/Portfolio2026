"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Plane from "./Plane";
import { WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/world-pixels";

const CELL = 10;
const DOT = 5;
const HERO_H = 720;
const MAP_TOP = 96;
const NAME = "Shreya Shanmugam.";
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const PINS = [
  { num: 1, x: 1034, y: 338, color: "#6c9fde", label: "Previously in Hyderabad" },
  { num: 2, x: 247,  y: 272, color: "#d97a2a", label: "Now in Los Angeles" },
  { num: 3, x: 502,  y: 185, color: "#3d6bc4", label: "Looking for what's next" },
] as const;

/* ease-move: cubic-bezier(0.22, 1, 0.36, 1) -- LUT for canvas rAF loop */
function makeLUT(p1x: number, p1y: number, p2x: number, p2y: number, n = 200) {
  const xs = new Float64Array(n + 1);
  const ys = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    xs[i] = 3 * u * u * t * p1x + 3 * u * t * t * p2x + t * t * t;
    ys[i] = 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t;
  }
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = n;
    while (lo < hi - 1) {
      const m = (lo + hi) >> 1;
      if (xs[m] < x) lo = m; else hi = m;
    }
    return ys[lo] + (x - xs[lo]) / (xs[hi] - xs[lo]) * (ys[hi] - ys[lo]);
  };
}
const EASE_MV = makeLUT(0.22, 1, 0.36, 1);

interface Dot { fx: number; fy: number; sx: number; sy: number; flyStart: number; flyDur: number; blinks: number[]; }
let _dots: Dot[] | null = null;

function buildDots(): Dot[] {
  if (_dots) return _dots;
  _dots = [];
  for (let row = 0; row < WORLD_ROWS; row++) {
    const rs = WORLD_ROWS_DATA[row];
    for (let col = 0; col < WORLD_COLS; col++) {
      if (rs[col] !== "1") continue;
      _dots.push({
        fx: col * CELL + (CELL - DOT) / 2,
        fy: row * CELL + (CELL - DOT) / 2,
        sx: Math.random() * 1440,
        sy: Math.random() * HERO_H,
        flyStart: Math.random() * 400,
        flyDur: 600 + Math.random() * 150,
        blinks: Array.from(
          { length: 3 + Math.floor(Math.random() * 3) },
          () => Math.random() * 500
        ).sort((a, b) => a - b),
      });
    }
  }
  return _dots;
}

function IntroLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls =
    "font-bold text-[#211f1c] underline underline-offset-2 decoration-[#211f1c]/50 " +
    "transition-colors duration-[--dur-quick] ease-[--ease-fade] " +
    "hover:text-[#3d6bc4] hover:decoration-[#3d6bc4]";
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

export default function Hero() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const charRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const [charWidths, setCharWidths] = useState<number[] | null>(null);
  const [nameDisp,   setNameDisp]   = useState<string[]>(NAME.split(""));
  const [activePin,  setActivePin]  = useState<number | null>(null);
  const [pinsLive,   setPinsLive]   = useState(false);
  const reduced = useReducedMotion() ?? false;

  /* measure fixed char widths once mounted */
  useEffect(() => {
    if (reduced) { setActivePin(2); setPinsLive(true); return; }
    const ws = charRefs.current.map(el => el?.getBoundingClientRect().width ?? 20);
    setCharWidths(ws);
  }, [reduced]);

  /* canvas: scatter and settle */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = WORLD_COLS * CELL, H = WORLD_ROWS * CELL;
    canvas.width  = W * dpr; canvas.height  = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    function drawFinal() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#888888"; ctx!.globalAlpha = 1;
      for (let row = 0; row < WORLD_ROWS; row++) {
        const rs = WORLD_ROWS_DATA[row];
        for (let col = 0; col < WORLD_COLS; col++) {
          if (rs[col] === "1")
            ctx!.fillRect(col * CELL + (CELL - DOT) / 2, row * CELL + (CELL - DOT) / 2, DOT, DOT);
        }
      }
    }

    if (reduced) { drawFinal(); return; }

    const dots = buildDots();
    const t0 = performance.now();
    let raf = 0;

    function frame(now: number) {
      const e = now - t0;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#888888";

      for (const d of dots) {
        let op = 0;
        for (let b = 0; b < d.blinks.length; b++) {
          if (e < d.blinks[b]) break;
          op = (b & 1) === 0 ? 1 : 0;
        }
        const end = d.flyStart + d.flyDur;
        if (e >= end) op = 1;
        if (op === 0) continue;

        let x: number, y: number;
        if (e < d.flyStart) {
          x = d.sx; y = d.sy;
        } else if (e >= end) {
          x = d.fx; y = d.fy;
        } else {
          const p = EASE_MV((e - d.flyStart) / d.flyDur);
          x = d.sx + p * (d.fx - d.sx);
          y = d.sy + p * (d.fy - d.sy);
        }

        ctx!.globalAlpha = op;
        ctx!.fillRect(x, y, DOT, DOT);
      }
      ctx!.globalAlpha = 1;

      if (e < 1400) raf = requestAnimationFrame(frame);
      else drawFinal();
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* name scramble starting at t=1.3s */
  useEffect(() => {
    if (reduced || !charWidths) return;
    const nameArr = NAME.split("");
    let locked = 0;
    let tick: ReturnType<typeof setInterval> | null = null;

    const t1 = setTimeout(() => {
      tick = setInterval(() => {
        setNameDisp(nameArr.map((ch, i) => {
          if (i < locked || ch === " " || ch === ".") return nameArr[i];
          return ALPHA[Math.floor(Math.random() * ALPHA.length)];
        }));
      }, 40);

      nameArr.forEach((_, i) => {
        setTimeout(() => {
          locked = i + 1;
          if (locked >= nameArr.length) {
            clearInterval(tick!);
            setNameDisp(NAME.split(""));
          }
        }, i * 30);
      });
    }, 1300);

    const t2 = setTimeout(() => { setActivePin(2); setPinsLive(true); }, 2500);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      if (tick) clearInterval(tick);
    };
  }, [reduced, charWidths]);

  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: HERO_H, backgroundColor: "#e9e9e6" }}
    >
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(108,159,222,0.20)" }} />

      {/* 1440px content frame, centred */}
      <div className="pointer-events-none absolute"
        style={{ left: "50%", transform: "translateX(-50%)", width: 1440, height: HERO_H }}>

        <canvas ref={canvasRef} className="absolute"
          style={{ top: MAP_TOP, left: 0, zIndex: 1 }} aria-hidden="true" />

        <div className="pointer-events-none absolute inset-0" style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 120% 110% at 50% 50%, transparent 30%, rgba(108,159,222,0.12) 100%)",
        }} />

        <div className="pointer-events-none absolute" style={{
          width: 1540, height: 642, left: "50%", top: 331,
          transform: "translate(-50%, -50%)", zIndex: 2,
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0) 100%)",
        }} />

        {/* plane: outer div holds final center position; inner motion.div animates the fly-in */}
        <div className="absolute" style={{ left: 695, top: 129, transform: "translate(-50%, -50%)", zIndex: 10 }}>
          <motion.div
            initial={reduced ? false : { x: -2000, y: -80, rotate: -8, opacity: 0 }}
            animate={reduced ? {} : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={reduced ? {} : { duration: 0.9, delay: 1.0, ease }}
          >
            <Plane width={132} />
          </motion.div>
        </div>

        {/* pins */}
        {PINS.map((pin, idx) => (
          <motion.button
            key={pin.num}
            className="pointer-events-auto absolute grid place-items-center"
            style={{
              left: pin.x, top: pin.y, width: 44, height: 44,
              transform: "translate(-50%, -50%)",
              background: "none", border: "none", cursor: "default", padding: 0, zIndex: 20,
            }}
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            animate={reduced ? {} : { scale: 1, opacity: 1 }}
            transition={reduced ? {} : { duration: 0.28, delay: 2.0 + idx * 0.06, ease }}
            onMouseEnter={() => pinsLive && setActivePin(pin.num)}
            onMouseLeave={() => pinsLive && setActivePin(null)}
            aria-label={pin.label}
          >
            <span className="absolute rounded-full" style={{
              width: 30, height: 30, border: `1px solid ${pin.color}`, opacity: 0.35,
            }} />
            <span className="relative grid place-items-center rounded-full" style={{
              width: 22, height: 22, backgroundColor: pin.color,
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
              letterSpacing: "0.1em", color: "#211f1c", zIndex: 1,
            }}>
              {pin.num}
            </span>
          </motion.button>
        ))}

        {/* pin labels */}
        {PINS.map(pin => activePin !== pin.num ? null : (
          <div key={`lbl-${pin.num}`} className="pointer-events-none absolute"
            style={{ left: pin.x, top: pin.y + 15, transform: "translateX(-50%)", zIndex: 30 }}>
            <div style={{
              margin: "0 auto", width: 0, height: 0,
              borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
              borderBottom: "15px solid #211f1c",
            }} />
            <div style={{
              backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid #d6d6d2",
              padding: "6px 11px", whiteSpace: "nowrap",
              fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
              lineHeight: 1.5, color: "#211f1c",
            }}>
              {pin.label}
            </div>
          </div>
        ))}

        {/* name block */}
        <div className="pointer-events-none absolute w-full text-center" style={{ top: 230, zIndex: 20 }}>

          <motion.h1
            style={{
              fontFamily: "var(--font-sans)", fontSize: 64, fontWeight: 600,
              lineHeight: 1.04, letterSpacing: "-0.03em", color: "#211f1c",
            }}
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? {} : { opacity: 1 }}
            transition={reduced ? {} : { duration: 0.16, delay: 1.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {NAME.split("").map((ch, i) => (
              <span
                key={i}
                ref={el => { charRefs.current[i] = el; }}
                style={charWidths ? { display: "inline-block", width: charWidths[i], textAlign: "center" } : {}}
              >
                {charWidths ? nameDisp[i] : ch}
              </span>
            ))}
          </motion.h1>

          <motion.p
            style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 18, lineHeight: 1.6 }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={reduced ? {} : { duration: 0.48, delay: 2.0, ease }}
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
            transition={reduced ? {} : { duration: 0.48, delay: 2.08, ease }}
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
      </div>
    </section>
  );
}
