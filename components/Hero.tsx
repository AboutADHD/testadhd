import { SECTIONS } from "@/lib/content";
import { SITE } from "@/lib/site";

const TRUST = [
  { label: "Gratuit" },
  { label: `~${SITE.estimatedMinutes} minute` },
  { label: "18 întrebări" },
  { label: "100% confidențial" },
];

/**
 * Hero — the LCP surface and the first thing every visitor sees.
 *
 * The entrance is a *pure-CSS* staggered rise (`.hero-rise` in globals.css),
 * deliberately NOT a `motion` client animation. Two reasons:
 *
 *  1. Robustness: a CSS animation runs even if the page's JavaScript never
 *     hydrates, is deferred by a proxy, or a sibling island crashes. A
 *     `motion` entrance ships `opacity:0` in the SSR HTML and only reveals on
 *     the client — so any JS failure leaves the headline invisible. The LCP
 *     element must never depend on JS to become visible.
 *  2. Performance: keeping the Hero server-rendered drops a client island and
 *     removes JS from the critical path of first paint.
 *
 * Reduced-motion is honoured in globals.css (the rise collapses to an instant,
 * movement-free reveal), so this stays a Server Component with no hooks.
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

      <div className="mx-auto max-w-5xl px-5 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <p className="hero-rise mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          ASRS v1.1 · Scala OMS de autoevaluare
        </p>

        <h1
          className="hero-rise max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
          style={{ animationDelay: "0.05s" }}
        >
          Test ADHD pentru adulți,
          <span className="text-primary"> în câteva minute.</span>
        </h1>

        <p
          className="hero-rise mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl"
          style={{ animationDelay: "0.12s" }}
        >
          Răspunde la 18 întrebări validate de Organizația Mondială a Sănătății și
          află dacă simptomele tale merită o evaluare de specialitate. Nimic nu se
          salvează — totul rămâne în browserul tău.
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
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none">
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={`#${SECTIONS.about}`}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
          >
            Cum funcționează
          </a>
        </div>

        <ul
          className="hero-rise mt-10 flex flex-wrap gap-x-6 gap-y-3"
          style={{ animationDelay: "0.24s" }}
        >
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-low" fill="none" aria-hidden="true">
                <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
