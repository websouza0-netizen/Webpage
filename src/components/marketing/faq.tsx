"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function FAQ() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.faq.title}</h2>
      </Reveal>
      <StaggerGroup className="mt-12 flex flex-col divide-y divide-border border-y border-border">
        {t.faq.items.map((faqItem, i) => (
          <StaggerItem key={faqItem.question}>
            <Collapsible open={openIndex === i} onOpenChange={(open) => setOpenIndex(open ? i : null)}>
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium transition-colors hover:text-accent">
                {faqItem.question}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === i && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-5 text-sm text-muted-foreground">
                {faqItem.answer}
              </CollapsibleContent>
            </Collapsible>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
