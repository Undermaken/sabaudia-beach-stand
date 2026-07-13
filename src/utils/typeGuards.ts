export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return !isNullish(value);
};
