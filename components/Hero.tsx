"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Plane from "./Plane";
import { WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/world-pixels";

const CELL = 10;
const DOT = 5;
const HERO_H = 720;
const MAP_TOP = 96;

const PINS = [
  { num: 1, x: 1034, y: 338, color: "#6c9fde", label: "Previously in Hyderabad" },
  { num: 2, x: 247,  y: 272, color: "#d97a2a", label: "Now in Los Angeles" },
  { num: 3, x: 502,  y: 185, color: "#3d6bc4", label: "Looking for what's next" },
] as const;

function IntroLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls =
    "font-bold text-[#211f1c] underline underline-offset-2 decoration-[#211f1c]/50 " +
    "transition-colors duration-[--dur-quick] ease-[--ease-fade] " +
    "hover:text-[#3d6bc4] hover:decoration-[#3d6bc4]";
  if (href.startsWith("#")) return <a href={href} className={cls}>{children}</a>;
  return <Link href={href} className={cls}>{children}</Link>;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Pin 2 (LA) label visible by default, matching Figma static state
  const [activePin, setActivePin] = useState<number | null>(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = WORLD_COLS * CELL;
    const h = WORLD_ROWS * CELL;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#888888";

    for (let row = 0; row < WORLD_ROWS; row++) {
      const rowStr = WORLD_ROWS_DATA[row];
      for (let col = 0; col < WORLD_COLS; col++) {
        if (rowStr[col] === "1") {
          ctx.fillRect(
            col * CELL + (CELL - DOT) / 2,
            row * CELL + (CELL - DOT) / 2,
            DOT,
            DOT
          );
        }
      }
    }
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: HERO_H, backgroundColor: "#e9e9e6" }}
    >
      {/* Flat 20% blue wash -- uniform periwinkle at any viewport width */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "rgba(108,159,222,0.20)" }}
      />

      {/* 1440px content frame, centred */}
      <div
        className="pointer-events-none absolute"
        style={{ left: "50%", transform: "translateX(-50%)", width: 1440, height: HERO_H }}
      >
        {/* Layer 1: pixel map canvas */}
        <canvas
          ref={canvasRef}
          className="absolute"
          style={{ top: MAP_TOP, left: 0, zIndex: 1 }}
          aria-hidden="true"
        />

        {/* Layer 1b: edge darkening inside content frame -- stays content-relative */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            background:
              "radial-gradient(ellipse 120% 110% at 50% 50%, transparent 30%, rgba(108,159,222,0.12) 100%)",
          }}
        />

        {/* Layer 2: white radial glow above canvas, keeps text readable */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 1540,
            height: 642,
            left: "50%",
            top: 331,
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            background:
              "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Layer 3: plane at rest (695, 129) */}
        <div
          className="absolute"
          style={{ left: 695, top: 129, transform: "translate(-50%, -50%)", zIndex: 10 }}
        >
          <Plane width={132} />
        </div>

        {/* Layer 4: pins (z-index 20) */}
        {PINS.map((pin) => (
          <button
            key={pin.num}
            className="pointer-events-auto absolute grid place-items-center"
            style={{
              left: pin.x,
              top: pin.y,
              width: 44,
              height: 44,
              transform: "translate(-50%, -50%)",
              background: "none",
              border: "none",
              cursor: "default",
              padding: 0,
              zIndex: 20,
            }}
            onMouseEnter={() => setActivePin(pin.num)}
            onMouseLeave={() => setActivePin(null)}
            aria-label={pin.label}
          >
            {/* ring */}
            <span
              className="absolute rounded-full"
              style={{
                width: 30,
                height: 30,
                border: `1px solid ${pin.color}`,
                opacity: 0.35,
              }}
            />
            {/* filled circle */}
            <span
              className="relative grid place-items-center rounded-full"
              style={{
                width: 22,
                height: 22,
                backgroundColor: pin.color,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: "#211f1c",
                zIndex: 1,
              }}
            >
              {pin.num}
            </span>
          </button>
        ))}

        {/* Layer 4: pin labels -- one at a time */}
        {PINS.map((pin) =>
          activePin !== pin.num ? null : (
            <div
              key={`lbl-${pin.num}`}
              className="pointer-events-none absolute"
              style={{
                left: pin.x,
                top: pin.y + 15,
                transform: "translateX(-50%)",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  margin: "0 auto",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderBottom: "15px solid #211f1c",
                }}
              />
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  border: "1px solid #d6d6d2",
                  padding: "6px 11px",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  color: "#211f1c",
                }}
              >
                {pin.label}
              </div>
            </div>
          )
        )}

        {/* Layer 5: name block (top at y=230) */}
        <div
          className="pointer-events-none absolute w-full text-center"
          style={{ top: 230, zIndex: 20 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#211f1c",
            }}
          >
            Shreya Shanmugam.
          </h1>

          <p
            style={{
              marginTop: 10,
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: 400, color: "#211f1c" }}>
              Designing to make complex systems feel{" "}
            </span>
            <span style={{ fontWeight: 700, color: "#3d6bc4" }}>simple</span>
            <span style={{ fontWeight: 700, color: "#b3c3e5" }}>.</span>
          </p>

          <p
            className="pointer-events-auto"
            style={{
              marginTop: 10,
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#434343",
            }}
          >
            <span style={{ fontWeight: 400 }}>Currently</span>
            {" "}
            <span style={{ fontWeight: 700 }}>@</span>
            {" "}
            <IntroLink href="/about">USC Iovine and Young Academy</IntroLink>
            {" "}
            <span style={{ fontWeight: 400 }}>and</span>
            {" "}
            <IntroLink href="/about">Marshall</IntroLink>
            <span style={{ fontWeight: 700 }}>.</span>
            <br />
            <span style={{ fontWeight: 400 }}>Consulting</span>
            {" "}
            <span style={{ fontWeight: 700 }}>@</span>
            {" "}
            <IntroLink href="#disney">Disney Experiences</IntroLink>
            {" "}
            <span style={{ fontWeight: 400 }}>with ProductSC, previously</span>
            {" "}
            <span style={{ fontWeight: 700 }}>@</span>
            {" "}
            <IntroLink href="#synechron">Synechron</IntroLink>
            <span style={{ fontWeight: 700 }}>.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
