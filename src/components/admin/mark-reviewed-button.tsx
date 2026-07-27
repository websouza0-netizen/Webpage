"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markBriefReviewed } from "@/app/admin/briefs/actions";

export function MarkReviewedButton({ briefId }: { briefId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markBriefReviewed(briefId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Brief marked reviewed.");
    });
  }

  return (
    <Button type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Saving…" : "Mark reviewed"}
    </Button>
  );
}
