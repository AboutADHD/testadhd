import { Reveal } from "../Reveal";
import { Questionnaire } from "./Questionnaire";
import { DISCLAIMER_IMPORTANT, SECTIONS } from "@/lib/content";
import { SITE } from "@/lib/site";

export function TestSection() {
  return (
    <section id={SECTIONS.test} className="scroll-mt-24 bg-surface-2 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <Reveal className="mb-6 max-w-2xl">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Testul
          </p>
          <h2 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Începe testul ASRS v1.1
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            18 întrebări · ~{SITE.estimatedMinutes} minute. Răspunde gândindu-te la
            cum te-ai simțit în ultimele 6 luni.
          </p>
        </Reveal>

        <Reveal className="mb-8">
          <div className="flex items-start gap-3 rounded-2xl border border-moderate/25 bg-moderate-soft p-5">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-moderate" fill="none" aria-hidden="true">
              <path d="M12 3l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Important. </span>
              {DISCLAIMER_IMPORTANT}
            </p>
          </div>
        </Reveal>

        <Questionnaire />
      </div>
    </section>
  );
}
