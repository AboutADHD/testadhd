import { BrandMark } from "./BrandMark";
import { BrandLogo } from "./BrandLogo";
import { NetworkGallery } from "./NetworkGallery";
import { WHO_COPYRIGHT } from "@/lib/content";
import { RESOURCES, SITE, type BrandKey } from "@/lib/site";

const LINKS: { label: string; href: string; brand?: BrandKey }[] = [
  { label: "despreadhd.ro", href: RESOURCES.despreadhd, brand: "despreadhd" },
  { label: "doctoradhd.com", href: RESOURCES.doctoradhd, brand: "doctoradhd" },
  { label: "Comunitate Facebook", href: RESOURCES.facebookGroup },
  { label: "Cod sursă (GitHub)", href: SITE.githubRepo },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] lg:max-w-5xl">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-7 w-7" />
              <span className="font-display text-base font-bold text-ink">
                Test<span className="text-primary">ADHD</span>
                <span className="text-ink-faint">.ro</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              Screening gratuit și confidențial pentru ADHD la adulți, folosind
              scala ASRS v1.1 a Organizației Mondiale a Sănătății. Nu colectăm
              date, nu folosim cookie-uri și nu stocăm rezultatele.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-low-soft px-3.5 py-1.5 text-xs font-medium text-low">
              <span className="h-1.5 w-1.5 rounded-full bg-low" />
              100% confidențial · totul rămâne în browserul tău
            </div>
          </div>

          <nav aria-label="Resurse" className="text-sm">
            <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Resurse
            </p>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-soft underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {link.brand && <BrandLogo brand={link.brand} size={16} decorative />}
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-ink-soft underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {SITE.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <NetworkGallery />

        <div className="mt-12 space-y-4 border-t border-line pt-8 text-xs leading-relaxed text-ink-faint lg:max-w-5xl">
          <p>
            <span className="font-semibold text-ink-soft">Drepturi de autor (OMS): </span>
            {WHO_COPYRIGHT} Acest test este destinat exclusiv în scop informativ (de
            screening) și nu trebuie utilizat ca instrument de diagnostic.
          </p>
          <p>
            Conținutul este distribuit sub licența{" "}
            <a
              href={RESOURCES.ccLicense}
              target="_blank"
              rel="noopener noreferrer license"
              className="font-medium text-ink-soft underline-offset-4 hover:text-primary hover:underline"
            >
              Creative Commons Attribution 4.0 International (CC BY 4.0)
            </a>
            .
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5">
            <span>© {year} {SITE.name}.</span>
            <span>Construit cu grijă (și Lisdexamfetamină) de</span>
            <a
              href={SITE.author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft underline-offset-4 hover:text-primary hover:underline"
            >
              {SITE.author.name}
            </a>
            <span>·</span>
            <a
              href={RESOURCES.lisdex}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft underline-offset-4 hover:text-primary hover:underline"
            >
              sos.lisdex.ro
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
