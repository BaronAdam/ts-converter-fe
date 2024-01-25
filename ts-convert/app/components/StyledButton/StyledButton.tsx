import { FC } from "react";
import StyledButtonProps from "./StyledButtonProps";

const StyledButton: FC<StyledButtonProps> = ({ text, callback, disabled }) => {
  return (
    <input
      type="button"
      className="m-2 rounded-md border border-solid border-red-600 
      bg-red-600 p-2 text-2xl text-gray-50 transition-colors duration-100 
      ease-linear hover:rounded-md hover:border-red-800 hover:bg-red-800 
      hover:text-gray-50 hover:shadow hover:shadow-red-800 hover:outline-1 
      hover:outline-red-800 focus:rounded-md focus:border-red-800 focus:shadow 
      focus:shadow-red-800 focus:outline-0 active:bg-gray-50 active:text-gray-900 
      active:outline-red-800 disabled:border-red-900 disabled:bg-red-900 disabled:text-gray-50"
      value={text}
      onClick={() => callback()}
      disabled={disabled}
    />
  );
};

export default StyledButton;
