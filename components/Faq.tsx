import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { FAQ, SECTIONS } from "@/lib/content";
import { IconChatQuestion } from "./icons";

/**
 * Native <details> accordion — content stays in the DOM (good for SEO + the
 * matching FAQPage structured data) and works without JavaScript.
 */
export function Faq() {
  return (
    <Section
      id={SECTIONS.faq}
      eyebrow="Întrebări frecvente"
      icon={<IconChatQuestion className="h-3.5 w-3.5" />}
      title="Ce ai putea dori să știi despre acest test?"
      className="bg-surface-2"
      contentClassName="max-w-4xl"
    >
      <div className="space-y-3">
        {FAQ.map((item, i) => (
          <Reveal key={item.question} delay={Math.min(i * 0.04, 0.2)}>
            <details className="group rounded-2xl border border-line bg-surface px-5 shadow-card open:border-primary/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink marker:hidden">
                {item.question}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-transform duration-300 group-open:rotate-45">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-10 text-[0.95rem] leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
