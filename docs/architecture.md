# Architecture & Key Patterns

> Reference doc for `CLAUDE.md`. Read on demand when working on the App Router shell,
> SEO/metadata, the design system, components, or the interactive questionnaire.

`testadhd.ro` is a Next.js 16 (App Router, React 19, TypeScript, Tailwind v4) ADHD
screening tool with a Romanian UI. It is RSC-by-default and 100% client-side at runtime —
no backend, no data collection. The page is a single landing page assembled in
`app/page.tsx`; all editorial copy lives in `lib/content.ts` and all URLs/brand in
`lib/site.ts`.

Contents:
- [1. RSC vs client boundary](#1-rsc-vs-client-boundary)
- [2. Design system ("Calm focus")](#2-design-system-calm-focus)
- [3. Shared primitives — Section & Reveal](#3-shared-primitives--section--reveal)
- [4. SEO / metadata & structured data](#4-seo--metadata--structured-data)
- [5. Interactive questionnaire](#5-interactive-questionnaire)
- [6. Icon generation](#6-icon-generation)

---

## 1. RSC vs client boundary

The app is RSC-by-default. Exactly **three** components opt into `"use client"`, only
because they need browser APIs:

- **`Reveal`** (`components/Reveal.tsx`) — needs `motion/react` (`useReducedMotion`,
  `whileInView`/IntersectionObserver).
- **`SiteHeader`** (`components/SiteHeader.tsx`) — needs `useState`/`useEffect`,
  `IntersectionObserver`, `window` scroll listeners (scroll-spy).
- **`Hero`** (`components/Hero.tsx`) — needs `motion/react` for the staggered entrance.

The interactive questionnaire (`components/test/Questionnaire.tsx`) is also a client
component (it holds all state). Everything else (`Section`, `BrandMark`, `JsonLd`,
`SiteFooter`, `ConfidentialBanner`, `AboutSection`, `ScoringSection`, `ValiditySection`,
`Downloads`, `Resources`, `Faq`, `TestSection`) is a Server Component emitting zero
client JS of its own. Keep them server-only (no hooks, no event handlers).

The *interactive-looking* sections — FAQ and validity references — use native
`<details>`/`<summary>`, so they stay RSC, keep content in the DOM (good for SEO + the
matching `FAQPage` JSON-LD), and work with JS disabled. **Don't replace them with
JS-only accordions.** `Section` (server) composes the client `Reveal` via the children
boundary — the standard RSC pattern.

## 2. Design system ("Calm focus")

Tailwind v4, CSS-first. There is **no `tailwind.config.js`** — `app/globals.css` does
`@import "tailwindcss"` then declares one `@theme` block of tokens that Tailwind turns
into utilities. **Use tokens via utilities (`text-ink`, `bg-surface`, `border-line`,
`shadow-card`, `text-primary`, `bg-accent`); never hardcode hex in components.**

- **Fonts** (CSS vars injected by `next/font` on `<html>` in `app/layout.tsx`):
  `--font-display` (Sora) → `font-display`; `--font-sans` (IBM Plex Sans, body default)
  → `font-sans`; `--font-mono` (IBM Plex Mono) → `font-mono`. All loaded with
  `latin` + `latin-ext` subsets (required for Romanian diacritics) and `display:"swap"`.
- **Ink/neutrals:** `--color-ink` (#1a1b2e), `--color-ink-soft` (#4a4d68),
  `--color-ink-faint` (#7a7e99). Surfaces: `--color-canvas` (#f3f5fb page),
  `--color-surface` (#fff cards), `--color-surface-2` (#f7f9fe alt), `--color-line` /
  `--color-line-strong` (borders).
- **Brand indigo:** `--color-primary` (#4b45d6) + `-strong/-soft/-tint`. **Coral spark:**
  `--color-accent` (#f26a4b) + `-strong` — **reserved for the primary CTA / signature
  moments only**; indigo is the default brand colour.
- **Semantic result tones:** `high`/`moderate`/`low` each with a `-soft` background —
  drive the confidential banner (low/green), scoring warnings (moderate), and the
  questionnaire result bands.
- **Radii:** `--radius-xl` (1.25rem) → `rounded-xl`; `--radius-2xl` (1.75rem) →
  `rounded-2xl` (standard card). **Shadows:** `--shadow-card`, `--shadow-lift` (hover),
  `--shadow-accent` (CTA glow). **Easing:** `--ease-out-soft` =
  `cubic-bezier(0.22,1,0.36,1)` — the same curve used in JS transitions.

Base layer: `color-scheme:light`, smooth scroll + `scroll-padding-top:6rem`, body
defaults, `h1–h4` use `font-display` with balanced wrapping, global `:focus-visible`
indigo outline. **`.tabular`** switches to mono + `tabular-nums` — use it for all
numeric/data values (scores, percentages, counts).

**Reduced motion (two layers, both honoured):**
1. **JS:** `Reveal` and `Hero` check `useReducedMotion()`.
2. **CSS:** a global `@media (prefers-reduced-motion: reduce)` block force-clamps every
   `animation/transition-duration` to `0.001ms !important`, disables `.aura-animate`,
   and sets `scroll-behavior:auto`. This neutralizes **all** CSS transitions/keyframes,
   not just `motion/react` ones.

Decorative-only CSS: `.aura` (radial-gradient hero glow, `.aura-animate` = 18s drift),
`.cta-sheen` (5.5s shimmer on the primary CTA) — all `pointer-events:none`/`aria-hidden`.

## 3. Shared primitives — Section & Reveal

These are the load-bearing reused primitives.

**`Section`** (`components/Section.tsx`) — the standard section shell used by AboutSection,
ScoringSection, ValiditySection, Downloads, Resources, Faq:

```
<Section id eyebrow title lead className contentClassName>{children}</Section>
```

Renders `<section id className="scroll-mt-24 …">` with a centered container. When any of
`eyebrow|title|lead` is present it wraps them in a `<Reveal>`: a mono uppercase eyebrow
(`text-primary`), a display `<h2>` (`text-ink`), and a `text-ink-soft` lead. `children`
render below. `scroll-mt-24` complements the global `scroll-padding-top:6rem` so anchored
sections clear the sticky header.

**`Reveal`** (`components/Reveal.tsx`) — the single, uniform entrance animation for
content blocks. Props: `children`, `delay=0`, `y=18`, `className`. Under reduced motion it
returns a **plain `<div className={className}>`** (animation fully removed) — so **the
`className` you pass must lay out correctly without the motion wrapper**. Otherwise it
renders a `motion.div` (`opacity/y` fade-rise, `viewport={{once:true, margin:"-80px"}}`,
`duration:0.6`, ease `[0.22,1,0.36,1]`). Sections stagger child cards via incremental
`delay` (e.g. `delay={i*0.05}`).

**`cn()`** (`lib/cn.ts`) is a naive `filter(Boolean).join(" ")` — **NOT** `clsx`/
`tailwind-merge`. It does not dedupe or resolve conflicting Tailwind classes; source
order decides. Don't pass conflicting utilities expecting a merge.

**Scroll-spy** (`SiteHeader`): on mount, derives section ids from `NAV_ITEMS[].href`
(`lib/content.ts`), observes them with one `IntersectionObserver({rootMargin:"-45% 0px
-50% 0px"})` (a ~5% band near viewport center), and sets `active` on `isIntersecting`.
Caveats: `active` is only *set*, never cleared (last-passed section stays highlighted in
gaps); the desktop nav renders only **`NAV_ITEMS.slice(0,3)`** and there is **no mobile
menu** — extra nav items are silently dropped; the always-visible action is the "Începe
testul" CTA. The skip-link target `#main` (`app/layout.tsx`) requires `id="main"` on the
page wrapper (`app/page.tsx`).

## 4. SEO / metadata & structured data

All crawler-facing output flows from one config module, so brand/URL changes are a single edit.

**Single source of truth — `lib/site.ts`.** Two frozen objects:
- `SITE` — name/shortName/legalName, `url:"https://www.testadhd.ro"` (canonical, **www**),
  `lang`, `locale`/`localeAlternate`, `themeColor:"#4B45D6"`, `email:"contact@aboutadhd.ro"`,
  `twitter`, `author`, `ogImage {url:"/asrs-adhd.jpg", 1200×675}`, `logo` (external
  despreadhd.ro CDN), `title`, `description`, `keywords[]`, `estimatedMinutes:7`.
- `RESOURCES` — outbound links (doctoradhd, despreadhd, facebookGroup, lisdex, ccLicense,
  local `romanianPdf`, external apaPdf, seminalPaper PubMed).

To rebrand/change domain: edit `SITE.url`, `SITE.name`/etc., `SITE.twitter`, `SITE.email`,
`SITE.logo`, `SITE.ogImage`. **Caveat:** OG/Twitter `title`/`description` in
`app/layout.tsx` are **hardcoded inline** (not from `SITE`), as are several name/description
strings in `lib/structured-data.ts`. A URL/domain change is fully covered by `SITE.url`; a
*copy* change is not (three copies of marketing copy exist).

**`app/layout.tsx`** exports static `metadata` and `viewport`:
- `metadataBase: new URL(SITE.url)` resolves relative OG/Twitter image paths absolutely.
  **JSON-LD does not use this.**
- `title: {default, template:"%s | Test ADHD România"}`; child pages set only their leaf title.
- `alternates: {canonical:"/", languages:{ro:"/", "x-default":"/"}}`.
- OpenGraph (`type:website`, hardcoded title/desc, image from `SITE.ogImage`), Twitter
  (`summary_large_image`), `robots` index+follow, `appleWebApp`, `formatDetection`.
- `viewport`: `themeColor:SITE.themeColor`, `colorScheme:"light"`, scale 1–5.
- `RootLayout` renders `<html lang="ro" className={font vars}>`, a skip-link to `#main`,
  then `<JsonLd data={[organizationSchema(), websiteSchema()]} />`, then children.

**JSON-LD injection — `components/JsonLd.tsx`** (Server Component): accepts
`object | object[]`, renders each as `<script type="application/ld+json"
dangerouslySetInnerHTML={JSON.stringify(item)} />`. Safe **only** because every input is a
build/server constant — **never route user input through it.** Split:
- **Site-wide** (`layout.tsx`): `organizationSchema()`, `websiteSchema()`.
- **Page-level** (`page.tsx`): `medicalWebPageSchema()`, `faqSchema()`, `breadcrumbSchema()`.

**The five builders — `lib/structured-data.ts`** (`BASE = SITE.url`). Builders **manually
prefix `BASE`** for absolute URLs because JSON-LD is not `metadataBase`-aware — the one
place absolute URLs are built by hand.
1. `medicalWebPageSchema()` — `@type:["MedicalWebPage","WebApplication"]`; `datePublished`
   hardcoded, **`dateModified: new Date().toISOString()` (recomputed each render/build —
   non-deterministic output)**; free `Offer` (0 RON), MedicalCondition (ADHD), MedicalTest (ASRS).
2. `faqSchema()` — `FAQPage` generated from `FAQ` in `lib/content.ts` (edit content there).
3. `breadcrumbSchema()` — `BreadcrumbList` whose item URLs are `${BASE}/#${SECTIONS.x}`,
   anchors from `SECTIONS` in `lib/content.ts`.
4. `organizationSchema()` / 5. `websiteSchema()` — site identity, `logo:SITE.logo`, contact.
6. `allSchemas()` — returns all five; **exported but currently unused** (a test/snapshot helper).

**Metadata-route convention (replaces static files):** Next compiles these TS files to
crawler endpoints — there is no `public/robots.txt` etc.:
- `app/manifest.ts` → `/manifest.webmanifest` (name/desc from `SITE`, `theme_color`,
  three PNG icons under `/icons/` from `scripts/generate-icons.mjs`).
- `app/robots.ts` → `/robots.txt` (allow-all, sitemap; also a non-standard `host` field).
- `app/sitemap.ts` → `/sitemap.xml` (single entry — one landing page).

**File-based icons:** `app/icon.svg` (gradient ASRS bullseye favicon) and
`app/apple-icon.png` are auto-wired by Next — no manual `<link>` tags. Distinct from the
manifest's `/icons/*.png` PWA icons.

**404 — `app/not-found.tsx`:** `title:"Pagina nu a fost găsită"` (via template),
`robots:{index:false}` (noindex), links to `/#${SECTIONS.test}` (anchor from `content.ts`).

## 5. Interactive questionnaire

The questionnaire is the application's **single stateful feature**. Component tree:

```
app/page.tsx
 └─ TestSection (server)            components/test/TestSection.tsx
     ├─ heading + "Important" disclaimer (Reveal-wrapped)
     └─ Questionnaire (client)      components/test/Questionnaire.tsx   ← all state lives here
         ├─ ProgressTracker         (props only, while !submitted)
         ├─ flagged-validation banner (inline, AnimatePresence)
         ├─ QuestionCard × 18       (props + onSelect callback)
         ├─ "Calculează scorul" submit button (while !submitted)
         ├─ Results                 (after submit; props + onRestart)
         └─ restart-confirm modal   (inline, AnimatePresence, showConfirm)
```

**State shape** (`Questionnaire.tsx`):
```ts
answers: AnswerMap            // Record<number, number|undefined>, 1-based Q# → 0-based response
submitted: boolean
result: ScoreResult | null
flagged: number[]             // unanswered question numbers to highlight
showConfirm: boolean          // restart modal
resultsRef: ref               // scroll target after submit
```

**Falsy-zero rule:** an answer of `0` ("Niciodată") is falsy, so **every presence check
MUST use `=== undefined`**, never truthiness — honoured in `answeredCount`, the
auto-advance lookup, and `calculateScores`.

**Interaction flow:**
1. **Select** → `handleSelect(qNum, optionIndex)` merges the answer, then (while
   `!submitted`) finds the first **unanswered** question *below* the current one and, after
   220ms, smooth-scrolls to it (skips already-answered items so editing earlier answers
   doesn't yank you down). Removes the item from `flagged`.
2. **Progress** — `ProgressTracker` (sticky `top-16`) shows `answered din 18`, an
   `A: x/6 · B: y/12` breakdown, estimated `~N min` (a local heuristic
   `max(ceil(remaining*0.4),1)`, **not** from `SITE.estimatedMinutes`; hidden < `sm`), an
   animated bar with a Part-A marker (~33%), and an `aria-live` message via
   `progressMessage()`. The bar uses `initial={false}` (does not animate on first paint).
   **There is no live score-band preview** — only counts are shown during answering; the
   verdict is withheld until submit. Don't surface partial bands.
3. **Submit** — `handleSubmit` computes `missing` (all `undefined` answers). If any, it sets
   `flagged`, scrolls to the first missing, and **returns without a result**. The banner
   (`role="alert"`) lists missing numbers as scroll-to buttons; flagged cards get
   `ring-accent`. Only when all 18 are answered does it call `calculateScores(answers)` and
   set `submitted`.
4. **Results** — after submit, a `useEffect` scrolls `resultsRef` into view; all
   `QuestionCard`s become `disabled` and `ProgressTracker` unmounts.
5. **Restart** — opens a hand-built confirm modal (`role="dialog" aria-modal`). `confirmRestart`
   resets all state and scrolls to Q1. **The modal has no focus trap and no Escape handler**
   — only the backdrop or buttons close it.

**`Results.tsx`** consumes `ScoreResult`: a level badge from `LEVEL_COPY[result.level]`;
two `ScoreBar`s (Part A vs `PART_A_COUNT`, Part B vs `PART_B_COUNT`, elevated when
`partBScore >= 6`); a domain panel (Inatenție / Hiperactivitate vs max 9); static
`GENERAL_INTERPRETATION`; and `buildRecommendations(result)` styled by tone.
`ScoreBar.tsx` animates `width` 0→`round(value/max*100)%` (with `max>0` guard).

**Reduced motion:** `prefersReducedMotion()` reads `window.matchMedia(...)` and governs
**scroll behaviour only** — all `scrollIntoView` calls pass `behavior:"auto"` when reduced.
Element-level `motion` animations are additionally damped by the global CSS rule.

**Accessibility:** native `<fieldset>`/`<legend>` per question; real `<input type="radio">`
(`peer sr-only`) with CSS-only selection via `has-[:checked]`/`peer-checked`; visually-hidden
`Întrebarea N.` prefixes; validation banner `role="alert"`; progress `aria-live="polite"`.
(Scoring detail → `docs/asrs-scoring.md`.)

## 6. Icon generation

`scripts/generate-icons.mjs` (run `node scripts/generate-icons.mjs`) renders the brand
"focus target" mark (concentric rings + orange dot on a `#4B45D6→#3A35B8` gradient) with
**sharp**, writing:
- `public/icons/icon-192.png`, `public/icons/icon-512.png` — rounded, for the manifest.
- `public/icons/icon-maskable-512.png` — square, maskable.
- `app/apple-icon.png` — 180×180 Apple touch icon (file-based metadata convention).

**Output paths are relative — run from the repo root** or files land in the wrong place.
`app/icon.svg` (the scalable favicon) is hand-maintained and is **not** produced by this
script. Regenerate the PNGs whenever the brand mark changes.
