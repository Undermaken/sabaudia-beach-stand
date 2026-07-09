import { beachStands, type BeachStand } from "../data/points.ts";
import {
  estimatedSpeedsKmH,
  estimateTimeByDistance,
  haversineDistance
} from "./map.ts";

export type Meters = number;
export type Minutes = number;

export type RouteSegment = "north" | "south" | "outsideComparison";

export type AdjacentStandGap = {
  distanceMeters: Meters;
  walkingMinutes: Minutes;
  standA: BeachStand;
  standB: BeachStand;
  routeSegment: RouteSegment;
  startOffsetMeters: Meters;
  endOffsetMeters: Meters;
};

export type UnservedStandGap = AdjacentStandGap & {
  unservedSpanMeters: Meters;
  unservedRatioOfGap: number;
};

export type StandRoutePosition = {
  stand: BeachStand;
  distanceFromStartMeters: Meters;
  positionRatio: number;
  routeSegment: RouteSegment;
};

export type SegmentSummary = {
  key: Extract<RouteSegment, "north" | "south">;
  label: string;
  fromStandName: string;
  toStandName: string;
  distanceMeters: Meters;
  gapCount: number;
  standCount: number;
  averageGapMeters: Meters;
  unservedSpanMeters: Meters;
  unservedSpanRatio: number;
};

export type ServiceCoverageAssumptions = {
  northSegmentStartStandName: string;
  southSegmentStartStandName: string;
  maxAcceptableRoundTripMinutes: Minutes;
  walkingSpeedKmH: number;
  walkingSpeedMetersPerMinute: Meters;
  maxAcceptableRoundTripMeters: Meters;
  maxDistanceToStandMeters: Meters;
  maxCoveredGapBetweenStandsMeters: Meters;
  averageParkedVehicleLengthMeters: Meters;
  vehicleDailyTurnoverRatio: number;
  averagePeoplePerVehicle: number;
  averageExpensePerPersonEuros: number;
  fullUnservedSpanDays: number;
};

export type EconomicImpact = {
  parkedVehiclesInUnservedSpan: number;
  dailyVehiclesWithTurnover: number;
  dailyPeopleImpacted: number;
  dailyEconomicOpportunityEuros: number;
  seasonalEconomicOpportunityEuros: number;
};

export type ServiceCoverageReport = {
  standCount: number;
  assumptions: ServiceCoverageAssumptions;
  adjacentStandGaps: AdjacentStandGap[];
  gapsByDistanceDescending: AdjacentStandGap[];
  unservedStandGaps: UnservedStandGap[];
  standRoutePositions: StandRoutePosition[];
  totalMeasuredLineMeters: Meters;
  averageAdjacentGapMeters: Meters;
  totalServedSpanMeters: Meters;
  totalUnservedSpanMeters: Meters;
  totalUnservedSpanRatio: number;
  segmentSummaries: Record<"north" | "south", SegmentSummary>;
  economicImpact: EconomicImpact;
};

export type CreateServiceCoverageReportOptions = {
  maxAcceptableRoundTripMinutes?: Minutes;
  stands?: BeachStand[];
};

const NORTH_SEGMENT_START_STAND_NAME = "Da Bruno";
const SOUTH_SEGMENT_START_STAND_NAME = "Camping Sabaudia";
const MAX_ACCEPTABLE_ROUND_TRIP_MINUTES = 10;
const AVERAGE_PARKED_VEHICLE_LENGTH_METERS = 5;
const FULL_UNSERVED_SPAN_DAYS = 20;
const VEHICLE_DAILY_TURNOVER_RATIO = 0.2;
const AVERAGE_PEOPLE_PER_VEHICLE = 3;
const AVERAGE_EXPENSE_PER_PERSON_EUROS = 5;
const DEFAULT_WALKING_SPEED_METERS_PER_MINUTE =
  (estimatedSpeedsKmH.walking * 1000) / 60;

export const createServiceCoverageAssumptions = (
  maxAcceptableRoundTripMinutes: Minutes = MAX_ACCEPTABLE_ROUND_TRIP_MINUTES
): ServiceCoverageAssumptions => {
  const maxAcceptableRoundTripMeters =
    DEFAULT_WALKING_SPEED_METERS_PER_MINUTE * maxAcceptableRoundTripMinutes;
  const maxDistanceToStandMeters = maxAcceptableRoundTripMeters / 2;

  return {
    northSegmentStartStandName: NORTH_SEGMENT_START_STAND_NAME,
    southSegmentStartStandName: SOUTH_SEGMENT_START_STAND_NAME,
    maxAcceptableRoundTripMinutes,
    walkingSpeedKmH: estimatedSpeedsKmH.walking,
    walkingSpeedMetersPerMinute: DEFAULT_WALKING_SPEED_METERS_PER_MINUTE,
    maxAcceptableRoundTripMeters,
    maxDistanceToStandMeters,
    maxCoveredGapBetweenStandsMeters: maxDistanceToStandMeters * 2,
    averageParkedVehicleLengthMeters: AVERAGE_PARKED_VEHICLE_LENGTH_METERS,
    vehicleDailyTurnoverRatio: VEHICLE_DAILY_TURNOVER_RATIO,
    averagePeoplePerVehicle: AVERAGE_PEOPLE_PER_VEHICLE,
    averageExpensePerPersonEuros: AVERAGE_EXPENSE_PER_PERSON_EUROS,
    fullUnservedSpanDays: FULL_UNSERVED_SPAN_DAYS
  };
};

export const SERVICE_COVERAGE_ASSUMPTIONS = createServiceCoverageAssumptions();

const normalizeStandName = (name: string) => name.toLocaleLowerCase("it-IT");

const findStandIndexByName = (stands: BeachStand[], name: string) =>
  stands.findIndex(
    stand => normalizeStandName(stand.name) === normalizeStandName(name)
  );

const getGapRouteSegment = (
  gapStartIndex: number,
  northStartIndex: number,
  southStartIndex: number
): RouteSegment => {
  if (northStartIndex < 0 || southStartIndex < 0) {
    return "outsideComparison";
  }

  if (gapStartIndex >= northStartIndex && gapStartIndex < southStartIndex) {
    return "north";
  }

  if (gapStartIndex >= southStartIndex) {
    return "south";
  }

  return "outsideComparison";
};

const getStandRouteSegment = (
  standIndex: number,
  northStartIndex: number,
  southStartIndex: number
): RouteSegment => {
  if (northStartIndex < 0 || southStartIndex < 0) {
    return "outsideComparison";
  }

  if (standIndex >= northStartIndex && standIndex <= southStartIndex) {
    return "north";
  }

  if (standIndex >= southStartIndex) {
    return "south";
  }

  return "outsideComparison";
};

const sumMeters = <T>(items: T[], getMeters: (item: T) => Meters): Meters =>
  items.reduce((total, item) => total + getMeters(item), 0);

const getAdjacentStandGaps = (
  stands: BeachStand[],
  northStartIndex: number,
  southStartIndex: number
): AdjacentStandGap[] => {
  const gaps: AdjacentStandGap[] = [];
  let startOffsetMeters = 0;

  stands.forEach((stand, index) => {
    const nextStand = stands[index + 1];
    if (!nextStand) {
      return;
    }

    const distanceMeters = haversineDistance(
      stand.coordinates,
      nextStand.coordinates
    );
    const endOffsetMeters = startOffsetMeters + distanceMeters;

    gaps.push({
      distanceMeters,
      walkingMinutes: estimateTimeByDistance(distanceMeters).walking,
      standA: stand,
      standB: nextStand,
      routeSegment: getGapRouteSegment(index, northStartIndex, southStartIndex),
      startOffsetMeters,
      endOffsetMeters
    });

    startOffsetMeters = endOffsetMeters;
  });

  return gaps;
};

const getStandRoutePositions = (
  stands: BeachStand[],
  adjacentStandGaps: AdjacentStandGap[],
  totalMeasuredLineMeters: Meters,
  northStartIndex: number,
  southStartIndex: number
): StandRoutePosition[] =>
  stands.map((stand, index) => {
    const previousGap = adjacentStandGaps[index - 1];
    const distanceFromStartMeters = previousGap?.endOffsetMeters ?? 0;

    return {
      stand,
      distanceFromStartMeters,
      positionRatio:
        totalMeasuredLineMeters > 0
          ? distanceFromStartMeters / totalMeasuredLineMeters
          : 0,
      routeSegment: getStandRouteSegment(
        index,
        northStartIndex,
        southStartIndex
      )
    };
  });

const getSegmentSummary = ({
  key,
  label,
  fromStandName,
  toStandName,
  gaps,
  unservedGaps
}: {
  key: Extract<RouteSegment, "north" | "south">;
  label: string;
  fromStandName: string;
  toStandName: string;
  gaps: AdjacentStandGap[];
  unservedGaps: UnservedStandGap[];
}): SegmentSummary => {
  const distanceMeters = sumMeters(gaps, gap => gap.distanceMeters);
  const unservedSpanMeters = sumMeters(
    unservedGaps,
    gap => gap.unservedSpanMeters
  );

  return {
    key,
    label,
    fromStandName,
    toStandName,
    distanceMeters,
    gapCount: gaps.length,
    standCount: gaps.length + 1,
    averageGapMeters: gaps.length > 0 ? distanceMeters / gaps.length : 0,
    unservedSpanMeters,
    unservedSpanRatio:
      distanceMeters > 0 ? unservedSpanMeters / distanceMeters : 0
  };
};

export const createServiceCoverageReport = ({
  maxAcceptableRoundTripMinutes,
  stands = beachStands
}: CreateServiceCoverageReportOptions = {}): ServiceCoverageReport => {
  const assumptions = createServiceCoverageAssumptions(
    maxAcceptableRoundTripMinutes
  );
  const northStartIndex = findStandIndexByName(
    stands,
    assumptions.northSegmentStartStandName
  );
  const southStartIndex = findStandIndexByName(
    stands,
    assumptions.southSegmentStartStandName
  );
  const adjacentStandGaps = getAdjacentStandGaps(
    stands,
    northStartIndex,
    southStartIndex
  );
  const totalMeasuredLineMeters = sumMeters(
    adjacentStandGaps,
    gap => gap.distanceMeters
  );
  const averageAdjacentGapMeters =
    adjacentStandGaps.length > 0
      ? totalMeasuredLineMeters / adjacentStandGaps.length
      : 0;
  const gapsByDistanceDescending = [...adjacentStandGaps].sort(
    (gapA, gapB) => gapB.distanceMeters - gapA.distanceMeters
  );
  const unservedStandGaps: UnservedStandGap[] = gapsByDistanceDescending
    .filter(
      gap => gap.distanceMeters > assumptions.maxCoveredGapBetweenStandsMeters
    )
    .map(gap => ({
      ...gap,
      unservedSpanMeters:
        gap.distanceMeters - assumptions.maxCoveredGapBetweenStandsMeters,
      unservedRatioOfGap:
        (gap.distanceMeters - assumptions.maxCoveredGapBetweenStandsMeters) /
        gap.distanceMeters
    }));
  const totalUnservedSpanMeters = sumMeters(
    unservedStandGaps,
    gap => gap.unservedSpanMeters
  );
  const parkedVehiclesInUnservedSpan =
    totalUnservedSpanMeters / assumptions.averageParkedVehicleLengthMeters;
  const dailyVehiclesWithTurnover =
    parkedVehiclesInUnservedSpan * (1 + assumptions.vehicleDailyTurnoverRatio);
  const dailyPeopleImpacted =
    dailyVehiclesWithTurnover * assumptions.averagePeoplePerVehicle;
  const dailyEconomicOpportunityEuros =
    dailyPeopleImpacted * assumptions.averageExpensePerPersonEuros;

  const northGaps = adjacentStandGaps.filter(
    gap => gap.routeSegment === "north"
  );
  const southGaps = adjacentStandGaps.filter(
    gap => gap.routeSegment === "south"
  );
  const northUnservedGaps = unservedStandGaps.filter(
    gap => gap.routeSegment === "north"
  );
  const southUnservedGaps = unservedStandGaps.filter(
    gap => gap.routeSegment === "south"
  );

  return {
    standCount: stands.length,
    assumptions,
    adjacentStandGaps,
    gapsByDistanceDescending,
    unservedStandGaps,
    standRoutePositions: getStandRoutePositions(
      stands,
      adjacentStandGaps,
      totalMeasuredLineMeters,
      northStartIndex,
      southStartIndex
    ),
    totalMeasuredLineMeters,
    averageAdjacentGapMeters,
    totalServedSpanMeters: totalMeasuredLineMeters - totalUnservedSpanMeters,
    totalUnservedSpanMeters,
    totalUnservedSpanRatio:
      totalMeasuredLineMeters > 0
        ? totalUnservedSpanMeters / totalMeasuredLineMeters
        : 0,
    segmentSummaries: {
      north: getSegmentSummary({
        key: "north",
        label: "Tratta nord",
        fromStandName:
          stands[northStartIndex]?.name ??
          assumptions.northSegmentStartStandName,
        toStandName:
          stands[southStartIndex]?.name ??
          assumptions.southSegmentStartStandName,
        gaps: northGaps,
        unservedGaps: northUnservedGaps
      }),
      south: getSegmentSummary({
        key: "south",
        label: "Tratta sud",
        fromStandName:
          stands[southStartIndex]?.name ??
          assumptions.southSegmentStartStandName,
        toStandName: stands.at(-1)?.name ?? "",
        gaps: southGaps,
        unservedGaps: southUnservedGaps
      })
    },
    economicImpact: {
      parkedVehiclesInUnservedSpan,
      dailyVehiclesWithTurnover,
      dailyPeopleImpacted,
      dailyEconomicOpportunityEuros,
      seasonalEconomicOpportunityEuros:
        dailyEconomicOpportunityEuros * assumptions.fullUnservedSpanDays
    }
  };
};

export const serviceCoverageReport = createServiceCoverageReport();
