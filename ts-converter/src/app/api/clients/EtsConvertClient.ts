import { getApiBaseUrl } from "../config";
import { handleTimeConverterRequest } from "../helpers/TimeConverterRequestHelper";


export const getEtsConvertedTimeForCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${getApiBaseUrl()}/api/convert/ets/city/${minutes}`,
  );
};

export const getEtsConvertedTimeForOutsideOfCityMainland = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${getApiBaseUrl()}/api/convert/ets/outside/mainland/${minutes}`,
  );
};

export const getEtsConvertedTimeForOutsideOfCityUk = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${getApiBaseUrl()}/api/convert/ets/outside/uk/${minutes}`,
  );
};
