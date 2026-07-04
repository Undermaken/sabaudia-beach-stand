import { Alert, Box } from "@mantine/core";
import {
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import {
  Layer,
  Map as MapGL,
  type MapRef,
  NavigationControl,
  Source
} from "react-map-gl/mapbox";
import { beachStands, bounds } from "../data/points.ts";
import { WaypointMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue } from "jotai";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors
} from "../atoms/selectedBeackStand.ts";
import type { GPSCoordinate } from "../types.ts";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_PADDING = { top: 80, bottom: 40, left: 40, right: 40 };

export type MapViewHandle = {
  /** Draw a dashed line between two coordinates. */
  drawDashedLine: (start: GPSCoordinate, end: GPSCoordinate) => void;
  /** Remove the dashed line, if any. */
  clearDashedLine: () => void;
};

type MapViewProps = {
  ref?: Ref<MapViewHandle>;
};

export const MapView = ({ ref }: MapViewProps) => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const { next, previous } = useAtomValue(selectedBeachStandNeighbors);
  const mapRef = useRef<MapRef | null>(null);
  const [dashedLines, setDashedLines] = useState<
    GeoJSON.Feature<GeoJSON.LineString>[]
  >([]);
  const clearDashedLine = useCallback(() => setDashedLines([]), []);

  const drawDashedLine = useCallback(
    (start: GPSCoordinate, end: GPSCoordinate) => {
      setDashedLines(pv => [
        ...pv,
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [start.longitude, start.latitude],
              [end.longitude, end.latitude]
            ]
          }
        }
      ]);
    },
    []
  );

  useImperativeHandle(ref, () => ({ drawDashedLine, clearDashedLine }), [
    drawDashedLine,
    clearDashedLine
  ]);

  useEffect(() => {
    if (!beachStand || (!next && !previous)) {
      clearDashedLine();
      return;
    }
    if (next) {
      drawDashedLine(next.coordinates, beachStand.coordinates);
    }
    if (previous) {
      drawDashedLine(previous.coordinates, beachStand.coordinates);
    }
  }, [next, previous]);

  useEffect(() => {
    if (!beachStand) {
      mapRef?.current?.fitBounds(bounds, {
        padding: MAP_PADDING
      });
      return;
    }
    const { longitude, latitude } = beachStand.coordinates;
    mapRef?.current?.fitBounds(
      [
        [longitude, latitude],
        [longitude, latitude]
      ],
      {
        padding: { ...MAP_PADDING, bottom: 160 },
        maxZoom: 14,
        duration: 600
      }
    );
  }, [beachStand]);

  if (!MAPBOX_TOKEN) {
    return (
      <Alert color="yellow" title="Mappa non disponibile" m="md">
        Manca <code>VITE_MAPBOX_ACCESS_TOKEN</code>. Copia{" "}
        <code>.env.example</code> in <code>.env</code> e aggiungi un token di
        accesso Mapbox per visualizzare la mappa.
      </Alert>
    );
  }
  console.log(dashedLines);
  return (
    <Box style={{ flex: 1, minHeight: 0 }}>
      <MapGL
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          bounds,
          fitBoundsOptions: {
            padding: MAP_PADDING
          }
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        {beachStands.map(beackStand => (
          <WaypointMarker key={beackStand.name} beackStand={beackStand} />
        ))}
        {dashedLines.map(dashedLine => {
          const [start] = dashedLine.geometry.coordinates;
          const id = `dashed-line-${start[0]},${start[1]}`;
          return (
            <Source key={id} id={id} type="geojson" data={dashedLine}>
              <Layer
                id={`${id}-layer`}
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{
                  "line-color": "#e03131",
                  "line-width": 3,
                  "line-dasharray": [2, 2]
                }}
              />
            </Source>
          );
        })}
      </MapGL>
    </Box>
  );
};
