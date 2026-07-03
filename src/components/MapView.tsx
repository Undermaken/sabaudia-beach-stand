import { Alert, Box } from "@mantine/core";
import { Map as MapGL, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Sabaudia, Italy — default map center.
const SABAUDIA = { longitude: 13.0296, latitude: 41.3011, zoom: 12 };

export function MapView() {
  if (!MAPBOX_TOKEN) {
    return (
      <Alert color="yellow" title="Map unavailable" m="md">
        Missing <code>VITE_MAPBOX_ACCESS_TOKEN</code>. Copy{" "}
        <code>.env.example</code> to <code>.env</code> and add a Mapbox access
        token to display the map.
      </Alert>
    );
  }

  return (
    <Box style={{ flex: 1, minHeight: 0 }}>
      <MapGL
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={SABAUDIA}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
      </MapGL>
    </Box>
  );
}
