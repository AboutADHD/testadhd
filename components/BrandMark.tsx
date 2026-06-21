import { cn } from "@/lib/cn";

/**
 * The "focus target" — concentric rings converging on a single coral focal
 * point. The signature mark: attention resolving into focus.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <circle cx="16" cy="16" r="13.25" stroke="var(--color-primary)" strokeWidth="2.4" opacity="0.22" />
      <circle cx="16" cy="16" r="8.25" stroke="var(--color-primary)" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="3.25" fill="var(--color-accent)" />
    </svg>
  );
}
