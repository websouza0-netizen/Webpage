"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { DeliveryStep } from "@/components/dashboard/pipeline-status";
import { markStepDone, setStepEstimate } from "@/app/admin/clients/[clientId]/actions";
import { cn } from "@/lib/utils";

// Short, plain-English cue for what this phase actually involves — shown
// only for the current step, so the admin never has to guess what "mark
// done" is supposed to mean here.
const STEP_GUIDANCE: Record<string, string> = {
  brief_received: "Review the client's brief. Once you're ready to start designing, mark this done.",
  design_draft: "Send the client a first visual draft (mockup or staging link), then mark this done — they're notified automatically.",
  in_development: "Build the site against the approved design. Marking this done locks the client's brief and switches further changes to edit requests.",
  client_review: "The client is reviewing the built site. Mark done once they've signed off or moved past revisions.",
  revisions: "Apply the changes the client asked for during review, then mark this done.",
  launched: "Deploy the site to its live domain. Add the live URL as the link before marking this done.",
  post_launch: "Check in with the client that everything's running smoothly. Mark done to close out the pipeline.",
};

export function PipelineEditor({ clientId, steps }: { clientId: string; steps: DeliveryStep[] }) {
  const [detailsOpenFor, setDetailsOpenFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [estimateDrafts, setEstimateDrafts] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [savingEstimateFor, setSavingEstimateFor] = useState<string | null>(null);

  const currentIndex = steps.findIndex((s) => s.status === "pending");
  const current = currentIndex === -1 ? null : steps[currentIndex];

  function handleCheck(step: DeliveryStep) {
    startTransition(async () => {
      const result = await markStepDone({
        clientId,
        stepKey: step.step_key,
        note: detailsOpenFor === step.step_key ? note : undefined,
        link: detailsOpenFor === step.step_key ? link : undefined,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Marked done — client notified.");
      setDetailsOpenFor(null);
      setNote("");
      setLink("");
    });
  }

  function handleEstimateChange(stepKey: string, value: string) {
    setEstimateDrafts((prev) => ({ ...prev, [stepKey]: value }));
  }

  function handleEstimateBlur(step: DeliveryStep) {
    const value = estimateDrafts[step.step_key];
    if (value === undefined || value === (step.estimated_date ?? "")) return;
    setSavingEstimateFor(step.step_key);
    startTransition(async () => {
      const result = await setStepEstimate({ clientId, stepKey: step.step_key, estimatedDate: value || null });
      setSavingEstimateFor(null);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {current && (
        <div className="mb-2 rounded-lg border border-accent/40 bg-accent/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Up next</p>
          <p className="mt-1 text-sm font-medium">
            {current.step_order}. {current.title_en}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{STEP_GUIDANCE[current.step_key]}</p>
        </div>
      )}

      {steps.map((step) => {
        const isCurrent = current?.id === step.id;
        // One step of lookahead: the admin can set an ETA/note on the step
        // right after the current one, so completing the current step can
        // fold a real "next up, expected around <date>" line into the
        // client email instead of that reassurance only ever being empty.
        const isBeyondLookahead = current !== null && step.step_order > current.step_order + 1;
        const detailsOpen = detailsOpenFor === step.step_key;
        const estimateValue = estimateDrafts[step.step_key] ?? step.estimated_date ?? "";

        return (
          <div
            key={step.id}
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 transition-colors",
              step.status === "done"
                ? "border-border"
                : isCurrent
                  ? "border-accent/50 bg-accent/5"
                  : "border-border opacity-60",
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox
                checked={step.status === "done"}
                disabled={step.status === "done" || !isCurrent || isPending}
                onCheckedChange={() => handleCheck(step)}
                aria-label={`Mark ${step.title_en} done`}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">
                  {step.step_order}. {step.title_en}
                </span>
                {step.status === "done" && step.completed_at && (
                  <span className="text-xs text-muted-foreground">
                    Done {new Date(step.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {step.status !== "done" && !isBeyondLookahead && (
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={`eta-${step.step_key}`} className="text-xs text-muted-foreground">
                    ETA
                  </Label>
                  <Input
                    id={`eta-${step.step_key}`}
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={estimateValue}
                    onChange={(e) => handleEstimateChange(step.step_key, e.target.value)}
                    onBlur={() => handleEstimateBlur(step)}
                    disabled={savingEstimateFor === step.step_key}
                  />
                </div>
              )}

              {step.status !== "done" && !isBeyondLookahead && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground"
                  onClick={() => setDetailsOpenFor(detailsOpen ? null : step.step_key)}
                >
                  {detailsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  Note / link
                </Button>
              )}

              {step.status === "done" && (
                <Badge variant="default" className="gap-1">
                  <Check className="size-3" /> Done
                </Badge>
              )}
            </div>

            {step.status === "done" && (step.note || step.link) && (
              <div className="pl-8 text-xs text-muted-foreground">
                {step.note && <p>{step.note}</p>}
                {step.link && (
                  <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                    {step.link}
                  </a>
                )}
              </div>
            )}

            {detailsOpen && (
              <div className="ml-8 flex flex-col gap-2 border-t border-border pt-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`note-${step.step_key}`} className="text-xs">
                    Note to include in the client email (optional)
                  </Label>
                  <Textarea
                    id={`note-${step.step_key}`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`link-${step.step_key}`} className="text-xs">
                    Link, e.g. staging or live URL (optional)
                  </Label>
                  <Input
                    id={`link-${step.step_key}`}
                    type="url"
                    placeholder="https://…"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
