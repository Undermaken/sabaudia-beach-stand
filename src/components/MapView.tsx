import { Alert, Box } from "@mantine/core";
import { useEffect, useRef, type RefObject } from "react";
import {
  Map as MapGL,
  type MapRef,
  NavigationControl
} from "react-map-gl/mapbox";
import { bounds, gpsBeachStandKml } from "../data/points.ts";
import { WaypointMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import { useAtomValue } from "jotai";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_PADDING = { top: 80, bottom: 40, left: 40, right: 40 };

export const MapView = () => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const mapRef = useRef<MapRef | null>(null);
  useEffect(() => {
    if (!beachStand){
      mapRef?.current?.fitBounds(
      bounds,
      {
        padding: MAP_PADDING
      }
    );
    return;
    } 
    const { longitude, latitude } = beachStand.coordinates;
    mapRef?.current?.fitBounds(
      [
        [longitude, latitude],
        [longitude, latitude]
      ],
      {
        padding: {...MAP_PADDING, bottom: 160},
        maxZoom: 14,
        duration: 600
      }
    );
  }, [beachStand, mapRef]);

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
          bounds,
          fitBoundsOptions: {
            padding: MAP_PADDING
          }
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        {gpsBeachStandKml.beachStands.map(beackStand => (
          <WaypointMarker key={beackStand.name} beackStand={beackStand} />
        ))}
      </MapGL>
    </Box>
  );
};
