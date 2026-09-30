"use client";

import { FC, useState } from "react";
import Header from "@/app/components/Header/Header";
import NumberStepper from "@/app/components/NumberStepper/NumberStepper";
import ResultPanel from "@/app/components/ResultPanel/ResultPanel";
import SegmentedControl from "@/app/components/SegmentedControl/SegmentedControl";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import { Area, Game, getRate, isRegionRelevant, Region } from "./rates";
import {
  normalizeHours,
  normalizeMinutes,
  stepHours,
  stepMinutes,
  toTotalMinutes,
} from "./timeInput";
import { useConversion } from "./useConversion";

/** In-game minutes offered as one-tap presets. */
export const QUICK_PICKS = [30, 60, 120, 360, 720, 1440];

const sectionLabel =
  "text-xs font-bold uppercase tracking-widest text-muted sm:text-[13px]";

const TsConverter: FC = () => {
  const { t } = useLanguage();
  const [game, setGame] = useState<Game>("ats");
  const [area, setArea] = useState<Area>("outside");
  const [region, setRegion] = useState<Region>("mainland");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const showRegion = isRegionRelevant(game, area);
  const effectiveRegion: Region = showRegion ? region : "mainland";
  const hasInput = hours !== "" || minutes !== "";
  const totalMinutes = toTotalMinutes(hours, minutes);

  const { state, retry } = useConversion(
    hasInput
      ? { game, area, region: effectiveRegion, minutes: totalMinutes }
      : null,
  );

  const reset = () => {
    setHours("");
    setMinutes("");
  };

  const quickLabel = (mins: number) =>
    mins < 60 ? `${mins} ${t.unitMinutes}` : `${mins / 60} ${t.unitHours}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 sm:px-8 sm:pb-12 lg:px-12">
      <Header />

      <main className="grid flex-1 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="flex flex-col gap-5 rounded-[20px] border border-line bg-surface p-5 sm:gap-6 sm:rounded-3xl sm:p-8">
          <SegmentedControl<Game>
            label={t.gameLabel}
            emphasis
            value={game}
            onChange={setGame}
            options={[
              { value: "ats", label: "ATS", hint: t.usa },
              { value: "ets", label: "ETS", hint: t.europe },
            ]}
          />

          <SegmentedControl<Area>
            label={t.areaLabel}
            value={area}
            onChange={setArea}
            options={[
              { value: "outside", label: t.outside, hint: t.outsideHint },
              { value: "city", label: t.city, hint: t.cityHint },
            ]}
          />

          {showRegion && (
            <SegmentedControl<Region>
              label={t.regionLabel}
              value={region}
              onChange={setRegion}
              options={[
                { value: "mainland", label: t.mainland },
                { value: "uk", label: t.uk },
              ]}
            />
          )}

          <div className="flex flex-col gap-2.5">
            <div className={sectionLabel}>{t.timeLabel}</div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <NumberStepper
                id="hours-input"
                label={t.hours}
                value={hours}
                onChange={(v) => setHours(normalizeHours(v))}
                onStep={(delta) => setHours(stepHours(hours, delta))}
                step={1}
                decLabel={t.hoursDec}
                incLabel={t.hoursInc}
              />
              <NumberStepper
                id="minutes-input"
                label={t.minutes}
                value={minutes}
                onChange={(v) => setMinutes(normalizeMinutes(v))}
                onStep={(delta) => setMinutes(stepMinutes(minutes, delta))}
                step={5}
                decLabel={t.minutesDec}
                incLabel={t.minutesInc}
              />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="mr-1 hidden text-sm text-muted sm:inline">
                {t.quick}
              </span>
              {QUICK_PICKS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setHours(String(Math.floor(mins / 60)));
                    setMinutes(String(mins % 60));
                  }}
                  className="h-11 rounded-full border-[1.5px] border-line bg-transparent px-3.5 text-sm font-semibold text-ink sm:h-10 sm:px-4 sm:text-[15px]"
                >
                  {quickLabel(mins)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <ResultPanel
          state={state}
          rate={getRate(game, area, effectiveRegion)}
          inputHours={Math.floor(totalMinutes / 60)}
          inputMinutes={totalMinutes % 60}
          onReset={reset}
          onRetry={retry}
        />
      </main>
    </div>
  );
};

export default TsConverter;
