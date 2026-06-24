"use client";

import { motion } from "motion/react";
import { PART_A_COUNT, PART_B_COUNT, TOTAL_QUESTIONS } from "@/lib/asrs";

/** Part A ends at question 6 of 18 → marker position on the bar. */
const PART_A_MARKER = (PART_A_COUNT / TOTAL_QUESTIONS) * 100;

export function ProgressTracker({
  answered,
  partAAnswered,
  partBAnswered,
  message,
}: {
  answered: number;
  partAAnswered: number;
  partBAnswered: number;
  message: string;
}) {
  const percent = Math.round((answered / TOTAL_QUESTIONS) * 100);
  const remaining = TOTAL_QUESTIONS - answered;
  const minutesLeft = Math.max(Math.ceil(remaining * 0.4), remaining === 0 ? 0 : 1);

  return (
    <div className="sticky top-16 z-30 -mx-5 mb-6 border-b border-line bg-canvas/85 px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <p className="font-medium text-ink">
            <span className="tabular text-primary">{answered}</span>
            <span className="text-ink-faint"> din {TOTAL_QUESTIONS} întrebări</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span className="tabular">
              A: {partAAnswered}/{PART_A_COUNT}
            </span>
            <span className="text-line-strong">·</span>
            <span className="tabular">
              B: {partBAnswered}/{PART_B_COUNT}
            </span>
            {remaining > 0 && (
              <>
                <span className="text-line-strong">·</span>
                <span className="tabular hidden sm:inline">~{minutesLeft} min</span>
              </>
            )}
          </div>
        </div>

        <div
          className="relative mt-2 h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-valuenow={answered}
          aria-valuetext={`${answered} din ${TOTAL_QUESTIONS} întrebări completate`}
          aria-label="Progresul testului"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#6d67f0]"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <span
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${PART_A_MARKER}%` }}
            aria-hidden="true"
            title="Sfârșitul Părții A"
          />
        </div>

        <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
          {message}
        </p>
      </div>
    </div>
  );
}
