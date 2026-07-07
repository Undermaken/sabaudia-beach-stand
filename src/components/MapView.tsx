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
  Source,
  useControl
} from "react-map-gl/mapbox";
import { beachStands, getBounds, type BeachStand } from "../data/points.ts";
import { BeachStandMarker } from "./BeachStandMarker.tsx";
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

// "Fit to frame" icon for the custom reset control (mapbox controls are plain DOM).
const RESET_VIEW_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>';

// Mapbox has no built-in "reset view" control: add a custom mapbox-styled button
// that stacks under NavigationControl (same corner, added after it).
const ResetViewControl = ({ onReset }: { onReset: () => void }) => {
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useControl(
    () => {
      const container = document.createElement("div");
      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      const button = document.createElement("button");
      button.type = "button";
      button.title = "Reimposta vista";
      button.setAttribute("aria-label", "Reimposta vista");
      button.innerHTML = RESET_VIEW_ICON;
      button.addEventListener("click", () => onResetRef.current());
      container.appendChild(button);
      return { onAdd: () => container, onRemove: () => container.remove() };
    },
    { position: "top-right" }
  );

  return null;
};

export const MapView = ({ ref }: MapViewProps) => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const beachStandNeighboors = useAtomValue(selectedBeachStandNeighbors);
  const nextNeighboor = beachStandNeighboors.find(
    bs => bs.direction === "next"
  );
  const previousNeighboor = beachStandNeighboors.find(
    bs => bs.direction === "previous"
  );
  const mapRef = useRef<MapRef | null>(null);
  const [dashedLines, setDashedLines] = useState<
    { line: GeoJSON.Feature<GeoJSON.LineString>; color: string }[]
  >([]);
  const clearDashedLine = useCallback(() => setDashedLines([]), []);

  // Reset the map to its initial view (fit to every beach stand).
  const resetView = useCallback(() => {
    mapRef.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
      padding: MAP_PADDING,
      duration: 600
    });
  }, []);

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
    clearDashedLine();

    if (!beachStand || (!nextNeighboor && !previousNeighboor)) {
      return;
    }
    if (nextNeighboor) {
      drawDashedLine(
        nextNeighboor.coordinates,
        beachStand.coordinates,
        nextNeighboor.direction === "next"
          ? COLORS.nextBeachStandLineColor
          : COLORS.prevBeachStandLineColor
      );
    }
    if (previousNeighboor) {
      drawDashedLine(
        previousNeighboor.coordinates,
        beachStand.coordinates,
        previousNeighboor.direction === "next"
          ? COLORS.nextBeachStandLineColor
          : COLORS.prevBeachStandLineColor
      );
    }
  }, [nextNeighboor, previousNeighboor]);

  // Frame the viewport on the selection + its neighbors (whole set if none selected).
  useEffect(() => {
    if (!beachStand) {
      mapRef?.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
        padding: MAP_PADDING
      });
      return;
    }
    const bounds = getBounds(
      [beachStand, nextNeighboor, previousNeighboor]
        .filter((bs: BeachStand | undefined): bs is BeachStand => !!bs)
        .map(bs => bs.coordinates)
    );

    mapRef?.current?.fitBounds(bounds, {
      // Extra bottom padding keeps the selection clear of the open bottom-sheet.
      padding: { ...MAP_PADDING, bottom: 380 },
      maxZoom: Math.max(13, mapRef.current.getZoom()),
      duration: 600
    });
  }, [beachStand, nextNeighboor, previousNeighboor]);

  if (!MAPBOX_TOKEN) {
    return (
      <Alert color="yellow" title="Mappa non disponibile" m="md">
        Manca <code>VITE_MAPBOX_ACCESS_TOKEN</code>. Copia{" "}
        <code>.env.example</code> in <code>.env</code> e aggiungi un token di
        accesso Mapbox per visualizzare la mappa.
      </Alert>
    );
  }
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
        <ResetViewControl onReset={resetView} />
        {beachStands.map(beachStand => (
          <BeachStandMarker key={beachStand.name} beachStand={beachStand} />
        ))}
        {dashedLines.map(({ line: dashedLine, color }) => {
          // Unique source id per line — mapbox ignores sources sharing an id.
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
