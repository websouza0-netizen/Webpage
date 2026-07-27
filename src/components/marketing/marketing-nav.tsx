"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function MarketingNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t, locale, setLocale } = useI18n();
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);

  return (
    <motion.header
      style={{
        borderBottomColor: useTransform(borderOpacity, (v) => `color-mix(in oklch, var(--border) ${v * 100}%, transparent)`),
        boxShadow: useTransform(shadowOpacity, (v) => `0 8px 24px -12px rgb(0 0 0 / ${v})`),
      }}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-quote)] text-2xl italic text-foreground"
        >
          WebSouza
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            {t.nav.features}
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            {t.nav.pricing}
          </a>
          <a href="#projects" className="transition-colors hover:text-foreground">
            {t.nav.projects}
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            {t.nav.faq}
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs font-semibold"
            onClick={() => setLocale(locale === "en" ? "pt" : "en")}
            aria-label="Toggle language"
          >
            {locale === "en" ? "PT" : "EN"}
          </Button>
          <ThemeToggle />
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t.nav.signup}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
