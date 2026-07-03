import type { GPSCoordinate } from "../types";


export type BeachStand = {
  name: string;
  timestamp: string;
  coordinates: GPSCoordinate;
  accuracy: number;
  provider: string;
  address?: string;
};

export type GPSWaypointsKml = {
  name: string;
  waypoints: BeachStand[];
};

export const gpsWaypointsKml = {
  name: "GPSWpts-2026-07-03",
  waypoints: [
    {
      name: "Pierino alla bufalara",
      timestamp: "2026-07-03T09:13:17Z",
      coordinates: {
        latitude: 41.36443954,
        longitude: 12.94786123,
        altitude: 6.823041138313144,
      },
      accuracy: 3.7900925,
      provider: "gps",
      address: "N/A",
    },
    {
      name: "Da Bruno",
      timestamp: "2026-07-03T09:14:20Z",
      coordinates: {
        latitude: 41.36127593,
        longitude: 12.95213385,
        altitude: 0,
      },
      accuracy: 0,
      provider: "Manual",
    },
    {
      name: "Paradise Beach",
      timestamp: "2026-07-03T09:16:39Z",
      coordinates: {
        latitude: 41.35014571,
        longitude: 12.96630036,
        altitude: 0,
      },
      accuracy: 0,
      provider: "Manual",
    },
    {
      name: "La perla",
      timestamp: "2026-07-03T09:20:20Z",
      coordinates: {
        latitude: 41.32661672,
        longitude: 12.98990109,
        altitude: 0,
      },
      accuracy: 0,
      provider: "Manual",
    },
  ],
} satisfies GPSWaypointsKml;


const waypoints = gpsWaypointsKml.waypoints;
// Bounding box [[minLng, minLat], [maxLng, maxLat]] that contains every
// waypoint, so the map can zoom to fit them all on load.
export const bounds: [[number, number], [number, number]] = [
  [
    Math.min(...waypoints.map(w => w.coordinates.longitude)),
    Math.min(...waypoints.map(w => w.coordinates.latitude))
  ],
  [
    Math.max(...waypoints.map(w => w.coordinates.longitude)),
    Math.max(...waypoints.map(w => w.coordinates.latitude))
  ]
];