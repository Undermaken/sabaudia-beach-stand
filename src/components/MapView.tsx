import { Alert, Box } from "@mantine/core";
import { Map as MapGL, NavigationControl } from "react-map-gl/mapbox";
import { bounds, gpsWaypointsKml } from "../data/points.ts";
import { WaypointMarker } from "./WaypointMarker.tsx";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;


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
        {gpsWaypointsKml.waypoints.map(waypoint => (
          <WaypointMarker key={waypoint.name} waypoint={waypoint} />
        ))}
      </MapGL>
    </Box>
  );
}
