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
import { BeachStandMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors
} from "../atoms/selectedBeackStand.ts";
import type { GPSCoordinate } from "../types.ts";
import { usePrevious } from "../hooks/usePrevious.ts";
import { COLORS } from "../utils/colors.ts";
import { myPositionAtom } from "../atoms/myPosition.ts";
import { MyPositionMarker } from "./MyPositionMarker.tsx";
import { ResetViewControl } from "./ResetViewControl.tsx";
import { MyPositionControl } from "./MyPositionControl.tsx";

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
  const myPosition = useAtomValue(myPositionAtom);
  const setMyPosition = useSetAtom(myPositionAtom);
  const prevActive = usePrevious(myPosition.active);
  const hasCenteredRef = useRef(false);
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

  const toggleMyPosition = useCallback(() => {
    setMyPosition(pv => ({ ...pv, active: !pv.active }));
  }, [setMyPosition]);

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
  }, [
    beachStand,
    nextNeighboor,
    previousNeighboor,
    clearDashedLine,
    drawDashedLine
  ]);

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

  // React to position tracking toggle:
  // - activated → fly to the user's position (if already available)
  // - deactivated → reset the centered flag and fit back to all beach stands
  useEffect(() => {
    if (!prevActive && myPosition.active) {
      const lat = myPosition.position?.latitude;
      const lon = myPosition.position?.longitude;
      if (lat != null && lon != null) {
        mapRef.current?.flyTo({ center: [lon, lat], zoom: 15, duration: 600 });
        hasCenteredRef.current = true;
      }
    }
    if (prevActive && !myPosition.active) {
      hasCenteredRef.current = false;
      mapRef.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
        padding: MAP_PADDING,
        duration: 600
      });
    }
  }, [myPosition.active, prevActive, myPosition.position?.latitude, myPosition.position?.longitude]);

  // GPS coordinates may arrive after the tracking was activated (async geolocation);
  // center the map once the first valid position comes in.
  useEffect(() => {
    if (!myPosition.active || hasCenteredRef.current) return;
    const lat = myPosition.position?.latitude;
    const lon = myPosition.position?.longitude;
    if (lat != null && lon != null) {
      mapRef.current?.flyTo({ center: [lon, lat], zoom: 15, duration: 600 });
      hasCenteredRef.current = true;
    }
  }, [myPosition.active, myPosition.position?.latitude, myPosition.position?.longitude]);

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
        <MyPositionControl key={String(myPosition.active)} active={myPosition.active} onToggle={toggleMyPosition} />
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
        {myPosition.active && <MyPositionMarker/>}
      </MapGL>
    </Box>
  );
};
