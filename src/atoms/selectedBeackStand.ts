import {  atomWithReset } from "jotai/utils";
import type { BeachStand } from "../data/points";


export const selectedBeachStandAtom =     atomWithReset<BeachStand| undefined>(undefined);      