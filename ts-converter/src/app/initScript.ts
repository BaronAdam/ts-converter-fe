// Plain module (no "use client") so the server layout can read these values.

export const THEME_STORAGE_KEY = "ts-converter-theme";
export const LANGUAGE_STORAGE_KEY = "ts-converter-lang";

/** Milliseconds for each half of the language fade. */
export const LANG_FADE_MS = 160;
/** Milliseconds for the circular theme reveal. */
export const THEME_REVEAL_MS = 500;

/**
 * Runs before first paint (see layout.tsx):
 * - applies the saved/system theme so there is no light/dark flash
 * - hides translatable content when a non-default language is saved, so the
 *   default language never flashes; the LanguageProvider fades it back in
 */
export const initScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.classList.toggle("dark",t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches);var l=localStorage.getItem("${LANGUAGE_STORAGE_KEY}");if(l==="en"){d.setAttribute("data-lang-fading","")}}catch(e){}})()`;
