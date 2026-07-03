import type { GPSCoordinate } from "../types";

export const haversineDistance = (start: GPSCoordinate, end: GPSCoordinate): number => {
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const { latitude: lat1, longitude: lon1 } = start;
  const { latitude: lat2, longitude: lon2 } = end;
  const R = 6371000; // Raggio della Terra in metri
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

  return R * c; // Distanza in metri
};