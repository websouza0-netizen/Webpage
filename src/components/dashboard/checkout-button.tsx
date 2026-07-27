"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

export function CheckoutButton({
  endpoint,
  body,
  children,
  variant,
  disabled,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled || loading} variant={variant}>
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
