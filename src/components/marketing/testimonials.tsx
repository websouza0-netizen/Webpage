"use client";

import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.testimonials.title}</h2>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {t.testimonials.items.map((testimonial) => (
          <Card key={testimonial.name} className="flex flex-col justify-between">
            <CardContent className="flex flex-col gap-4">
              <Quote className="size-5 text-accent" />
              <p className="text-sm text-foreground/90">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-2 text-sm">
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-muted-foreground">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
