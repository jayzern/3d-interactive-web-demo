"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Scene } from "./Scene";
import type { Controls } from "./KeyboardInput";

/** Action names KeyboardInput reads back out of drei's KeyboardControls context. */
const keyboardMap: { name: Controls; keys: string[] }[] = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
];

export function WorldCanvas({ debug = false }: { debug?: boolean }) {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ fov: 55, near: 0.1, far: 200, position: [0, 5, 16] }}
        dpr={[1, 1.75]}
        // preserveDrawingBuffer keeps the last frame readable, so screenshots of the
        // demo capture the scene instead of an empty canvas.
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Fixed timestep, not "vary". With a variable step, any frame stall —
              alt-tabbing away is enough, since browsers throttle rAF in background
              windows — hands Rapier one enormous delta and the character is flung
              across the room on the next frame. */}
          <Physics debug={debug} timeStep={1 / 60}>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
