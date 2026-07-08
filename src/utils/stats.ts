import { beachStands, type BeachStand } from "../data/points.ts";
import {
  estimatedSpeedsKmH,
  estimateTimeByDistance,
  haversineDistance
} from "./map.ts";
import { formatDuration } from "./time.ts";

type Meters = number;
type Minutes = number;

type AdjacentStandGap = {
  distanceMeters: Meters;
  walkingMinutes: Minutes;
  standA: BeachStand;
  standB: BeachStand;
};

type UnservedStandGap = AdjacentStandGap & {
  unservedSpanMeters: Meters;
};

const MAX_ACCEPTABLE_ROUND_TRIP_MINUTES = 15;
const WALKING_SPEED_METERS_PER_MINUTE =
  (estimatedSpeedsKmH.walking * 1000) / 60;
const MAX_ACCEPTABLE_ROUND_TRIP_METERS =
  WALKING_SPEED_METERS_PER_MINUTE * MAX_ACCEPTABLE_ROUND_TRIP_MINUTES;
const MAX_DISTANCE_TO_STAND_METERS = MAX_ACCEPTABLE_ROUND_TRIP_METERS / 2;
const MAX_COVERED_GAP_BETWEEN_STANDS_METERS = MAX_DISTANCE_TO_STAND_METERS * 2;

const formatWalkingMinutes = (minutes: Minutes) =>
  `${formatDuration(minutes)} (camminata)`;

const formatStandGap = (gap: AdjacentStandGap) =>
  `${(gap.distanceMeters / 1000).toFixed(2)}km tra ${gap.standA.name} e ${gap.standB.name} (${formatWalkingMinutes(gap.walkingMinutes)})`;

const getAdjacentStandGaps = (stands: BeachStand[]): AdjacentStandGap[] => {
  const gaps: AdjacentStandGap[] = [];

  stands.forEach((stand, index) => {
    const nextStand = stands[index + 1];
    if (!nextStand) {
      return;
    }

    const distanceMeters = haversineDistance(
      stand.coordinates,
      nextStand.coordinates
    );

    gaps.push({
      distanceMeters,
      walkingMinutes: estimateTimeByDistance(distanceMeters).walking,
      standA: stand,
      standB: nextStand
    });
  });

  return gaps;
};

const stats = () => {
  console.log(
    `una persona comune è disposta a camminare per un massimo di ${MAX_ACCEPTABLE_ROUND_TRIP_MINUTES} min (andata + ritorno) per raggiungere un punto di servizio.`
  );
  console.log(
    `Questo corrisponde a ${MAX_ACCEPTABLE_ROUND_TRIP_METERS.toFixed(2)}m percorsi in totale per un adulto medio.`
  );
  console.log(
    `Quindi deve trovarsi al massimo a ${MAX_DISTANCE_TO_STAND_METERS.toFixed(2)}m di distanza dal punto di servizio.`
  );

  const adjacentStandGaps = getAdjacentStandGaps(beachStands);
  if (adjacentStandGaps.length === 0) {
    console.log(
      "Servono almeno due punti di servizio per calcolare le distanze."
    );
    return;
  }

  const totalMeasuredLineMeters = adjacentStandGaps.reduce(
    (total, gap) => total + gap.distanceMeters,
    0
  );

  console.log(
    `Linea totale misurata: ${(totalMeasuredLineMeters / 1000).toFixed(2)}km`
  );

  // Uniform spacing uses the number of intervals between stands, not the number
  // of stands.
  const averageAdjacentGapMeters =
    totalMeasuredLineMeters / adjacentStandGaps.length;

  console.log(
    `Distanza media tra servizi adiacenti: ${(averageAdjacentGapMeters / 1000).toFixed(2)}km (${formatWalkingMinutes(estimateTimeByDistance(averageAdjacentGapMeters).walking)})`
  );

  const gapsByDistanceDescending = [...adjacentStandGaps].sort(
    (gapA, gapB) => gapB.distanceMeters - gapA.distanceMeters
  );
  gapsByDistanceDescending.forEach(gap => {
    console.log(formatStandGap(gap));
  });

  const gapsBeyondServiceCoverage = gapsByDistanceDescending.filter(
    gap => gap.distanceMeters > MAX_COVERED_GAP_BETWEEN_STANDS_METERS
  );
  console.log(
    "queste sono le tratte in cui la distanza tra due servizi supera la copertura massima combinata"
  );
  gapsBeyondServiceCoverage.forEach(gap => {
    console.log(formatStandGap(gap));
  });

  // The unserved segment is the part left after subtracting both stands'
  // one-way service ranges from the gap.
  const unservedStandGaps: UnservedStandGap[] = gapsBeyondServiceCoverage.map(
    gap => ({
      ...gap,
      unservedSpanMeters:
        gap.distanceMeters - MAX_COVERED_GAP_BETWEEN_STANDS_METERS
    })
  );

  console.log("questi sono gli spazi non serviti al centro di ogni tratta");
  unservedStandGaps.forEach(gap => {
    console.log(
      `${gap.unservedSpanMeters.toFixed(2)}m tra ${gap.standA.name} e ${gap.standB.name}`
    );
  });

  const totalUnservedSpanMeters = unservedStandGaps.reduce(
    (total, gap) => total + gap.unservedSpanMeters,
    0
  );
  const unservedSpanRatio = totalUnservedSpanMeters / totalMeasuredLineMeters;

  console.log(
    `per un totale di spazio "non servito" di ${(totalUnservedSpanMeters / 1000).toFixed(2)}km (${(unservedSpanRatio * 100).toFixed(2)}%)`
  );
};

stats();
