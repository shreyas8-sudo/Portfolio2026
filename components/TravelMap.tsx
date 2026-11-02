"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import land110m from "world-atlas/land-110m.json";
import { places, type Place } from "@/lib/site";
import { Seat } from "./map/Seat";

const W = 820;
const H = 420;
const MIN_Z = 1;
const MAX_Z = 8;

const EASE_MOVE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_FADE: [number, number, number, number] = [0.4, 0, 0.2, 1];

type View = { k: number; x: number; y: number };

const photosOf = (p: Place) => (Array.isArray(p.photo) ? p.photo : [p.photo]);

export default function TravelMap() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [shot, setShot] = useState(0);
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; ux: number; uy: number } | null>(null);
  const shotDirRef = useRef(0);
  const still = useReducedMotion();

  /* mobile detection for label visibility */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { pathD, graticuleD, project } = useMemo(() => {
    const projection = geoNaturalEarth1().fitExtent(
      [
        [12, 12],
        [W - 12, H - 12],
      ],
      { type: "Sphere" }
    );
    const path = geoPath(projection);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const topo = land110m as any;
    const land = feature(topo, topo.objects.land) as any;

    return {
      pathD: path(land) ?? "",
      graticuleD: path(geoGraticule10()) ?? "",
      project: (lon: number, lat: number) => projection([lon, lat]),
    };
  }, []);

  const metrics = useCallback(() => {
    const el = svgRef.current;
    const rect = el?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) {
      return { scale: 1, vw: W, vh: H, ox: 0, oy: 0, rect: null };
    }
    const scale = Math.max(rect.width / W, rect.height / H);
    const vw = rect.width / scale;
    const vh = rect.height / scale;
    return { scale, vw, vh, ox: (W - vw) / 2, oy: (H - vh) / 2, rect };
  }, []);

  const toUser = useCallback(
    (clientX: number, clientY: number) => {
      const m = metrics();
      if (!m.rect) return [W / 2, H / 2] as const;
      return [
        m.ox + (clientX - m.rect.left) / m.scale,
        m.oy + (clientY - m.rect.top) / m.scale,
      ] as const;
    },
    [metrics]
  );

  const clamp = useCallback(
    (v: View): View => {
      const { vw, vh, ox, oy } = metrics();
      const lo = (origin: number, extent: number, size: number) => {
        const min = origin + extent - size * v.k;
        const max = origin;
        return min > max ? (min + max) / 2 : { min, max };
      };
      const cx = lo(ox, vw, W);
      const cy = lo(oy, vh, H);
      return {
        k: v.k,
        x: typeof cx === "number" ? cx : Math.max(cx.min, Math.min(cx.max, v.x)),
        y: typeof cy === "number" ? cy : Math.max(cy.min, Math.min(cy.max, v.y)),
      };
    },
    [metrics]
  );

  const zoomBy = useCallback(
    (factor: number, cx = W / 2, cy = H / 2) => {
      setView((v) => {
        const k = Math.max(MIN_Z, Math.min(MAX_Z, v.k * factor));
        if (k === v.k) return v;
        const scale = k / v.k;
        const x = cx - (cx - v.x) * scale;
        const y = cy - (cy - v.y) * scale;
        return clamp({ k, x, y });
      });
    },
    [clamp]
  );

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const [cx, cy] = toUser(e.clientX, e.clientY);
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy, toUser]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
      pinch.current = null;
    } else if (pointers.current.size === 2) {
      drag.current = null;
      pinch.current = null;
    }
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const p = pinch.current;
        if (!p || dist < 1) {
          const [ux, uy] = toUser(mid.x, mid.y);
          pinch.current = { dist, ux, uy };
          return;
        }
        const factor = dist / p.dist;
        if (Math.abs(factor - 1) < 0.005) return;
        pinch.current = { ...p, dist };
        zoomBy(factor, p.ux, p.uy);
        return;
      }

      const d = drag.current;
      const { scale } = metrics();
      if (!d) return;
      const dx = (e.clientX - d.x) / scale;
      const dy = (e.clientY - d.y) / scale;
      setView((v) => clamp({ k: v.k, x: d.ox + dx, y: d.oy + dy }));
    };

    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      pinch.current = null;
      if (pointers.current.size === 1) {
        const [only] = [...pointers.current.values()];
        setView((v) => {
          drag.current = { x: only.x, y: only.y, ox: v.x, oy: v.y };
          return v;
        });
        return;
      }
      if (pointers.current.size === 0) {
        drag.current = null;
        setDragging(false);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, clamp, metrics, toUser, zoomBy]);

  const home = useCallback((): View => {
    const isNarrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (!isNarrow) return { k: 1, x: 0, y: 0 };
    const xy = project(-96, 42);
    if (!xy) return { k: 1, x: 0, y: 0 };
    const k = 2.1;
    return { k, x: W / 2 - xy[0] * k, y: H / 2 - xy[1] * k };
  }, [project]);

  useEffect(() => {
    setView(clamp(home()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => setView(clamp(home()));

  const handleShot = useCallback((i: number) => {
    shotDirRef.current = i > shot ? 1 : -1;
    setShot(i);
  }, [shot]);

  const focus = (p: Place) => {
    const xy = project(p.lon, p.lat);
    shotDirRef.current = 0;
    setSelected((s) => (s?.name === p.name ? null : p));
    setShot(0);
    if (!xy) return;
    const [px, py] = xy;
    setView((v) => {
      const k = Math.max(v.k, 2.4);
      return clamp({ k, x: W / 2 - px * k, y: H / 2 - py * k });
    });
  };

  const btn =
    "grid size-7 place-items-center rounded-[4px] border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/12 hover:text-white";

  /** Shared transition constants */
  const inT = still
    ? { duration: 0.16, ease: EASE_FADE }
    : { duration: 0.28, ease: EASE_MOVE }; // --dur-base/--ease-move
  const outT = { duration: 0.16, ease: EASE_FADE }; // --dur-quick/--ease-fade
  const slowT = still
    ? { duration: 0.16, ease: EASE_FADE }
    : { duration: 0.45, ease: EASE_MOVE }; // --dur-slow/--ease-move

  return (
    <div className="overflow-hidden rounded-[--radius-panel] border border-grey-20 bg-gradient-to-br from-[#0f1626] via-[#16203a] to-[#22314f]">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[2.5fr_1fr]">
        {/* map */}
        <div className="relative p-3 md:p-5">
          <p className="label pointer-events-none absolute left-6 top-5 z-10 hidden text-[var(--color-peri)] md:block">
            Every pin is somewhere I&apos;ve been since 2023
          </p>

          <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5 md:left-auto md:right-5 md:top-5">
            <button onClick={() => zoomBy(1.4)} className={btn} aria-label="Zoom in">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => zoomBy(1 / 1.4)} className={btn} aria-label="Zoom out">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={reset} className={btn} aria-label="Reset view">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 5a4 4 0 1 1 .4 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path d="M1 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            className={`aspect-square w-full touch-none select-none sm:aspect-[3/2] md:aspect-auto ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            role="img"
            aria-label="Map of places visited"
            onPointerDown={onPointerDown}
          >
            <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
              <path
                d={graticuleD}
                fill="none"
                stroke="rgba(160,185,225,0.10)"
                strokeWidth={0.5 / view.k}
              />
              <path
                d={pathD}
                fill="rgba(150,175,215,0.16)"
                stroke="rgba(160,190,230,0.30)"
                strokeWidth={0.5 / view.k}
              />

              {places.map((p) => {
                const xy = project(p.lon, p.lat);
                if (!xy) return null;
                const [x, y] = xy;
                const isOn = selected?.name === p.name;
                const color = isOn
                  ? "var(--color-marigold)"
                  : p.home
                    ? "var(--color-orange)"
                    : "var(--color-sky)";
                const s = 1 / view.k;

                /* labels: desktop shows at zoom > 2; mobile shows only for selected pin */
                const showLabel =
                  (!narrow && view.k > 2) || (narrow && isOn);

                return (
                  <g
                    key={p.name}
                    transform={`translate(${x} ${y}) scale(${s})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      focus(p);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      r={isOn ? 13 : p.home ? 11 : 9}
                      fill="transparent"
                      stroke={color}
                      strokeWidth="0.9"
                      opacity={isOn ? 0.6 : p.home ? 0.4 : 0.26}
                    />
                    {p.home ? (
                      <>
                        <circle r={7} fill={color} opacity={isOn ? 1 : 0.92} />
                        <path
                          d="M-3.1 0.6 L0 -2.6 L3.1 0.6 M-2.2 -0.2 L-2.2 3 L2.2 3 L2.2 -0.2"
                          fill="none"
                          stroke="#141a26"
                          strokeWidth="1.05"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <circle
                        r={isOn ? 4.6 : 3.4}
                        fill={color}
                        opacity={isOn ? 1 : 0.85}
                      />
                    )}
                    {showLabel && (
                      <text
                        x={11}
                        y={3.5}
                        fill="rgba(255,255,255,0.75)"
                        fontSize="9"
                        fontFamily="var(--font-plex-mono), monospace"
                      >
                        {p.name}
                      </text>
                    )}
                    <title>
                      {p.name}
                      {p.home ? ", lived here" : ""}
                    </title>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="pointer-events-none absolute bottom-5 left-6 hidden items-center gap-4 md:flex">
            <span className="label text-white/30">
              {places.length} stops and counting
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="-6 -6 12 12">
                <circle r="5.4" fill="var(--color-orange)" />
                <path
                  d="M-2.4 0.5 L0 -2 L2.4 0.5 M-1.7 -0.1 L-1.7 2.3 L1.7 2.3 L1.7 -0.1"
                  fill="none"
                  stroke="#141a26"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="label text-white/30">lived here</span>
            </span>
          </div>

          <p className="label pointer-events-none absolute bottom-4 left-4 text-white/25 md:bottom-5 md:left-auto md:right-6">
            <span className="md:hidden">pinch to zoom · drag to pan</span>
            <span className="hidden md:inline">scroll to zoom · drag to pan</span>
          </p>

          {narrow && (
            <div className="absolute right-3 top-3 z-20 w-[42%] max-w-[10.5rem]">
              <Seat
                compact
                selected={selected}
                shot={shot}
                shots={selected ? photosOf(selected) : []}
                onShot={handleShot}
                still={still}
                shotDir={shotDirRef.current}
                inT={inT}
                outT={outT}
                slowT={slowT}
              />
            </div>
          )}
        </div>

        {/* panel — desktop only */}
        {!narrow && (
          <div className="flex flex-col items-center justify-center gap-4 border-l border-white/10 p-6">
            <Seat
              selected={selected}
              shot={shot}
              shots={selected ? photosOf(selected) : []}
              onShot={handleShot}
              still={still}
              shotDir={shotDirRef.current}
              inT={inT}
              outT={outT}
              slowT={slowT}
            />
          </div>
        )}
      </div>
    </div>
  );
}
