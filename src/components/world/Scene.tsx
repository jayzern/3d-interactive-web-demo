"use client";

import { Office } from "./Office";
import { Npc } from "./Npc";
import { Kiosk } from "./Kiosk";
import { Player } from "./Player";
import { NPCS } from "@/lib/npcs";

export function Scene() {
  return (
    <>
      <color attach="background" args={["#c7d3e3"]} />
      <fog attach="fog" args={["#c7d3e3", 46, 105]} />

      {/* Lit entirely with primitives — no HDR environment map, so the demo never
          waits on a CDN to look right. */}
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#dbe9ff", "#9c8f78", 0.55]} />
      <directionalLight
        castShadow
        position={[14, 20, 10]}
        intensity={1.7}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 24, -24, 0.1, 70]} />
      </directionalLight>
      <directionalLight position={[-12, 10, -8]} intensity={0.25} />

      <Office />
      {NPCS.map((npc) => (
        <Npc key={npc.id} data={npc} />
      ))}
      <Kiosk />
      <Player />
    </>
  );
}
