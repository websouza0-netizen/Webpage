"use client";

import { motion } from "framer-motion";
import { Palette, Rocket, Repeat, LifeBuoy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const icons = [Palette, Rocket, Repeat, LifeBuoy];

export function FeaturesGrid() {
  const { t } = useI18n();

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.features.title}</h2>
        <p className="mt-4 text-muted-foreground">{t.features.subtitle}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.features.items.map((feature, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.div key={feature.title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
