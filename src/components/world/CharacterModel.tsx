"use client";

/*
 * react-hooks/immutability is disabled for this file. It objects to mutating the
 * AnimationActions and Materials that useAnimations/useGLTF hand back — but those
 * are imperative three.js objects, and driving them is the only way to play a clip.
 * The rule is about React values; nothing here feeds a render.
 */
/* eslint-disable react-hooks/immutability */

import { useCallback, useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEcctrlAnimationStore } from "ecctrl/animation";
import * as THREE from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

const MODEL = "/models/AnimationLibrary.glb";

/**
 * Ecctrl emits these seven states; the Quaternius library that ships with ecctrl
 * happens to have a clip for each, which is why we use its rig for the player.
 */
const CLIP: Record<string, string> = {
  IDLE: "Idle_Loop",
  WALK: "Walk_Loop",
  RUN: "Jog_Fwd_Loop",
  JUMP_START: "Jump_Start",
  JUMP_IDLE: "Jump_Loop",
  JUMP_FALL: "Jump_Loop",
  JUMP_LAND: "Jump_Land",
};

/** Clips that must play out before anything else takes over. */
const ONE_SHOT = new Set(["Jump_Start", "Jump_Land"]);

const TINT: Record<string, string> = {
  M_Main: "#f1f5f9",
  M_Joints: "#38bdf8",
};

export function CharacterModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions, mixer } = useAnimations(animations, group);

  const state = useEcctrlAnimationStore((s) => s.animationState);
  const playing = useRef("Idle_Loop");
  const wanted = useRef("Idle_Loop");
  const locked = useRef(false);

  // The rig ships untextured, so tint it here rather than shipping a variant GLB.
  useEffect(() => {
    group.current?.traverse((object) => {
      const material = (object as Mesh).material as MeshStandardMaterial | undefined;
      const tint = material && TINT[material.name];
      if (!tint) return;
      material.color.set(tint);
      material.side = THREE.FrontSide;
    });
  }, []);

  const play = useCallback(
    (next: string) => {
      const action = actions[next];
      if (!action || next === playing.current) return;

      const from = actions[playing.current];
      const oneShot = ONE_SHOT.has(next);

      action.reset();
      action.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
      action.clampWhenFinished = oneShot;
      action.timeScale = oneShot ? 1.6 : 1;

      const fade = oneShot ? 0.1 : 0.2;
      if (from) action.crossFadeFrom(from, fade, true).play();
      else action.fadeIn(fade).play();

      playing.current = next;
      locked.current = oneShot;
    },
    [actions],
  );

  useEffect(() => {
    const next = CLIP[state];
    if (!next) return;
    wanted.current = next;
    // A jump take-off or landing is allowed to finish before the loop resumes.
    if (!locked.current) play(next);
  }, [state, play]);

  // Once a one-shot has played out, catch up to whatever the controller wants now.
  useEffect(() => {
    const onFinished = () => {
      locked.current = false;
      play(wanted.current);
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer, play]);

  // Drop the rig so its feet land on the floor rather than at the capsule's centre:
  // half the capsule (CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS) plus the float gap Ecctrl
  // holds the body at.
  return (
    <group ref={group} position={[0, -1.1, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL);
