"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { BlobField } from "./blob-field";
import { PLANS, FREE_EDITS_PER_PERIOD, EXTRA_EDIT_PRICE_EUR, formatEUR } from "@/lib/pricing";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  const { t } = useI18n();

  const stats = [
    { value: String(PLANS.length), label: t.hero.stats.plansLabel },
    { value: String(FREE_EDITS_PER_PERIOD), label: t.hero.stats.freeEditsLabel },
    { value: formatEUR(EXTRA_EDIT_PRICE_EUR), label: t.hero.stats.extraEditLabel },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pt-28">
      <BlobField />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {t.hero.eyebrow}
        </motion.div>

        <motion.h1 variants={item} className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {t.hero.headingLead}{" "}
          <span className="text-shimmer font-[family-name:var(--font-quote)] italic">
            {t.hero.headingAccent}
          </span>
          {t.hero.headingTail}
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          {t.hero.subtitle}
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">{t.hero.ctaPrimary}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#projects">{t.hero.ctaSecondary}</a>
          </Button>
        </motion.div>

        <motion.dl
          variants={item}
          className="mt-16 grid w-full max-w-xl grid-cols-3 gap-6 border-t border-border pt-8"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-semibold sm:text-3xl">{s.value}</dd>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.div
        aria-hidden
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mt-14 flex w-full max-w-3xl justify-center text-muted-foreground/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
