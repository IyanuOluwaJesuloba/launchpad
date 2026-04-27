"use client";

import { ReactNode, useEffect, useState } from "react";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { useLocale } from "./LocaleProvider";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { locale, messages: contextMessages } = useLocale();
  const [messages, setMessages] = useState<AbstractIntlMessages>({});
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (contextMessages && Object.keys(contextMessages).length > 0) {
      setMessages(contextMessages);
    }
  }, [contextMessages]);

  if (!isClientReady) {
    return <>{children}</>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
