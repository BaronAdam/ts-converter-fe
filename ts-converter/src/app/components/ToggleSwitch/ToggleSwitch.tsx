"use client";

import { FC, useState } from "react";

const ToggleSwitch: FC<ToggleSwitchProps> = ({
  labelTextInactive,
  labelTextActive,
  callback,
  disabled,
}) => {
  const [text, setText] = useState<string>(labelTextInactive);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setText(labelTextActive);
    } else {
      setText(labelTextInactive);
    }

    callback?.(e.target.checked);
  };

  return (
    <div
      className="m-2 flex place-content-between items-center text-xl 
      text-gray-900"
    >
      <span>{text}</span>
      <label className="relative inline-block h-6 w-12">
        <input
          onChange={handleOnChange}
          type="checkbox"
          disabled={disabled}
          className="peer h-0 w-0 opacity-0"
        />
        <span
          className="slider round absolute bottom-0 end-0 start-0 top-0 
          cursor-pointer rounded-3xl bg-gray-300 duration-300 before:absolute
          before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-3xl 
          before:bg-white before:duration-300 before:content-['']
          hover:shadow hover:shadow-red-800 hover:outline-red-800 
          peer-checked:bg-red-600 peer-checked:before:translate-x-6 
          peer-focus:border-red-800 peer-focus:shadow peer-focus:shadow-red-800 
          peer-focus:outline-0 peer-disabled:bg-gray-400 
          peer-checked:peer-disabled:bg-red-800"
        />
      </label>
    </div>
  );
};

export default ToggleSwitch;
