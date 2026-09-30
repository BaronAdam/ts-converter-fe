/** Sets what navigator.languages / navigator.language report. */
export const setSystemLanguages = (languages: string[]) => {
  Object.defineProperty(navigator, "languages", {
    value: languages,
    configurable: true,
  });
  Object.defineProperty(navigator, "language", {
    value: languages[0],
    configurable: true,
  });
};
