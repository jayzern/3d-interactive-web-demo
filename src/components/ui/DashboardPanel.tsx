"use client";

import { useEffect, useState } from "react";

const STATS = [
  { label: "Draw calls", value: 41, max: 100, unit: "", tone: "#38bdf8" },
  { label: "Frame budget used", value: 62, max: 100, unit: "%", tone: "#4ade80" },
  { label: "Shipped assets", value: 7.6, max: 20, unit: " MB", tone: "#fbbf24" },
  { label: "Rigid bodies", value: 12, max: 60, unit: "", tone: "#a78bfa" },
];

const ROWS = [
  { name: "Ada", role: "Front desk", status: "Available" },
  { name: "Kai", role: "Tech lead", status: "Refactoring" },
  { name: "Mira", role: "Recruiting", status: "Available" },
  { name: "Bo", role: "Coffee", status: "Brewing" },
];

/** The other half of the demo: same trigger, completely different React component. */
export function DashboardPanel({ onClose }: { onClose: () => void }) {
  // Bars animate from zero on mount so the panel feels like it powers on.
  const [live, setLive] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="pointer-events-auto w-[min(620px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-wide text-slate-100">Ops Terminal</p>
          <p className="text-xs text-slate-400">Scene telemetry · live</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
        >
          Esc
        </button>
      </header>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-400">{s.label}</span>
              <span className="font-mono text-sm text-slate-100">
                {s.value}
                {s.unit}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: live ? `${(s.value / s.max) * 100}%` : "0%",
                  background: s.tone,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">Floor roster</p>
        <ul className="divide-y divide-white/5">
          {ROWS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-14 font-medium text-slate-100">{r.name}</span>
              <span className="flex-1 truncate text-slate-400">{r.role}</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-300">{r.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
