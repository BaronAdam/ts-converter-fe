"use client";

import { FC, useState } from "react";
import { normalizeHours, normalizeMinutes, toTotalMinutes } from "./timeInput";
import InputGroup from "./InputGroup/InputGroup";
import { getAtsConvertedTimeForCity, getAtsConvertedTimeForOutsideOfCity } from "@/app/api/clients/AtsConvertClient";
import StyledButton from "@/app/components/StyledButton/StyledButton";
import ResultDisplay from "@/app/components/ResultDisplay/ResultDisplay";
import { getEtsConvertedTimeForCity, getEtsConvertedTimeForOutsideOfCityMainland, getEtsConvertedTimeForOutsideOfCityUk } from "@/app/api/clients/EtsConvertClient";


const TsConverter: FC = () => {
  const [isEts, setIsEts] = useState<boolean>(false);
  const [isUk, setIsUk] = useState<boolean>(false);
  const [isInCity, setIsInCity] = useState<boolean>(false);
  const [hoursValue, setHoursValue] = useState<string>("");
  const [minutesValue, setMinutesValue] = useState<string>("");
  const [result, setResult] = useState<TimeConverterDto | null>(null);

  const handleGameChange = (isChecked: boolean): void => {
    setIsEts(isChecked);
    if (!isChecked) {
      setIsUk(false);
    }
  };

  const handleUkChange = (isChecked: boolean): void => {
    setIsUk(isChecked);
  };

  const handleAreaChange = (isChecked: boolean): void => {
    setIsInCity(isChecked);
  };

  const handleMinutesChange = (minutes: string): void => {
    setMinutesValue(normalizeMinutes(minutes));
  };

  const handleHoursChange = (hours: string): void => {
    setHoursValue(normalizeHours(hours));
  };

  const sendRequest = async () => {
    const totalMinutes = toTotalMinutes(hoursValue, minutesValue);

    let response: TimeConverterDto | null = null
    if (isEts) {
      response = isInCity
        ? await getEtsConvertedTimeForCity(totalMinutes)
        : isUk
          ? await getEtsConvertedTimeForOutsideOfCityUk(totalMinutes)
          : await getEtsConvertedTimeForOutsideOfCityMainland(totalMinutes)
    }
    else {
      response = isInCity
        ? await getAtsConvertedTimeForCity(totalMinutes)
        : await getAtsConvertedTimeForOutsideOfCity(totalMinutes);
    }
    setResult(response);
  };

  return (
    <div className="md:mx-auto lg:w-1/2">
      <nav className="flex-1 p-5 text-center text-3xl text-gray-900">
        Truck Sim Time Converter
      </nav>
      <section className="flex flex-col">
        <InputGroup
          isEts={isEts}
          handleGameChange={handleGameChange}
          isUk={isUk}
          handleUkChange={handleUkChange}
          handleAreaChange={handleAreaChange}
          hoursValue={hoursValue}
          handleHoursChange={handleHoursChange}
          minutesValue={minutesValue}
          handleMinutesChange={handleMinutesChange}
        ></InputGroup>
        <StyledButton
          callback={sendRequest}
          text="Calculate"
          disabled={minutesValue === "" && hoursValue === ""}
        ></StyledButton>
        {result !== undefined && result !== null ? (
          <ResultDisplay
            minutes={result.Minutes}
            hours={result.Hours}
          ></ResultDisplay>
        ) : (
          <></>
        )}
      </section>
    </div>
  );
};

export default TsConverter;
