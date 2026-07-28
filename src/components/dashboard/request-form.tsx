"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFreeEditRequest } from "@/app/dashboard/requests/actions";
import type { en } from "@/lib/i18n/en";

type RequestsDict = (typeof en)["dashboard"]["requests"];

export function RequestForm({
  tokenBalance,
  readOnly,
  t,
}: {
  tokenBalance: number;
  readOnly: boolean;
  t: RequestsDict;
}) {
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [paying, setPaying] = useState(false);

  function handleFree() {
    startTransition(async () => {
      const result = await submitFreeEditRequest(description);
      if (result?.error === "no_tokens") {
        toast.error(t.outOfTokensToast);
        void handlePaid();
        return;
      }
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      setDescription("");
      toast.success(t.submittedToast);
    });
  }

  async function handlePaid() {
    if (!description.trim()) {
      toast.error(t.descriptionRequiredToast);
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/checkout/edit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? t.genericErrorToast);
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error(t.genericErrorToast);
      setPaying(false);
    }
  }

  const hasFreeTokens = tokenBalance > 0;

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder={t.placeholder}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={readOnly}
        rows={4}
      />
      <div className="flex items-center gap-3">
        <Button
          onClick={hasFreeTokens ? handleFree : handlePaid}
          disabled={readOnly || pending || paying || !description.trim()}
        >
          {pending || paying
            ? t.submitting
            : hasFreeTokens
              ? `${t.submitPrefix} (${tokenBalance} ${t.freeLeft})`
              : t.payForRequest}
        </Button>
        {readOnly && <span className="text-xs text-muted-foreground">{t.pausedNote}</span>}
      </div>
    </div>
  );
}
