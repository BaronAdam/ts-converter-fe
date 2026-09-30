export const MAX_HOURS = 999;
export const MAX_MINUTES = 59;

const parseOrNull = (value: string): number | null => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const clamp = (value: number, max: number): number =>
  Math.min(Math.max(value, 0), max);

/** Normalises the hours input; empty or invalid input stays empty. */
export const normalizeHours = (value: string): string => {
  const parsed = parseOrNull(value);
  return parsed === null ? "" : clamp(parsed, MAX_HOURS).toString();
};

/** Normalises the minutes input to 0-59; empty or invalid input stays empty. */
export const normalizeMinutes = (value: string): string => {
  const parsed = parseOrNull(value);
  return parsed === null ? "" : clamp(parsed, MAX_MINUTES).toString();
};

export const stepHours = (value: string, delta: number): string =>
  clamp((parseOrNull(value) ?? 0) + delta, MAX_HOURS).toString();

export const stepMinutes = (value: string, delta: number): string =>
  clamp((parseOrNull(value) ?? 0) + delta, MAX_MINUTES).toString();

export const toTotalMinutes = (hours: string, minutes: string): number =>
  (parseOrNull(hours) ?? 0) * 60 + (parseOrNull(minutes) ?? 0);
