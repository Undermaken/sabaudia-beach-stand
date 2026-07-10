import { useAtomValue, useSetAtom } from "jotai";
import { usePosition } from "use-position";
import { useEffect } from "react";
import { Marker } from "react-map-gl/mapbox";
import { isDeveloperEnvironment } from "../utils/env";
import { myPositionAtom } from "../atoms/myPosition";
import classes from "./MyPositionMarker.module.css";

const devCoordinates = [41.35106376933946, 12.964129260409381];
export const MyPositionMarker = () => {
  const myPosition = useAtomValue(myPositionAtom);
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

  const lat = myPosition.position?.latitude;
  const lon = myPosition.position?.longitude;
  if (lat == null || lon == null) return null;

  return (
    <Marker latitude={lat} longitude={lon} anchor="center">
      <div className={classes.dot} />
    </Marker>
  );
};
