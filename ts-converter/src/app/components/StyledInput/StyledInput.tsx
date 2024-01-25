"use client";

import { FC } from "react";
import { InputTypes } from "./InputTypes";
import { StyledInputProps } from "./StyledInputProps";

const StyledInput: FC<StyledInputProps> = ({
  placeholderText,
  value,
  setValue,
  type = InputTypes.Text,
}) => {
  return (
    <>
      <input
        className="input m-2 rounded-md border border-solid 
        border-gray-900 p-2 text-2xl text-gray-900 hover:border-red-800 
        hover:shadow hover:shadow-red-800 hover:outline-red-800 focus:border-red-800 
        focus:shadow focus:shadow-red-800 focus:outline-0 focus:outline-red-800
        active:border-red-800 active:shadow active:shadow-red-800 active:outline-red-800"
        type={InputTypes[type].toLowerCase()}
        placeholder={placeholderText}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.currentTarget.value)
        }
      ></input>
    </>
  );
};

export default StyledInput;
