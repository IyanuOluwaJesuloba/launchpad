"use client";

import { useState, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";

const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
] as const;

type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

const STORAGE_KEY = "soropad:locale";

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
      if (stored && SUPPORTED_LOCALES.some((l) => l.code === stored)) {
        setCurrentLocale(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleSelect = (code: LocaleCode) => {
    setCurrentLocale(code);
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable
    }
  };

  if (!mounted) {
    return (
      <div className="h-9 w-28 animate-pulse rounded-lg border border-white/5 bg-white/5" />
    );
  }

  const currentLabel = SUPPORTED_LOCALES.find((l) => l.code === currentLocale)?.label ?? "English";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-stellar-400" />
        <span>{currentLabel}</span>
        <ChevronDown className="h-3 w-3 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <ul
            role="listbox"
            aria-label="Available languages"
            className="absolute left-0 mt-2 w-36 origin-top-left rounded-xl border border-white/10 bg-void-800 p-1 shadow-2xl z-50"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <li key={locale.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale.code === currentLocale}
                  onClick={() => handleSelect(locale.code)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    locale.code === currentLocale
                      ? "bg-stellar-500/10 text-stellar-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {locale.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
