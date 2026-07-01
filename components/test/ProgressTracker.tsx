"use client";

import { motion } from "motion/react";
import { PART_A_COUNT, PART_B_COUNT, TOTAL_QUESTIONS } from "@/lib/asrs";
import { IconClock } from "../icons";

/** Part A ends at question 6 of 18 → marker position on the bar. */
const PART_A_MARKER = (PART_A_COUNT / TOTAL_QUESTIONS) * 100;

/**
 * Live completion tracker. Self-contained card so it reads well in both
 * placements it gets: a sticky top bar on mobile (single column) and a sticky
 * side rail on desktop (left column of the questionnaire grid). Exposes a real
 * `role="progressbar"` with a spoken `aria-valuetext`; the motivational line is a
 * polite live region.
 */
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
    <div className="sticky top-16 z-30 lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-line bg-surface/90 p-4 shadow-card backdrop-blur-xl sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <p className="leading-none">
            <span className="tabular text-2xl font-bold text-primary">{answered}</span>
            <span className="text-sm text-ink-faint"> / {TOTAL_QUESTIONS}</span>
            <span className="ml-1 hidden text-sm text-ink-faint sm:inline">întrebări</span>
          </p>
          <span className="tabular text-sm font-semibold text-ink-soft">{percent}%</span>
        </div>

        <div
          className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-line"
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
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${PART_A_MARKER}%` }}
            aria-hidden="true"
            title="Sfârșitul Părții A"
          />
        </div>

        {/* Detail rows (Part A/B counts, time-left, motivational line) only fit the
            desktop side rail. On mobile the tracker is a sticky top bar, so it stays
            a compact count + bar + percent strip — a tall card here would pin ~180px
            over the viewport top and hide the title of the just-advanced question. */}
        <div className="mt-3 hidden flex-wrap items-center gap-2 text-xs lg:flex">
          <span className="tabular inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary">
            Partea A {partAAnswered}/{PART_A_COUNT}
          </span>
          <span className="tabular inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-soft">
            Partea B {partBAnswered}/{PART_B_COUNT}
          </span>
          {remaining > 0 && (
            <span className="tabular inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-soft">
              <IconClock className="h-3.5 w-3.5" />~{minutesLeft} min
            </span>
          )}
        </div>

        <p className="mt-3 hidden text-xs leading-relaxed text-ink-soft lg:block" aria-live="polite">
          {message}
        </p>
      </div>
    </div>
  );
}
