"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { ReactNode } from "react";
import { useGame, type Target } from "@/lib/useGame";

/** Name on the player's rigid body, used to ignore every other collider. */
export const PLAYER_NAME = "player";

type InteractableProps = {
  target: Target;
  position: [number, number, number];
  /** Half-extents of the trigger volume. */
  radius?: number;
  /** Half-extents of the solid body the player bumps into. */
  solid?: [number, number, number];
  children?: ReactNode;
};

/**
 * A thing in the world the player can walk up to: a solid body you can't walk
 * through, wrapped in a sensor volume that reports arrival and departure.
 */
export function Interactable({ target, position, radius = 2.6, solid = [0.45, 1, 0.45], children }: InteractableProps) {
  const enter = useGame((s) => s.enter);
  const leave = useGame((s) => s.leave);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      {children}

      <CuboidCollider args={solid} position={[0, solid[1], 0]} />

      {/* Sensors report *any* intersection — the floor and every prop included —
          so filter down to the player's body by name. */}
      <CuboidCollider
        args={[radius, 2, radius]}
        position={[0, 2, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === PLAYER_NAME) enter(target);
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name === PLAYER_NAME) leave(target.id);
        }}
      />
    </RigidBody>
  );
}
