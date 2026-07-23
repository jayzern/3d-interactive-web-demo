"use client";

import dynamic from "next/dynamic";
import { UILayer } from "./ui/UILayer";
import { LoadingVeil } from "./ui/LoadingVeil";

// WebGL has no server-side equivalent, so the canvas is client-only. `ssr: false`
// is rejected inside a Server Component, which is why this wrapper is a Client
// Component and page.tsx only renders it.
const WorldCanvas = dynamic(() => import("./world/WorldCanvas").then((m) => m.WorldCanvas), {
  ssr: false,
});

export function GameClient() {
  // ?debug draws Rapier's colliders — the fastest way to see why something is
  // standing in the wrong place or falling through the floor.
  const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#c7d3e3]">
      <WorldCanvas debug={debug} />
      <UILayer />
      <LoadingVeil />
    </main>
  );
}
