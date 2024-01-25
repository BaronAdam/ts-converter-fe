import { FC, useState } from "react";
import ResultDisplay from "~/components/ResultDisplay/ResultDisplay";
import StyledButton from "~/components/StyledButton/StyledButton";
import InputGroup from "./InputGroup/InputGroup";
import {
  getAtsConvertedTimeForCity,
  getAtsConvertedTimeForOutsideOfCity,
} from "~/api/clients/AtsConvertClient";

const TsConverter: FC = () => {
  const [isEts, setIsEts] = useState<boolean>(false);
  const [isUk, setIsUk] = useState<boolean>(false);
  const [isInCity, setIsInCity] = useState<boolean>(false);
  const [hoursValue, setHoursValue] = useState<string>("");
  const [minutesValue, setMinutesValue] = useState<string>("");
  const [result, setResult] = useState<TimeConverterDto | null>(null);

  const handleGameChange = (isChecked: boolean): void => {
    setIsEts(isChecked);
  };

  const handleUkChange = (isChecked: boolean): void => {
    setIsUk(isChecked);
  };

  const handleAreaChange = (isChecked: boolean): void => {
    setIsInCity(isChecked);
  };

  const handleMinutesChange = (minutes: string): void => {
    const converted = parseInt(minutes);

    let result = converted < 0 ? 0 : converted;
    result = result >= 60 ? 59 : result;
    setMinutesValue(result.toString());
  };

  const handleHoursChange = (hours: string): void => {
    const converted = parseInt(hours);

    const result = converted < 0 ? 0 : converted;
    setHoursValue(result.toString());
  };

  const sendRequest = async () => {
    const minutes = parseInt(minutesValue);
    const hours = parseInt(hoursValue);

    const totalMinutes = isNaN(hours)
      ? 0
      : hours * 60 + (isNaN(minutes) ? 0 : minutes);

    const response = isInCity
      ? await getAtsConvertedTimeForCity(totalMinutes)
      : await getAtsConvertedTimeForOutsideOfCity(totalMinutes);
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
