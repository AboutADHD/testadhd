import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

/**
 * Standard section shell: optional eyebrow (with a small role icon), display
 * heading and lead, with a consistent reveal. Lives in the fluid `.shell` so it
 * fills the viewport; the header text keeps a readable measure of its own.
 */
export function Section({
  id,
  eyebrow,
  icon,
  title,
  lead,
  children,
  className,
  contentClassName,
}: {
  id?: string;
  eyebrow?: string;
  /** Small role icon shown beside the eyebrow (decorative — aria-hidden). */
  icon?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-20", className)}>
      <div className="shell">
        {(eyebrow || title || lead) && (
          <Reveal className="mb-10 measure-wide">
            {eyebrow && (
              <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {icon && (
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 place-items-center rounded-md bg-primary-soft text-primary"
                  >
                    {icon}
                  </span>
                )}
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {title}
              </h2>
            )}
            {lead && (
              <p className="mt-4 measure text-pretty text-lg leading-relaxed text-ink-soft">
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
