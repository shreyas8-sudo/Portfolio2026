"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import land110m from "world-atlas/land-110m.json";
import { places, type Place } from "@/lib/site";
import Window from "./Window";

const W = 820;
const H = 420;
const MIN_Z = 1;
const MAX_Z = 8;

type View = { k: number; x: number; y: number };

const photosOf = (p: Place) => (Array.isArray(p.photo) ? p.photo : [p.photo]);

/**
 * One photo inside the window.
 * The caller keys this by src, so a failed load can't leave stale
 * error state behind when a different photo loads fine.
 */
function PlacePhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid size-full place-items-center">
        <span className="label text-white/70">photo coming soon</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function TravelMap() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [shot, setShot] = useState(0);
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

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

  /* keep the map from being dragged off-screen */
  const clamp = useCallback((v: View): View => {
    const maxX = (W * (v.k - 1)) / 2;
    const maxY = (H * (v.k - 1)) / 2;
    return {
      k: v.k,
      x: Math.max(-maxX, Math.min(maxX, v.x)),
      y: Math.max(-maxY, Math.min(maxY, v.y)),
    };
  }, []);

  const zoomBy = useCallback(
    (factor: number, cx = W / 2, cy = H / 2) => {
      setView((v) => {
        const k = Math.max(MIN_Z, Math.min(MAX_Z, v.k * factor));
        if (k === v.k) return v;
        const scale = k / v.k;
        // zoom toward the cursor
        const x = cx - (cx - v.x) * scale;
        const y = cy - (cy - v.y) * scale;
        return clamp({ k, x, y });
      });
    },
    [clamp]
  );

  /* wheel zoom, non-passive so we can preventDefault */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * W;
      const cy = ((e.clientY - rect.top) / rect.height) * H;
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.x) / rect.width) * W;
    const dy = ((e.clientY - drag.current.y) / rect.height) * H;
    setView((v) =>
      clamp({ k: v.k, x: drag.current!.ox + dx, y: drag.current!.oy + dy })
    );
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const reset = () => setView({ k: 1, x: 0, y: 0 });

  /* clicking a pin centres it */
  const focus = (p: Place) => {
    const xy = project(p.lon, p.lat);
    setSelected((s) => (s?.name === p.name ? null : p));
    setShot(0); // reset before the new place renders
    if (!xy) return;
    const [px, py] = xy;
    setView((v) => {
      const k = Math.max(v.k, 2.4);
      return clamp({ k, x: W / 2 - px * k, y: H / 2 - py * k });
    });
  };

  const btn =
    "grid size-7 place-items-center rounded-[4px] border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/12 hover:text-white";

  return (
    <div className="overflow-hidden rounded-[--radius-panel] border border-grey-20 bg-gradient-to-br from-[#0f1626] via-[#16203a] to-[#22314f]">
      <div className="grid gap-0 md:grid-cols-[2.5fr_1fr]">
        {/* map */}
        <div className="relative p-5">
          <p className="label pointer-events-none absolute left-6 top-5 z-10 text-[var(--color-peri)]">
            Every pin is somewhere I&apos;ve been since 2023
          </p>

          {/* zoom controls */}
          <div className="absolute right-5 top-5 z-10 flex flex-col gap-1.5">
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
            className={`w-full touch-none select-none ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            role="img"
            aria-label="Map of places visited"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
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
                /* pins keep their size as you zoom */
                const s = 1 / view.k;

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
                    {/* name appears once you've zoomed in */}
                    {view.k > 2 && (
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

          <div className="pointer-events-none absolute bottom-5 left-6 flex items-center gap-4">
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

          <p className="label pointer-events-none absolute bottom-5 right-6 text-white/25">
            scroll to zoom · drag to pan
          </p>
        </div>

        {/* panel, the window seat */}
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/10 p-6 md:border-l md:border-t-0">
          {selected ? (
            <div className="w-full">
              <Window>
                <PlacePhoto
                  key={photosOf(selected)[shot] ?? photosOf(selected)[0]}
                  src={photosOf(selected)[shot] ?? photosOf(selected)[0]}
                  alt={selected.name}
                />
              </Window>

              {/* more than one shot of this place */}
              {photosOf(selected).length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5">
                  {photosOf(selected).map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setShot(i)}
                      aria-label={`Photo ${i + 1}`}
                      className={`size-10 overflow-hidden rounded-[3px] border transition-opacity ${
                        i === shot
                          ? "border-white/40 opacity-100"
                          : "border-white/10 opacity-50 hover:opacity-80"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-sub font-semibold text-white">
                {selected.name}
                {selected.home && (
                  <span
                    className="label rounded-[--radius-tag] px-1.5 py-0.5"
                    style={{
                      color: "var(--color-orange)",
                      border: "1px solid var(--color-orange)",
                    }}
                  >
                    lived here
                  </span>
                )}
              </p>
              <p
                className="label mt-1 text-center"
                style={{ color: "var(--color-marigold)" }}
              >
                {selected.date} · {Math.abs(selected.lat).toFixed(1)}°
                {selected.lat >= 0 ? "N" : "S"}{" "}
                {Math.abs(selected.lon).toFixed(1)}°
                {selected.lon >= 0 ? "E" : "W"}
              </p>
              {selected.caption && (
                <p className="mt-2 text-center text-caption text-white/60">
                  {selected.caption}
                </p>
              )}
            </div>
          ) : (
            /* empty state, an empty window seat, blue sky outside */
            <Window>
              <div className="grid size-full place-items-center">
                <span className="label text-white/90">Click on any pin!</span>
              </div>
            </Window>
          )}
        </div>
      </div>
    </div>
  );
}
