"use client";

import { useEffect, useRef } from "react";
import { Html, useAnimations, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { Interactable } from "./Interactable";
import { useGame } from "@/lib/useGame";
import type { Npc as NpcData } from "@/lib/npcs";

/**
 * Kenney's rig is 2.7 units from floor to crown — the head hangs off the torso, so
 * its offsets compound. Scaled down to match the ~1.83-unit player rig.
 */
const NPC_SCALE = 0.68;

export function Npc({ data }: { data: NpcData }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(`/models/npc/${data.model}`);
  const { actions } = useAnimations(animations, group);

  const isNearby = useGame((s) => s.nearby?.id === data.id);
  const isTalking = useGame((s) => s.open?.id === data.id);

  // Kenney rigs ship 27 clips; we only need to look alive and react when spoken to.
  useEffect(() => {
    const action = actions[isTalking ? "interact-right" : "idle"];
    if (!action) return;
    action.reset().fadeIn(0.25).play();
    return () => {
      action.fadeOut(0.25);
    };
  }, [actions, isTalking]);

  return (
    <Interactable target={data} position={data.position}>
      <group ref={group} rotation={[0, data.rotation, 0]} scale={NPC_SCALE}>
        <primitive object={scene} />
      </group>

      <Html position={[0, 2.3, 0]} center distanceFactor={12} zIndexRange={[20, 0]} pointerEvents="none">
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded-full px-3 py-1 text-center font-sans text-[13px] font-semibold tracking-wide text-white shadow-lg transition-transform duration-200"
          style={{
            background: isNearby ? data.color : "rgba(15,23,42,0.75)",
            color: isNearby ? "#0f172a" : "#e2e8f0",
            transform: `scale(${isNearby ? 1.12 : 1})`,
            border: `1px solid ${isNearby ? data.color : "rgba(148,163,184,0.35)"}`,
          }}
        >
          {data.name}
          <span className="ml-1.5 font-normal opacity-70">{data.role}</span>
        </div>
      </Html>
    </Interactable>
  );
}
