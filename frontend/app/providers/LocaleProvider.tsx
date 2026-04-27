"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { AbstractIntlMessages } from "next-intl";

type Locale = "en" | "es" | "fr" | "zh";

interface LocaleContextType {
  locale: Locale;
  messages: AbstractIntlMessages;
  setLocale: (locale: Locale) => void;
}

const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "zh"];

const STORAGE_KEY = "soropad:locale";

const defaultMessages: AbstractIntlMessages = {};

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  messages: defaultMessages,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored;
    }
  } catch {}
  return "en";
}

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  switch (locale) {
    case "es":
      return (await import("../../messages/es.json")).default;
    case "fr":
      return (await import("../../messages/fr.json")).default;
    case "zh":
      return (await import("../../messages/zh.json")).default;
    default:
      return (await import("../../messages/en.json")).default;
  }
}

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<AbstractIntlMessages>(defaultMessages);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    loadMessages(initialLocale).then((msgs) => {
      setMessages(msgs);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    loadMessages(locale).then((msgs) => {
      setMessages(msgs);
    });
  }, [locale, isLoaded]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
  };

  return (
    <LocaleContext.Provider value={{ locale, messages, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}