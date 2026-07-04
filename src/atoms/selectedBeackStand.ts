import { atomWithReset } from "jotai/utils";
import { getBesideBeachStand, type BeachStand } from "../data/points";
import { atom } from "jotai";

export const selectedBeachStandAtom = atomWithReset<BeachStand | undefined>(
  undefined
);

export const selectedBeachStandNeighbors = atom<{
  previous: BeachStand | undefined;
  next: BeachStand | undefined;
}>(get => {
  const selectedBeachStand = get(selectedBeachStandAtom);
  if (!selectedBeachStand) {
    return {
      next: undefined,
      previous: undefined
    };
  }
  const previous = getBesideBeachStand(selectedBeachStand, "previous");
  const next = getBesideBeachStand(selectedBeachStand, "next");
  return {
    next,
    previous
  };
});
