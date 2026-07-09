import {
  serviceCoverageReport,
  type AdjacentStandGap,
  type SegmentSummary,
  type UnservedStandGap
} from "./serviceCoverage.ts";
import { formatDuration } from "./time.ts";

const integerFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0
});
const decimalFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
const euroFormatter = new Intl.NumberFormat("it-IT", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency"
});

const formatMeters = (meters: number) => `${decimalFormatter.format(meters)}m`;
const formatKilometers = (meters: number) =>
  `${decimalFormatter.format(meters / 1000)}km`;
const formatPercent = (ratio: number) =>
  `${decimalFormatter.format(ratio * 100)}%`;
const formatWalkingMinutes = (minutes: number) =>
  `${formatDuration(minutes)} (camminata)`;

const formatStandGap = (gap: AdjacentStandGap) =>
  `${formatKilometers(gap.distanceMeters)} tra ${gap.standA.name} e ${gap.standB.name} (${formatWalkingMinutes(gap.walkingMinutes)})`;

const formatUnservedStandGap = (gap: UnservedStandGap) =>
  `${formatMeters(gap.unservedSpanMeters)} tra ${gap.standA.name} e ${gap.standB.name}`;

const formatSegmentSummary = (segment: SegmentSummary) =>
  `${segment.label} (${segment.fromStandName} -> ${segment.toStandName}): ${formatKilometers(segment.distanceMeters)}, distanza media tra servizi ${formatKilometers(segment.averageGapMeters)}, spazio non servito ${formatPercent(segment.unservedSpanRatio)}`;

const stats = () => {
  const { assumptions, economicImpact, segmentSummaries } =
    serviceCoverageReport;

  console.log(
    `Una persona comune è disposta a camminare per un massimo di ${assumptions.maxAcceptableRoundTripMinutes} min (andata + ritorno) per raggiungere un punto di servizio.`
  );
  console.log(
    `Uso una velocità media stimata di ${assumptions.walkingSpeedKmH} km/h per un adulto su un percorso semplice.`
  );
  console.log(
    `Questo corrisponde a ${formatMeters(assumptions.maxAcceptableRoundTripMeters)} percorsi in totale.`
  );
  console.log(
    `Quindi deve trovarsi al massimo a ${formatMeters(assumptions.maxDistanceToStandMeters)} di distanza dal punto di servizio.`
  );
  console.log(
    `Due servizi adiacenti coprono insieme al massimo ${formatMeters(assumptions.maxCoveredGapBetweenStandsMeters)}.`
  );

  if (serviceCoverageReport.adjacentStandGaps.length === 0) {
    console.log(
      "Servono almeno due punti di servizio per calcolare le distanze."
    );
    return;
  }

  console.log(
    `\nPunti di servizio tracciati: ${serviceCoverageReport.standCount}`
  );
  console.log(
    `Lunghezza lungomare di Sabaudia stimata: ${formatKilometers(serviceCoverageReport.totalMeasuredLineMeters)}`
  );
  console.log(
    `Distanza media tra servizi adiacenti: ${formatKilometers(serviceCoverageReport.averageAdjacentGapMeters)} (${formatWalkingMinutes(serviceCoverageReport.averageAdjacentGapMeters / assumptions.walkingSpeedMetersPerMinute)})`
  );

  console.log("\nDistanze tra servizi, dalla più lunga alla più corta:");
  serviceCoverageReport.gapsByDistanceDescending.forEach(gap => {
    console.log(formatStandGap(gap));
  });

  console.log(
    "\nTratte in cui la distanza tra due servizi supera la copertura massima combinata:"
  );
  serviceCoverageReport.unservedStandGaps.forEach(gap => {
    console.log(formatStandGap(gap));
  });

  console.log('\nSpazi "vuoti" non serviti al centro di ogni tratta critica:');
  serviceCoverageReport.unservedStandGaps.forEach(gap => {
    console.log(formatUnservedStandGap(gap));
  });

  console.log(
    `\nTotale spazio "non servito": ${formatKilometers(serviceCoverageReport.totalUnservedSpanMeters)} (${formatPercent(serviceCoverageReport.totalUnservedSpanRatio)})`
  );

  console.log("\nDistribuzione nord/sud:");
  console.log(formatSegmentSummary(segmentSummaries.north));
  console.log(formatSegmentSummary(segmentSummaries.south));

  console.log(
    `\nNello spazio "non servito" ci si possono parcheggiare circa ${integerFormatter.format(economicImpact.parkedVehiclesInUnservedSpan)} automobili, assumendo ${assumptions.averageParkedVehicleLengthMeters}m di ingombro medio per auto parcheggiata.`
  );
  console.log(
    `Con un ricambio giornaliero del ${formatPercent(assumptions.vehicleDailyTurnoverRatio)}, cioè assumendo che quella quota di posti auto si liberi e venga rioccupata nella stessa giornata, diventano circa ${integerFormatter.format(economicImpact.dailyVehiclesWithTurnover)} auto al giorno.`
  );
  console.log(
    `Assumendo ${assumptions.averagePeoplePerVehicle} persone per veicolo, le persone potenzialmente impattate sono circa ${integerFormatter.format(economicImpact.dailyPeopleImpacted)} al giorno.`
  );
  console.log(
    `Con una spesa media ipotizzata di ${euroFormatter.format(assumptions.averageExpensePerPersonEuros)} a persona, l'opportunità economica vale circa ${euroFormatter.format(economicImpact.dailyEconomicOpportunityEuros)} al giorno.`
  );
  console.log(
    `Su ${assumptions.fullUnservedSpanDays} giorni di pieno utilizzo estivo, cioè giorni in cui considero pieni per tutta la giornata gli spazi non serviti, l'ordine di grandezza diventa ${euroFormatter.format(economicImpact.seasonalEconomicOpportunityEuros)}.`
  );
};

stats();
