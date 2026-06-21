# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`testadhd.ro` is a free, privacy-first ADHD screening tool for adults, built around the
**ASRS v1.1** questionnaire (Adult ADHD Self-Report Scale, World Health Organisation).
It was migrated from a single static `index.html` to a modern **Next.js 16 (App Router)**
application. The interface is in **Romanian**.

**Key characteristics**
- Next.js 16 + React 19 + TypeScript, App Router, React Server Components.
- Tailwind CSS v4 (CSS-first `@theme` tokens) + `motion` for transitions.
- 100% client-side scoring — **no data is collected, stored or transmitted**. No cookies,
  no analytics, no backend/database.
- Runs as a Node process on **port 9460**, managed by an **isolated PM2** instance, behind
  an **nginx reverse proxy** terminating the Cloudflare Origin TLS.

## Architecture

### App Router structure (`app/`)
- `layout.tsx` — root layout: `next/font` (Sora, IBM Plex Sans, IBM Plex Mono), the global
  metadata object, site-wide JSON-LD (`Organization`, `WebSite`), skip-link.
- `page.tsx` — the single landing page: assembles all sections and page-level JSON-LD
  (`MedicalWebPage`/`WebApplication`, `FAQPage`, `BreadcrumbList`).
- `globals.css` — the "Calm focus" design system: Tailwind v4 `@theme` tokens (colours,
  fonts, radii, shadows), base layer, reduced-motion handling, ambient keyframes.
- `manifest.ts`, `robots.ts`, `sitemap.ts` — metadata routes (compile to
  `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`). These replace the old hand-written
  static files.
- `not-found.tsx` — branded 404 (noindex).
- `icon.svg`, `apple-icon.png` — favicons (file-based metadata conventions).

### Data & logic (`lib/`) — the clinical core, framework-free and unit-testable
- `asrs.ts` — the 18 ASRS v1.1 questions (verbatim Romanian), the 5-point Likert scale, and
  per-question metadata: `part` (A/B), `domain` (inatenție / hiperactivitate) and
  `thresholdIndex`.
- `scoring.ts` — pure scoring engine: `calculateScores`, level bands, interpretations and
  conditional recommendations.
- `content.ts` — all editorial/clinical copy (about, scoring tables, validity stats,
  references, FAQ, disclaimers, progress messages, section anchors, nav).
- `structured-data.ts` — JSON-LD builders.
- `site.ts` — single source of truth for URLs, brand strings, SEO defaults, external links.
- `cn.ts` — tiny className joiner.

### Components (`components/`)
- Static/presentational (Server Components): `Hero`, `SiteHeader`, `SiteFooter`,
  `ConfidentialBanner`, `AboutSection`, `ScoringSection`, `ValiditySection`, `Downloads`,
  `Resources`, `Faq`, `Section`, `BrandMark`, `JsonLd`.
- Client (interactivity/animation): `Reveal`, `SiteHeader` (scroll-spy), `Hero` (entrance).
- `components/test/` — the interactive questionnaire: `Questionnaire` (state orchestrator),
  `QuestionCard`, `ProgressTracker`, `ScoreBar`, `Results`, `TestSection`.

## ASRS v1.1 scoring — IMPORTANT

The official ASRS v1.1 uses **two shaded zones**, encoded as `thresholdIndex` per question:
- Questions **1-3, 9, 12, 16, 18** count from **"Uneori"** (index 2) upward.
- All other questions count only from **"Adesea"** (index 3) upward.

`isShaded()` in `lib/asrs.ts` applies this. **Part A** (questions 1-6) is the screener; a
count of **≥ 4 of 6** shaded answers is a positive screen (`PART_A_POSITIVE_CUTOFF`). The
legacy single-file app used a uniform "Uneori+" threshold for all 18 items (a bug that
over-counted); this implementation follows the official scale and the on-page scoring tables.

Levels (from Part A): `≥4` → "Nivel ridicat", `≥2` → "Nivel moderat", else "Nivel scăzut".

## Development

```bash
npm install            # install dependencies
npm run dev            # dev server on http://localhost:9460
npm run build          # production build (Turbopack) — also type-checks
npm run start          # production server on 0.0.0.0:9460
npm run lint           # ESLint (flat config, eslint-config-next 16 native)
npm run typecheck      # tsc --noEmit
node scripts/generate-icons.mjs   # regenerate PWA/Apple PNG icons from the brand mark
```

## Deployment

The app is served by an **isolated PM2** instance (so it never collides with the other apps
on this server) behind nginx.

- **Port:** 9460 (Next.js `next start`, fork mode, single instance).
- **PM2 home:** `./.pm2-isolated` (unique per app). **Namespace:** `testadhd`.
- **Process name:** `testadhd-prod` (see `ecosystem.config.cjs`).
- **Always manage PM2 through the wrapper** so `PM2_HOME` is correct:
  ```bash
  ./pm2-isolated.sh start|reload|restart|stop|status|logs
  ```
- **Boot persistence:** `systemd` unit `pm2-testadhd.service` runs `pm2 resurrect` against the
  isolated `PM2_HOME` on boot (`systemctl status pm2-testadhd`).
- **nginx:** `/etc/nginx/sites-generated/testadhd.ro.conf` reverse-proxies
  `www.testadhd.ro` → `127.0.0.1:9460`, redirects HTTP→HTTPS and apex
  `testadhd.ro` → `https://www.testadhd.ro`, using the existing **Cloudflare Origin**
  certificate (`/etc/nginx/nginx-rc-compat/testadhd-ro.d/server.{crt,key}`).
- **Headers:** security headers are split — nginx sets `X-Frame-Options`,
  `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` globally; the app
  (`next.config.ts`) sets `Content-Security-Policy`, `Strict-Transport-Security` and
  `Permissions-Policy`.
- **No PHP:** this domain has no php-fpm pool and the vhost has no `fastcgi_pass`.

### Deploy a change
```bash
npm ci && npm run build && ./pm2-isolated.sh reload
```

## Important notes
- **Privacy:** never add analytics, cookies, persistence or any network call that transmits
  answers. Scoring must stay 100% client-side.
- **Clinical accuracy:** the ASRS wording and the two-zone scoring are clinical content —
  change `lib/asrs.ts` / `lib/scoring.ts` only with care, and keep the on-page scoring tables
  in `lib/content.ts` consistent with the thresholds.
- **Language:** all user-facing copy is Romanian (with diacritics — fonts load the
  `latin-ext` subset).
- **SEO:** structured data, canonical (`https://www.testadhd.ro`), OG/Twitter, sitemap and
  robots are generated from `lib/site.ts` — update brand/URL there.
