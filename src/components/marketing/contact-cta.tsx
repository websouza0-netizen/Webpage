"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  const { t } = useI18n();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl px-6 py-24"
    >
      <div className="rounded-3xl border border-border bg-card px-8 py-16 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.cta.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t.cta.subtitle}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/signup">{t.cta.button}</Link>
        </Button>
      </div>
    </motion.section>
  );
}
