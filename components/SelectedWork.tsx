"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion, animate,
  useMotionValue, useTransform, useReducedMotion,
} from "framer-motion";
import { durBase, easeMove } from "@/lib/motion";

/* ─── shared tile shell ─── */
function useTileHover() {
  const [over, setOver] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const dur = `${durBase * 1000}ms`;
  const ease = `cubic-bezier(${easeMove.join(",")})`;
  const shell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: "#fcfcfb",
    border: `1px solid ${over ? "#a8a8a3" : "#d6d6d2"}`,
    borderRadius: 0,
    overflow: "hidden",
    transform: over && !reduced ? "translateY(-3px)" : "translateY(0)",
    boxShadow: over ? "0 2px 8px rgba(19,28,51,0.05)" : "none",
    transition: `transform ${dur} ${ease}, border-color ${dur} ${ease}, box-shadow ${dur} ${ease}`,
    ...extra,
  });
  return { over, setOver, reduced, dur, ease, shell };
}

/* ─── cover scale helper ─── */
function coverScale(over: boolean, reduced: boolean, dur: string, ease: string): React.CSSProperties {
  return {
    width: "100%", height: "100%", objectFit: "cover",
    transform: over && !reduced ? "scale(1.02)" : "scale(1)",
    transition: `transform ${dur} ${ease}`,
  };
}

/* ─── meta row ─── */
function MetaRow({
  company, role, status, statusColor,
}: {
  company: string; role?: string; status: string; statusColor: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      <span>
        <span style={{ color: "#232322" }}>{company}</span>
        {role && <>
          <span style={{ color: "#a8a8a3", margin: "0 5px" }}>·</span>
          <span style={{ color: "#6e6e69" }}>{role}</span>
        </>}
      </span>
      <span style={{ color: statusColor, flexShrink: 0, marginLeft: 8 }}>{status}</span>
    </div>
  );
}

/* ─── tile body ─── */
function TileBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "14px 16px 18px" }}>{children}</div>;
}

function TileTitle({ children, color = "#232322" }: { children: React.ReactNode; color?: string }) {
  return (
    <h3 style={{
      marginTop: 10,
      fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 500,
      letterSpacing: "-0.01em", color, lineHeight: 1.3,
    }}>
      {children}
    </h3>
  );
}

/* ══════════════════════════════════════════════════════
   SYNECHRON + BASIS TILES
═══════════════════════════════════════════════════════ */
function WorkTile({
  company, role, status, statusColor, title, href, poster, video, arrow = "↗",
}: {
  company: string; role: string; status: string; statusColor: string;
  title: string; href: string; poster?: string; video?: string; arrow?: string;
}) {
  const { over, setOver, reduced, dur, ease, shell } = useTileHover();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || typeof window === "undefined") return;
    if (window.innerWidth < 1024) v.play().catch(() => {});
  }, []);

  const enter = () => {
    setOver(true);
    videoRef.current?.play().catch(() => {});
  };
  const leave = () => {
    setOver(false);
    const v = videoRef.current;
    if (v && typeof window !== "undefined" && window.innerWidth >= 1024) {
      v.pause(); v.currentTime = 0;
    }
  };

  return (
    <Link href={href} style={{ display: "block", ...shell() }}
      onMouseEnter={enter} onMouseLeave={leave}
      onFocus={enter} onBlur={leave}
    >
      <div style={{ height: 250, overflow: "hidden", position: "relative", background: "#f4f4f2" }}>
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" aria-hidden="true" style={coverScale(over, reduced, dur, ease)} />
        )}
        {video && (
          <video ref={videoRef} src={video} muted loop playsInline style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            opacity: over ? 1 : 0,
            transform: over && !reduced ? "scale(1.02)" : "scale(1)",
            transition: `opacity ${durBase * 1000}ms ease-in-out, transform ${dur} ${ease}`,
          } as React.CSSProperties} />
        )}
      </div>
      <TileBody>
        <MetaRow company={company} role={role} status={status} statusColor={statusColor} />
        <TileTitle>
          {title}&ensp;<span style={{ color: "#3d6bc4" }}>{arrow}</span>
        </TileTitle>
      </TileBody>
    </Link>
  );
}


/* ══════════════════════════════════════════════════════
   DISNEY TILE
═══════════════════════════════════════════════════════ */
function DisneyTile() {
  const { over, setOver, reduced, dur, ease, shell } = useTileHover();
  const phase = useMotionValue(0);
  const isHovering = useRef(false);
  const animCtrl = useRef<ReturnType<typeof animate> | null>(null);

  const bgPos = useTransform(
    useTransform(phase, [0, 1], [0, 100]),
    (v: number) => `${v}% 50%`,
  );
  const textY = useTransform(phase, [0, 1], [-4, 4]);

  const startAnim = () => {
    if (reduced) return;
    isHovering.current = true;
    animCtrl.current?.stop();
    const current = phase.get();
    const remaining = 1 - current;
    animCtrl.current = animate(phase, remaining > 0.001 ? [current, 1] : [1], {
      duration: remaining > 0.001 ? remaining * 6 : 0,
      ease: "easeInOut",
      onComplete: () => {
        if (!isHovering.current) return;
        animCtrl.current = animate(phase, [1, 0], {
          duration: 6, ease: "easeInOut",
          repeat: Infinity, repeatType: "mirror",
        });
      },
    });
  };

  const stopAnim = () => {
    isHovering.current = false;
    animCtrl.current?.stop();
    animCtrl.current = animate(phase, 0, { duration: durBase, ease: easeMove });
  };

  return (
    <div
      style={{ display: "block", ...shell({ cursor: "default" }) }}
      onMouseEnter={() => { setOver(true); startAnim(); }}
      onMouseLeave={() => { setOver(false); stopAnim(); }}
    >
      {/* Cover */}
      <div style={{ height: 250, overflow: "hidden", position: "relative" }}>
        <motion.div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(135deg, #b3c3e5 0%, #6c9fde 55%, #3d6bc4 100%)",
          backgroundSize: "200% 100%",
          backgroundPosition: bgPos,
        }} />
        <motion.div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", textAlign: "center",
          y: textY,
        }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 39, fontWeight: 600,
            letterSpacing: "-0.025em", color: "#fcfcfb", lineHeight: 1.1, display: "block",
          }}>
            Disney<br />Experiences
          </span>
          <span style={{
            display: "block",
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.1em", color: "rgba(252,252,251,0.8)",
            marginTop: 10, textTransform: "uppercase",
          }}>
            Case Study Coming Soon
          </span>
        </motion.div>
      </div>
      <TileBody>
        <MetaRow
          company="Disney Experiences" role="via ProductSC"
          status="◷ Boarding Dec" statusColor="#e0b33c"
        />
        <TileTitle>
          Unifying Disney&rsquo;s fragmented experience offerings into one place
        </TileTitle>
      </TileBody>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LAYOVERS TILE
═══════════════════════════════════════════════════════ */

/* Boarding pass stack — back to front */
const PASSES = [
  { name: "designathon", code: "DA118", descriptor: "design hackathon", bg: "#e0b33c", fg: "#232322" },
  { name: "spotify widgets", code: "SP024", descriptor: "design challenge", bg: "#d97a2a", fg: "#fcfcfb" },
  { name: "peinao", code: "PN101", descriptor: "side project", bg: "#1e2d50", fg: "#fcfcfb" },
  { name: "mark", code: "MK001", descriptor: "branding", bg: "#3d6bc4", fg: "#fcfcfb" },
] as const;

const PASS_H      = 72;
const COVER_REST  = 250;
// At rest: mark anchored near bottom, others stacked 14px above it
const REST_TOPS   = [134, 148, 162, 176] as const; // [designathon, spotify, peinao, mark]
// On hover: designathon stays, others spread 72px below it
const HOVER_TOPS  = [134, 206, 278, 350] as const;
const COVER_HOVER = 350 + PASS_H + 36;            // = 458px

function LayoversTile() {
  const { over, setOver, reduced, dur, ease, shell } = useTileHover();

  return (
    <Link href="/layovers" style={{ display: "block", ...shell() }}
      onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}
      onFocus={() => setOver(true)} onBlur={() => setOver(false)}
    >
      {/* Cover */}
      <motion.div
        initial={{ height: COVER_REST }}
        animate={{ height: over && !reduced ? COVER_HOVER : COVER_REST }}
        transition={{ duration: durBase, ease: easeMove }}
        style={{ overflow: "hidden", position: "relative", background: "#f4f4f2" }}
      >
        {PASSES.map((pass, i) => {
          // Stagger from bottom (mark = i 3) up: mark first, peinao +40ms, spotify +80ms
          // designathon doesn't move so delay doesn't matter
          const delay = (3 - i) * 0.04;
          return (
            <motion.div
              key={pass.code}
              initial={{ top: REST_TOPS[i] }}
              animate={{ top: over && !reduced ? HOVER_TOPS[i] : REST_TOPS[i] }}
              transition={{ duration: durBase, ease: easeMove, delay }}
              style={{
                position: "absolute", left: 20, right: 20, height: PASS_H,
                backgroundColor: pass.bg,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 16px",
                zIndex: i + 1,
              }}
            >
              {/* Left */}
              <div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 500,
                  color: pass.fg, lineHeight: 1.1,
                }}>{pass.name}</div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
                  color: pass.fg, opacity: 0.72, marginTop: 2,
                }}>{pass.descriptor}</div>
              </div>
              {/* Right */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.1em", color: pass.fg, opacity: 0.6,
                  textTransform: "uppercase",
                }}>Flight</div>
                <div style={{
                  fontFamily: "var(--font-dot)", fontSize: 22, fontWeight: 800,
                  color: pass.fg, lineHeight: 1,
                }}>{pass.code}</div>
              </div>
            </motion.div>
          );
        })}

        {/* +7 more stops — fades in on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: over && !reduced ? 1 : 0 }}
          transition={{ duration: durBase, ease: easeMove }}
          style={{
            position: "absolute",
            left: 20, right: 20,
            top: HOVER_TOPS[HOVER_TOPS.length - 1] + PASS_H + 12,
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.1em", color: "#a8a8a3",
            textTransform: "uppercase",
            borderTop: "1px dashed #d6d6d2",
            paddingTop: 8,
          }}
        >
          + 7 More Stops
        </motion.div>
      </motion.div>

      <TileBody>
        <MetaRow company="Layovers" status="11 Stops" statusColor="#3d6bc4" />
        <TileTitle>
          Side projects, experiments and challenges, between destinations&ensp;
          <span style={{ color: "#3d6bc4" }}>→</span>
        </TileTitle>
      </TileBody>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION
═══════════════════════════════════════════════════════ */
export default function SelectedWork() {
  return (
    <section id="work" className="container-content scroll-mt-28 pt-20">
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
          letterSpacing: "0.08em", color: "#3d6bc4",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          Selected Work
        </h2>
        <div style={{ flex: 1, height: 1, backgroundColor: "#d6d6d2" }} aria-hidden="true" />
      </div>

      {/* 2×2 grid — 444px tiles, 24px gap; single column below 768px */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
        <WorkTile
          company="Synechron" role="Product design intern"
          status="✈ Shipped 2026" statusColor="#d97a2a"
          title="Designed process intelligence for banks, and shipped a spec skill engineers now use"
          href="/synechron"
          poster="/media/synechron/banner-poster.webp"
          video="/media/synechron/banner.mp4"
        />
        <WorkTile
          company="Basis" role="Co-founder, designer"
          status="✈ Shipped 2025" statusColor="#d97a2a"
          title="Co-founded an AI copilot for cost segregation engineers, and won Best Traction"
          href="/basis"
          poster="/media/basis/banner-poster.webp"
          video="/media/basis/banner.mp4"
        />
        <DisneyTile />
        <LayoversTile />
      </div>
    </section>
  );
}
