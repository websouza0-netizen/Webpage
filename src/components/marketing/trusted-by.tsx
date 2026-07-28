"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function TrustedBy() {
  const { t } = useI18n();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden border-y border-border bg-muted/40 px-6 py-10"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="shrink-0 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t.trustedBy.title}
        </p>
        <div
          className="flex w-full max-w-3xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          <div className="flex w-max shrink-0 animate-marquee items-center gap-10 pr-10">
            {[...t.trustedBy.categories, ...t.trustedBy.categories].map((category, i) => (
              <span
                key={`${category}-${i}`}
                className="whitespace-nowrap text-lg font-medium text-foreground/70 transition-colors hover:text-accent"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
