"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ASRS_QUESTIONS,
  PART_A_COUNT,
  TOTAL_QUESTIONS,
  type AnswerMap,
} from "@/lib/asrs";
import { LEVEL_COPY, calculateScores, type ScoreResult } from "@/lib/scoring";
import { progressMessage } from "@/lib/content";
import { QuestionCard } from "./QuestionCard";
import { ProgressTracker } from "./ProgressTracker";
import { Results } from "./Results";

/**
 * Auto-advance / jump scrolling uses a hand-rolled rAF glide rather than
 * `scrollIntoView({behavior})` for two reasons:
 *
 *  1. A *deliberately slow, eased* scroll (~620ms) reads as "moving you to the
 *     next question" — an instant jump is disorienting. We drive it even when
 *     the OS prefers reduced motion: here the movement is a small, purposeful
 *     reorientation that aids comprehension, not decoration. (Decorative motion
 *     elsewhere still honours reduced motion via globals.css.)
 *  2. `html { scroll-behavior: smooth }` (and its reduced-motion `auto` switch)
 *     would otherwise override or fight the animation; we pin it to `auto` for
 *     the duration so our easing is the single source of truth.
 */
const SCROLL_MS = 620;
let scrollRAF = 0;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateScrollTo(targetY: number, duration = SCROLL_MS) {
  if (typeof window === "undefined") return;
  const html = document.documentElement;
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  if (scrollRAF) cancelAnimationFrame(scrollRAF);
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto"; // don't let CSS smooth double-animate
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    if (t < 1) {
      scrollRAF = requestAnimationFrame(step);
    } else {
      scrollRAF = 0;
      html.style.scrollBehavior = prevBehavior;
    }
  };
  scrollRAF = requestAnimationFrame(step);
}

/** Smoothly glide so `el` sits centred (or just below the sticky header for
 *  `start`) in the viewport. */
function scrollToEl(el: Element | null, block: "center" | "start" = "center") {
  if (!el || typeof window === "undefined") return;
  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const target =
    block === "center"
      ? absoluteTop - Math.max(0, (window.innerHeight - rect.height) / 2)
      : absoluteTop - 88; // clear the sticky header for top-aligned targets
  animateScrollTo(Math.max(0, Math.min(target, maxY)));
}

function scrollToQuestion(num: number) {
  scrollToEl(document.getElementById(`q-${num}`));
}

/** The next item to advance to after answering `num`: the first unanswered
 *  below it, else the first unanswered anywhere, else null (everything done). */
function nextUnanswered(num: number, answers: AnswerMap): number | null {
  const below = ASRS_QUESTIONS.find(
    (q) => q.number > num && answers[q.number] === undefined,
  );
  if (below) return below.number;
  const any = ASRS_QUESTIONS.find((q) => answers[q.number] === undefined);
  return any ? any.number : null;
}

export function Questionnaire() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [flagged, setFlagged] = useState<number[]>([]);
  // The question the auto-advance has moved the user to ("you're here now"
  // highlight). Starts on Q1 as a gentle "start here" cue.
  const [activeQuestion, setActiveQuestion] = useState<number | null>(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restartTriggerRef = useRef<HTMLElement | null>(null);
  // Tracks whether the most recent interaction came from the keyboard, so the
  // gentle auto-advance scroll only fires for pointer users (scrolling the
  // just-focused radio out of view would disorient keyboard/SR users — WCAG 3.2.5).
  const keyboardRef = useRef(false);

  useEffect(() => {
    const onKey = () => {
      keyboardRef.current = true;
    };
    const onPointer = () => {
      keyboardRef.current = false;
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);

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

  // Auto-advance target computed (purely) inside the answer updater and consumed
  // by the effect below. A ref — not state — so `handleSelect` stays a stable
  // callback and the 17 untouched QuestionCards keep bailing out of re-render.
  // `undefined` = no advance this change; `null` = all answered; number = target.
  const advanceRef = useRef<number | null | undefined>(undefined);

  const handleSelect = useCallback(
    (num: number, idx: number) => {
      setAnswers((prev) => {
        const wasUnanswered = prev[num] === undefined;
        const next = { ...prev, [num]: idx };
        // Advance only on a *first* answer (so correcting an earlier item never
        // yanks the page) and only for pointer input (auto-scrolling a keyboard
        // user pulls their focused radio off-screen — WCAG 2.4.7 / 3.2.2).
        advanceRef.current =
          !submitted && wasUnanswered && !keyboardRef.current
            ? nextUnanswered(num, next)
            : undefined;
        return next;
      });
      // Clear this item's flag, but keep the same array reference when it was not
      // flagged (the common case) so memoised QuestionCards can bail out.
      setFlagged((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : prev));
    },
    [submitted],
  );

  // Run the auto-advance once the answer has committed: highlight the next
  // unanswered question ("you're here now") and gently scroll it to centre.
  // Restored to fire under reduced motion too (scrollToEl falls back to an
  // instant jump) — the previous build skipped it entirely for reduced-motion
  // users, which is much of this audience.
  useEffect(() => {
    const target = advanceRef.current;
    if (target === undefined) return;
    advanceRef.current = undefined;
    setActiveQuestion(target);
    const id = window.setTimeout(() => {
      if (target !== null) {
        scrollToQuestion(target);
      } else {
        scrollToEl(document.getElementById("submit-scores"));
      }
    }, 220);
    return () => window.clearTimeout(id);
  }, [answers]);

  const handleSubmit = useCallback(() => {
    const missing = ASRS_QUESTIONS.filter((q) => answers[q.number] === undefined).map(
      (q) => q.number,
    );
    if (missing.length > 0) {
      setFlagged(missing);
      const first = missing[0];
      if (first !== undefined) {
        scrollToQuestion(first);
        // Move focus into the first unanswered group so keyboard and
        // screen-reader users are taken to the problem, not left on the now
        // out-of-view submit button. The per-question error (aria-describedby)
        // is announced with it.
        window.setTimeout(() => {
          document
            .getElementById(`q-${first}`)
            ?.querySelector<HTMLInputElement>('input[type="radio"]')
            ?.focus({ preventScroll: true });
        }, 60);
      }
      return;
    }
    setResult(calculateScores(answers));
    setFlagged([]);
    setActiveQuestion(null);
    setSubmitted(true);
  }, [answers]);

  useEffect(() => {
    if (submitted && result) {
      const id = window.setTimeout(() => {
        const node = resultsRef.current;
        if (!node) return;
        // Move focus to the results region so keyboard and screen-reader users
        // are taken straight to the verdict (the region's aria-label is
        // announced); the visually-hidden live region below voices the score.
        node.focus({ preventScroll: true });
        scrollToEl(node, "start");
      }, 80);
      return () => window.clearTimeout(id);
    }
  }, [submitted, result]);

  const confirmRestart = useCallback(() => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setFlagged([]);
    setActiveQuestion(1);
    setShowConfirm(false);
    // The dialog's trigger lived inside the now-unmounting Results, so restoring
    // focus to it would drop focus on <body>. Land the user on the fresh first
    // question instead.
    window.setTimeout(() => {
      scrollToQuestion(1);
      document
        .getElementById("q-1")
        ?.querySelector<HTMLInputElement>('input[type="radio"]')
        ?.focus({ preventScroll: true });
    }, 60);
  }, []);

  // Focus management for the restart confirmation dialog: move focus into it on
  // open, trap Tab/Shift+Tab inside it, close on Escape, and restore focus to
  // the triggering control on close. (A native <dialog> would give this for
  // free, but the entry/exit animation needs the AnimatePresence wrapper.)
  useEffect(() => {
    if (!showConfirm) return;
    restartTriggerRef.current = document.activeElement as HTMLElement | null;
    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    getFocusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowConfirm(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restartTriggerRef.current?.focus();
    };
  }, [showConfirm]);

  const questionCards = ASRS_QUESTIONS.map((q) => (
    <QuestionCard
      key={q.number}
      question={q}
      selected={answers[q.number]}
      onSelect={handleSelect}
      flagged={flagged.includes(q.number)}
      active={!submitted && activeQuestion === q.number}
      disabled={submitted}
    />
  ));

  return (
    <div>
      {submitted ? (
        // After submit: the (disabled) questions read at a comfortable measure
        // above the result (no rail, so they no longer need the full width).
        <div className="max-w-5xl space-y-4">{questionCards}</div>
      ) : (
        // Active test: progress rail beside the questions on desktop; on mobile
        // the rail is a sticky bar that stacks above them (single column).
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
          <ProgressTracker
            answered={answeredCount}
            partAAnswered={partAAnswered}
            partBAnswered={partBAnswered}
            message={message}
          />

          <div>
            <AnimatePresence>
              {flagged.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5" role="alert">
                    <p className="font-semibold text-ink">Te rugăm să răspunzi la toate întrebările.</p>
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
                      <span className="mr-0.5">Întrebări fără răspuns:</span>
                      {flagged.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => scrollToQuestion(n)}
                          aria-label={`Mergi la întrebarea ${n}`}
                          className="tabular inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-accent/40 bg-surface px-1.5 font-semibold text-accent transition-colors hover:bg-accent/10"
                        >
                          {n}
                        </button>
                      ))}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">{questionCards}</div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                id="submit-scores"
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
          </div>
        </div>
      )}

      {/* Visually-hidden live region: voices the verdict for screen-reader users
          the moment the score is computed, independent of focus handling. */}
      <div className="sr-only" role="status" aria-live="polite">
        {submitted && result
          ? `Rezultatul testului: ${LEVEL_COPY[result.level].category}. Partea A: ${result.partAScore} din ${PART_A_COUNT}.`
          : ""}
      </div>

      {submitted && result && (
        <div
          ref={resultsRef}
          tabIndex={-1}
          role="region"
          aria-label="Rezultatul testului ASRS v1.1"
          className="mt-8 max-w-5xl scroll-mt-24 outline-none"
        >
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
              ref={dialogRef}
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
