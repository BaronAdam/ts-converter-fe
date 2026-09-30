export type Language = "pl" | "en";

export const LANGUAGES: readonly Language[] = ["pl", "en"];
export const DEFAULT_LANGUAGE: Language = "pl";
export const LANGUAGE_STORAGE_KEY = "ts-converter-lang";

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
  calculating: string;
  error: string;
  retry: string;
  reset: string;
  langLabel: string;
  themeLabel: string;
  hoursDec: string;
  hoursInc: string;
  minutesDec: string;
  minutesInc: string;
  rate: (gameMinutes: number) => string;
  real: (hours: number, minutes: number) => string;
  from: (hours: number, minutes: number) => string;
};

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
    calculating: "Liczenie…",
    error: "Nie udało się pobrać wyniku.",
    retry: "Spróbuj ponownie",
    reset: "Wyczyść",
    langLabel: "Język",
    themeLabel: "Przełącz motyw jasny/ciemny",
    hoursDec: "Zmniejsz liczbę godzin",
    hoursInc: "Zwiększ liczbę godzin",
    minutesDec: "Zmniejsz liczbę minut",
    minutesInc: "Zwiększ liczbę minut",
    rate: (n) => `1 min rzeczywista = ${n} min w grze`,
    real: (h, m) => `${h} godz. ${m} min`,
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
    calculating: "Calculating…",
    error: "Couldn't fetch the result.",
    retry: "Try again",
    reset: "Clear",
    langLabel: "Language",
    themeLabel: "Switch light/dark theme",
    hoursDec: "Decrease hours",
    hoursInc: "Increase hours",
    minutesDec: "Decrease minutes",
    minutesInc: "Increase minutes",
    rate: (n) => `1 real minute = ${n} game minutes`,
    real: (h, m) => `${h} h ${m} min`,
    from: (h, m) => `From ${h} h ${m} min in game`,
  },
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
