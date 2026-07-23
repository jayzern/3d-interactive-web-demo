"use client";

import { RigidBody } from "@react-three/rapier";
import { Prop } from "./Prop";

/** Interior half-extents. The room runs x ∈ [-14,14], z ∈ [-11,11]. */
const HALF_X = 14;
const HALF_Z = 11;
const WALL_H = 4.5;
const WALL_T = 0.5;

const FLOOR = "#cbc2b1";
const WALL = "#ddd8cd";

/** A desk with a chair and a monitor — the unit the open-plan area repeats. */
function Workstation({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Prop name="desk" position={[-0.79, 0, 0]} />
      <Prop name="computerScreen" position={[-0.4, 0.84, -0.1]} rotation={[0, 0.2, 0]} />
      <Prop name="computerKeyboard" position={[0, 0.84, 0.35]} />
      <Prop name="chairDesk" position={[0.1, 0, 1.1]} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

export function Office() {
  return (
    <group>
      {/* Floor and walls are the only colliders in the room. Everything else is
          decor the player walks through — cheaper, and nothing to snag on. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[HALF_X * 2, 0.5, HALF_Z * 2]} />
          <meshStandardMaterial color={FLOOR} />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <Wall position={[0, WALL_H / 2, -HALF_Z]} args={[HALF_X * 2, WALL_H, WALL_T]} />
      <Wall position={[0, WALL_H / 2, HALF_Z]} args={[HALF_X * 2, WALL_H, WALL_T]} />
      <Wall position={[-HALF_X, WALL_H / 2, 0]} args={[WALL_T, WALL_H, HALF_Z * 2]} />
      <Wall position={[HALF_X, WALL_H / 2, 0]} args={[WALL_T, WALL_H, HALF_Z * 2]} />

      {/* ---- West wing: engineering desks ---- */}
      <Workstation position={[-9.5, 0, -5.5]} rotation={Math.PI / 2} />
      <Workstation position={[-9.5, 0, -2]} rotation={Math.PI / 2} />
      <Workstation position={[-9.5, 0, 1.5]} rotation={Math.PI / 2} />
      <Workstation position={[-9.5, 0, 5]} rotation={Math.PI / 2} />
      <Prop name="bookcaseClosedWide" position={[-13.2, 0, -9]} rotation={[0, Math.PI / 2, 0]} />
      <Prop name="bookcaseOpen" position={[-13.2, 0, 8.5]} rotation={[0, Math.PI / 2, 0]} />
      <Prop name="rugRectangle" position={[-8.2, 0.01, -7.5]} rotation={[0, Math.PI / 2, 0]} scale={1.6} />

      {/* ---- East wing: recruiting corner ---- */}
      <Workstation position={[9.5, 0, -5.5]} rotation={-Math.PI / 2} />
      <Workstation position={[9.5, 0, -1]} rotation={-Math.PI / 2} />
      <Prop name="lampSquareFloor" position={[12.6, 0, -8.5]} />
      <Prop name="pottedPlant" position={[12.8, 0, 2]} />
      <Prop name="plantSmall1" position={[12.8, 0, -3.5]} />

      {/* ---- Back-right: break room ---- */}
      <Prop name="rugRound" position={[9, 0.01, 6.5]} scale={1.8} />
      <Prop name="loungeChair" position={[6.6, 0, 5.4]} rotation={[0, -Math.PI / 3, 0]} />
      <Prop name="loungeChair" position={[11.2, 0, 5.2]} rotation={[0, Math.PI / 3, 0]} />
      <Prop name="tableCoffee" position={[8.4, 0, 6.2]} />
      <Prop name="desk" position={[7.4, 0, 9.6]} />
      <Prop name="desk" position={[9.2, 0, 9.6]} />
      <Prop name="kitchenCoffeeMachine" position={[8.4, 0.84, 9.5]} rotation={[0, Math.PI, 0]} />
      <Prop name="pottedPlant" position={[12.6, 0, 9.4]} />

      {/* ---- Back-left: lounge / demo screen ---- */}
      <Prop name="cabinetTelevision" position={[-9.5, 0, 9.4]} rotation={[0, Math.PI, 0]} />
      <Prop name="televisionModern" position={[-8.7, 0.72, 9.4]} rotation={[0, Math.PI, 0]} />
      <Prop name="rugRectangle" position={[-11, 0.01, 6.2]} scale={1.7} />
      <Prop name="loungeChair" position={[-11.5, 0, 6]} rotation={[0, Math.PI, 0]} />
      <Prop name="plantSmall1" position={[-13, 0, 3]} />

      {/* ---- Centre: reception ---- */}
      <Prop name="rugRound" position={[0, 0.01, 5.5]} scale={2.2} />
      <Prop name="pottedPlant" position={[-3.2, 0, 6.4]} />
      <Prop name="pottedPlant" position={[3.2, 0, 6.4]} />
    </group>
  );
}

function Wall({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color={WALL} />
      </mesh>
    </RigidBody>
  );
}
