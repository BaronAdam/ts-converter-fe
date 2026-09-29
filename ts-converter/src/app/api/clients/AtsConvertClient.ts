import { getApiBaseUrl } from "../config";
import { handleTimeConverterRequest } from "../helpers/TimeConverterRequestHelper";


export const getAtsConvertedTimeForCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${getApiBaseUrl()}/api/convert/ats/city/${minutes}`,
  );
};

export const getAtsConvertedTimeForOutsideOfCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${getApiBaseUrl()}/api/convert/ats/outside/${minutes}`,
  );
};
