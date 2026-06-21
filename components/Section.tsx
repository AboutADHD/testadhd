import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

/**
 * Standard section shell: optional mono eyebrow, display heading and lead, with
 * a consistent reveal. The eyebrow encodes the section's role, not decoration.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  contentClassName,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
        {(eyebrow || title || lead) && (
          <Reveal className="mb-10 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {title}
              </h2>
            )}
            {lead && (
              <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
                {lead}
              </p>
            )}
          </Reveal>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}
