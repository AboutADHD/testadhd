import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { RESOURCES } from "@/lib/site";

const FILES = [
  {
    title: "ASRS v1.1 Original (APA)",
    description: "Versiunea oficială în limba engleză.",
    href: RESOURCES.apaPdf,
    external: true,
  },
  {
    title: "ASRS v1.1 — Traducere română",
    description: "Scala de autoevaluare în limba română (PDF).",
    href: RESOURCES.romanianPdf,
    external: false,
  },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Downloads() {
  return (
    <Section
      eyebrow="Resurse"
      title="Descarcă scala ASRS v1.1"
      lead="Explorează scala originală sau traducerea în română pentru mai multe detalii."
      className="bg-surface-2"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FILES.map((file, i) => (
          <Reveal key={file.href} delay={i * 0.06}>
            <a
              href={file.href}
              target="_blank"
              rel="noopener noreferrer"
              {...(file.external ? {} : { download: true })}
              className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft transition-colors group-hover:bg-primary/15">
                <DownloadIcon />
              </span>
              <span>
                <span className="block font-semibold text-ink">{file.title}</span>
                <span className="block text-sm text-ink-soft">{file.description}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
