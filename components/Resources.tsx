import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { RESOURCE_CARDS, type ResourceCard } from "@/lib/content";

const TONE: Record<ResourceCard["kind"], { dot: string; chip: string }> = {
  educational: { dot: "bg-primary", chip: "text-primary" },
  clinical: { dot: "bg-low", chip: "text-low" },
  community: { dot: "bg-accent", chip: "text-accent" },
};

export function Resources() {
  return (
    <Section
      eyebrow="Mergi mai departe"
      title="Informare, evaluare și sprijin"
      lead="Testul este doar primul pas. Iată unde poți afla mai multe și unde poți cere ajutor."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {RESOURCE_CARDS.map((card, i) => (
          <Reveal key={card.href} delay={i * 0.06}>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="mb-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${TONE[card.kind].dot}`} />
              </span>
              <h3 className="text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {card.description}
              </p>
              <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${TONE[card.kind].chip}`}>
                {card.linkLabel}
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                  <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
