import type { GPSCoordinate } from "../types.ts";

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
    },
    {
      name: "Alma",
      coordinates: {
        latitude: 41.303009628096696,
        longitude: 13.006859982973436,
        altitude: 0
      }
    },
    {
      name: "Oasi di Kufra",
      coordinates: {
        latitude: 41.30035426821182,
        longitude: 13.009588869297106,
        altitude: 0
      }
    },
    {
      name: "Graziella Beach",
      coordinates: {
        latitude: 41.298657608951885,
        longitude: 13.01018287256343,
        altitude: 0
      }
    },
    {
      name: "Lido Azzurro",
      coordinates: {
        latitude: 41.29647044400552,
        longitude: 13.012076625572151,
        altitude: 0
      }
    },
    {
      name: "Le Dune",
      coordinates: {
        latitude: 41.2936742718317,
        longitude: 13.01361787429254,
        altitude: 0
      }
    },
    {
      name: "Duna 31.5",
      coordinates: {
        latitude: 41.286926448022534,
        longitude: 13.017270112216476,
        altitude: 0
      }
    },
    {
      name: "Le Scalette",
      coordinates: {
        latitude: 41.287045767272424,
        longitude: 13.01855809951857,
        altitude: 0
      }
    },
    {
      name: "I gemelli",
      coordinates: {
        latitude: 41.283426666090456,
        longitude: 13.019512917067255,
        altitude: 0
      }
    },
    {
      name: "La Spiaggia",
      coordinates: {
        latitude: 41.2779997267896,
        longitude: 13.023015261970972,
        altitude: 0
      }
    },
    {
      name: "Lilandà",
      coordinates: {
        latitude: 41.269497278245,
        longitude: 13.028168181697112,
        altitude: 0
      }
    },
    {
      name: "Le Streghe",
      coordinates: {
        latitude: 41.262071548936845,
        longitude: 13.030785465923417,
        altitude: 0
      }
    },
    {
      name: "Saporetti",
      coordinates: {
        latitude: 41.24811318892581,
        longitude: 13.036409501150516,
        altitude: 0
      }
    }
  ].map((bs, idx) => ({ ...bs, id: idx + 1 }))
} satisfies GPSWaypointsKml;

export const beachStands = gpsBeachStandKml.beachStands;
// Bounding box [[minLng, minLat], [maxLng, maxLat]] that contains every
// waypoint, so the map can zoom to fit them all on load.
export const getBounds: (
  coords: Omit<GPSCoordinate, "altitude">[]
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
