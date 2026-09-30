"use client";

import { FC } from "react";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import { LANGUAGES } from "@/app/i18n/translations";
import { useTheme } from "@/app/theme/ThemeProvider";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Header: FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between sm:h-24">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-on-accent sm:h-11 sm:w-11 sm:rounded-xl">
          <svg {...iconProps}>
            <path d="M3 6h11v10H3z" />
            <path d="M14 9h4l3 3v4h-7" />
            <circle cx="7" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="lang-fade text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-xs">
            {t.brand}
          </span>
          <h1 className="lang-fade font-display text-2xl font-bold sm:text-[30px]">
            {t.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          role="group"
          aria-label={t.langLabel}
          className="flex gap-[3px] rounded-xl bg-track p-[3px] sm:gap-1 sm:rounded-2xl sm:p-1"
        >
          {LANGUAGES.map((code) => {
            const selected = code === language;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onClick={() => setLanguage(code)}
                className={`h-[38px] min-w-11 rounded-[9px] text-sm font-bold tracking-wide sm:h-10 sm:min-w-[52px] sm:rounded-[10px] sm:text-[15px] ${
                  selected ? "bg-surface text-ink" : "bg-transparent text-muted"
                }`}
              >
                {code.toUpperCase()}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={t.themeLabel}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            toggleTheme({
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            });
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-line bg-surface text-ink sm:h-12 sm:w-12 sm:rounded-2xl"
        >
          {theme === "dark" ? (
            <svg key="sun" {...iconProps}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg key="moon" {...iconProps}>
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
