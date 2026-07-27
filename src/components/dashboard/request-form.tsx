"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFreeEditRequest } from "@/app/dashboard/requests/actions";

export function RequestForm({
  tokenBalance,
  readOnly,
}: {
  tokenBalance: number;
  readOnly: boolean;
}) {
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [paying, setPaying] = useState(false);

  function handleFree() {
    startTransition(async () => {
      const result = await submitFreeEditRequest(description);
      if (result?.error === "no_tokens") {
        toast.error("You're out of free requests — redirecting to pay for this one.");
        void handlePaid();
        return;
      }
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      setDescription("");
      toast.success("Request submitted.");
    });
  }

  async function handlePaid() {
    if (!description.trim()) {
      toast.error("Description is required.");
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
        toast.error(data.error ?? "Something went wrong.");
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong.");
      setPaying(false);
    }
  }

  const hasFreeTokens = tokenBalance > 0;

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Describe the change you'd like…"
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
            ? "Submitting…"
            : hasFreeTokens
              ? `Submit (${tokenBalance} free left)`
              : "Pay for this request"}
        </Button>
        {readOnly && (
          <span className="text-xs text-muted-foreground">
            Change requests are paused while billing is unresolved.
          </span>
        )}
      </div>
    </div>
  );
}
