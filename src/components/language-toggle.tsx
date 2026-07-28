"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle({
  locale,
  onToggle,
  className,
  disabled,
}: {
  locale: Locale;
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("relative overflow-hidden text-xs font-semibold", className)}
      onClick={onToggle}
      disabled={disabled}
      aria-label="Toggle language"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={locale}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="inline-block"
        >
          {locale === "en" ? "PT" : "EN"}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
