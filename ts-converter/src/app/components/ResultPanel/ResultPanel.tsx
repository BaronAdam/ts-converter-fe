"use client";

import { FC } from "react";
import { ConversionState } from "@/app/domain/converter/useConversion";
import { useLanguage } from "@/app/i18n/LanguageProvider";

type ResultPanelProps = {
  state: ConversionState;
  rate: number;
  inputHours: number;
  inputMinutes: number;
  onReset: () => void;
  onRetry: () => void;
};

export const formatResult = (hours: number, minutes: number): string =>
  `${hours}:${String(minutes).padStart(2, "0")}`;

const ResultPanel: FC<ResultPanelProps> = ({
  state,
  rate,
  inputHours,
  inputMinutes,
  onReset,
  onRetry,
}) => {
  const { t } = useLanguage();

  const shown =
    state.status === "success"
      ? state.data
      : state.status === "loading"
        ? state.previous
        : null;
  const loading = state.status === "loading";
  const hasInput = state.status !== "idle";

  const outlineButton =
    "h-11 rounded-xl border-[1.5px] border-res-fg bg-transparent px-4 text-[15px] font-semibold text-res-fg sm:h-12 sm:rounded-2xl sm:text-base";

  return (
    <section
      aria-live="polite"
      className="order-first flex flex-col gap-2 rounded-[20px] bg-res-bg px-[22px] py-5 text-res-fg sm:gap-3 sm:rounded-3xl sm:px-9 sm:py-8 lg:order-none"
    >
      <div className="lang-fade text-xs font-bold uppercase tracking-[0.12em] opacity-80 sm:text-[13px]">
        {t.resultLabel}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <div
          className={`flex items-baseline gap-2 font-display font-bold leading-[0.9] text-res-num transition-opacity ${loading ? "opacity-50" : ""}`}
        >
          <span className="text-[88px] sm:text-[148px] sm:tracking-tight">
            {shown ? formatResult(shown.Hours, shown.Minutes) : "–:––"}
          </span>
          {shown ? <span className="text-3xl sm:text-[44px]">h</span> : null}
        </div>

        {state.status === "idle" && (
          <p className="max-w-xs text-base opacity-85 sm:text-lg">
            <span className="lang-fade">{t.empty}</span>
          </p>
        )}

        {loading && <p className="text-base opacity-85">
            <span className="lang-fade">{t.calculating}</span>
          </p>}

        {state.status === "error" && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-semibold">
              <span className="lang-fade">{t.error}</span>
            </p>
            <button type="button" onClick={onRetry} className={outlineButton}>
              <span className="lang-fade">{t.retry}</span>
            </button>
          </div>
        )}

        {state.status === "success" && (
          <div className="flex flex-col gap-0.5">
            <p className="text-[17px] font-semibold sm:text-[22px]">
              <span className="lang-fade">
                {t.real(state.data.Hours, state.data.Minutes)}
              </span>
            </p>
            <p className="text-sm opacity-80 sm:text-base">
              <span className="lang-fade">{t.from(inputHours, inputMinutes)}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <p className="border-t border-current/40 pt-2.5 text-[13px] opacity-90 sm:rounded-2xl sm:border sm:px-4 sm:py-3.5 sm:text-[15px]">
          <span className="lang-fade">{t.rate(rate)}</span>
        </p>
        {hasInput && (
          <button type="button" onClick={onReset} className={outlineButton}>
            <span className="lang-fade">{t.reset}</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ResultPanel;
