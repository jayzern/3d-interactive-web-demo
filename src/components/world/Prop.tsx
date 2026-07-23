"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

/**
 * Kenney's furniture kit is authored at roughly half the scale of our ~2-unit-tall
 * characters, so everything gets the same multiplier to land at human proportions.
 */
export const FURNITURE_SCALE = 2.2;

const url = (name: string) => `/models/props/${name}.glb`;

type PropProps = Omit<ThreeElements["group"], "ref" | "children" | "scale"> & {
  /** Filename (no extension) under /models/props/. */
  name: string;
  /** Extra multiplier on top of FURNITURE_SCALE. */
  scale?: number;
};

/**
 * One piece of decor. <Clone> shares the loaded geometry and materials between
 * every copy, so twelve desks cost one GLB parse.
 */
export function Prop({ name, scale = 1, ...props }: PropProps) {
  const { scene } = useGLTF(url(name));
  return <Clone object={scene} scale={FURNITURE_SCALE * scale} castShadow receiveShadow {...props} />;
}

export function preloadProps(names: string[]) {
  names.forEach((n) => useGLTF.preload(url(n)));
}
