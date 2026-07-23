"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

/**
 * Covers the canvas until the GLBs are parsed. drei's own <Loader> lives inside
 * the R3F tree; this one is plain DOM so it can style freely and fade out.
 */
export function LoadingVeil() {
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);
  // useProgress reads 100/inactive for the first few frames, before Suspense has
  // asked for anything. Without a floor the veil blinks away and the player stares
  // at an empty canvas while the GLBs are still arriving.
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (active || progress < 100 || !minElapsed) return;
    // Hold briefly so the first frame is rendered before the veil lifts.
    const t = setTimeout(() => setDone(true), 400);
    return () => clearTimeout(t);
  }, [active, progress, minElapsed]);

  if (done) return null;

  return (
    <div
      className={`absolute inset-0 z-50 grid place-items-center bg-slate-950 transition-opacity duration-500 ${
        progress >= 100 && minElapsed ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-56 text-center">
        <p className="mb-4 text-sm font-medium tracking-widest text-slate-400 uppercase">Entering the office</p>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-xs text-slate-500">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
