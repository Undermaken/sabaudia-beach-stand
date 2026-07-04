import { Alert, Box } from "@mantine/core";
import { Map as MapGL, NavigationControl } from "react-map-gl/mapbox";
import { bounds, gpsBeachStandKml } from "../data/points.ts";
import { WaypointMarker } from "./BeachStandMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export function MapView() {
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
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          bounds,
          fitBoundsOptions: {
            padding: { top: 80, bottom: 40, left: 40, right: 40 }
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
}
