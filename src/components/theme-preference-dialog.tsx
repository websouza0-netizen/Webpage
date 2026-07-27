"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";

const SEEN_KEY = "ws-theme-preference-seen";

function hasBeenSeen() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SEEN_KEY) === "1";
}

/**
 * Renders with the base (non-.ws-editorial) popover/button tokens since it
 * mounts in the root layout, outside any page's design-system wrapper —
 * it needs to look right on both the marketing dark theme and the
 * .ws-editorial pages that render inside it.
 */
export function ThemePreferenceDialog() {
  const { setTheme } = useTheme();
  const mounted = useMounted();
  const open = mounted && !hasBeenSeen();

  function choose(theme: "light" | "dark") {
    setTheme(theme);
    window.localStorage.setItem(SEEN_KEY, "1");
  }

  function dismiss() {
    window.localStorage.setItem(SEEN_KEY, "1");
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Light or dark?</DialogTitle>
          <DialogDescription>
            Pick how WebSouza should look. You can change this anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => choose("light")}>
            <Sun className="size-4" />
            Light
          </Button>
          <Button variant="outline" onClick={() => choose("dark")}>
            <Moon className="size-4" />
            Dark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
