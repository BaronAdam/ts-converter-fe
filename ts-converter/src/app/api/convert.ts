import {
  Area,
  Game,
  isRegionRelevant,
  Region,
} from "../domain/converter/rates";
import {
  getAtsConvertedTimeForCity,
  getAtsConvertedTimeForOutsideOfCity,
} from "./clients/AtsConvertClient";
import {
  getEtsConvertedTimeForCity,
  getEtsConvertedTimeForOutsideOfCityMainland,
  getEtsConvertedTimeForOutsideOfCityUk,
} from "./clients/EtsConvertClient";

export type ConvertRequest = {
  game: Game;
  area: Area;
  region: Region;
  minutes: number;
};

export const convertTime = ({
  game,
  area,
  region,
  minutes,
}: ConvertRequest): Promise<TimeConverterDto | null> => {
  if (game === "ats") {
    return area === "city"
      ? getAtsConvertedTimeForCity(minutes)
      : getAtsConvertedTimeForOutsideOfCity(minutes);
  }

  if (area === "city") {
    return getEtsConvertedTimeForCity(minutes);
  }

  return isRegionRelevant(game, area) && region === "uk"
    ? getEtsConvertedTimeForOutsideOfCityUk(minutes)
    : getEtsConvertedTimeForOutsideOfCityMainland(minutes);
};
