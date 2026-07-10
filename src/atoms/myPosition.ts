import { atomWithReset } from "jotai/utils";


type MyPosition = {
  active: boolean;
  centerInMap: boolean;
  position?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    error?: string;
  };
};



export const myPositionAtom = atomWithReset<MyPosition>({
  active: false,
  centerInMap: false,
  position: undefined
});
myPositionAtom.debugLabel = "aroundYouIsActiveAtom";


