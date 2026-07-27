import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliveryStep = {
  id: string;
  step_key: string;
  step_order: number;
  title_en: string;
  status: "pending" | "done";
  note: string | null;
  link: string | null;
  completed_at: string | null;
};

export function PipelineStatus({ steps }: { steps: DeliveryStep[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your delivery pipeline will appear here once your brief is submitted.
      </p>
    );
  }

  const currentIndex = steps.findIndex((s) => s.status === "pending");
  const current = currentIndex === -1 ? steps[steps.length - 1] : steps[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
              step.status === "done"
                ? "border-transparent bg-primary text-primary-foreground"
                : step.id === current.id
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground",
            )}
          >
            {step.status === "done" && <Check className="size-3" />}
            {step.title_en}
          </li>
        ))}
      </ol>
      {current.status !== "done" && (current.note || current.link) && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">{current.title_en}</p>
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
