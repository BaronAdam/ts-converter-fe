"use client";

import { FC, useState } from "react";
import Collapsible from "@/app/components/Collapsible/Collapsible";
import {
  Arrival,
  Duration,
  formatDuration,
  getArrival,
} from "@/app/domain/converter/conversion";
import { useLanguage } from "@/app/i18n/LanguageProvider";

type ResultPanelProps = {
  /** Real time left, or null while nothing has been entered. */
  result: Duration | null;
  rate: number;
  /** Epoch ms when the inputs were last changed; the arrival is measured from it. */
  calculatedAt: number;
  inputHours: number;
  inputMinutes: number;
  onReset: () => void;
};

type Snapshot = {
  key: string;
  text: string;
  arrival: Arrival;
  inputHours: number;
  inputMinutes: number;
};

const EMPTY_RESULT = "–:––:––";

const ResultPanel: FC<ResultPanelProps> = ({
  result,
  rate,
  calculatedAt,
  inputHours,
  inputMinutes,
  onReset,
}) => {
  const { t } = useLanguage();

  const current: Snapshot | null = result
    ? (() => {
        const text = formatDuration(result);
        const arrival = getArrival(calculatedAt, result);
        return {
          key: `${text}|${arrival.time}|${arrival.days}|${inputHours}|${inputMinutes}`,
          text,
          arrival,
          inputHours,
          inputMinutes,
        };
      })()
    : null;

  // Remember the last result so its text stays readable while it collapses
  // away after "Clear" (adjusting state during render, guarded by the key).
  const [snapshot, setSnapshot] = useState<Snapshot | null>(current);
  if (current && snapshot?.key !== current.key) {
    setSnapshot(current);
  }

  const hasResult = current !== null;
  const shown = current ?? snapshot;
  const text = current ? current.text : EMPTY_RESULT;

  // long results (hundreds of hours) need a smaller size to fit the panel
  const sizeClass =
    text.length > 8
      ? "text-[56px] sm:text-[88px]"
      : "text-[72px] sm:text-[112px]";

  const outlineButton =
    "h-11 w-full rounded-xl border-[1.5px] border-res-fg bg-transparent px-4 text-[15px] font-semibold text-res-fg sm:h-12 sm:rounded-2xl sm:text-base";

  return (
    <section
      aria-live="polite"
      className="order-first flex flex-col gap-2 rounded-[20px] bg-res-bg px-[22px] py-5 text-res-fg sm:gap-3 sm:rounded-3xl sm:px-9 sm:py-8 lg:order-none"
    >
      <div className="lang-fade text-xs font-bold uppercase tracking-[0.12em] opacity-80 sm:text-[13px]">
        {t.resultLabel}
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div
          className={`font-display font-bold leading-[0.9] text-res-num ${sizeClass}`}
        >
          {text}
        </div>

        <Collapsible open={hasResult} className="flex flex-col gap-0.5 pt-2.5">
          {shown && (
            <>
              <p className="text-[17px] font-semibold sm:text-[22px]">
                <span className="lang-fade">
                  {t.arrival(shown.arrival.time, shown.arrival.days)}
                </span>
              </p>
              <p className="text-sm opacity-80 sm:text-base">
                <span className="lang-fade">
                  {t.from(shown.inputHours, shown.inputMinutes)}
                </span>
              </p>
            </>
          )}
        </Collapsible>

        <Collapsible open={!hasResult} className="pt-2.5">
          <p className="max-w-xs text-base opacity-85 sm:text-lg">
            <span className="lang-fade">{t.empty}</span>
          </p>
        </Collapsible>
      </div>

      <div className="flex flex-col">
        <p className="border-t border-current/40 pt-2.5 text-[13px] opacity-90 sm:rounded-2xl sm:border sm:px-4 sm:py-3.5 sm:text-[15px]">
          <span className="lang-fade">{t.rate(rate)}</span>
        </p>

        <Collapsible open={hasResult} className="px-1 pb-1 pt-3.5">
          <button type="button" onClick={onReset} className={outlineButton}>
            <span className="lang-fade">{t.reset}</span>
          </button>
        </Collapsible>
      </div>
    </section>
  );
};

export default ResultPanel;
