import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import classes from "./ServiceAreaCircle.module.css";

export const SERVICE_AREA_RADIUS_METERS = 700;
export const SERVICE_AREA_OPACITY = 0.25;

type ServiceAreaCircleProps = {
  latitude: number;
};

// Web Mercator ground resolution: meters per pixel at a given latitude/zoom.
const metersPerPixel = (latitude: number, zoom: number): number =>
  (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

export const ServiceAreaCircle = ({ latitude }: ServiceAreaCircleProps) => {
  const { current: map } = useMap();
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? 0);

  useEffect(() => {
    if (!map) {
      return;
    }
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoom", onZoom);
    return () => {
      map.off("zoom", onZoom);
    };
  }, [map]);

  const diameterPx =
    (2 * SERVICE_AREA_RADIUS_METERS) / metersPerPixel(latitude, zoom);

  return (
    <div
      className={classes.circle}
      style={{
        width: diameterPx,
        height: diameterPx,
        opacity: SERVICE_AREA_OPACITY
      }}
    />
  );
};
