"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { en } from "./en";
import { pt } from "./pt";

export type Locale = "en" | "pt";
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, pt };

const STORAGE_KEY = "ws-locale";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "pt";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // One-time sync from browser-only sources (URL query, localStorage) on
  // mount, mirroring the same deferred-hydration pattern next-themes uses
  // for theme detection elsewhere in this app. Server always renders "en";
  // the client corrects it once, right after hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");
    if (isLocale(queryLang)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(queryLang);
      window.localStorage.setItem(STORAGE_KEY, queryLang);
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  // Keep the <html lang> attribute in sync so screen readers and browser
  // translation tools reflect the actual rendered language, not the
  // server's always-"en" default.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: dictionaries[locale], setLocale }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
