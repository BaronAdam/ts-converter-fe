import { handleTimeConverterRequest } from "../helpers/TimeConverterRequestHelper";

const baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!;

console.log(baseUrl);

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
