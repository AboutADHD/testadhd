import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { ABOUT_INTRO, AUDIENCE, INFO_FACTS, SECTIONS } from "@/lib/content";
import { IconInfo } from "./icons";

export function AboutSection() {
  return (
    <Section
      id={SECTIONS.about}
      eyebrow="Despre test"
      icon={<IconInfo className="h-3.5 w-3.5" />}
      title="Ce este Adult ADHD Self-Report Scale (ASRS v1.1)?"
      lead={ABOUT_INTRO}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INFO_FACTS.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {fact.label}
              </p>
              {fact.href ? (
                <a
                  href={fact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-base font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {fact.value}
                </a>
              ) : (
                <p className="mt-2 text-base font-semibold text-ink">{fact.value}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-tint p-5">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 16v-5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Cui se adresează: </span>
            {AUDIENCE}.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
