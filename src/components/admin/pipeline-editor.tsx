"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { DeliveryStep } from "@/components/dashboard/pipeline-status";
import { markStepDone } from "@/app/admin/clients/[clientId]/actions";

export function PipelineEditor({ clientId, steps }: { clientId: string; steps: DeliveryStep[] }) {
  const [openStepKey, setOpenStepKey] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [isPending, startTransition] = useTransition();

  function openDialog(stepKey: string) {
    setNote("");
    setLink("");
    setOpenStepKey(stepKey);
  }

  function handleSubmit() {
    if (!openStepKey) return;
    const stepKey = openStepKey;
    startTransition(async () => {
      const result = await markStepDone({ clientId, stepKey, note, link });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Step marked done and client notified.");
      setOpenStepKey(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => (
        <div
          key={step.id}
          className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {step.step_order}. {step.title_en}
              </span>
              <Badge variant={step.status === "done" ? "default" : "outline"}>
                {step.status === "done" ? (
                  <>
                    <Check className="size-3" /> Done
                  </>
                ) : (
                  "Pending"
                )}
              </Badge>
            </div>
            {step.status === "done" && (
              <div className="text-xs text-muted-foreground">
                {step.completed_at && <span>{new Date(step.completed_at).toLocaleString()}</span>}
                {step.note && <p className="mt-1">{step.note}</p>}
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-accent underline underline-offset-4"
                  >
                    {step.link}
                  </a>
                )}
              </div>
            )}
          </div>
          {step.status !== "done" && (
            <Button type="button" variant="secondary" size="sm" onClick={() => openDialog(step.step_key)}>
              Mark done
            </Button>
          )}
        </div>
      ))}

      <Dialog open={openStepKey !== null} onOpenChange={(open) => !open && setOpenStepKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark step done</DialogTitle>
            <DialogDescription>
              This notifies the client by email. Add an optional note or link (e.g. a staging URL).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="step-note">Note (optional)</Label>
              <Textarea id="step-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="step-link">Link (optional)</Label>
              <Input
                id="step-link"
                type="url"
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenStepKey(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving…" : "Mark done & notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
