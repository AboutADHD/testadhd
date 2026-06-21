import { Section } from "./Section";
import { Reveal } from "./Reveal";
import {
  REFERENCES,
  SECTIONS,
  VALIDITY_INTRO,
  VALIDITY_NOTE,
  VALIDITY_ROWS,
} from "@/lib/content";

export function ValiditySection() {
  return (
    <Section
      id={SECTIONS.validity}
      eyebrow="Validitate"
      title="Cât de precis este testul"
      lead={VALIDITY_INTRO}
    >
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th scope="col" className="px-4 py-3 font-semibold text-ink">Măsurătoare</th>
                <th scope="col" className="px-4 py-3 text-right font-mono text-xs font-medium uppercase tracking-wider text-ink-soft">6 întrebări</th>
                <th scope="col" className="px-4 py-3 text-right font-mono text-xs font-medium uppercase tracking-wider text-ink-soft">18 întrebări</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {VALIDITY_ROWS.map((row) => (
                <tr key={row.measure} className="transition-colors hover:bg-surface-2">
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    <span title={row.tooltip} className="cursor-help decoration-line-strong decoration-dotted underline-offset-4 [text-decoration-line:underline]">
                      {row.measure}
                    </span>
                  </th>
                  <td className="tabular px-4 py-3 text-right font-semibold text-ink">{row.sixItems}</td>
                  <td className="tabular px-4 py-3 text-right text-ink-soft">{row.eighteenItems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-5 rounded-2xl border border-line bg-surface-2 p-5 text-sm leading-relaxed text-ink-soft">
          {VALIDITY_NOTE}
        </p>
      </Reveal>

      <Reveal delay={0.12}>
        <details className="group mt-5 rounded-2xl border border-line bg-surface shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold text-ink">
            Referințe bibliografice
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-ink-faint transition-transform group-open:rotate-180" fill="none" aria-hidden="true">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ol className="space-y-3 border-t border-line px-6 py-5 text-sm">
            {REFERENCES.map((ref, i) => (
              <li key={ref.href} className="flex gap-3 text-ink-soft">
                <span className="tabular shrink-0 font-semibold text-primary">{i + 1}.</span>
                <span>
                  {ref.title}{" "}
                  <span className="text-ink-faint">— {ref.authors}.</span>{" "}
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    sursă
                  </a>
                </span>
              </li>
            ))}
          </ol>
        </details>
      </Reveal>
    </Section>
  );
}
