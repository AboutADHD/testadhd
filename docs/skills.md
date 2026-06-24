# Project skills (`.claude/skills/`)

A curated set of Claude Code **skills** focused on this project's working areas:
frontend design, UI/UX, UX writing / Romanian microcopy, data visualization, frontend
implementation, motion, accessibility, and SEO. Each skill is a self-contained `SKILL.md`
with YAML frontmatter; Claude Code auto-discovers them and the model selects one when its
`description` matches the task.

This is the detail doc. The session-loaded summary (trigger table + binding overrides)
lives in `CLAUDE.md` → "Frontend / a11y skills".

## How they're wired

1. **Discovery** — every skill is `.claude/skills/<name>/SKILL.md`. The filename **must be
   uppercase `SKILL.md`**; lowercase `skill.md` is **not** discovered on this (case-sensitive)
   host. (The four pre-existing graph skills — `debug-issue`, `explore-codebase`,
   `refactor-safely`, `review-changes` — still use lowercase `skill.md` and therefore do not
   auto-register; left as-is, out of scope for this change.)
2. **Routing** — `CLAUDE.md` maps project tasks → skills so the right one is invoked when
   suitable.
3. **Guardrails** — `CLAUDE.md` lists project overrides that **bind every skill**. On any
   conflict between a skill and a project constraint, the constraint wins.

These are vendored copies (docs only — no code, no deps, no build impact). They are tracked
with the rest of `.claude/` so they travel with the repo and load for every contributor.

## Imported skills (14 — mixed sources)

Source key: **ECC** = local collection at `~/everything-claude-code/skills/`; **CA** =
[`Community-Access/accessibility-agents`](https://github.com/Community-Access/accessibility-agents) (MIT);
**CD** = [`content-designer/ux-writing-skill`](https://github.com/content-designer/ux-writing-skill) (MIT);
**AV** = [`aref-vc/tufte-claude-skill`](https://github.com/aref-vc/tufte-claude-skill) (MIT);
**NT** = [`NTCoding/claude-skillz`](https://github.com/NTCoding/claude-skillz) (no LICENSE; private use);
**1P** = first-party (authored for this repo). The four newest (`ux-writing`, `data-visualization`,
`tufte`, `microcopy-ro`) were imported 2026-06-24 from the `eu-project-mining` and `donatie` sibling
repos; `microcopy-ro` was re-authored for this project.

| Skill | Src | Area | What it's for here | Key caveat under this project |
|---|---|---|---|---|
| `frontend-a11y` | ECC | a11y | React/Next ARIA, label/`id`, `aria-describedby`+`role="alert"`, `aria-live`, keyboard nav, reduced motion — for the Questionnaire. | Examples are `"use client"`; don't leak hooks into RSC. Reduced motion defers to `Reveal`. |
| `forms-specialist` | CA | a11y | Spec-grade form a11y: fieldset/legend, radio grouping, required indication, validation feedback — the ASRS radio matrix. | Framework-agnostic; map to React. Ignore any "test the form" step (no runner). |
| `cognitive-accessibility` | CA | a11y/UX | Plain language, reduced cognitive load, COGA, clear errors/results — for the ADHD audience specifically. | Content/UX axis, not markup. Copy lives in `lib/content.ts` (Romanian). |
| `microcopy-ro` | 1P | UX/copy | The Romanian copy layer — results/level copy, the fixed ASRS scale, incomplete-answer validation, privacy/disclaimer, FAQ. House voice **on top of** `ux-writing`. | Surface-specific register (impersonal clinical / "tu" / legacy formal); never imply answers are saved/stored; scale labels are a clinical contract; comma-below `ș/ț`. Re-authored from the donatie sibling. |
| `ux-writing` | CD | UX/copy | General microcopy craft: buttons, errors, empty/success states, voice/tone, the 4-phase edit (purposeful→concise→conversational→clear) — the layer **under** `microcopy-ro`. | Defaults to informal/conversational; defer to `microcopy-ro`'s register map. Ignore any "measure copy / analytics" step. |
| `react-patterns` | ECC | react | React 19 + RSC client/server boundary, hooks discipline, derive-during-render, state-location decision tree. | Ignore Server Actions / data-fetching / "run axe in tests" sections. |
| `react-performance` | ECC | perf | Re-render rules, bundle/first-load JS, Core Web Vitals — serves the SEO goals + the all-state Questionnaire. | ~half (waterfalls/server/client-fetching) is out of scope for a backend-free page. Analytics examples teach *deferring* scripts — still don't add any. |
| `motion-foundations` | ECC | motion | Baseline discipline for `motion/react`: reduced-motion override, SSR-safe initial states, transform/opacity only, `"use client"`. Dependency of `motion-ui`. | Keep motion timing inline / minimal; don't split design tokens into a JS file. |
| `motion-ui` | ECC | motion | Complete UI motion system (scroll reveal, stagger, transitions) built on the foundations. | Replace example hex (`bg-indigo-500`…) with `@theme` tokens; coral is CTA-only. |
| `make-interfaces-feel-better` | ECC | design | Micro-detail polish: concentric radii, optical icon centering, ≥40–44px hit areas, transition scope, `tabular-nums`, text-wrap. | Express inline rgba as `@theme` tokens; skip its dark-mode blocks (no dark mode). |
| `frontend-design-direction` | ECC | design | Pick purpose/audience/tone before coding; anti-templating checklist (no purple gradients/blobs, no cards-in-cards). | Overlaps the `frontend-design` plugin skill; kept as an always-local reference. No concrete a11y — pair with the a11y skills. |
| `data-visualization` | NT | dataviz | Perceptual encoding hierarchy, chart selection, layout-algorithm guidance (dagre/d3) — *if* a score/results viz is ever built. | No chart lib today; apply with hand-rolled SVG/Tailwind or add Recharts only on real need. No upstream LICENSE (private use). |
| `tufte` | AV | dataviz | Tufte principles for the score bars / results surfaces (data-ink, small multiples, sparklines, dense tables). | Body lists `presets/*` helper files **not vendored** upstream; inline principles stand alone. Use `@theme` tokens, not its example palette. |
| `seo` | ECC | seo | Technical SEO, structured-data selection, on-page title/meta/heading targets, CWV — for `layout.tsx`, `lib/structured-data.ts`, the metadata routes. | Use only Medical/Org/FAQ schemas; never add tracking in the name of "SEO measurement". |

### Binding project overrides (summary — authoritative copy in `CLAUDE.md`)

- **No backend / network / persistence / analytics** — scoring is 100% client-side. Ignore
  `fetch`/Server Actions/SWR/React Query/MSW/analytics examples.
- **No test runner** — verify only via `npm run build` + `lint` + `typecheck`. Ignore every
  vitest/jest/jest-axe/TDD step; do a11y checks manually.
- **`motion/react`, never `framer-motion`**; reduced motion defers to `Reveal`; no parallel
  JS motion-token file (`@theme` is the single source of truth).
- **Design tokens only** — `@theme` utilities, never hardcoded hex/rgba; coral
  `--color-accent` is CTA-only; no separate `design-tokens.json`.
- **Keep the RSC boundary** — client islands are `Reveal`, `SiteHeader`, `Hero`,
  `components/test/*`; everything else is server-only.
- **`AnswerMap` presence via `=== undefined`** — `0` is a valid answer.
- **Romanian copy is surface-specific & promise-bound** (binds `microcopy-ro` + `ux-writing`):
  impersonal clinical voice for results/recommendations, warm "tu" for UI chrome, formal
  "dumneavoastră" only in legacy about/FAQ/disclaimer; never imply answers are saved/stored/
  transmitted; never frame a positive screen as "ai ADHD" (use *probabilitate/trăsături*); the
  five scale labels are a clinical contract — never paraphrase; comma-below `ș/ț`.

## Why these and not others (rejected, with reasons)

Recorded so the selection isn't re-litigated. All were assessed against the project profile.

| Considered | Verdict | Reason |
|---|---|---|
| `accessibility` (ECC) | skip | Near-duplicate of `frontend-a11y`; ~⅓ is iOS/Android dead weight for a web-only app. |
| `frontend-patterns` (ECC) | skip | Conflicts: imports `framer-motion`; `fetch`/SWR data recipes; Context+Reducer global state; truthiness presence checks. Good slices covered by `react-patterns`/`frontend-a11y`. |
| `motion-patterns` (ECC) | skip | Subset of `motion-ui`; its modal/toast/page-transition patterns target multi-route UI this single page lacks. |
| `motion-advanced` (ECC) | skip | Drag/gestures/physics — interaction surfaces this tool doesn't have. |
| `design-system` (ECC) | skip | Its generate mode wants a `design-tokens.json` + `DESIGN.md`, conflicting with the `@theme` single source of truth; audit/slop modes overlap the two kept design skills. |
| `nextjs-turbopack` (ECC) | skip | Thin tooling note; its real nuggets (Turbopack default, `proxy.ts`) are already in `CLAUDE.md`. Not design/UI/UX/a11y. |
| `click-path-audit` (ECC) | skip | Built around multi-store (Zustand/Redux) state maps; doesn't fit one local-`useState` component, and its TDD hand-off can't run. |
| `react-testing` (ECC) | skip | **Hard conflict** — sets up Vitest/Jest + MSW + jest-axe; the project has no test runner and forbids `npm test`. |
| `product-lens` (ECC) | skip | Pure product strategy (PMF/ICE, revenue signals) — outside the frontend/UI/UX/a11y scope; product is already constraint-locked. |

## Verified, vetted, NOT imported (add later if wanted)

Found via GitHub; **all repos/paths confirmed to exist**. Left out to keep the set focused,
but each is a sound opt-in. To add one, drop its `SKILL.md` under `.claude/skills/<name>/`.

- **Vercel Web Interface Guidelines** — `vercel-labs/agent-skills` →
  [`skills/web-design-guidelines`](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines).
  Dense `file:line` UI audit checklist. **Caveat:** the skill `WebFetch`es its rule list from an
  external raw URL at *run* time — vendor the rules locally before relying on it (matches the
  privacy-first, deterministic ethos), or it overlaps `make-interfaces-feel-better` + `frontend-a11y`.
- **WCAG conformance auditor** — [`masuP9/a11y-specialist-skills`](https://github.com/masuP9/a11y-specialist-skills)
  (MIT). Pass/Fail/NT/NA per WCAG 2.2 criterion; can drive the connected Playwright MCP for live
  keyboard/focus/tree checks and degrades gracefully with no browser — **no test runner required**.
  Good for periodic criterion-level audits; heavier than the always-on set.
- **Color science** — [`meodai/skill.color-expert`](https://github.com/meodai/skill.color-expert).
  OKLCH ramps + APCA/WCAG contrast math + token graphs — useful when reworking the palette or
  proving the coral CTA's contrast. Large (140+ files); import selectively.
- **React View Transitions** — `vercel-labs/agent-skills` →
  [`skills/react-view-transitions`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-view-transitions).
  React 19 `<ViewTransition>` with no added runtime dep. Additive technique; vet against `motion-ui`
  first to avoid two parallel motion systems.
- More CA specialists worth knowing (same MIT repo): `aria-specialist`, `keyboard-navigator`,
  `contrast-master`, `alt-text-headings`, `live-region-controller`, `design-system-auditor`.

## Licensing / attribution

- `cognitive-accessibility`, `forms-specialist` — **MIT**, © Community-Access; vendored from
  `Community-Access/accessibility-agents`. A short provenance/attribution note is preserved at the
  top of each vendored `SKILL.md`.
- `ux-writing` — **MIT**, © 2026 Christopher Greer; vendored from `content-designer/ux-writing-skill`
  (provenance note preserved in the `SKILL.md` header).
- `tufte` — **MIT**; vendored from `aref-vc/tufte-claude-skill` (provenance note in the footer).
- `data-visualization` — vendored from `NTCoding/claude-skillz`; **no LICENSE file upstream**, used
  here for private, non-redistributed reference only (footer note).
- `microcopy-ro` — **first-party**, authored for this repo (re-targeted from the `donatie`
  sibling). Builds on the MIT `ux-writing` craft layer; no third-party code.
- The eight ECC skills come from the local `~/everything-claude-code/skills/` collection.

## Maintenance

- **Adding a skill:** create `.claude/skills/<name>/SKILL.md` (uppercase filename; valid YAML
  frontmatter with `name` + a trigger-leading `description`), then add a row to the `CLAUDE.md`
  table.
- **Updating a vendored MIT skill:**
  `gh api repos/Community-Access/accessibility-agents/contents/codex-skills/<name>/SKILL.md -H "Accept: application/vnd.github.raw" > .claude/skills/<name>/SKILL.md`
  then re-apply the provenance note.
- **Verify discovery:** after adding, a new session lists the skill name + description in the
  available-skills reminder. If it's missing, check the filename case and frontmatter.
