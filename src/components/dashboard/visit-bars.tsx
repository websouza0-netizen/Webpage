"use client";

import { motion } from "framer-motion";

export function VisitBars({
  visits,
  max,
}: {
  visits: { day: string; count: number }[];
  max: number;
}) {
  return (
    <div className="flex h-24 items-end gap-1">
      {visits.map((v, i) => (
        <motion.div
          key={v.day}
          className="flex-1 rounded-t bg-accent"
          initial={{ height: 0 }}
          whileInView={{ height: `${Math.max(4, (v.count / max) * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
          title={`${v.day}: ${v.count} visits`}
        />
      ))}
    </div>
  );
}
