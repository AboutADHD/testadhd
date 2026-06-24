import type { SVGProps } from "react";

/**
 * Shared inline icon set. Stroke-based, 24×24, currentColor — matches the
 * hand-rolled SVGs already used across the sections. All icons are decorative by
 * default (`aria-hidden`); pass `aria-hidden={false}` + a label only when an icon
 * is the sole content of an interactive control without visible text.
 *
 * Server components (no hooks) so they compose into RSC sections freely.
 */
type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/** Forward arrow — used on the primary "Începe testul" / link CTAs. */
export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** Play triangle — "start the test" affordance. */
export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Question mark in a circle — "Cum funcționează?" / help. */
export function IconHelp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.7 2.3-2.7 4" />
      <path d="M12 17.4h.01" />
    </svg>
  );
}

/** Info circle — the "Despre test" section + general notes. */
export function IconInfo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" />
    </svg>
  );
}

/** Clipboard with a check — the questionnaire / test section. */
export function IconClipboard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
      <path d="M8 6H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  );
}

/** Sliders / scoring — "Structură & scoring". */
export function IconScale(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Shield with a check — validity / confidentiality. */
export function IconShieldCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/** Download arrow into a tray. */
export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  );
}

/** Compass — "Mergi mai departe" / resources. */
export function IconCompass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

/** Speech bubble with a question — FAQ. */
export function IconChatQuestion(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M10.4 8.6a1.8 1.8 0 0 1 3.4.7c0 1.2-1.8 1.5-1.8 2.6" />
      <path d="M12 14.2h.01" />
    </svg>
  );
}

/** Clock — time estimate. */
export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** Lock — privacy / confidential. */
export function IconLock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </svg>
  );
}

/** Check mark — trust list bullets. */
export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5l4.2 4.2L19 7" strokeWidth={2.2} />
    </svg>
  );
}

/** Spark — small signature accent. */
export function IconSpark(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Restart / circular arrow. */
export function IconRestart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15.5 8a5.5 5.5 0 1 0 .4 3" />
      <path d="M16 4v4h-4" />
    </svg>
  );
}
