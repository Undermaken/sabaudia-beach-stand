import { Alert, Box } from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";
import { Map as MapGL, type MapRef, NavigationControl } from "react-map-gl/mapbox";
import { beachStands, getBounds, type BeachStand } from "../data/points.ts";
import { BeachStandMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors
} from "../atoms/selectedBeackStand.ts";
import { usePrevious } from "../hooks/usePrevious.ts";
import { myPositionAtom } from "../atoms/myPosition.ts";
import { MyPositionMarker } from "./MyPositionMarker.tsx";
import { ResetViewControl } from "./ResetViewControl.tsx";
import { MyPositionControl } from "./MyPositionControl.tsx";
import { NeighborLines } from "./NeighborLines.tsx";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_PADDING = { top: 80, bottom: 40, left: 40, right: 40 };
// All stand coordinates, precomputed once for the default (whole-set) map fit.
const BEACH_STANDS_COORDS = beachStands.map(bs => bs.coordinates);

export const MapView = () => {
  const myPosition = useAtomValue(myPositionAtom);
  const setMyPosition = useSetAtom(myPositionAtom);
  const prevActive = usePrevious(myPosition.active);
  const hasCenteredRef = useRef(false);
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const resetSelectedBeachStand = useResetAtom(selectedBeachStandAtom);
  const beachStandNeighboors = useAtomValue(selectedBeachStandNeighbors);
  const nextNeighboor = beachStandNeighboors.find(
    bs => bs.direction === "next"
  );
  const previousNeighboor = beachStandNeighboors.find(
    bs => bs.direction === "previous"
  );
  const mapRef = useRef<MapRef | null>(null);

  const toggleMyPosition = useCallback(() => {
    setMyPosition(pv => ({ ...pv, active: !pv.active }));
  }, [setMyPosition]);

  const resetView = useCallback(() => {
    mapRef.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
      padding: MAP_PADDING,
      duration: 600
    });
  }, []);

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
      resetSelectedBeachStand();
      const lat = myPosition.position?.latitude;
      const lon = myPosition.position?.longitude;
      if (lat != null && lon != null) {
        mapRef.current?.flyTo({ center: [lon, lat], zoom: 15, duration: 600 });
        hasCenteredRef.current = true;
      }
    }
    if (prevActive && !myPosition.active) {
      hasCenteredRef.current = false;
      setMyPosition(pv => ({ ...pv, drawerOpen: false }));
      resetSelectedBeachStand();
      mapRef.current?.fitBounds(getBounds(BEACH_STANDS_COORDS), {
        padding: MAP_PADDING,
        duration: 600
      });
    }
  }, [
    myPosition.active,
    prevActive,
    myPosition.position?.latitude,
    myPosition.position?.longitude
  ]);

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
  }, [
    myPosition.active,
    myPosition.position?.latitude,
    myPosition.position?.longitude
  ]);

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
        <MyPositionControl
          key={String(myPosition.active)}
          active={myPosition.active}
          onToggle={toggleMyPosition}
        />
        {beachStands.map(beachStand => (
          <BeachStandMarker key={beachStand.name} beachStand={beachStand} />
        ))}
        <NeighborLines />
        {myPosition.active && <MyPositionMarker />}
      </MapGL>
    </Box>
  );
};
