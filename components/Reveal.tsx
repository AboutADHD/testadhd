import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Entrance reveal for content blocks — implemented in PURE CSS so a section's
 * visibility never depends on the client JS runtime.
 *
 * This previously used `motion`'s `whileInView`, which server-renders the block
 * at opacity:0 and only reveals it once the client animation fires. That is
 * unreliable: if the reveal JS doesn't run for a block — hydration race, a
 * sibling island throwing, or (the common one) the browser restoring scroll
 * position on reload so the section is already in view at mount and the
 * IntersectionObserver never fires — the section stays frozen invisible. That
 * is exactly the "despre-ASRS / scoring sections don't load" symptom.
 *
 * The CSS `reveal-rise` animation (see app/globals.css) plays on load with
 * `animation-fill-mode: both`, so every block reliably ends at opacity:1
 * regardless of scroll position or JS, and worst-cases to its natural opacity:1
 * if the stylesheet itself fails. Reduced motion collapses it to an instant,
 * movement-free reveal. This is a Server Component (no hooks, no "use client").
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const style = {
    "--reveal-y": `${y}px`,
    ...(delay ? { animationDelay: `${delay}s` } : {}),
  } as CSSProperties;

  return (
    <div className={cn("reveal-rise", className)} style={style}>
      {children}
    </div>
  );
}
