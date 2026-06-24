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
  threshold,
}: {
  label: string;
  value: number;
  max: number;
  tone: Tone;
  sublabel?: string;
  /** Optional reference value (e.g. the positive-screen cutoff) drawn as a tick. */
  threshold?: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const hasThreshold =
    threshold !== undefined && threshold > 0 && threshold < max;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="tabular text-sm font-semibold text-ink">
          {value}
          <span className="font-normal text-ink-faint">/{max}</span>
        </span>
      </div>
      {/* The track is clipped (overflow-hidden); the reference tick lives in the
          unclipped wrapper above it so it can stand slightly proud of the bar. */}
      <div className="relative mt-1.5">
        <div className="h-2.5 overflow-hidden rounded-full bg-line">
          <motion.div
            className={cn("h-full rounded-full", TONE_FILL[tone])}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </div>
        {hasThreshold && (
          <span
            className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-faint"
            style={{ left: `${(threshold / max) * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      {hasThreshold && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-faint">
          <span className="inline-block h-2.5 w-0.5 shrink-0 rounded-full bg-ink-faint" aria-hidden="true" />
          Prag pozitiv ASRS:{" "}
          <span className="tabular font-semibold text-ink-soft">
            ≥{threshold} din {max}
          </span>
        </p>
      )}
      {sublabel && <p className="mt-1 text-xs text-ink-faint">{sublabel}</p>}
    </div>
  );
}
