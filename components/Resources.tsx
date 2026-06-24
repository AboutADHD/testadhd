import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { BrandLogo } from "./BrandLogo";
import { RESOURCE_CARDS, type ResourceCard } from "@/lib/content";
import { IconCompass } from "./icons";

// Coral --color-accent is reserved for the primary CTA + signature moments, so
// the three resource kinds tone with the indigo/teal system instead. The
// `community` card previously leaked coral here.
const TONE: Record<ResourceCard["kind"], { dot: string; chip: string }> = {
  educational: { dot: "bg-primary", chip: "text-primary" },
  clinical: { dot: "bg-low", chip: "text-low" },
  community: { dot: "bg-primary", chip: "text-primary" },
};

export function Resources() {
  return (
    <Section
      eyebrow="Mergi mai departe"
      icon={<IconCompass className="h-3.5 w-3.5" />}
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
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="mb-4 flex items-center">
                {card.brand ? (
                  <BrandLogo
                    brand={card.brand}
                    size={40}
                    decorative
                    className="rounded-xl ring-1 ring-line transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </span>
              <h3 className="text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {card.description}
              </p>
              <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${TONE[card.kind].chip}`}>
                {card.brand && <BrandLogo brand={card.brand} size={16} decorative />}
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
