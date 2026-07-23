"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { EcctrlHandle } from "ecctrl";
import type { RefObject } from "react";

/**
 * Third-person orbit camera.
 *
 * Ecctrl v2 dropped v1's built-in follow camera, so we drive one here. This is
 * load-bearing beyond the view: Ecctrl derives "forward" from the default camera's
 * world direction, so this component is also the steering input.
 *
 * It owns the camera transform outright rather than delegating to camera-controls.
 * A library orbit rig keeps its own target/spherical state, which fights a target
 * that is rewritten every frame; holding the angles ourselves is both shorter and
 * completely predictable.
 */

// Kept well away from straight-down: a bird's-eye angle reads as a strategy game
// and loses the character entirely behind the desks.
const MIN_POLAR = 0.65;
const MAX_POLAR = 1.45;
const MIN_DIST = 3.5;
const MAX_DIST = 12;
const HEAD_HEIGHT = 0.7;

export function FollowCamera({
  ecctrl,
  frozen,
}: {
  ecctrl: RefObject<EcctrlHandle | null>;
  frozen: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const domElement = useThree((s) => s.gl.domElement);

  // Orbit state, in refs so dragging never triggers a React render.
  const azimuth = useRef(0);
  const polar = useRef(1.15);
  const distance = useRef(7.5);
  const dragging = useRef(false);
  // Mirrored into a ref so the pointer listeners, which are bound once, always see
  // the current value without rebinding.
  const frozenRef = useRef(frozen);
  useEffect(() => {
    frozenRef.current = frozen;
  }, [frozen]);

  const target = useRef(new THREE.Vector3(0, 3, 8));
  const desired = useRef(new THREE.Vector3());
  const settled = useRef(false);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (frozenRef.current || e.button !== 0) return;
      dragging.current = true;
      domElement.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current || frozenRef.current) return;
      azimuth.current -= e.movementX * 0.005;
      polar.current = THREE.MathUtils.clamp(polar.current - e.movementY * 0.005, MIN_POLAR, MAX_POLAR);
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      if (domElement.hasPointerCapture(e.pointerId)) domElement.releasePointerCapture(e.pointerId);
    };

    const onWheel = (e: WheelEvent) => {
      if (frozenRef.current) return;
      e.preventDefault();
      distance.current = THREE.MathUtils.clamp(distance.current + e.deltaY * 0.01, MIN_DIST, MAX_DIST);
    };

    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("pointerup", onPointerUp);
    domElement.addEventListener("pointercancel", onPointerUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", onPointerUp);
      domElement.removeEventListener("pointercancel", onPointerUp);
      domElement.removeEventListener("wheel", onWheel);
    };
  }, [domElement]);

  // Dragging past the edge of the window should not leave the camera stuck to the
  // pointer once the button comes back up somewhere else.
  useEffect(() => {
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener("blur", stop);
    return () => window.removeEventListener("blur", stop);
  }, []);

  useFrame((_, delta) => {
    const pos = ecctrl.current?.currPos;
    if (!pos) return;

    // Ease the look-at point toward the character so landing from the spawn drop
    // does not jolt the frame.
    const lookY = pos.y + HEAD_HEIGHT;
    if (!settled.current) {
      target.current.set(pos.x, lookY, pos.z);
      settled.current = true;
    } else {
      target.current.lerp(tmp.set(pos.x, lookY, pos.z), 1 - Math.pow(0.0015, delta));
    }

    const sinPolar = Math.sin(polar.current);
    desired.current.set(
      target.current.x + distance.current * sinPolar * Math.sin(azimuth.current),
      target.current.y + distance.current * Math.cos(polar.current),
      target.current.z + distance.current * sinPolar * Math.cos(azimuth.current),
    );

    camera.position.copy(desired.current);
    camera.lookAt(target.current);
  });

  return null;
}

const tmp = new THREE.Vector3();
