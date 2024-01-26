const baseUrl: string = "https://ts-convert.azurewebsites.net";
// const baseUrl: string = "http://localhost:7071";

export const getAtsConvertedTimeForCity = async (
  minutes: number
): Promise<TimeConverterDto | null> => {
  try {
    const response = await fetch(`${baseUrl}/api/convert/ats/city/${minutes}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = (await response.json()) as TimeConverterDto;

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error message: ", error.message);
      return null;
    } else {
      console.log("unexpected error: ", error);
      return null;
    }
  }
};

export const getAtsConvertedTimeForOutsideOfCity = async (
  minutes: number
): Promise<TimeConverterDto | null> => {
  try {
    const response = await fetch(
      `${baseUrl}/api/convert/ats/outside/${minutes}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const res = await response.json();

    console.log(res);

    const result = res as TimeConverterDto;

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error message: ", error.message);
      return null;
    } else {
      console.log("unexpected error: ", error);
      return null;
    }
  }
};
