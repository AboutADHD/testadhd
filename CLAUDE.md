# CLAUDE.md

Guidance for Claude Code working in this repo. Detailed context lives in `docs/` —
read those on demand (see [Reference documents](#reference-documents)); they are not
loaded every session.

## Project overview

`testadhd.ro` — a free, privacy-first **ADHD screening tool for adults** built on the
**ASRS v1.1** questionnaire (WHO). Romanian UI. Next.js 16 App Router, React 19, TS,
Tailwind v4. **100% client-side scoring — no backend, no database, no cookies, no
analytics, no data ever transmitted.** Single landing page. See `README.md` for the
product/feature summary (Romanian).

## Code intelligence tools — use BEFORE Grep/Glob/Read

This repo ships two **complementary** tools (both gitignored local artifacts). They are
faster, cheaper, and give structural context file-scanning cannot. Full guide:
`docs/code-intelligence.md`.

- **code-review-graph** (MCP server, live, auto-updates via a PostToolUse hook) — the
  authoritative structural graph. Use its MCP tools FIRST:
  - `detect_changes` — review changes (risk-scored). `get_review_context` — token-efficient snippets.
  - `get_impact_radius` / `get_affected_flows` — blast radius / impacted execution paths.
  - `query_graph` — trace `callers_of`/`callees_of`/`imports_of`/`importers_of`/`tests_for`.
  - `semantic_search_nodes` — find functions/classes by name/keyword (FTS fallback; no embeddings).
  - `get_architecture_overview` / `list_communities` — high-level structure.
  - `refactor_tool` — plan renames, find dead code.
- **codesight** (static map in `.codesight/*.md`) — skim `.codesight/CODESIGHT.md` for
  instant orientation. Regenerate with `codesight` (from repo root) after significant changes.
  **NEVER run `codesight --init`** (it overwrites this `CLAUDE.md`, `.cursorrules`, etc.) or
  `codesight --hook`.

Fall back to Grep/Glob/Read only when the graph/map don't cover what you need. The graph is
authoritative when the two disagree (it auto-refreshes; codesight does not).

## Tech stack

- **Next.js 16** (App Router, React Server Components) · **React 19** · **TypeScript**
  (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
- **Tailwind CSS v4** — CSS-first; tokens in `app/globals.css` `@theme`. **No
  `tailwind.config.js`.** Configured only via `@tailwindcss/postcss`.
- **`motion`** (^12) for animation · **`next/font`** (Sora, IBM Plex Sans, IBM Plex Mono).
- **ESM** (`type: "module"`). **Node 22** (`.nvmrc`; `engines` floor is `>=20.9.0`).
- Runtime: **PM2 (isolated)** + **nginx** + **Cloudflare Origin TLS**, port **9460**.

## Commands

```bash
npm install
npm run dev          # dev server, http://localhost:9460
npm run build        # production build; type-checks as a side effect
npm run start        # prod server on 0.0.0.0:9460
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
node scripts/generate-icons.mjs       # regenerate PWA/Apple PNG icons (run from repo root)
./pm2-isolated.sh start|reload|restart|stop|status|logs   # ALWAYS manage PM2 via this wrapper
npm ci && npm run build && ./pm2-isolated.sh reload       # deploy
```

**There is NO test runner** — no `test` script, no test deps, zero test files. **Never run
`npm test`.** `components/test/` is the questionnaire UI, not tests. Verify with
**`npm run build` + `npm run lint` + `npm run typecheck`**.

## Project structure

```
app/          App Router: layout.tsx (fonts, metadata, site-wide JSON-LD, skip-link),
              page.tsx (assembles the page + page-level JSON-LD), globals.css (design
              tokens), manifest.ts/robots.ts/sitemap.ts (metadata routes → replace static
              files), not-found.tsx, icon.svg/apple-icon.png (file-based icons)
components/   Presentational sections + shared primitives (Section, Reveal, BrandMark, JsonLd)
components/test/   The interactive questionnaire (the only stateful feature)
lib/          Framework-free core (single source of truth): asrs.ts + scoring.ts (clinical),
              content.ts (all copy), site.ts (URLs/brand/SEO), structured-data.ts (JSON-LD),
              cn.ts
public/       OG image, ASRS PDF, PWA icons     scripts/  generate-icons.mjs (only file)
docs/         Detailed reference docs (progressive disclosure)
```

## Architecture & key patterns

Detail: `docs/architecture.md`.

- **RSC-by-default.** Only `Reveal`, `SiteHeader`, `Hero`, and `components/test/*` are
  `"use client"`. Keep all other components server-only (no hooks/handlers).
- **Edit content/data in `lib/`, not JSX.** All copy is in `content.ts`; all URLs/brand/SEO
  defaults in `site.ts`; clinical logic/data in `asrs.ts`/`scoring.ts`.
- **`Section` + `Reveal` are the load-bearing primitives.** Wrap section content in
  `Section`; wrap reveal-on-scroll blocks in `Reveal` (it no-ops to a plain `<div>` under
  reduced motion — the `className` you pass must lay out correctly without the wrapper).
- **Use design tokens via Tailwind utilities** (`text-ink`, `bg-surface`, `text-primary`,
  `bg-accent`, …); don't hardcode hex. Coral `--color-accent` is reserved for the primary
  CTA only. Use `.tabular` for numeric values.
- **SEO:** metadata in `layout.tsx`; JSON-LD via the `<JsonLd>` component (site-wide schemas
  in `layout.tsx`, page schemas in `page.tsx`); `manifest/robots/sitemap` are TS metadata
  routes. Change brand/URL in `lib/site.ts`.
- **Questionnaire** (`components/test/Questionnaire.tsx`) holds all state; `calculateScores`
  is safe on partial answer maps (used for live progress, not a live score band).

## ASRS v1.1 scoring — IMPORTANT (clinical)

Detail + the content↔engine consistency contract: `docs/asrs-scoring.md`.

- **Two-zone thresholds** (`thresholdIndex` in `lib/asrs.ts`): questions **1, 2, 3, 9, 12,
  16, 18** count from **"Uneori"** (index 2); all others only from **"Adesea"** (index 3).
  `isShaded()` = `responseIndex >= thresholdIndex`.
- **Scoring is a COUNT of shaded items** (0/1 per question), **NOT a sum of Likert values.**
  Ranges: Part A 0-6, Part B 0-12, total 0-18, each domain (inatenție / hiperactivitate) 0-9.
- **Levels derive ONLY from Part A:** `≥4` → ridicat (positive screen), `≥2` → moderat,
  else scăzut. Part B (`PART_B_ELEVATED_CUTOFF=6`) affects only recommendations, not level.
- **NEVER flatten `thresholdIndex` to a uniform value** — that reintroduces the legacy
  over-counting bug the migration fixed.
- **Keep `lib/content.ts` tables consistent with the engine.** When you change a question's
  zone or domain, or a cutoff, edit `asrs.ts`/`scoring.ts` AND the matching
  `SCORING_TABLES`/`COMPONENTS` copy in `content.ts`. The moderate `≥2` threshold is an
  inline literal in **three** places in `scoring.ts` — change all together.

## Conventions (non-obvious)

- **Commits:** Conventional Commits with scopes — `feat(lib|ui|app|test|assets|seo)`,
  `chore(deploy)`, `build`, `docs`, `chore`.
- **`AnswerMap` presence checks MUST use `=== undefined`** — `0` ("Niciodată") is a valid,
  falsy answer; truthiness checks silently drop it.
- **`cn()` (`lib/cn.ts`) is NOT `tailwind-merge`** — it's a plain join; it does not dedupe
  or resolve conflicting Tailwind classes (source order wins).
- **`next/font` subsets MUST include `latin-ext`** — required for Romanian diacritics.
- **ESLint:** use the native `eslint-config-next` flat arrays; do **not** reintroduce
  FlatCompat/eslint-plugin-react (crashes under ESLint 9).

## Gotchas & warnings

- **NEVER add analytics, cookies, persistence, or any network call that transmits answers.**
  Scoring must stay 100% client-side. This is the product's core promise.
- **Header split:** the app (`next.config.ts`) sets only CSP, HSTS, Permissions-Policy;
  nginx sets `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`,
  `Referrer-Policy` globally. **Don't duplicate** the nginx-owned headers in the app.
- **PM2:** always go through `./pm2-isolated.sh` (it pins `PM2_HOME=./.pm2-isolated`).
  Calling `pm2` directly hits the wrong daemon.
- **`generate-icons.mjs` uses relative paths** — run it from the repo root. `app/icon.svg`
  is hand-maintained and is NOT produced by the script.
- **`medicalWebPageSchema()` sets `dateModified: new Date()`** — its JSON-LD output is
  non-deterministic per build/request (expected, not a bug).
- The "Turbopack" build is just the Next 16 default — `build` has **no `--turbopack` flag**;
  don't add one expecting a behavior change.
- Boot persistence (systemd `pm2-testadhd.service`) and the nginx vhost are **out of repo**
  — configured on the host.

## Workflow

- **Branch:** `main` is the working branch. Make focused commits per the convention above.
- **Deploy:** `npm ci && npm run build && ./pm2-isolated.sh reload` from the repo root.
  Detail: `docs/deployment.md`.

## Reference documents

Read on demand (progressive disclosure — detailed, not needed every session):

- `docs/architecture.md` — App Router shell, RSC/client boundary, design system, shared
  primitives, SEO/structured data, the interactive questionnaire, icon generation.
- `docs/asrs-scoring.md` — the clinical scoring engine, every constant, the algorithm, and
  the `content.ts`↔engine consistency contract. **Read before editing scoring or scale copy.**
- `docs/deployment.md` — build/runtime config, headers, isolated PM2, nginx/Cloudflare,
  deploy steps, git/migration history.
- `docs/code-intelligence.md` — full guide to code-review-graph + codesight (config,
  commands, complementarity, no-interference setup).
