import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/mapbox";
import type { GPSCoordinate } from "../types.ts";

export const SERVICE_AREA_RADIUS_METERS = 625;
export const SERVICE_AREA_OPACITY = 0.25;
const CIRCLE_POINTS = 64;

type ServiceAreaCircleProps = {
  id: string;
  center: GPSCoordinate;
};

// A real geographic polygon (not a fixed-pixel shape): Mapbox projects it
// correctly at every zoom/pan/rotation, so the radius is always accurate.
const buildCirclePolygon = (
  center: GPSCoordinate,
  radiusMeters: number
): GeoJSON.Feature<GeoJSON.Polygon> => {
  const km = radiusMeters / 1000;
  const distanceX = km / (111.32 * Math.cos((center.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  const ring = Array.from({ length: CIRCLE_POINTS }, (_, i) => {
    const theta = (i / CIRCLE_POINTS) * (2 * Math.PI);
    return [
      center.longitude + distanceX * Math.cos(theta),
      center.latitude + distanceY * Math.sin(theta)
    ];
  });
  ring.push(ring[0]);

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [ring] }
  };
};

export const ServiceAreaCircle = ({ id, center }: ServiceAreaCircleProps) => {
  const circle = useMemo(
    () => buildCirclePolygon(center, SERVICE_AREA_RADIUS_METERS),
    [center]
  );

  return (
    <Source id={id} type="geojson" data={circle}>
      <Layer
        id={`${id}-layer`}
        type="fill"
        paint={{
          "fill-color": "#4dabf7",
          "fill-opacity": SERVICE_AREA_OPACITY
        }}
      />
    </Source>
  );
};
