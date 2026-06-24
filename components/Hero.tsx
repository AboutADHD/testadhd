import { SECTIONS } from "@/lib/content";
import { SITE } from "@/lib/site";
import {
  IconArrowRight,
  IconCheck,
  IconClipboard,
  IconHelp,
  IconLock,
  IconScale,
  IconSpark,
} from "./icons";

const TRUST = [
  { label: "Gratuit" },
  { label: `~${SITE.estimatedMinutes} minute` },
  { label: "18 întrebări" },
  { label: "100% confidențial" },
];

const STEPS = [
  {
    icon: IconClipboard,
    title: "Răspunzi la 18 întrebări",
    body: "Întrebări scurte despre ultimele 6 luni. Durează ~" + SITE.estimatedMinutes + " minute.",
  },
  {
    icon: IconScale,
    title: "Scorul se calculează instant",
    body: "Totul se întâmplă local, în browserul tău. Nimic nu pleacă de pe dispozitiv.",
  },
  {
    icon: IconSpark,
    title: "Primești un rezultat explicat",
    body: "Vezi unde te situezi pe scala ASRS și ce pași poți face mai departe.",
  },
];

/**
 * Hero — the LCP surface and the first thing every visitor sees.
 *
 * The entrance is a *pure-CSS* staggered rise (`.hero-rise` in globals.css),
 * deliberately NOT a `motion` client animation, so the LCP headline reveals even
 * if the page JS never hydrates (a CSS animation worst-cases to "visible"). That
 * keeps the Hero a Server Component with no hooks. Reduced motion is honoured in
 * globals.css (the rise collapses to an instant, movement-free reveal).
 *
 * Layout fills the viewport: copy on the left, a "Cum funcționează" step panel on
 * the right that uses the reclaimed width and previews what the secondary CTA
 * explains. Stacks to a single column below `lg`.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient focus aura */}
      <div
        aria-hidden="true"
        className="aura aura-animate pointer-events-none absolute inset-0 -z-10 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line to-transparent"
      />

      <div className="shell pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy column */}
          <div>
            <p className="hero-rise mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              ASRS v1.1 · Scala OMS de autoevaluare
            </p>

            <h1
              className="hero-rise measure-wide text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
              style={{ animationDelay: "0.05s" }}
            >
              Test ADHD pentru adulți,
              <span className="text-primary"> în câteva minute.</span>
            </h1>

            <p
              className="hero-rise measure mt-6 text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl"
              style={{ animationDelay: "0.12s" }}
            >
              Răspunde la 18 întrebări validate de Organizația Mondială a Sănătății și
              află dacă simptomele tale merită o evaluare de specialitate. Nimic nu se
              salvează, totul rămâne în browserul tău.
            </p>

            <div
              className="hero-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.18s" }}
            >
              <a
                href={`#${SECTIONS.test}`}
                className="cta-sheen group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Începe testul
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={`#${SECTIONS.about}`}
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
              >
                <IconHelp className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                Cum funcționează?
              </a>
            </div>

            <ul
              className="hero-rise mt-10 flex flex-wrap gap-x-6 gap-y-3"
              style={{ animationDelay: "0.24s" }}
            >
              {TRUST.map((t) => (
                <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                  <IconCheck className="h-4 w-4 text-low" />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>

          {/* "How it works" panel — uses the width, previews the flow */}
          <div
            className="hero-rise"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative rounded-[1.75rem] border border-line bg-surface/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
              <p className="mb-6 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <IconSpark className="h-4 w-4" />
                Cum funcționează
              </p>
              <ol className="space-y-5">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex gap-4">
                      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Icon className="h-5 w-5" />
                        <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[0.7rem] font-bold text-white">
                          {i + 1}
                        </span>
                      </span>
                      <div className="pt-0.5">
                        <p className="font-semibold text-ink">{step.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-7 flex items-center gap-2 rounded-xl border border-low/20 bg-low-soft/70 px-4 py-3 text-sm font-medium text-low">
                <IconLock className="h-4 w-4 shrink-0" />
                Nimic nu se salvează, totul rămâne pe dispozitivul tău.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
