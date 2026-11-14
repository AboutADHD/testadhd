# Deployment, Build & Runtime Configuration

> Reference doc for `CLAUDE.md`. Read on demand when touching build config, PM2/nginx,
> headers, or when deploying.

`testadhd.ro` runs as a single Node process on **port 9460** under an **isolated PM2
instance**, behind an **nginx reverse proxy** that terminates **Cloudflare Origin TLS**.
No backend, no database — 100% client-side at runtime.

## Toolchain & versions

- **Package:** `testadhd-ro` @ `2.0.0` (the rewrite; the static app was implicitly v1).
  `private: true`, `type: "module"` (ESM), license `CC-BY-4.0`.
- **Pinned runtime deps:** `next 16.4.6`, `react 19.2.9`, `react-dom 19.2.9`,
  `motion ^12.40.0`. Dev: `tailwindcss ^4.3.1` + `@tailwindcss/postcss`, `eslint ^9.39.0`
  + `eslint-config-next 16.4.6`, `typescript ^6.0.3`, `@types/node ^24` (matches the runtime),
  `@types/react ~19.2.18`, `@types/react-dom ~19.2.7`. `next`, `react`, `react-dom` and
  `eslint-config-next` are exact-pinned; React stays on the 19.2 patch line on purpose (a
  caret range would pull the unrequested 19.3 minor — App Router renders with Next's vendored
  React anyway).
- **Node version truth: Node 24 LTS** — `.nvmrc` `24`, `engines.node >=24.11.0` (first 24 LTS),
  and production runs `/home/runcloud/.nvm/versions/node/v24.22.3/bin/node` via the PM2 `interpreter`.
  The box's shared **system `/usr/bin/node` is 22** (NodeSource apt, serves ~20 other tenants'
  PM2 daemons/crons) and is **deliberately not upgraded in place** — this app opts in on its
  own, same pattern as the `donatie-despreadhd.ro` sibling. Because a plain shell resolves
  `node` to 22, the npm **`prebuild`** hook runs `scripts/check-node.mjs`, which fails
  `npm run build` on Node <24 and prints the exact `PATH=… npm run build` to use.
- **Migrated 2026-11-14** (Node 22 → 24.22.3, Next 16.2.9 → 16.4.6). `npm audit`: 19 → 7;
  `--omit=dev` → 0. The 7 left are moderate, dev-only (`minimatch` via `typescript-eslint`
  ≤8.72.2, already the newest release) — lint tooling, never shipped. ESLint 10, TS 7 and
  `motion` 14 are separate majors, intentionally not adopted in this migration.
- **TypeScript (`tsconfig.json`):** `target ES2022`, `module/moduleResolution esnext/bundler`,
  `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`, `noEmit`,
  `jsx react-jsx`, path alias `@/* → ./*`. `next-env.d.ts` is gitignored (generated).

## NPM scripts (the only commands that exist)

```
dev        → next dev -p 9460                  # http://localhost:9460
build      → next build                        # production build; type-checks as a side effect
start      → next start -p 9460 -H 0.0.0.0     # prod server, all interfaces
lint       → eslint                            # flat config, no args
typecheck  → tsc --noEmit
pm2:start  → ./pm2-isolated.sh start           # + pm2:reload/restart/stop/logs/status
```

Plus `node scripts/generate-icons.mjs` (regenerates PWA/Apple PNG icons) and
`scripts/check-node.mjs` (the `prebuild` Node ≥24 guard, run automatically by `npm run build`).

**No-test reality:** there is **no `test` script, no test runner dependency, and zero test
files** (`git ls-files` finds no `*.test.*`/`*.spec.*`/`__tests__`). `components/test/` is
the questionnaire UI, NOT test suites. **Do not invent `npm test`.** Verification =
`npm run build` (type-checks) + `npm run lint` + `npm run typecheck`. The `lib/` clinical
core was deliberately kept framework-free and testable, but no tests were ever written.

**Turbopack caveat:** README/older docs describe the build as "Turbopack", but `build` is
plain `next build` with **no `--turbopack` flag** — Turbopack is simply the Next.js 16
default. Don't add a flag expecting different behavior.

## Lint & CSS build config

- **`eslint.config.mjs`** — ESLint 9 flat config that spreads
  `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` directly, plus an
  `ignores` block. Header comment documents the rationale: **FlatCompat + eslint-plugin-react
  crashes with a circular-structure error under ESLint 9** — do not reintroduce FlatCompat.
- **`postcss.config.mjs`** — the entire Tailwind v4 config: `{ "@tailwindcss/postcss": {} }`.
  There is **no `tailwind.config.js`**; theme tokens live in `app/globals.css` under `@theme`.

## `next.config.ts` — headers, redirects, proxy trust

- `reactStrictMode`, `poweredByHeader:false`, `compress:true`, `productionBrowserSourceMaps:false`.
- **Header split (critical):** nginx globally emits `X-Frame-Options`,
  `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` for every site. To avoid
  duplicates, the app emits **only** the three nginx does not: `Content-Security-Policy`,
  `Strict-Transport-Security` (`max-age=63072000; includeSubDomains; preload`), and
  `Permissions-Policy` (`geolocation=(), microphone=(), camera=(), browsing-topics=()`),
  applied to `/:path*`. They also keep the app self-contained in dev/preview without nginx.
- **CSP** is self-only: `default-src 'self'`; `script-src 'self' 'unsafe-inline'
  'unsafe-eval'` (required by Next hydration + RSC inline scripts); `style-src 'self'
  'unsafe-inline'`; `img-src 'self' data: blob: https:`; `font-src 'self' data:` (fonts
  self-hosted via next/font); `connect-src 'self'`; `object-src 'none'`; `frame-ancestors
  'self'`; `upgrade-insecure-requests`. No third-party runtime resources, no analytics, no CDN.
- **Redirect:** permanent 301 `/index.html → /` preserving canonicalisation from the old
  static deployment.

## PM2 runtime

Managed by an **isolated PM2 instance** so it never collides with the other apps on this server.

**`ecosystem.config.cjs`** — one app:
- **name** `testadhd-prod`, **namespace** `testadhd`, **cwd** the repo root.
- **script** `./node_modules/next/dist/bin/next`, **args** `start -p 9460 -H 127.0.0.1`,
  **interpreter** `/home/runcloud/.nvm/versions/node/v24.22.3/bin/node` (absolute — Node 24, see above) —
  invokes the Next CLI directly (not `npm start`) so PM2 owns the Node process. The PM2
  God Daemon itself (global PM2 v7, started by systemd) stays on system Node 22; only the
  app child runs on 24, and `dump.pm2` records `exec_interpreter` so boot-time `resurrect`
  comes back on 24. **Changing the interpreter needs `./pm2-isolated.sh delete` + `start`**
  — a plain `reload` keeps the old binary. Binds `127.0.0.1` (nginx-only); `npm start` binds `0.0.0.0`.
- **exec_mode** `fork`, **instances** `1` (deliberate; scaling = extra instances on distinct
  ports behind an nginx upstream).
- **Restart:** `autorestart`, `max_restarts:10`, `min_uptime:"20s"`, `restart_delay:4000`,
  `exp_backoff_restart_delay:200`, `kill_timeout:5000`.
- **Recycle:** `max_memory_restart:"500M"`, `cron_restart:"0 4 * * *"` (nightly 04:00),
  `watch:false`.
- **env:** `NODE_ENV=production`, `PORT=9460`, `HOSTNAME=127.0.0.1`, `TZ=Europe/Bucharest`.
- **Logs:** `merge_logs`, `time`, to `./logs/pm2-error.log` / `./logs/pm2-out.log`.

**`pm2-isolated.sh`** (`set -euo pipefail`) is the **mandatory** wrapper. It hardcodes
`APP_DIR=/home/runcloud/webapps/testadhd-ro`, exports `PM2_HOME="$APP_DIR/.pm2-isolated"`,
uses the **global PM2 v7** at `/usr/lib/node_modules/pm2/bin/pm2` (matching the systemd
unit), and dispatches `start|stop|restart|reload|delete|save|status|logs|monit` (each
mutating verb runs `pm2 save --force`). **Never call `pm2` directly** — without the
wrapper's `PM2_HOME` you touch the wrong daemon. Moving the repo or PM2 binary breaks the
hardcoded paths.

## Boot persistence & nginx (out of repo)

- **systemd:** unit `pm2-testadhd.service` runs `pm2 resurrect` against the isolated
  `PM2_HOME` on boot — check `systemctl status pm2-testadhd`. **Not in the repository**;
  configured on the host.
- **nginx:** `/etc/nginx/sites-generated/testadhd.ro.conf` reverse-proxies
  `www.testadhd.ro → 127.0.0.1:9460`, redirects HTTP→HTTPS and apex `testadhd.ro →
  https://www.testadhd.ro`, using the **Cloudflare Origin** cert at
  `/etc/nginx/nginx-rc-compat/testadhd-ro.d/server.{crt,key}`. No php-fpm, no `fastcgi_pass`.
- The app trusts `X-Forwarded-*` from nginx for absolute/canonical URL resolution.

## Deploy workflow

```bash
export PATH=/home/runcloud/.nvm/versions/node/v24.22.3/bin:$PATH   # Node 24 first (system node is 22)
npm ci && npm run build && ./pm2-isolated.sh reload
```

**Rollback of the Node 24 runtime:** point `interpreter` back at `/usr/bin/node`, revert
`engines`/`prebuild`/`.nvmrc` (+ `next`/`eslint-config-next` 16.2.9 if needed), `npm ci &&
npm run build` on Node 22, then `./pm2-isolated.sh delete && ./pm2-isolated.sh start`.

`reload` passes `--update-env` and re-saves the PM2 dump. Gitignored build/runtime
artifacts: `node_modules`, `.next/`, `out/`, `logs/`, `.pm2-isolated/`, env files,
`next-env.d.ts`, `*.tsbuildinfo`, `.code-review-graph/`, `.codesight/`.

## Git history: conventions & migration story

**Commit convention:** Conventional Commits (adopted from the Next.js rewrite onward; older
"small fixes" commits predate it). Scopes seen: `build`, `chore`, `chore(deploy)`,
`feat(lib)`, `feat(ui)`, `feat(app)`, `feat(test)`, `feat(assets)`, `feat(seo)`, `docs`.

**Migration (single static `index.html` → Next.js 16)** — a clean rewrite over ~10 commits:
1. `ce0143b build:` scaffold Next.js 16 (App Router, TS, Tailwind v4).
2. `d4c033d feat(lib):` clinical core (`asrs.ts`, `scoring.ts`, `content.ts`, `site.ts`,
   `structured-data.ts`, `cn.ts`).
3. `d7948dc feat(ui):` "Calm focus" design system + primitives.
4. `0106ead feat(ui):` landing-page sections + site chrome.
5. `1c8f503 feat(test):` interactive ASRS v1.1 questionnaire.
6. `17bc853 feat(app):` App Router shell, metadata, SEO routes.
7. `c5104d1 feat(assets):` icons, OG image, ASRS PDF.
8. `5663129 chore(deploy):` isolated PM2 config.
9. `88be2aa chore:` delete the legacy ~131KB single-file `index.html` (embedded
   Bootstrap/FontAwesome CDN), relocate `asrs-adhd.jpg` + the ASRS PDF to `public/`.
10. `a0e9355 docs:` rewrite CLAUDE.md + README for the new architecture.

**Abandoned patterns to avoid:**
- The legacy `index.html` is gone — do not resurrect single-file static markup or CDN
  Bootstrap/FontAwesome.
- **Uniform-threshold scoring bug:** the old app applied a single uniform "Uneori+"
  threshold to all 18 items, over-counting positives. `lib/asrs.ts` `isShaded()` now
  implements the official **two-zone** thresholds. **Never revert to a uniform threshold.**
  (See `docs/asrs-scoring.md`.)
- The `/index.html → /` 301 redirect is the only vestige preserving old URLs.
