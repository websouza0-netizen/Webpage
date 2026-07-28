"use client";

import { motion } from "framer-motion";

export function BlobField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-32 size-96 rounded-full bg-accent/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-10 top-10 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 16, 0], y: [0, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 size-72 rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -14, 0], y: [0, -10, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-1/4 top-1/2 size-64 rounded-full bg-primary/5 blur-3xl"
      />
    </div>
  );
}
