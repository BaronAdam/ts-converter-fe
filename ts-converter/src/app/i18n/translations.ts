export type Language = "pl" | "en";

export const LANGUAGES: readonly Language[] = ["pl", "en"];
/** Language of the server render and first paint (the site is Polish-first). */
export const DEFAULT_LANGUAGE: Language = "pl";
/** Used for every system language other than Polish. */
export const FALLBACK_LANGUAGE: Language = "en";
export { LANGUAGE_STORAGE_KEY } from "../initScript";

export type Translations = {
  brand: string;
  title: string;
  gameLabel: string;
  usa: string;
  europe: string;
  areaLabel: string;
  outside: string;
  outsideHint: string;
  city: string;
  cityHint: string;
  regionLabel: string;
  mainland: string;
  uk: string;
  timeLabel: string;
  hours: string;
  minutes: string;
  unitHours: string;
  unitMinutes: string;
  quick: string;
  resultLabel: string;
  empty: string;
  reset: string;
  langLabel: string;
  themeLabel: string;
  hoursDec: string;
  hoursInc: string;
  minutesDec: string;
  minutesInc: string;
  rate: (gameMinutes: number) => string;
  arrival: (time: string, days: number) => string;
  from: (hours: number, minutes: number) => string;
};

const plDay = (days: number): string =>
  days <= 0 ? "" : days === 1 ? " (jutro)" : days === 2 ? " (pojutrze)" : ` (za ${days} dni)`;

const enDay = (days: number): string =>
  days <= 0 ? "" : days === 1 ? " (tomorrow)" : ` (in ${days} days)`;

export const translations: Record<Language, Translations> = {
  pl: {
    brand: "Truck Sim",
    title: "Konwerter czasu",
    gameLabel: "Gra",
    usa: "Ameryka Północna",
    europe: "Europa",
    areaLabel: "Gdzie jedziesz?",
    outside: "Poza miastem",
    outsideHint: "Trasa i autostrada",
    city: "W mieście",
    cityHint: "Miasto i strefy specjalne",
    regionLabel: "Region",
    mainland: "Europa kontynentalna",
    uk: "Wielka Brytania",
    timeLabel: "Czas w grze",
    hours: "Godziny",
    minutes: "Minuty",
    unitHours: "godz.",
    unitMinutes: "min",
    quick: "Szybki wybór",
    resultLabel: "Pozostały czas rzeczywisty",
    empty: "Wpisz czas z gry, aby zobaczyć wynik.",
    reset: "Wyczyść",
    langLabel: "Język",
    themeLabel: "Przełącz motyw jasny/ciemny",
    hoursDec: "Zmniejsz liczbę godzin",
    hoursInc: "Zwiększ liczbę godzin",
    minutesDec: "Zmniejsz liczbę minut",
    minutesInc: "Zwiększ liczbę minut",
    rate: (n) => `1 min rzeczywista = ${n} min w grze`,
    arrival: (time, days) => `Będziesz na miejscu o ${time}${plDay(days)}`,
    from: (h, m) => `Z ${h} godz. ${m} min w grze`,
  },
  en: {
    brand: "Truck Sim",
    title: "Time Converter",
    gameLabel: "Game",
    usa: "North America",
    europe: "Europe",
    areaLabel: "Where are you driving?",
    outside: "Outside a city",
    outsideHint: "Roads and highways",
    city: "Inside a city",
    cityHint: "Cities and special areas",
    regionLabel: "Region",
    mainland: "Mainland Europe",
    uk: "United Kingdom",
    timeLabel: "In-game time",
    hours: "Hours",
    minutes: "Minutes",
    unitHours: "h",
    unitMinutes: "min",
    quick: "Quick pick",
    resultLabel: "Real time left",
    empty: "Enter the in-game time to see the result.",
    reset: "Clear",
    langLabel: "Language",
    themeLabel: "Switch light/dark theme",
    hoursDec: "Decrease hours",
    hoursInc: "Increase hours",
    minutesDec: "Decrease minutes",
    minutesInc: "Increase minutes",
    rate: (n) => `1 real minute = ${n} game minutes`,
    arrival: (time, days) => `You'll arrive at ${time}${enDay(days)}`,
    from: (h, m) => `From ${h} h ${m} min in game`,
  },
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);

/**
 * The site follows the visitor's primary language: Polish when it is Polish
 * (any region, e.g. "pl-PL"), English for everything else.
 */
export const detectLanguage = (preferred: readonly string[]): Language => {
  const primary = (preferred[0] ?? "").toLowerCase().split("-")[0];
  return primary === "pl" ? "pl" : FALLBACK_LANGUAGE;
};
