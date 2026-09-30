"use client";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Use the display font for the option label (game picker). */
  emphasis?: boolean;
};

const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  emphasis = false,
}: SegmentedControlProps<T>) => (
  <div className="flex flex-col gap-2.5">
    <div className="text-xs font-bold uppercase tracking-widest text-muted sm:text-[13px]">
      {label}
    </div>
    <div role="group" aria-label={label} className="flex gap-2 sm:gap-3">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex min-h-14 flex-1 flex-col items-start justify-center gap-0.5 rounded-xl border-[1.5px] px-3.5 py-3 text-left sm:rounded-2xl sm:px-[18px] sm:py-3.5 ${
              selected
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-transparent text-ink"
            }`}
          >
            <span
              className={
                emphasis
                  ? "font-display text-[26px] font-bold leading-none sm:text-[30px]"
                  : "text-base font-bold sm:text-lg"
              }
            >
              {option.label}
            </span>
            {option.hint ? (
              <span
                className={`text-[13px] sm:text-sm ${selected ? "text-on-accent" : "text-muted"}`}
              >
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  </div>
);

export default SegmentedControl;
