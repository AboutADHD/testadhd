"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

type Tone = "high" | "moderate" | "low" | "info";

const TONE_FILL: Record<Tone, string> = {
  high: "bg-high",
  moderate: "bg-moderate",
  low: "bg-low",
  info: "bg-primary",
};

export function ScoreBar({
  label,
  value,
  max,
  tone,
  sublabel,
}: {
  label: string;
  value: number;
  max: number;
  tone: Tone;
  sublabel?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="tabular text-sm font-semibold text-ink">
          {value}
          <span className="font-normal text-ink-faint">/{max}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn("h-full rounded-full", TONE_FILL[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
      {sublabel && <p className="mt-1 text-xs text-ink-faint">{sublabel}</p>}
    </div>
  );
}
