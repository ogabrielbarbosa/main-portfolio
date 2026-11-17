import { dataCenter } from "./dataCenter";
import { flag } from "./flag";
import { goldenGate } from "./goldenGate";
import { hpGarage } from "./hpGarage";
import { stanford } from "./stanford";
import type { SceneBuilder } from "./types";

// goldenGate goes first: it is always the opening scene. The flag is disabled for now (keep the import).
void flag;
export const SCENES = { goldenGate, stanford, hpGarage, dataCenter } satisfies Record<string, SceneBuilder>;
