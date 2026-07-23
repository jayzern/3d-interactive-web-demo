"use client";

import { Html } from "@react-three/drei";
import { Interactable } from "./Interactable";
import { Prop } from "./Prop";
import { useGame } from "@/lib/useGame";
import { KIOSK } from "@/lib/npcs";

/** The dashboard terminal: a desk, a screen, and a glow so it reads as interactive. */
export function Kiosk() {
  const isNearby = useGame((s) => s.nearby?.id === KIOSK.id);

  return (
    <Interactable target={KIOSK} position={KIOSK.position} radius={2.8} solid={[1.4, 0.6, 0.6]}>
      <Prop name="desk" position={[-0.8, 0, 0.4]} rotation={[0, 0, 0]} />
      <Prop name="desk" position={[0.8, 0, 0.4]} rotation={[0, 0, 0]} />
      <Prop name="computerScreen" position={[-0.45, 0.84, 0]} rotation={[0, 0.25, 0]} />
      <Prop name="computerScreen" position={[0.45, 0.84, 0]} rotation={[0, -0.25, 0]} />
      <Prop name="computerKeyboard" position={[0, 0.84, 0.45]} />

      {/* Cheap fake monitor glow — an emissive plane, no light in the budget. */}
      <mesh position={[0, 1.15, 0.02]}>
        <planeGeometry args={[2.4, 0.9]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={isNearby ? 0.22 : 0.12} />
      </mesh>
      <pointLight position={[0, 1.5, 0.5]} distance={3.4} intensity={isNearby ? 4 : 2.2} color="#22d3ee" />

      <Html position={[0, 2.2, 0]} center distanceFactor={12} zIndexRange={[20, 0]} pointerEvents="none">
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded-full border px-3 py-1 font-sans text-[13px] font-semibold tracking-wide shadow-lg transition-transform duration-200"
          style={{
            background: isNearby ? "#22d3ee" : "rgba(15,23,42,0.75)",
            color: isNearby ? "#0f172a" : "#e2e8f0",
            borderColor: isNearby ? "#22d3ee" : "rgba(148,163,184,0.35)",
            transform: `scale(${isNearby ? 1.12 : 1})`,
          }}
        >
          {KIOSK.name}
          <span className="ml-1.5 font-normal opacity-70">live metrics</span>
        </div>
      </Html>
    </Interactable>
  );
}
