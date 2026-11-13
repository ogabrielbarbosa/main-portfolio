import { dataCenter } from "./dataCenter";
import { flag } from "./flag";
import { goldenGate } from "./goldenGate";
import { hpGarage } from "./hpGarage";
import { stanford } from "./stanford";
import type { SceneBuilder } from "./types";

export const SCENES = { goldenGate, stanford, flag, hpGarage, dataCenter } satisfies Record<string, SceneBuilder>;
