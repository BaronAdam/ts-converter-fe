import { Area, Game, getRate, Region } from "./rates";

export type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** Splits a number of seconds into hours, minutes and seconds. */
export const toDuration = (totalSeconds: number): Duration => ({
  hours: Math.floor(totalSeconds / SECONDS_PER_HOUR),
  minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
  seconds: totalSeconds % SECONDS_PER_MINUTE,
});

/**
 * Converts in-game minutes into real time. In-game time runs `rate` times
 * faster than real time; the result is truncated to whole seconds.
 */
export const convertToRealTime = (
  game: Game,
  area: Area,
  region: Region,
  gameMinutes: number,
): Duration => {
  const rate = getRate(game, area, region);
  return toDuration(Math.floor((gameMinutes * SECONDS_PER_MINUTE) / rate));
};

const pad = (value: number): string => String(value).padStart(2, "0");

/** H:MM:SS */
export const formatDuration = ({ hours, minutes, seconds }: Duration): string =>
  `${hours}:${pad(minutes)}:${pad(seconds)}`;

export const toSeconds = ({ hours, minutes, seconds }: Duration): number =>
  hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;

export type Arrival = {
  /** Local wall-clock time, HH:MM:SS. */
  time: string;
  /** Calendar days after the start day (0 = same day). */
  days: number;
};

const MS_PER_DAY = 86_400_000;

/** When you will arrive in real life if you set off at `startMs` (local time). */
export const getArrival = (startMs: number, duration: Duration): Arrival => {
  const start = new Date(startMs);
  const end = new Date(startMs + toSeconds(duration) * 1000);

  // compare calendar dates in UTC so daylight-saving shifts can't skew the count
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return {
    time: `${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`,
    days: Math.round((endDay - startDay) / MS_PER_DAY),
  };
};
