import { handleTimeConverterRequest } from "../helpers/TimeConverterRequestHelper";

const baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const getEtsConvertedTimeForCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${baseUrl}/api/convert/ets/city/${minutes}`,
  );
};

export const getEtsConvertedTimeForOutsideOfCityMainland = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${baseUrl}/api/convert/ets/outside/mainland/${minutes}`,
  );
};

export const getEtsConvertedTimeForOutsideOfCityUk = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${baseUrl}/api/convert/ets/outside/uk/${minutes}`,
  );
};
