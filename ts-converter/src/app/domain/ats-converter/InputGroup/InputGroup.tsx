"use client";

import { InputTypes } from "@/app/components/StyledInput/InputTypes";
import StyledInput from "@/app/components/StyledInput/StyledInput";
import ToggleSwitch from "@/app/components/ToggleSwitch/ToggleSwitch";
import { FC } from "react";

const InputGroup: FC<InputGroupProps> = ({
  isEts,
  handleGameChange,
  isUk,
  handleUkChange,
  handleAreaChange,
  hoursValue,
  handleHoursChange,
  minutesValue,
  handleMinutesChange,
}) => {
  return (
    <>
      <StyledInput
        placeholderText="Hours ingame"
        value={hoursValue}
        setValue={handleHoursChange}
        type={InputTypes.Number}
      ></StyledInput>
      <StyledInput
        placeholderText="Minutes ingame"
        value={minutesValue}
        setValue={handleMinutesChange}
        type={InputTypes.Number}
      ></StyledInput>
      <ToggleSwitch
        labelTextActive="Convert time inside city and special areas"
        labelTextInactive="Convert time outside of city and special areas"
        callback={handleAreaChange}
      ></ToggleSwitch>
      <ToggleSwitch
        labelTextActive="Convert for ETS"
        labelTextInactive="Convert for ATS"
        disabled={isUk}
        callback={handleGameChange}
      ></ToggleSwitch>
      {isEts ? (
        <ToggleSwitch
          labelTextActive="Inside UK"
          labelTextInactive="Outside of UK"
          callback={handleUkChange}
        ></ToggleSwitch>
      ) : (
        <></>
      )}
    </>
  );
};

export default InputGroup;
