import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SECTIONS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-20">
      <div className="w-full max-w-md text-center">
        <BrandMark className="mx-auto h-12 w-12" />
        <p className="tabular mt-6 text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Eroare 404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Pagina nu a fost găsită</h1>
        <p className="mt-3 text-ink-soft">
          Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Înapoi la pagina principală
          </Link>
          <Link
            href={`/#${SECTIONS.test}`}
            className="rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
          >
            Începe testul ADHD
          </Link>
        </div>
      </div>
    </main>
  );
}
