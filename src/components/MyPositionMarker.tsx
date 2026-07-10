import { useSetAtom } from "jotai/index";
import { usePosition } from "use-position";
import { useEffect } from "react";
import { isDeveloperEnvironment } from "../utils/env";
import { myPositionAtom } from "../atoms/myPosition";

const devCoordinates = [41.9010151, 12.500202];
export const MyPositionMarker = () => {
  const setMyPosition = useSetAtom(myPositionAtom);
  const { latitude, longitude, accuracy, error } = usePosition(true, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
  useEffect(() => {
    const [tmpLat, tmpLon] = isDeveloperEnvironment
      ? devCoordinates
      : [latitude, longitude];
    setMyPosition(pv => ({
      ...pv,
      position: { latitude: tmpLat, longitude: tmpLon, accuracy, error }
    }));
  }, [latitude, longitude, accuracy, error, setMyPosition]);
  return null;
};
