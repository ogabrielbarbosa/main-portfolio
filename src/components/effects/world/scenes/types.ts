import type * as THREE from "three";
import type { Kit, Theme } from "../kit";

export interface Landmark {
  kit: Kit;
  // Positions the camera for this viewport and returns the point it looks at.
  frame: (camera: THREE.PerspectiveCamera, width: number) => THREE.Vector3;
  // How much the slow camera drift is allowed to wander (1 = full). Tight spaces keep it small.
  drift?: number;
}

export type SceneBuilder = (theme: Theme, flip: boolean) => Landmark;
