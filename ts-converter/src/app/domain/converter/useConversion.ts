"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConvertRequest, convertTime } from "@/app/api/convert";

export const DEBOUNCE_MS = 350;

export type ConversionState =
  | { status: "idle" }
  | { status: "loading"; previous: TimeConverterDto | null }
  | { status: "success"; data: TimeConverterDto }
  | { status: "error" };

type Settled = { key: string; data: TimeConverterDto | null };

const toKey = (request: ConvertRequest | null, attempt: number): string | null =>
  request
    ? `${request.game}|${request.area}|${request.region}|${request.minutes}|${attempt}`
    : null;

/**
 * Converts as the user types: waits for input to settle, calls the API and
 * ignores responses for inputs that have since changed.
 */
export const useConversion = (
  request: ConvertRequest | null,
): { state: ConversionState; retry: () => void } => {
  const [attempt, setAttempt] = useState(0);
  const [debounced, setDebounced] = useState<ConvertRequest | null>(null);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [lastData, setLastData] = useState<TimeConverterDto | null>(null);

  const { game, area, region, minutes } = request ?? {};
  const stableRequest = useMemo<ConvertRequest | null>(
    () =>
      game && area && region && minutes !== undefined
        ? { game, area, region, minutes }
        : null,
    [game, area, region, minutes],
  );

  const key = toKey(stableRequest, attempt);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(stableRequest), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [stableRequest, attempt]);

  useEffect(() => {
    if (!debounced) return;
    const debouncedKey = toKey(debounced, attempt)!;
    let cancelled = false;

    convertTime(debounced).then((data) => {
      if (cancelled) return;
      setSettled({ key: debouncedKey, data });
      if (data) setLastData(data);
    });

    return () => {
      cancelled = true;
    };
  }, [debounced, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  let state: ConversionState;
  if (!key) {
    state = { status: "idle" };
  } else if (settled?.key === key) {
    state = settled.data
      ? { status: "success", data: settled.data }
      : { status: "error" };
  } else {
    state = { status: "loading", previous: lastData };
  }

  return { state, retry };
};
