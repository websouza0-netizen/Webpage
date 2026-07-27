"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLANS, priceForInterval, formatEUR, type BillingInterval } from "@/lib/pricing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export function PricingSection() {
  const { t } = useI18n();
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.pricing.title}</h2>
        <p className="mt-4 text-muted-foreground">{t.pricing.subtitle}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex justify-center">
        <Tabs value={interval} onValueChange={(v) => setInterval(v as BillingInterval)}>
          <TabsList>
            <TabsTrigger value="monthly">{t.pricing.monthly}</TabsTrigger>
            <TabsTrigger value="annual">{t.pricing.annual}</TabsTrigger>
          </TabsList>
        </Tabs>
      </Reveal>

      <StaggerGroup className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <StaggerItem key={plan.id}>
            <Card className="flex h-full flex-col transition-transform duration-200 hover:-translate-y-1">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="flex items-baseline text-4xl font-semibold">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={interval}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatEUR(priceForInterval(plan, interval))}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-base font-normal text-muted-foreground">
                    /{interval === "monthly" ? t.pricing.perMonth : t.pricing.perYear}
                  </span>
                </p>
                <ul className="mt-6 flex flex-col gap-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/signup?plan=${plan.id}&interval=${interval}`}>{t.pricing.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
