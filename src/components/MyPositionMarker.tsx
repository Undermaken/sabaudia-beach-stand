import { useAtomValue, useSetAtom } from "jotai";
import { usePosition } from "use-position";
import { useEffect } from "react";
import { Marker } from "react-map-gl/mapbox";
import { isDeveloperEnvironment } from "../utils/env";
import { myPositionAtom } from "../atoms/myPosition";
import classes from "./MyPositionMarker.module.css";

const devCoordinates = [41.31429863669901, 13.026645489320895];
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
    const nextError = isDeveloperEnvironment ? undefined : error;
    setMyPosition(pv =>
      tmpLat != null && tmpLon != null
        ? {
            ...pv,
            error: nextError,
            position: { latitude: tmpLat, longitude: tmpLon, accuracy }
          }
        : { ...pv, error: nextError }
    );
  }, [latitude, longitude, accuracy, error, setMyPosition]);

  const lat = myPosition.position?.latitude;
  const lon = myPosition.position?.longitude;
  if (lat == null || lon == null) return null;

  const handleClick = () => {
    setMyPosition(pv => ({ ...pv, drawerOpen: !pv.drawerOpen }));
  };

  return (
    <Marker
      latitude={lat}
      longitude={lon}
      anchor="center"
      onClick={handleClick}
    >
      <div className={classes.pulse}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="3" />
          <path d="M12 10c-4 0-6 2.5-6 5v1h12v-1c0-2.5-2-5-6-5z" />
          <path d="M8 20h8" />
        </svg>
      </div>
    </Marker>
  );
};
