"use client";

import { FC } from "react";

type NumberStepperProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onStep: (delta: number) => void;
  step: number;
  decLabel: string;
  incLabel: string;
};

const stepButton =
  "h-full w-11 border-0 bg-transparent text-2xl text-ink sm:w-14 sm:text-[28px]";

const NumberStepper: FC<NumberStepperProps> = ({
  id,
  label,
  value,
  onChange,
  onStep,
  step,
  decLabel,
  incLabel,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="lang-fade text-[13px] font-semibold text-muted sm:text-sm">
      {label}
    </label>
    <div className="flex h-[60px] items-center overflow-hidden rounded-xl border-[1.5px] border-line bg-canvas sm:h-[72px] sm:rounded-2xl">
      <button
        type="button"
        aria-label={decLabel}
        onClick={() => onStep(-step)}
        className={stepButton}
      >
        &minus;
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-center font-display text-4xl font-semibold text-ink placeholder:text-muted placeholder:opacity-60 sm:text-[44px]"
      />
      <button
        type="button"
        aria-label={incLabel}
        onClick={() => onStep(step)}
        className={stepButton}
      >
        +
      </button>
    </div>
  </div>
);

export default NumberStepper;
