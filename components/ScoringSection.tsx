import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { COMPONENTS, SCORING_TABLES, SECTIONS } from "@/lib/content";
import { SCORE_RANGES } from "@/lib/scoring";

export function ScoringSection() {
  return (
    <Section
      id={SECTIONS.scoring}
      eyebrow="Structură & scoring"
      title="Ce evaluează și cum se calculează scorul"
      className="bg-surface-2"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* What it measures */}
        <Reveal>
          <div className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="text-xl font-bold text-ink">Ce evaluează testul</h3>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-ink">{COMPONENTS.inattention.label}</dt>
                <dd className="mt-0.5 text-sm text-ink-soft">
                  <span className="tabular text-primary">{COMPONENTS.inattention.items}</span>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">{COMPONENTS.hyperactivity.label}</dt>
                <dd className="mt-0.5 text-sm text-ink-soft">
                  <span className="tabular text-primary">{COMPONENTS.hyperactivity.items}</span>
                </dd>
              </div>
            </dl>
            <div className="mt-auto flex items-start gap-3 rounded-xl bg-moderate-soft p-4">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-moderate" fill="none" aria-hidden="true">
                <path d="M12 3l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <p className="text-sm leading-relaxed text-ink-soft">{COMPONENTS.note}</p>
            </div>
          </div>
        </Reveal>

        {/* Scoring system */}
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="text-xl font-bold text-ink">Sistemul de scoring</h3>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-line bg-surface-2 px-4 py-3">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">Interval</p>
                <p className="tabular mt-1 text-lg font-semibold text-ink">
                  0–{SCORE_RANGES.partA}
                  <span className="text-sm font-normal text-ink-faint"> (0–{SCORE_RANGES.total} complet)</span>
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-tint px-4 py-3">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-primary">Prag pozitiv</p>
                <p className="tabular mt-1 text-lg font-semibold text-primary">
                  {SCORE_RANGES.partAPositiveCutoff}+ <span className="text-sm font-normal">(Partea A)</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {SCORING_TABLES.map((table) => (
                <div key={table.caption} className="overflow-hidden rounded-xl border border-line">
                  <p className="bg-surface-2 px-4 py-2 text-xs font-medium text-ink-soft">
                    {table.caption}
                  </p>
                  <div className="grid grid-cols-5 divide-x divide-line border-t border-line text-center">
                    {table.rows.map((row) => (
                      <div key={row.option} className="px-1 py-2">
                        <p className="text-[0.68rem] leading-tight text-ink-faint">{row.option}</p>
                        <p
                          className={
                            row.score === 1
                              ? "tabular mt-1 text-sm font-bold text-primary"
                              : "tabular mt-1 text-sm font-semibold text-line-strong"
                          }
                        >
                          {row.score}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
