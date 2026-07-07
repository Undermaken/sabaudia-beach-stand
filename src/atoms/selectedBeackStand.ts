import { atomWithReset } from "jotai/utils";
import { beachStands, type BeachStand } from "../data/points";
import { atom } from "jotai";
import { haversineDistance } from "../utils/map";

export const selectedBeachStandAtom = atomWithReset<BeachStand | undefined>(
  undefined
);

type Direction = "next" | "previous";
export type BeachStandNeighbor = BeachStand & {
  direction: "next" | "previous";
};
export const selectedBeachStandNeighbors = atom<BeachStandNeighbor[]>(get => {
  const selectedBeachStand = get(selectedBeachStandAtom);
  if (!selectedBeachStand) {
    return [];
  }
  return beachStands
    .filter(bs => bs.id !== selectedBeachStand.id)
    .map(bs => ({
      ...bs,
      direction:
        bs.id > selectedBeachStand.id ? "next" : ("previous" as Direction),
      distance: haversineDistance(
        selectedBeachStand.coordinates,
        bs.coordinates
      )
    }))
    .sort((a, b) => {
      return a.distance - b.distance;
    })
    .slice(0, 5);
});
