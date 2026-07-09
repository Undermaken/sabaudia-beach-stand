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
  side: "north" | "south";
};

type UnservedStandGap = AdjacentStandGap & {
  unservedSpanMeters: Meters;
};

const MAX_ACCEPTABLE_ROUND_TRIP_MINUTES = 10;
const VEHICLE_PARKED_LENGHT = 5;
const DAYS_OF_FULL_EMPTY_SPANS = 20;
const VEHICLES_DAY_EXCHANGE_PERC = 0.2;
const AVERAGE_PEOPLE_IN_A_VEHICLE = 3;
const AVERAGE_EXPENSE_PER_PERSON = 5;
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

const campingSabaudiaIndex = beachStands.findIndex(
  s => s.name.toLocaleLowerCase() === "camping sabaudia"
);
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
      standB: nextStand,
      side: index < campingSabaudiaIndex ? "north" : "south"
    });
  });

  return gaps;
};

const stats = () => {
  console.log(
    `una persona comune è disposta a camminare per un massimo di ${MAX_ACCEPTABLE_ROUND_TRIP_MINUTES} min (andata + ritorno) per raggiungere un punto di servizio.`
  );
  console.log(
    `\nQuesto corrisponde a ${MAX_ACCEPTABLE_ROUND_TRIP_METERS.toFixed(2)}m percorsi in totale per un adulto medio.`
  );
  console.log(
    `\nQuindi deve trovarsi al massimo a ${MAX_DISTANCE_TO_STAND_METERS.toFixed(2)}m di distanza dal punto di servizio.`
  );

  const adjacentStandGaps = getAdjacentStandGaps(beachStands);
  if (adjacentStandGaps.length === 0) {
    console.log(
      "\nServono almeno due punti di servizio per calcolare le distanze."
    );
    return;
  }

  const totalMeasuredLineMeters = adjacentStandGaps.reduce(
    (total, gap) => total + gap.distanceMeters,
    0
  );

  console.log(
    `\nLinea totale misurata: ${(totalMeasuredLineMeters / 1000).toFixed(2)}km`
  );

  // Uniform spacing uses the number of intervals between stands, not the number
  // of stands.
  const averageAdjacentGapMeters =
    totalMeasuredLineMeters / adjacentStandGaps.length;

  console.log(
    `\nDistanza media tra servizi adiacenti: ${(averageAdjacentGapMeters / 1000).toFixed(2)}km (${formatWalkingMinutes(estimateTimeByDistance(averageAdjacentGapMeters).walking)})`
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
    "\nqueste sono le tratte in cui la distanza tra due servizi supera la copertura massima combinata"
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

  console.log(
    '\nquesti sono gli spazi "vuoti" (non serviti) per ogni segmento (spazio tra due punto di servizi)'
  );
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
    `\nper un totale di spazio "non servito" di ${(totalUnservedSpanMeters / 1000).toFixed(2)}km (${(unservedSpanRatio * 100).toFixed(2)}%)`
  );

  const { northLength, sudLength } = adjacentStandGaps.reduce(
    (acc, curr) => {
      if (curr.side === "south") {
        return { ...acc, sudLength: acc.sudLength + curr.distanceMeters };
      }
      return { ...acc, northLength: acc.northLength + curr.distanceMeters };
    },
    { northLength: 0, sudLength: 0 }
  );

  console.log(`Tratta nord ${(northLength / 1000).toFixed(2)}km`);
  console.log(`Tratta sud ${(sudLength / 1000).toFixed(2)}km`);

  console.log(
    `Nord: un servizio ogni ${(northLength / (campingSabaudiaIndex + 1) / 1000).toFixed(2)}km`
  );
  console.log(
    `Sud: un servizio ogni ${(sudLength / (adjacentStandGaps.length - campingSabaudiaIndex + 1) / 1000).toFixed(2)}km`
  );

  const unservedGapsNorth = unservedStandGaps
    .filter(g => g.side === "north")
    .reduce((total, gap) => total + gap.unservedSpanMeters, 0);

  const unservedGapsSouth = unservedStandGaps
    .filter(g => g.side === "south")
    .reduce((total, gap) => total + gap.unservedSpanMeters, 0);

  console.log(
    `Nord: percentuale di spazi non serviti ${((unservedGapsNorth / northLength) * 100).toFixed(2)}%`
  );
  console.log(
    `Sud: percentuale di spazi non serviti ${((unservedGapsSouth / sudLength) * 100).toFixed(2)}%`
  );

  const totalVehicleInUnservedSpan =
    totalUnservedSpanMeters / VEHICLE_PARKED_LENGHT;
  const totalVehicleInUnservedSpanWithExchange =
    (totalUnservedSpanMeters / VEHICLE_PARKED_LENGHT) *
    (1 + VEHICLES_DAY_EXCHANGE_PERC);

  console.log(
    `\nNello spazio "non servito" ci si possono parcheggiare circa ${totalVehicleInUnservedSpan.toFixed(2)} automobili (considerando un ingrombo medio per auto parcheggiata di ${VEHICLE_PARKED_LENGHT}m)`
  );

  console.log(
    `\nConsiderando che durante il giorno alcune di quelle auto lasciano posto a delle alte. Assumiamo che il ${VEHICLES_DAY_EXCHANGE_PERC * 100}% di queste lascia il posto ad altre`
  );

  console.log(
    `\nAvremmo dunque un totale di ${totalVehicleInUnservedSpanWithExchange.toFixed(2)} auto che al giorno occupano spazi "non serviti"`
  );

  console.log(
    `\nSe assumiamo che un veicolo, mediamente, possa contenere ${AVERAGE_PEOPLE_IN_A_VEHICLE} persone, le persone totali che, al giorno, occupano spazi non serviti sono ${(totalVehicleInUnservedSpanWithExchange * AVERAGE_PEOPLE_IN_A_VEHICLE).toFixed(2)} `
  );

  console.log(
    `\nVeniamo all'opportunità economica. Se assumiamo che, se avessero accesso al servizio, ciasucno di loro spenderebbe, in media ${AVERAGE_EXPENSE_PER_PERSON}€`
  );

  console.log(
    `\nAbbiamo che, se quegli spazi fossero serviti, ci sarebbe una economia di circa ${(totalVehicleInUnservedSpanWithExchange * AVERAGE_PEOPLE_IN_A_VEHICLE * AVERAGE_EXPENSE_PER_PERSON).toFixed(2)}€. Al giorno!`
  );

  console.log(
    `\nProviamo a buttare un altro numero. Diciamo che queste persone riempono questi trattii per ${DAYS_OF_FULL_EMPTY_SPANS} consecutivi in tutta l'estate.`
  );

  console.log(
    `\nAllora l'economia "mancata" ammonterebbe a ${(totalVehicleInUnservedSpanWithExchange * AVERAGE_PEOPLE_IN_A_VEHICLE * AVERAGE_EXPENSE_PER_PERSON * DAYS_OF_FULL_EMPTY_SPANS).toFixed(2)}€. IN totale!`
  );
};

stats();
