"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

// The root layout can't know a user's locale without an extra auth+DB
// query on every single request (marketing pages included), so the
// server-rendered areas that already resolve it via getServerLocale() —
// for nav/banner copy — pass that same value down here instead of paying
// for a second lookup just to fix the <html lang> attribute.
export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
