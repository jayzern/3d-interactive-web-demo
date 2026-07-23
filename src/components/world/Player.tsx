"use client";

import { useRef } from "react";
import { Ecctrl, type EcctrlHandle } from "ecctrl";
import { EcctrlAnimationStateController } from "ecctrl/animation";
import { CharacterModel } from "./CharacterModel";
import { FollowCamera } from "./FollowCamera";
import { KeyboardInput } from "./KeyboardInput";
import { PLAYER_NAME } from "./Interactable";
import { useGame } from "@/lib/useGame";

/** Sized to the ~1.8-unit rig; CharacterModel's offset depends on these. */
const CAPSULE_HALF_HEIGHT = 0.55;
const CAPSULE_RADIUS = 0.35;

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null);
  const open = useGame((s) => s.open);
  const busy = !!open;

  return (
    <>
      {/* Mounted before <Ecctrl> so its useFrame writes this frame's input before
          the controller reads it. */}
      <KeyboardInput ecctrl={ecctrl} frozen={busy} />

      {/* Watches the controller and publishes IDLE/WALK/RUN/JUMP_* for the model. */}
      <EcctrlAnimationStateController ecctrl={ecctrl} />

      <Ecctrl
        ref={ecctrl}
        name={PLAYER_NAME}
        // Freezing the controller is what stops WASD from walking the character
        // away while the player is typing in a panel.
        enable={!busy}
        // Spawn at the resting height (capsule half + radius + float gap). Dropping
        // the character in makes it skid on landing, so where it ends up — and
        // whether it starts inside an NPC's trigger — varies between loads.
        position={[0, CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS + 0.25, 8]}
        capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
        capsuleRadius={CAPSULE_RADIUS}
        maxWalkVel={2.6}
        maxRunVel={5.5}
        jumpVel={4.5}
        // The office is full of static props; nothing needs to be shoved around.
        applyCounterMass={false}
        applyCounterMoveImp={false}
        applyCounterJumpImp={false}
      >
        <CharacterModel />
      </Ecctrl>

      <FollowCamera ecctrl={ecctrl} frozen={busy} />
    </>
  );
}
