import { Box } from "@mantine/core";
import { Marker } from "react-map-gl/mapbox";
import type { BeachStand } from "../data/points.ts";

type WaypointMarkerProps = {
  waypoint: BeachStand;
};

/**
 * A single waypoint rendered as a rounded, colored box.
 * Click handling is intentionally left out for now.
 */
export function WaypointMarker({ waypoint }: WaypointMarkerProps) {
  const { latitude, longitude } = waypoint.coordinates;

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="bottom">
      <Box
        title={waypoint.name}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Box
          px="xs"
          py={4}
          style={{
            backgroundColor: "var(--mantine-color-red-6)",
            color: "var(--mantine-color-white)",
            borderRadius: "var(--mantine-radius-md)",
            border: "2px solid var(--mantine-color-white)",
            boxShadow: "var(--mantine-shadow-sm)",
            fontSize: "var(--mantine-font-size-xs)",
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: "nowrap"
          }}
        >
          {waypoint.name}
        </Box>
        {/* Downward triangle: its tip sits exactly on the coordinate. */}
        <Box
          style={{
            width: 0,
            height: 0,
            marginTop: -1,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid var(--mantine-color-red-6)"
          }}
        />
      </Box>
    </Marker>
  );
}
