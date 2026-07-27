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
      className="border-y border-border bg-muted/40 px-6 py-10"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t.trustedBy.title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {t.trustedBy.categories.map((category) => (
            <span key={category} className="text-lg font-medium text-foreground/70">
              {category}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
