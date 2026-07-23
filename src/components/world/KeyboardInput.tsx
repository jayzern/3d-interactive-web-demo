"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { EcctrlHandle } from "ecctrl";
import type { RefObject } from "react";

export type Controls = "forward" | "backward" | "leftward" | "rightward" | "jump" | "run";

/**
 * Feeds the keyboard into the controller.
 *
 * Ecctrl v2 has no keyboard handling of its own — it only listens to its touch
 * stores and to `setMovement()` — so wrapping the scene in drei's
 * <KeyboardControls> does nothing on its own. This is the missing wire.
 */
export function KeyboardInput({
  ecctrl,
  frozen,
}: {
  ecctrl: RefObject<EcctrlHandle | null>;
  frozen: boolean;
}) {
  const [, getKeys] = useKeyboardControls<Controls>();

  useFrame(() => {
    const handle = ecctrl.current;
    if (!handle) return;

    // While a panel is open, hold every key down so the character stops where it
    // is instead of coasting on whatever was pressed when the panel opened.
    if (frozen) {
      handle.setMovement({
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
        run: false,
        jump: false,
      });
      return;
    }

    const k = getKeys();
    handle.setMovement({
      forward: k.forward,
      backward: k.backward,
      leftward: k.leftward,
      rightward: k.rightward,
      run: k.run,
      jump: k.jump,
    });
  });

  return null;
}
