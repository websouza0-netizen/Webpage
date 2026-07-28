"use client";

import { Check } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type DeliveryStep = {
  id: string;
  step_key: string;
  step_order: number;
  title_en: string;
  title_pt: string;
  status: "pending" | "done";
  note: string | null;
  link: string | null;
  completed_at: string | null;
  estimated_date: string | null;
};

export function PipelineStatus({
  steps,
  locale,
  emptyText,
  expectedLabel,
}: {
  steps: DeliveryStep[];
  locale: "en" | "pt";
  emptyText: string;
  expectedLabel: string;
}) {
  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  const title = (step: DeliveryStep) => (locale === "pt" ? step.title_pt : step.title_en);
  const currentIndex = steps.findIndex((s) => s.status === "pending");
  const current = currentIndex === -1 ? steps[steps.length - 1] : steps[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <StaggerGroup className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <StaggerItem key={step.id}>
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                step.status === "done"
                  ? "border-transparent bg-primary text-primary-foreground"
                  : step.id === current.id
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground",
              )}
            >
              {step.status === "done" ? (
                <Check className="size-3" />
              ) : step.id === current.id ? (
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
              ) : null}
              {title(step)}
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
      {current.status !== "done" && (current.note || current.link || current.estimated_date) && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">{title(current)}</p>
          {current.estimated_date && (
            <p className="mt-1 text-accent">
              {expectedLabel}{" "}
              {new Date(`${current.estimated_date}T00:00:00`).toLocaleDateString(
                locale === "pt" ? "pt-BR" : "en-IE",
                { day: "numeric", month: "long" },
              )}
            </p>
          )}
          {current.note && <p className="mt-1 text-muted-foreground">{current.note}</p>}
          {current.link && (
            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-accent underline underline-offset-4"
            >
              {current.link}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
