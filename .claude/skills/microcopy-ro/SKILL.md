---
name: microcopy-ro
description: Use when writing or editing Romanian interface copy for testadhd.ro — results/score-band copy, the ASRS questionnaire (question prompts, the fixed Niciodată/Rareori/Uneori/Adesea/Foarte des scale, progress), incomplete-answer validation, the confidential/privacy banner, the medical disclaimer, FAQ, recommendations, or any string in lib/content.ts, lib/scoring.ts, lib/asrs.ts, or components/test/*. Ensures correct diacritics (ă â î ș ț), the project's surface-specific register, neuroaffirmative anti-hype framing, and that copy never contradicts the screening≠diagnostic or no-storage promises.
---

# Romanian Microcopy — testadhd.ro

The Romanian copy layer for **testadhd.ro** (ASRS v1.1 ADHD screening, part of the *About ADHD
România* / despreadhd.ro family). This is **how we say it**; the general craft (patterns, error
structure, benchmarks) is the **`ux-writing`** skill and the ADHD-audience cognitive-load lens is
**`cognitive-accessibility`** — use all three. Copy lives in `lib/content.ts` (informational), the
clinical strings in `lib/scoring.ts` + `lib/asrs.ts`, and UI-chrome strings in `components/test/*`,
`components/SiteFooter.tsx`, `components/Resources.tsx`.

**Core principle:** a screening result is information, never a verdict. Inform without alarming;
frame ADHD as difference, not deficit; and treat the **privacy promise** and the **screening ≠
diagnostic** line as sacred — copy must never contradict either.

## When to use
- Writing/editing any user-facing Romanian string (results, CTAs, labels, validation, FAQ, states).
- Phrasing a results / score-band message so it is honest but not alarmist.
- Reviewing copy in a PR for register, diacritics, neuroaffirmative framing, and the two promises.

## Register — match the surface (this project uses three)
Romanian forces a tu/dumneavoastră choice; testadhd resolves it **per surface**. Match the
surrounding surface and keep a single string internally consistent. Don't flip existing copy
wholesale — when introducing a new surface, follow this map; if unsure, ask.

| Surface | Register | Examples in repo |
|---|---|---|
| Results, recommendations, interpretations | **Impersonal clinical** (no direct address — sidesteps the choice) | "Se recomandă evaluarea clinică detaliată.", "Scorurile indică o probabilitate ridicată…" (`lib/scoring.ts`) |
| UI chrome, progress, CTAs, privacy reassurance | **Warm informal "tu"** | "Hai să începem…", "răspunsurile tale" (`progressMessage`, `CONFIDENTIAL_BANNER`) |
| About / FAQ / disclaimer (legacy clinical authority) | **Formal "dumneavoastră"** | "specialistul dumneavoastră", "Vă încurajăm să consultați…" (`ABOUT_INTRO`, `DISCLAIMER_IMPORTANT`) |

**Prefer impersonal for anything clinical** — it reads as authoritative and avoids the register
trap. Reserve "dumneavoastră" for the existing formal sections; never mix two registers in one
sentence (some legacy FAQ strings do — harmonize when you touch them).

## Romanian mechanics = quality gates
- **Diacritics are mandatory** (ă â î ș ț). A missing diacritic is a defect. Use comma-below
  **ș/ț** (U+0219/U+021B), not cedilla ş/ţ. The fonts ship `latin-ext` for exactly this.
- **Imperative CTAs, verb-first:** "Începe testul", "Calculează scorul", "Vezi rezultatul",
  "Descarcă PDF". Not "Trimite" / "OK" / "Click aici".
- **Numbers:** plain and `.tabular` in UI (`18 întrebări`, `5–10 minute`, `4 din 6`).
- **Avoid anglicisms/calques** — *screening*, *instrument de screening*, *evaluare* are the house
  terms; don't write "tool-uri", "scor-uri" loosely, or jargon like "end-to-end".

## Patterns (in-voice, grounded in the real copy)

**Results / score bands** — non-alarmist, neuroaffirmative, always paired with the next step.
- ✅ "Scorurile indică o probabilitate ridicată de ADHD. Acesta este un screening, nu un
  diagnostic — pasul următor este o evaluare clinică completă cu un specialist."
- ❌ "Ai ADHD." · "Rezultatul tău confirmă ADHD." · "Suferi de ADHD." (verdict, diagnosis, pity)
- Use **probabilitate / trăsături / simptome**, never "ai/suferi de ADHD". A "scăzut" result is
  reassuring but never "ești sănătos / nu ai nimic" — say symptoms weren't flagged.

**Recommendations** — impersonal, action + who: ✅ "Se recomandă discutarea rezultatelor cu un
specialist în sănătate mintală." (mirror `buildRecommendations` in `lib/scoring.ts`).

**Questionnaire scale labels** — the five options **Niciodată / Rareori / Uneori / Adesea / Foarte
des** are a **clinical contract** with the scoring engine (two-zone thresholds in `lib/asrs.ts`).
**Never paraphrase or reorder them.** Question prompts live in `lib/asrs.ts`; the reference period
is the last 6 months ("gândindu-te la ultimele 6 luni"). See `docs/asrs-scoring.md`.

**Incomplete-answer validation** — kind, specific, points to the fix, no blame.
- ✅ "Mai ai câteva întrebări fără răspuns. Completează-le pe toate cele 18 pentru a calcula scorul."
- ❌ "Răspunsurile rămân **salvate**." / "Datele tale sunt **stocate**." — **never imply storage.**
  The product promise is that nothing is saved/transmitted; if you must reassure about progress,
  say "nu pierzi nimic cât ești pe pagină", not "salvate".

**Progress / motivational** — warm "tu", momentum without patronising (see `progressMessage`):
✅ "Ești pe drumul cel bun — a mai rămas mai puțin de jumătate."

**Privacy / confidential** — the core promise, plain (see `CONFIDENTIAL_BANNER`):
✅ "100% confidențial — nu colectăm nicio informație despre tine, nu folosim cookie-uri și nu
stocăm rezultatele. Local rămân doar preferințele de accesibilitate, niciodată răspunsurile tale."

**Disclaimer / medical** — serious, formal register is appropriate here:
✅ "Acest test este destinat EXCLUSIV în scop informativ… consultați un profesionist calificat."

**Empty / loading states** — minimal. There is **no network**, so there are essentially **no
server/connection errors** — don't invent "conexiune întreruptă / a eșuat trimiterea" copy.

## Accessibility in copy (this is the mission)
- **Descriptive links/buttons:** "Vezi rezultatul", "Descarcă chestionarul ASRS (PDF)" — never
  "Click aici" / "Aici".
- **Errors pair text + meaning**, not colour alone; phrased to read sensibly beside the field
  label / via `aria-live` for a screen reader.
- **Plain language**, short sentences (≤14 words where possible). Legible under each
  accessibility profile and at 200% zoom.

## Glossary — prefer / avoid
- screening, instrument de screening ✅ · "test de diagnostic" ❌ (it is not one)
- probabilitate / trăsături / simptome ADHD ✅ · "ai ADHD", "suferă de ADHD" ❌
- persoană cu ADHD ✅ · "bolnav de ADHD", "sărman" ❌ (pity)
- salvate / stocate / transmise — ❌ when describing the user's answers (breaks the promise)
- **Banned:** hype ("revoluționar", "uimitor"), alarm/urgency ("rezultat grav", "urgent"),
  guilt, pity, raw codes ("Error 402"), cedilla ş/ţ.

## Workflow
1. Find where the string lives: informational copy → `lib/content.ts`; result/level/recommendation
   text → `lib/scoring.ts`; question prompts + the fixed scale → `lib/asrs.ts` (**clinical —
   keep consistent with the engine + `docs/asrs-scoring.md`**); UI chrome/states → the component
   (`Questionnaire.tsx`, `Results.tsx`, `QuestionCard.tsx`, `ProgressTracker.tsx`, `SiteFooter.tsx`).
2. Pick register by surface (table above).
3. Draft in voice, then run the `ux-writing` 4-phase edit (purposeful → concise → conversational → clear).
4. **Verify before done:** diacritics correct (comma-below ș/ț) · register matches the surface and
   is internally consistent · neuroaffirmative (probabilitate/trăsături, no "ai/suferi de ADHD") ·
   screening ≠ diagnostic kept · no claim that answers are saved/stored/transmitted · fixed scale
   labels unchanged · ≤14-word sentences where natural · every validation message has a next step.

## Common mistakes
- Implying answers are **saved/stored** ("rămân salvate", "datele tale sunt stocate") — contradicts
  the no-storage promise. The standout trap; always catch it.
- Alarmist or diagnostic framing of a positive screen ("Ai ADHD") instead of "probabilitate ridicată".
- Paraphrasing/reordering the five scale labels (breaks the scoring contract).
- Translating English copy literally instead of writing native Romanian; dropping diacritics
  ("multumim", "diagnostic") or using cedilla ş/ţ.
- Mixing "tu" and "dumneavoastră" in one surface; pushing formal register into the clinical results
  (use impersonal there).
- Inventing network/connection-error copy for a 100% client-side app.
- Generic CTAs ("Trimite", "OK") instead of "Calculează scorul".

**Cross-references:** general craft → `ux-writing` · ADHD cognitive load → `cognitive-accessibility`
· scale/threshold copy contract → `docs/asrs-scoring.md` · where copy lives → `lib/content.ts`,
`lib/scoring.ts`, `lib/asrs.ts`, `components/test/*`.
