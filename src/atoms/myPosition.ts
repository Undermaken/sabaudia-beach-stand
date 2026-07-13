import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { beachStands, type BeachStand } from "../data/points";
import { haversineDistance } from "../utils/map";

type MyPosition = {
  active: boolean;
  drawerOpen: boolean;
  error?: string;
  position?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
};

export const myPositionAtom = atomWithReset<MyPosition>({
  active: false,
  drawerOpen: false,
  position: undefined
});
myPositionAtom.debugLabel = "myPositionAtom";

export type NearbyStand = BeachStand & { distance: number };

export const myPositionNearbyStandsAtom = atom<NearbyStand[]>(get => {
  const myPosition = get(myPositionAtom);
  const lat = myPosition.position?.latitude;
  const lon = myPosition.position?.longitude;
  if (lat == null || lon == null) return [];
  const origin = { latitude: lat, longitude: lon, altitude: 0 };
  return beachStands
    .map(bs => ({
      ...bs,
      distance: haversineDistance(origin, bs.coordinates)
    }))
    .sort((a, b) => a.distance - b.distance);
});
