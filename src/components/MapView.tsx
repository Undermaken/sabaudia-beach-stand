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
import { beachStands, getBounds, type BeachStand } from "../data/points.ts";
import { WaypointMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue } from "jotai";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors
} from "../atoms/selectedBeackStand.ts";
import type { GPSCoordinate } from "../types.ts";
import { COLORS } from "../utils/colors.ts";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_PADDING = { top: 80, bottom: 40, left: 40, right: 40 };
// All stand coordinates, precomputed once for the default (whole-set) map fit.
const BEACH_STANDS_COORDS = beachStands.map(bs => bs.coordinates);
export type MapViewHandle = {
  /** Draw a dashed line of the given color between two coordinates. */
  drawDashedLine: (
    start: GPSCoordinate,
    end: GPSCoordinate,
    color: string
  ) => void;
  /** Remove every dashed line, if any. */
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
    { line: GeoJSON.Feature<GeoJSON.LineString>; color: string }[]
  >([]);
  const clearDashedLine = useCallback(() => setDashedLines([]), []);

  // Append a colored dashed line; state drives the <Source>/<Layer> rendered below.
  const drawDashedLine = useCallback(
    (start: GPSCoordinate, end: GPSCoordinate, color: string) => {
      setDashedLines(pv => [
        ...pv,
        {
          color,
          line: {
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
        }
      ]);
    },
    []
  );

  // Expose the draw/clear API to the parent through the forwarded ref.
  useImperativeHandle(ref, () => ({ drawDashedLine, clearDashedLine }), [
    drawDashedLine,
    clearDashedLine
  ]);

  // Keep the dashed lines in sync with the selection: one per existing neighbor.
  useEffect(() => {
    if (!beachStand || (!next && !previous)) {
      clearDashedLine();
      return;
    }
    if (next) {
      drawDashedLine(next.coordinates, beachStand.coordinates, COLORS.nextBeachStandLineColor);
    }
    if (previous) {
      drawDashedLine(previous.coordinates, beachStand.coordinates, COLORS.prevBeachStandLineColor);
    }
  }, [next, previous]);

  useEffect(() => {
    if (!beachStand) {
      mapRef?.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
        padding: MAP_PADDING
      });
      return;
    }
    const bounds = getBounds(
      [beachStand, next, previous]
        .filter((bs: BeachStand | undefined): bs is BeachStand => !!bs)
        .map(bs => bs.coordinates)
    );

    mapRef?.current?.fitBounds(bounds, {
      padding: { ...MAP_PADDING, bottom: 380 },
      maxZoom: 13,
      duration: 600
    });
  }, [beachStand, next, previous]);

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
          bounds: getBounds(BEACH_STANDS_COORDS),
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
        {dashedLines.map(({ line: dashedLine, color }) => {
          const [start] = dashedLine.geometry.coordinates;
          const id = `dashed-line-${start[0]},${start[1]}`;
          return (
            <Source key={id} id={id} type="geojson" data={dashedLine}>
              <Layer
                id={`${id}-layer`}
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{
                  "line-color": color,
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
