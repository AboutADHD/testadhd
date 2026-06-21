# Test ADHD adulți — ASRS v1.1 · [testadhd.ro](https://www.testadhd.ro)

Test online **gratuit** și **100% confidențial** pentru screening-ul ADHD la adulți, folosind
scala **ASRS v1.1** (Adult ADHD Self-Report Scale) dezvoltată de Organizația Mondială a
Sănătății. Rezultate instantanee, fără colectarea datelor — totul se calculează local, în
browser.

Aplicație **Next.js 16** (App Router), succesoarea variantei statice dintr-un singur fișier.

## Caracteristici

- **18 întrebări** ASRS v1.1 (Partea A — screening, 6 întrebări; Partea B — 12 întrebări).
- **Scoring oficial cu două zone** (vezi mai jos) — corect din punct de vedere clinic.
- **Confidențial**: zero cookie-uri, zero analytics, zero backend. Răspunsurile nu părăsesc
  dispozitivul.
- **SEO**: metadate complete, date structurate JSON-LD (MedicalWebPage, FAQPage,
  BreadcrumbList, Organization, WebSite), sitemap, robots, OpenGraph/Twitter.
- **PWA**: manifest + iconițe; **accesibil** (focus vizibil, `prefers-reduced-motion`, ARIA).
- UI/UX modern cu tranziții fluide (`motion`) și un sistem de progres prietenos cu ADHD.

## Tehnologii

| Strat        | Tehnologie                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 16 (App Router, RSC) · React 19 · TypeScript  |
| Stilizare    | Tailwind CSS v4 (`@theme`) · `motion`                 |
| Tipografie   | Sora · IBM Plex Sans · IBM Plex Mono (`next/font`)     |
| Rulare       | Node 22 · PM2 (izolat) · nginx (reverse proxy)        |

## Dezvoltare

```bash
npm install
npm run dev        # http://localhost:9460
npm run build      # build de producție (Turbopack) + verificare de tipuri
npm run start      # server de producție pe 0.0.0.0:9460
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Iconițele PWA/Apple se regenerează din marca brandului cu:

```bash
node scripts/generate-icons.mjs
```

## Structură

```
app/            # App Router: layout, pagină, globals.css, manifest/robots/sitemap, 404, iconițe
components/     # UI (secțiuni statice) + components/test/ (chestionarul interactiv)
lib/            # asrs.ts (întrebări), scoring.ts (calcul), content.ts, site.ts, structured-data.ts
public/         # imagine OG, PDF-ul scalei ASRS, iconițe PWA
scripts/        # generator de iconițe
ecosystem.config.cjs, pm2-isolated.sh   # rulare în producție (PM2 izolat)
```

## Scoring ASRS v1.1

Scala oficială folosește **două zone** de scor:

- Întrebările **1-3, 9, 12, 16, 18** punctează de la **„Uneori”** în sus.
- Restul întrebărilor punctează doar de la **„Adesea”** în sus.

**Partea A** (întrebările 1-6) este testul de screening: un scor de **≥ 4 din 6** indică o
probabilitate ridicată de ADHD și necesitatea unei evaluări clinice. Logica trăiește în
`lib/asrs.ts` și `lib/scoring.ts`.

## Deploy

Aplicația rulează ca proces Node pe portul **9460**, gestionat de o instanță **PM2 izolată**
(`PM2_HOME=./.pm2-isolated`, namespace `testadhd`), în spatele unui **reverse proxy nginx** care
termină certificatul **Cloudflare Origin** și păstrează redirect-ul apex → `www`.

```bash
npm ci && npm run build && ./pm2-isolated.sh reload
```

Vezi [`CLAUDE.md`](./CLAUDE.md) pentru detalii complete de infrastructură.

## Confidențialitate

Aplicația nu colectează, nu stochează și nu transmite nicio informație personală. Toate
calculele se efectuează local, în browser.

## Licență & atribuiri

- Conținut sub licența [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- ADHD-ASRS Screener v1.1 © World Health Organisation. Acest instrument este destinat
  **exclusiv** screening-ului informativ și **nu** este un instrument de diagnostic.
- Resurse: [despreadhd.ro](https://www.despreadhd.ro) · [doctoradhd.com](https://www.doctoradhd.com).
