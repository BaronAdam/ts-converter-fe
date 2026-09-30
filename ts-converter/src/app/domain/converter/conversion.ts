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
