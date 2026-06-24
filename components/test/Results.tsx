"use client";

import { motion } from "motion/react";
import { ScoreBar } from "./ScoreBar";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/cn";
import { PART_A_COUNT, PART_A_POSITIVE_CUTOFF, PART_B_COUNT } from "@/lib/asrs";
import {
  GENERAL_INTERPRETATION,
  LEVEL_COPY,
  buildRecommendations,
  partAInterpretation,
  partBInterpretation,
  type ScoreResult,
} from "@/lib/scoring";

const DOMAIN_MAX = 9; // 9 inattention items, 9 hyperactivity/impulsivity items

const BADGE: Record<"high" | "moderate" | "low", string> = {
  high: "bg-high-soft text-high",
  moderate: "bg-moderate-soft text-moderate",
  low: "bg-low-soft text-low",
};

const REC_STYLE: Record<"high" | "moderate" | "info", { box: string; icon: string }> = {
  high: { box: "border-high/20 bg-high-soft", icon: "text-high" },
  moderate: { box: "border-moderate/20 bg-moderate-soft", icon: "text-moderate" },
  info: { box: "border-primary/20 bg-primary-tint", icon: "text-primary" },
};

export function Results({
  result,
  onRestart,
}: {
  result: ScoreResult;
  onRestart: () => void;
}) {
  const copy = LEVEL_COPY[result.level];
  const recommendations = buildRecommendations(result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
    >
      {/* Headline verdict */}
      <div className="border-b border-line p-6 sm:p-8">
        <h3 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Rezultatul testului ASRS v1.1
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold", BADGE[copy.tone])}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {copy.category}
          </span>
          <span className="tabular text-sm text-ink-faint">
            Partea A: {result.partAScore}/{PART_A_COUNT}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
          {copy.description}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
        <div className="space-y-5">
          <ScoreBar
            label="Partea A — screening (Întrebările 1-6)"
            value={result.partAScore}
            max={PART_A_COUNT}
            tone={copy.tone}
            threshold={PART_A_POSITIVE_CUTOFF}
            sublabel={partAInterpretation(result.partAScore)}
          />
          <ScoreBar
            label="Partea B — suplimentar (Întrebările 7-18)"
            value={result.partBScore}
            max={PART_B_COUNT}
            tone="info"
            sublabel={partBInterpretation(result.partBScore)}
          />
        </div>

        <div className="space-y-5 rounded-xl bg-surface-2 p-5">
          <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
            Pe domenii de simptome
          </p>
          <ScoreBar label="Inatenție" value={result.inattentionScore} max={DOMAIN_MAX} tone="info" />
          <ScoreBar label="Hiperactivitate-impulsivitate" value={result.hyperactivityScore} max={DOMAIN_MAX} tone="info" />
        </div>
      </div>

      {/* General interpretation */}
      <div className="px-6 sm:px-8">
        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary-tint p-5">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 16v-5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Interpretarea rezultatelor. </span>
            {GENERAL_INTERPRETATION}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3 p-6 sm:p-8">
        <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
          Recomandări
        </p>
        {recommendations.map((rec, i) => {
          const style = REC_STYLE[rec.tone];
          return (
            <div key={i} className={cn("flex items-start gap-3 rounded-xl border p-4", style.box)}>
              <svg viewBox="0 0 24 24" className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} fill="none" aria-hidden="true">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <p className="text-sm leading-relaxed text-ink-soft">
                {rec.text}
                {rec.href && (
                  <>
                    {" "}
                    <a
                      href={rec.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 align-[-0.18em] font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {rec.brand && <BrandLogo brand={rec.brand} size={16} decorative />}
                      {rec.linkLabel}
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          );
        })}

        <div className="pt-3">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M15.5 8a5.5 5.5 0 10.4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Începe un test nou
          </button>
        </div>
      </div>
    </motion.div>
  );
}
