import { handleTimeConverterRequest } from "../helpers/TimeConverterRequestHelper";

const baseUrl: string = "https://ts-convert.azurewebsites.net";
// const baseUrl: string = "http://localhost:7071";

export const getAtsConvertedTimeForCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${baseUrl}/api/convert/ats/city/${minutes}`,
  );
};

export const getAtsConvertedTimeForOutsideOfCity = async (
  minutes: number,
): Promise<TimeConverterDto | null> => {
  return await handleTimeConverterRequest(
    `${baseUrl}/api/convert/ats/outside/${minutes}`,
  );
};
