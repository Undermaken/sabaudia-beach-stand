import type { GPSCoordinate } from "../types.ts";
export const MOVING_MODES = [
  "walking",
  "fastWalking",
  "lightRunning",
  "moderateRunning",
  "sustainedRunning"
] as const;
export type MovingMode = (typeof MOVING_MODES)[number];
export const estimatedSpeedsKmH: Record<MovingMode, number> = {
  walking: 5,
  fastWalking: 6.5,
  lightRunning: 8,
  moderateRunning: 10,
  sustainedRunning: 12
};

export const estimateTimeByCoordsDistance = (
  pointA: GPSCoordinate,
  pointB: GPSCoordinate
): Record<MovingMode, number> => {
  const distanceInMeters = haversineDistance(pointA, pointB);
  return estimateTimeByDistance(distanceInMeters);
};

export const estimateTimeByDistance = (
  distanceInMeters: number
): Record<MovingMode, number> => {
  return Object.fromEntries(
    MOVING_MODES.map(mode => {
      const timeInMinutes =
        60 * (distanceInMeters / 1000 / estimatedSpeedsKmH[mode]);
      return [mode, timeInMinutes];
    })
  ) as Record<MovingMode, number>;
};

export const haversineDistance = (
  start: GPSCoordinate,
  end: GPSCoordinate
): number => {
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const { latitude: lat1, longitude: lon1 } = start;
  const { latitude: lat2, longitude: lon2 } = end;
  const earthRadiusMeters = 6371000;
  const latRad1 = toRadians(lat1);
  const latRad2 = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLonRad = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(latRad1) *
      Math.cos(latRad2) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};
