"use client";

import { RESPONSE_OPTIONS, type AsrsQuestion } from "@/lib/asrs";
import { cn } from "@/lib/cn";

export function QuestionCard({
  question,
  selected,
  onSelect,
  flagged,
  disabled,
}: {
  question: AsrsQuestion;
  selected: number | undefined;
  onSelect: (questionNumber: number, responseIndex: number) => void;
  flagged: boolean;
  disabled: boolean;
}) {
  const answered = selected !== undefined;

  return (
    <fieldset
      id={`q-${question.number}`}
      className={cn(
        "scroll-mt-40 rounded-2xl border bg-surface p-5 shadow-card transition-colors sm:p-6",
        flagged ? "border-accent ring-1 ring-accent" : "border-line",
      )}
    >
      <legend className="contents">
        <div className="mb-4 flex items-start gap-3">
          <span
            className={cn(
              "tabular grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-semibold transition-colors",
              answered ? "bg-primary text-white" : "bg-primary-soft text-primary",
            )}
            aria-hidden="true"
          >
            {answered ? (
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              question.number
            )}
          </span>
          <p className="pt-0.5 text-base font-medium leading-snug text-ink sm:text-lg">
            <span className="sr-only">Întrebarea {question.number}. </span>
            {question.text}
          </p>
        </div>
      </legend>

      <div className="grid gap-2">
        {RESPONSE_OPTIONS.map((option) => (
          <label
            key={option.index}
            className={cn(
              "relative flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-all",
              "hover:border-primary/40 hover:bg-primary-tint",
              "has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:checked]:ring-1 has-[:checked]:ring-primary",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1",
              disabled && "cursor-default opacity-70",
            )}
          >
            <input
              type="radio"
              name={`q-${question.number}`}
              value={option.index}
              checked={selected === option.index}
              onChange={() => onSelect(question.number, option.index)}
              disabled={disabled}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-line-strong transition-colors peer-checked:border-primary"
            >
              <span className="h-2.5 w-2.5 scale-0 rounded-full bg-primary transition-transform duration-200 peer-checked:scale-100" />
            </span>
            <span className="flex flex-1 flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-ink">{option.label}</span>
              <span className="text-sm text-ink-faint">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
