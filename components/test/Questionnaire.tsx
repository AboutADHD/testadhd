"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ASRS_QUESTIONS,
  PART_A_COUNT,
  TOTAL_QUESTIONS,
  type AnswerMap,
} from "@/lib/asrs";
import { calculateScores, type ScoreResult } from "@/lib/scoring";
import { progressMessage } from "@/lib/content";
import { QuestionCard } from "./QuestionCard";
import { ProgressTracker } from "./ProgressTracker";
import { Results } from "./Results";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function scrollToQuestion(num: number) {
  const el = document.getElementById(`q-${num}`);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function Questionnaire() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const answeredCount = useMemo(
    () => ASRS_QUESTIONS.filter((q) => answers[q.number] !== undefined).length,
    [answers],
  );
  const partAAnswered = useMemo(
    () => ASRS_QUESTIONS.filter((q) => q.part === "A" && answers[q.number] !== undefined).length,
    [answers],
  );
  const partBAnswered = answeredCount - partAAnswered;
  const percent = (answeredCount / TOTAL_QUESTIONS) * 100;
  const message = progressMessage(percent, partAAnswered === PART_A_COUNT);

  const handleSelect = useCallback(
    (num: number, idx: number) => {
      setAnswers((prev) => {
        const next = { ...prev, [num]: idx };
        // Gentle auto-advance to the next still-unanswered item below.
        if (!submitted) {
          const upcoming = ASRS_QUESTIONS.find(
            (q) => q.number > num && next[q.number] === undefined,
          );
          if (upcoming) {
            window.setTimeout(() => scrollToQuestion(upcoming.number), 220);
          }
        }
        return next;
      });
      setFlagged((prev) => prev.filter((n) => n !== num));
    },
    [submitted],
  );

  const handleSubmit = useCallback(() => {
    const missing = ASRS_QUESTIONS.filter((q) => answers[q.number] === undefined).map(
      (q) => q.number,
    );
    if (missing.length > 0) {
      setFlagged(missing);
      const first = missing[0];
      if (first !== undefined) scrollToQuestion(first);
      return;
    }
    setResult(calculateScores(answers));
    setFlagged([]);
    setSubmitted(true);
  }, [answers]);

  useEffect(() => {
    if (submitted && result) {
      const id = window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }, 80);
      return () => window.clearTimeout(id);
    }
  }, [submitted, result]);

  const confirmRestart = useCallback(() => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setFlagged([]);
    setShowConfirm(false);
    window.setTimeout(() => scrollToQuestion(1), 60);
  }, []);

  return (
    <div>
      {!submitted && (
        <ProgressTracker
          answered={answeredCount}
          partAAnswered={partAAnswered}
          partBAnswered={partBAnswered}
          message={message}
        />
      )}

      <AnimatePresence>
        {flagged.length > 0 && !submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5" role="alert">
              <p className="font-semibold text-ink">Te rugăm să răspunzi la toate întrebările.</p>
              <p className="mt-1 text-sm text-ink-soft">
                Întrebări fără răspuns:{" "}
                {flagged.map((n, i) => (
                  <span key={n}>
                    <button
                      type="button"
                      onClick={() => scrollToQuestion(n)}
                      className="tabular font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      {n}
                    </button>
                    {i < flagged.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {ASRS_QUESTIONS.map((q) => (
          <QuestionCard
            key={q.number}
            question={q}
            selected={answers[q.number]}
            onSelect={handleSelect}
            flagged={flagged.includes(q.number)}
            disabled={submitted}
          />
        ))}
      </div>

      {!submitted && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#6d67f0] px-8 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Calculează scorul
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="tabular text-xs text-ink-faint">
            {answeredCount}/{TOTAL_QUESTIONS} completate
          </p>
        </div>
      )}

      {submitted && result && (
        <div ref={resultsRef} className="mt-8 scroll-mt-24">
          <Results result={result} onRestart={() => setShowConfirm(true)} />
        </div>
      )}

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restart-title"
          >
            <button
              type="button"
              aria-label="Închide"
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-lift"
            >
              <h3 id="restart-title" className="text-lg font-bold text-ink">
                Începi un test nou?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Toate răspunsurile și scorul actual vor fi șterse. Această acțiune nu
                poate fi anulată.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={confirmRestart}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Da, începe din nou
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
