export const MAX_MINUTES = 59;

const parseOrNull = (value: string): number | null => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/** Normalises the hours input; empty or invalid input stays empty. */
export const normalizeHours = (value: string): string => {
  const parsed = parseOrNull(value);
  return parsed === null ? "" : Math.max(parsed, 0).toString();
};

/** Normalises the minutes input to 0-59; empty or invalid input stays empty. */
export const normalizeMinutes = (value: string): string => {
  const parsed = parseOrNull(value);
  return parsed === null
    ? ""
    : Math.min(Math.max(parsed, 0), MAX_MINUTES).toString();
};

export const toTotalMinutes = (hours: string, minutes: string): number =>
  (parseOrNull(hours) ?? 0) * 60 + (parseOrNull(minutes) ?? 0);
