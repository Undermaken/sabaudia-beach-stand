import type { GPSCoordinate } from "../types";

export type BeachStand = {
  id: number;
  name: string;
  coordinates: GPSCoordinate;
};

export type GPSWaypointsKml = {
  name: string;
  beachStands: BeachStand[];
};

const gpsBeachStandKml = {
  name: "GPSWpts-2026-07-03",
  beachStands: [
    {
      name: "Pierino alla bufalara",
      coordinates: {
        latitude: 41.36443954,
        longitude: 12.94786123,
        altitude: 6.823041138313144
      }
    },
    {
      name: "Da Bruno",
      coordinates: {
        latitude: 41.36127593,
        longitude: 12.95213385,
        altitude: 0
      }
    },
    {
      name: "Paradise Beach",
      coordinates: {
        latitude: 41.35014571,
        longitude: 12.96630036,
        altitude: 0
      }
    },
    {
      name: "La perla",
      coordinates: {
        latitude: 41.32661672,
        longitude: 12.98990109,
        altitude: 0
      }
    },
    {
      name: "Camping Sabaudia",
      coordinates: {
        latitude: 41.31582667232958,
        longitude: 13.00007545079569,
        altitude: 0
      }
    },
    {
      name: "Rizzi Beach",
      coordinates: {
        latitude: 41.30853378,
        longitude: 13.00429771,
        altitude: 14.080337604526925
      }
    },
    {
      name: "Cala Eremita",
      coordinates: {
        latitude: 41.30770292,
        longitude: 13.0044203,
        altitude: 0
      }
    },
    {
      name: "La Giunca",
      coordinates: {
        latitude: 41.30566487983613,
        longitude: 13.00488977410809,
        altitude: 0
      }
    },
    {
      name: "Lo Scoglio",
      coordinates: {
        latitude: 41.30529376962435,
        longitude: 13.005219122459309,
        altitude: 0
      }
    },
    {
      name: "Dove Inizia il Mare",
      coordinates: {
        latitude: 41.30452503460958,
        longitude: 13.006042493337361,
        altitude: 0
      }
    },
    {
      name: "Bar Carinci",
      coordinates: {
        latitude: 41.30500218154897,
        longitude: 13.008365575442202,
        altitude: 0
      }
    }
  ].map((bs, idx) => ({ ...bs, id: idx + 1 }))
} satisfies GPSWaypointsKml;

export const beachStands = gpsBeachStandKml.beachStands;
// Bounding box [[minLng, minLat], [maxLng, maxLat]] that contains every
// waypoint, so the map can zoom to fit them all on load.
export const getBounds: (
  coords: GPSCoordinate[]
) => [[number, number], [number, number]] = coords => [
  [
    Math.min(...coords.map(w => w.longitude)),
    Math.min(...coords.map(w => w.latitude))
  ],
  [
    Math.max(...coords.map(w => w.longitude)),
    Math.max(...coords.map(w => w.latitude))
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
    return undefined;
  }
  if (index === 0 && !next) {
    return undefined;
  }
  return beachStands[index + (next ? 1 : -1)];
};
