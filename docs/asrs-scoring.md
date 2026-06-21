# ASRS v1.1 Scoring Core

> Reference doc for `CLAUDE.md`. Read on demand when touching `lib/asrs.ts`,
> `lib/scoring.ts`, or the on-page scoring/validity copy in `lib/content.ts`.
> Clinical content — change only with care.

This document specifies the clinical scoring engine and the **consistency contract**
between the framework-free logic in `lib/asrs.ts` + `lib/scoring.ts` and the on-page
editorial tables in `lib/content.ts`. The engine is pure, deterministic, and runs 100%
client-side; no answer leaves the device.

## Consistency verdict: CONSISTENT

A full hand-audit of every constant, table, count, threshold and range found **no
contradictions** between `content.ts` and the engine (verified per cross-check in
§8). Caveat: the validity percentages and round-number "~90% / ~70%" claims in
`content.ts` are literature figures with no counterpart in code, so they are out of
scope for code-vs-content verification (the engine computes nothing of the kind).

## 1. The two-zone model

The official ASRS v1.1 does **not** treat all items the same. An item is symptomatic
("shaded") only when the response reaches that item's frequency threshold:

- **Zone 1 (Uneori+, `thresholdIndex = 2`)**: questions **1, 2, 3, 9, 12, 16, 18**.
  A response of "Uneori" (index 2) or higher counts.
- **Zone 2 (Adesea+, `thresholdIndex = 3`)**: all other questions
  (**4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17**). Only "Adesea" (index 3) or higher counts.

The 5-point Likert scale (`RESPONSE_OPTIONS`, `asrs.ts:45`), 0-based: 0 Niciodată,
1 Rareori, 2 Uneori, 3 Adesea, 4 Foarte des.

`isShaded(question, responseIndex)` (`asrs.ts:196`) is simply
`responseIndex >= question.thresholdIndex`. There is no per-item sum of Likert points —
scoring is **binary per item** (shaded = 1, not shaded = 0).

Legacy bug context (documented in `asrs.ts:8-15`): the old single-file app applied a
uniform "Uneori+" threshold to all 18 items, over-counting positives. **Never regress
to a single threshold.**

## 2. Every constant and its meaning

| Constant | File:line | Value | Meaning |
| --- | --- | --- | --- |
| `RESPONSE_OPTIONS` | asrs.ts:45 | 5 options, index 0-4 | Shared Likert scale; index drives `isShaded`. |
| `ThresholdIndex` | asrs.ts:22 | `2 \| 3` | Min 0-based response index that scores as symptomatic. |
| `PART_A_QUESTIONS` / `PART_B_QUESTIONS` | asrs.ts:182-183 | filtered | A = items 1-6 (screener), B = items 7-18 (supplementary). |
| `TOTAL_QUESTIONS` | asrs.ts:185 | 18 | All items. |
| `PART_A_COUNT` | asrs.ts:186 | 6 | Part A size. |
| `PART_B_COUNT` | asrs.ts:187 | 12 | Part B size. |
| `PART_A_POSITIVE_CUTOFF` | asrs.ts:190 | **4** | ≥4 of 6 shaded Part A items = positive screen. |
| `AnswerMap` | asrs.ts:193 | `Record<number, number\|undefined>` | 1-based question number → 0-based response index. |
| `PART_B_ELEVATED_CUTOFF` | scoring.ts:118 | **6** | ≥6 of 12 shaded Part B items = "elevated" (supplementary signal only). |
| moderate threshold | scoring.ts:69,111,145 | **2** (inline literal) | partAScore ≥2 = moderat band. **Not a named constant.** |
| `SCORE_RANGES` | scoring.ts:165 | {partA:6, partB:12, total:18, partAPositiveCutoff:4} | Re-export bundle for UI; derives from the above. |

## 3. The scoring algorithm, step by step

`calculateScores(answers: AnswerMap): ScoreResult` (`scoring.ts:46`):

1. Initialize `partAScore=0, partBScore=0, inattentionScore=0, hyperactivityScore=0`.
2. For each of the 18 questions, look up `answers[question.number]`.
   - If `undefined` → **skip** (partial answers contribute nothing; safe for live previews).
   - If `!isShaded(question, answer)` → **skip** (response below the item's threshold).
3. Otherwise the item is shaded; increment exactly two counters:
   - Part bucket: `part === "A"` → `partAScore++`, else `partBScore++`.
   - Domain bucket: `domain === "inatentie"` → `inattentionScore++`, else `hyperactivityScore++`.
4. `totalScore = partAScore + partBScore` (range 0-18).
5. `positiveScreen = partAScore >= PART_A_POSITIVE_CUTOFF` (≥4).
6. Level (derived **only** from partAScore):
   - `partAScore >= 4` → `"ridicat"`
   - else `partAScore >= 2` → `"moderat"`
   - else → `"scazut"`

Returns `ScoreResult`: `partAScore` (0-6), `partBScore` (0-12), `totalScore` (0-18),
`inattentionScore` (0-9), `hyperactivityScore` (0-9), `level`, `positiveScreen`.

**Invariant:** every shaded item increments exactly one part counter AND exactly one
domain counter, so `inattentionScore + hyperactivityScore === totalScore` and
`partAScore + partBScore === totalScore` always hold. The two decompositions
(by part, by domain) are independent partitions of the same shaded-item set.

## 4. Partial-answer handling

The engine has **no completeness guard**. An `AnswerMap` missing keys is valid:
missing items are skipped in step 2. This is intentional so `Questionnaire` can render
live previews as the user answers. Any "must answer all 18" enforcement is a UI concern
(see `Questionnaire.handleSubmit`), not an engine invariant.

## 5. Level bands and copy

`LEVEL_COPY` (`scoring.ts:83`) maps each `Level` to UI copy + theming tone:

| Level | category (RO) | tone | Trigger |
| --- | --- | --- | --- |
| ridicat | "Nivel ridicat" | high | partAScore ≥ 4 |
| moderat | "Nivel moderat" | moderate | partAScore ≥ 2 (and < 4) |
| scazut | "Nivel scăzut" | low | partAScore < 2 |

`partAInterpretation` (`scoring.ts:107`) returns a paragraph keyed to the same
≥4 / ≥2 / else bands. `partBInterpretation` (`scoring.ts:120`) returns one of two
paragraphs keyed to `PART_B_ELEVATED_CUTOFF` (≥6 vs <6). `GENERAL_INTERPRETATION`
(`scoring.ts:162`) is static prose that names Part A as most predictive and states the
"4 or more responses above threshold" rule — the prose counterpart of
`PART_A_POSITIVE_CUTOFF=4`.

## 6. Recommendation logic

`buildRecommendations(result): Recommendation[]` (`scoring.ts:135`) builds a conditional list:

1. **High** card (tone `high`) — iff `partAScore >= 4`: recommend a full clinical evaluation soon.
2. **Moderate** card (tone `moderate`) — iff `partAScore >= 2 OR partBScore >= 6`: recommend
   discussing results with a mental-health specialist.
3. **Info** card (tone `info`) — **always** pushed: a link to doctoradhd.com.

Consequence: a low-Part-A / high-Part-B user (e.g. A=1, B=6) still gets the moderate card
even though `level` stays `scazut` (level ignores Part B).

## 7. Domain mapping per question (the 9/9 split)

| Q | Part | Domain | thresholdIndex |
| --- | --- | --- | --- |
| 1 | A | inatentie | 2 |
| 2 | A | inatentie | 2 |
| 3 | A | inatentie | 2 |
| 4 | A | inatentie | 3 |
| 5 | A | hiperactivitate | 3 |
| 6 | A | hiperactivitate | 3 |
| 7 | B | inatentie | 3 |
| 8 | B | inatentie | 3 |
| 9 | B | inatentie | 2 |
| 10 | B | inatentie | 3 |
| 11 | B | inatentie | 3 |
| 12 | B | hiperactivitate | 2 |
| 13 | B | hiperactivitate | 3 |
| 14 | B | hiperactivitate | 3 |
| 15 | B | hiperactivitate | 3 |
| 16 | B | hiperactivitate | 2 |
| 17 | B | hiperactivitate | 3 |
| 18 | B | hiperactivitate | 2 |

- Inattention = {1,2,3,4,7,8,9,10,11} → **9 items** (range 0-9). ✔
- Hyperactivity = {5,6,12,13,14,15,16,17,18} → **9 items** (range 0-9). ✔
- Two-zone (thresholdIndex=2) = {1,2,3,9,12,16,18} → **7 items**. ✔

## 8. The content.ts ↔ engine consistency contract

Invariants future edits MUST preserve. Each was verified against current source.

- **C1 — Two-zone set matches the scoring tables.** `SCORING_TABLES[0].caption`
  (`content.ts:78`) "Pentru întrebările 1-3, 9, 12, 16, 18" = {1,2,3,9,12,16,18} MUST equal
  the `thresholdIndex === 2` set. `SCORING_TABLES[1].caption` (`content.ts:88`)
  "Pentru întrebările 4-8, 10, 11, 13-15, 17" MUST equal the `thresholdIndex === 3` complement. ✔
- **C2 — Table rows encode the zones correctly.** Table 0 rows (`content.ts:79-85`):
  Niciodată→0, Rareori→0, Uneori→**1**, Adesea→1, Foarte des→1 (shaded from index 2).
  Table 1 rows (`content.ts:89-95`): Uneori→**0**, Adesea→1 (shaded from index 3).
  Row scores are always 0/1, never 2-4 — consistent with binary-count scoring. ✔
- **C3 — Domain item lists match the domain field.** `COMPONENTS.inattention.items`
  (`content.ts:64`) "Întrebările 1-4, 7-11" and `COMPONENTS.hyperactivity.items`
  (`content.ts:65`) "Întrebările 5-6, 12-18" match `asrs.ts` domain assignments (9/9 split). ✔
- **C4 — Counts prose matches 6 / 12 / 18.** FAQ (`content.ts:217,222`) says "18 întrebări"
  and "Partea A (6 întrebări de screening)". No content claims a Likert-sum range (e.g. 0-72). ✔
- **C5 — Positive-screen cutoff prose matches `PART_A_POSITIVE_CUTOFF=4`.** Only
  `GENERAL_INTERPRETATION` states the numeric cutoff; `content.ts` restates no numeric Part A
  cutoff, so it cannot contradict. (If a future edit adds one, it must say 4.) ✔
- **C6 — No content table states a contradictory threshold/range.** Exhaustive read of
  SCORING_TABLES, VALIDITY_ROWS, COMPONENTS, INFO_FACTS, FAQ found no conflict. ✔

**Out of scope (cannot be code-verified):** `VALIDITY_ROWS` psychometric percentages
(sensitivity 68,7%/56,3%, specificity 99,5%/98,3%, accuracy 97,9%/96,2%, kappa 0,76/0,58)
and the "~90% / ~70%" figures are literature claims (see `REFERENCES`, Kessler 2005 et al.),
not derived values. Romanian decimals use **commas** — do not normalize to dots.

## 9. Editing guidance

- **Change a question's zone:** edit `thresholdIndex` in `asrs.ts` AND the relevant
  `SCORING_TABLES` caption + row set in `content.ts` (C1/C2).
- **Change a question's domain:** edit `domain` in `asrs.ts` AND `COMPONENTS.*.items` in
  `content.ts`, keeping the 9/9 split unless the clinical instrument itself changes (C3).
- **Change a cutoff:** `PART_A_POSITIVE_CUTOFF` (asrs.ts) and `PART_B_ELEVATED_CUTOFF`
  (scoring.ts) are named; the moderate "≥2" is an inline literal in **three** spots
  (`scoring.ts:69,111,145`) — change all three together, and update `GENERAL_INTERPRETATION`
  prose if the Part A cutoff moves.
