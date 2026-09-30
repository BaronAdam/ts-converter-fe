export type Game = "ats" | "ets";
export type Area = "outside" | "city";
export type Region = "mainland" | "uk";

/** Region only matters for ETS outside a city. */
export const isRegionRelevant = (game: Game, area: Area): boolean =>
  game === "ets" && area === "outside";

/** How many in-game minutes pass per real minute (display only; the API does the conversion). */
export const getRate = (game: Game, area: Area, region: Region): number => {
  if (area === "city") return 3;
  if (game === "ats") return 20;
  return region === "uk" ? 15 : 19;
};
