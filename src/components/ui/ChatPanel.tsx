"use client";

import { useEffect, useRef, useState } from "react";
import type { Choice, Npc } from "@/lib/npcs";

type Bubble = { from: "npc" | "you"; text: string };

/**
 * An ordinary React chat component. It has no idea it is sitting on top of a 3D
 * scene — swapping the canned lines for a streaming API response would not
 * change anything above this line.
 */
export function ChatPanel({ npc, onClose }: { npc: Npc; onClose: () => void }) {
  const [log, setLog] = useState<Bubble[]>([]);
  const [pending, setPending] = useState<string[]>(npc.greeting);
  const scroller = useRef<HTMLDivElement>(null);

  // Reveal queued lines one at a time so it reads like someone talking.
  useEffect(() => {
    if (pending.length === 0) return;
    const [next, ...rest] = pending;
    const t = setTimeout(
      () => {
        setLog((l) => [...l, { from: "npc", text: next }]);
        setPending(rest);
      },
      log.length === 0 ? 120 : 620,
    );
    return () => clearTimeout(t);
  }, [pending, log.length]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, pending]);

  const ask = (choice: Choice) => {
    setLog((l) => [...l, { from: "you", text: choice.label }]);
    setPending(choice.lines);
  };

  const busy = pending.length > 0;

  return (
    <div className="pointer-events-auto flex w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-slate-900"
          style={{ background: npc.color }}
        >
          {npc.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{npc.name}</p>
          <p className="truncate text-xs text-slate-400">{npc.role}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
        >
          Esc
        </button>
      </header>

      <div ref={scroller} className="flex max-h-[38vh] min-h-[9rem] flex-col gap-2 overflow-y-auto px-4 py-4">
        {log.map((b, i) => (
          <p
            key={i}
            className={
              b.from === "npc"
                ? "max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-sm leading-relaxed text-slate-100"
                : "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-sky-500/90 px-3.5 py-2 text-sm leading-relaxed text-slate-950"
            }
          >
            {b.text}
          </p>
        ))}
        {busy && (
          <span className="flex gap-1 self-start rounded-2xl bg-white/10 px-3.5 py-3" aria-label="typing">
            {[0, 1, 2].map((i) => (
              <i
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
        {npc.choices.map((c) => (
          <button
            key={c.label}
            disabled={busy}
            onClick={() => ask(c)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {c.label}
          </button>
        ))}
      </footer>
    </div>
  );
}
