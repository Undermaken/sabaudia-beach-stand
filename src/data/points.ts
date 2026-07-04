import type { GPSCoordinate } from "../types";

export type BeachStand = {
  id: number;
  name: string;
  timestamp: string;
  coordinates: GPSCoordinate;
  accuracy: number;
  provider: string;
  address?: string;
};

export type GPSWaypointsKml = {
  name: string;
  beachStands: BeachStand[];
};

export const gpsBeachStandKml = {
  name: "GPSWpts-2026-07-03",
  beachStands: [
    {
      name: "Pierino alla bufalara",
      timestamp: "2026-07-03T09:13:17Z",
      coordinates: {
        latitude: 41.36443954,
        longitude: 12.94786123,
        altitude: 6.823041138313144
      },
      accuracy: 3.7900925,
      provider: "gps",
      address: "N/A"
    },
    {
      name: "Da Bruno",
      timestamp: "2026-07-03T09:14:20Z",
      coordinates: {
        latitude: 41.36127593,
        longitude: 12.95213385,
        altitude: 0
      },
      accuracy: 0,
      provider: "Manual"
    },
    {
      name: "Paradise Beach",
      timestamp: "2026-07-03T09:16:39Z",
      coordinates: {
        latitude: 41.35014571,
        longitude: 12.96630036,
        altitude: 0
      },
      accuracy: 0,
      provider: "Manual"
    },
    {
      name: "La perla",
      timestamp: "2026-07-03T09:20:20Z",
      coordinates: {
        latitude: 41.32661672,
        longitude: 12.98990109,
        altitude: 0
      },
      accuracy: 0,
      provider: "Manual"
    }
  ].map((bs, idx) => ({ ...bs, id: idx + 1 }))
} satisfies GPSWaypointsKml;

const beachStands = gpsBeachStandKml.beachStands;
// Bounding box [[minLng, minLat], [maxLng, maxLat]] that contains every
// waypoint, so the map can zoom to fit them all on load.
export const bounds: [[number, number], [number, number]] = [
  [
    Math.min(...beachStands.map(w => w.coordinates.longitude)),
    Math.min(...beachStands.map(w => w.coordinates.latitude))
  ],
  [
    Math.max(...beachStands.map(w => w.coordinates.longitude)),
    Math.max(...beachStands.map(w => w.coordinates.latitude))
  ]
];

export const getBesideBeachStand = (
  backstand: BeachStand,
  beside: "next" | "previous"
): BeachStand | undefined => {
  if (beachStands.length < 2) {
    return undefined;
  }
  const next = beside === "next";
  const index = beachStands.findIndex(bs => bs.id === backstand.id);
  if (index === -1) {
    return undefined;
  }
  if (index === beachStands.length - 1 && next) {
    return beachStands[0];
  }
  if (index === 0 && !next) {
    return beachStands[beachStands.length - 1];
  }
  return beachStands[index + (next ? 1 : -1)];
};
