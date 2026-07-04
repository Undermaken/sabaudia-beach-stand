import type { GPSCoordinate } from "../types";
export const MOVING_MODES = [
  "walking",
  "fastWalking",
  "lightRunning",
  "moderateRunning",
  "sustainedRunning"
] as const;
export type MovingMode = (typeof MOVING_MODES)[number];
const estimatedSpeedsKmH: Record<MovingMode, number> = {
  walking: 5,
  fastWalking: 6.5,
  lightRunning: 8,
  moderateRunning: 10,
  sustainedRunning: 12
};

export const estimateTimeByDistance = (
  pointA: GPSCoordinate,
  pointB: GPSCoordinate
): Record<MovingMode, number> => {
  const distanceInMeters = haversineDistance(pointA, pointB);
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
  const R = 6371000; // Earth radius in meters
  const latRad2 = toRadians(lat2);
  const delta1 = toRadians(lat2 - lat1);
  const delta2 = toRadians(lon2 - lon1);

  const a =
    Math.sin(delta1 / 2) * Math.sin(delta1 / 2) +
    Math.cos(latRad2) *
      Math.cos(latRad2) *
      Math.sin(delta2 / 2) *
      Math.sin(delta2 / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
