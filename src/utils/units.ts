export const integerFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0
});
export const decimalFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
export const euroFormatter = new Intl.NumberFormat("it-IT", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency"
});

export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return "<1 min";
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};
export const formatInteger = (value: number) => integerFormatter.format(value);
export const formatKilometers = (meters: number) =>
  `${decimalFormatter.format(meters / 1000)} km`;
export const formatMeters = (meters: number) =>
  `${decimalFormatter.format(meters)} m`;
export const formatPercent = (ratio: number) =>
  `${decimalFormatter.format(ratio * 100)}%`;
export const formatEuro = (value: number) => euroFormatter.format(value);
export const formatWalkingMinutes = (minutes: number) =>
  formatDuration(minutes);
