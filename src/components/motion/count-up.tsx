"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { formatEUR } from "@/lib/pricing";

export function CountUp({
  value,
  variant = "number",
  suffix = "",
  className,
}: {
  value: number;
  variant?: "number" | "eur";
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: shouldReduceMotion ? 0 : 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [inView, value, shouldReduceMotion]);

  const formatted = variant === "eur" ? formatEUR(display) : String(Math.round(display));

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
