import { CONFIDENTIAL_BANNER } from "@/lib/content";

export function ConfidentialBanner() {
  return (
    <div className="border-y border-line bg-low-soft/60">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2.5 px-5 py-3 text-center sm:px-6">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-low" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-medium text-low">{CONFIDENTIAL_BANNER}</p>
      </div>
    </div>
  );
}
