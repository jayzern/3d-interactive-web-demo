"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/useGame";
import { NPCS } from "@/lib/npcs";
import { ChatPanel } from "./ChatPanel";
import { DashboardPanel } from "./DashboardPanel";

export function UILayer() {
  const { nearby, open, openPanel, close } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never steal keys from a text field — otherwise typing "e" reopens the panel.
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

      if (e.key === "Escape") close();
      if (e.key.toLowerCase() === "e" && !open) openPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPanel, close]);

  const npc = open?.kind === "chat" ? NPCS.find((n) => n.id === open.id) : undefined;

  return (
    // pointer-events-none so the layer never eats a drag meant for the camera;
    // each panel opts back in.
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <header className="absolute left-5 top-5 max-w-xs">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 drop-shadow-sm">The Office</h1>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-700/80">
          <Key>W</Key>
          <Key>A</Key>
          <Key>S</Key>
          <Key>D</Key> move · <Key>Shift</Key> run · <Key>Space</Key> jump · drag to look
        </p>
      </header>

      {/* Proximity prompt */}
      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-all duration-200 ${
          nearby && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 shadow-xl backdrop-blur">
          Press <Key dark>E</Key> to {nearby?.kind === "dashboard" ? "use" : "talk to"}{" "}
          <span className="font-semibold">{nearby?.name ?? ""}</span>
        </div>
      </div>

      {/* Panels */}
      {open && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          {npc ? (
            <ChatPanel key={npc.id} npc={npc} onClose={close} />
          ) : (
            <DashboardPanel onClose={close} />
          )}
        </div>
      )}
    </div>
  );
}

function Key({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <kbd
      className={`mx-0.5 inline-block rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none ${
        dark ? "border-white/20 bg-white/10 text-slate-100" : "border-slate-900/15 bg-white/60 text-slate-800"
      }`}
    >
      {children}
    </kbd>
  );
}
