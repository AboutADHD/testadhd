import type { CSSProperties } from "react";
import { NETWORK_PROJECTS } from "@/lib/network-projects";

// "Din aceeași familie" — footer gallery linking the other 8 free About ADHD tools.
// Whole tile is one dofollow, new-tab backlink (rel="noopener", no nofollow/noreferrer).
// Skinned to TestADHD's own tokens: Sora display, Plex body/mono, surface/line/ink, shadow-card/lift.
export function NetworkGallery() {
  return (
    <section
      aria-label="Alte instrumente gratuite din aceeași familie"
      className="mt-12 border-t border-line pt-8"
    >
      <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
        Din aceeași familie
      </p>
      <h2 className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
        Alte instrumente gratuite pe care le construim
      </h2>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
        Proiecte independente, gratuite și fără reclame — construite de aceiași oameni.
      </p>

      <ul className="mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {NETWORK_PROJECTS.map((p) => (
          <li key={p.key}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener"
              style={{ "--brand": p.color } as CSSProperties}
              aria-label={`${p.name} — ${p.tagline} (se deschide într-o filă nouă)`}
              className="group flex h-full items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] focus-visible:ring-offset-2"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white"
                style={{ borderColor: "color-mix(in srgb, var(--brand) 30%, var(--color-line))" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/network/${p.logo}`}
                  alt=""
                  width={30}
                  height={30}
                  loading="lazy"
                  className="h-[30px] w-[30px] object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words font-display text-[0.95rem] font-semibold text-ink [overflow-wrap:anywhere]">
                  {p.name}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[0.8rem] leading-snug text-ink-soft">
                  {p.tagline}
                </span>
              </span>
              <svg
                className="shrink-0 text-ink-faint transition-[transform,color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--brand)]"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
