/**
 * ASRS v1.1 scoring engine — pure, deterministic, runs entirely in the browser.
 * No answer ever leaves the device.
 */
import {
  ASRS_QUESTIONS,
  PART_A_COUNT,
  PART_A_POSITIVE_CUTOFF,
  PART_B_COUNT,
  TOTAL_QUESTIONS,
  isShaded,
  type AnswerMap,
} from "./asrs";
import { RESOURCES, type BrandKey } from "./site";

export type Level = "ridicat" | "moderat" | "scazut";

export interface ScoreResult {
  /** Shaded Part A items (the screener). Range 0-6. */
  partAScore: number;
  /** Shaded Part B items. Range 0-12. */
  partBScore: number;
  /** Shaded items across all 18. Range 0-18. */
  totalScore: number;
  /** Shaded items in the inattention domain. Range 0-9. */
  inattentionScore: number;
  /** Shaded items in the hyperactivity/impulsivity domain. Range 0-9. */
  hyperactivityScore: number;
  /** Overall risk band, derived from the Part A screener. */
  level: Level;
  /** True when Part A meets the official positive-screen cutoff (≥ 4 of 6). */
  positiveScreen: boolean;
}

export interface LevelCopy {
  level: Level;
  category: string;
  description: string;
  /** Semantic token used for theming the result UI. */
  tone: "high" | "moderate" | "low";
}

/**
 * Compute every score from a complete (or partial) answer map. Items without an
 * answer simply do not contribute, so this is safe to call for live previews.
 */
export function calculateScores(answers: AnswerMap): ScoreResult {
  let partAScore = 0;
  let partBScore = 0;
  let inattentionScore = 0;
  let hyperactivityScore = 0;

  for (const question of ASRS_QUESTIONS) {
    const answer = answers[question.number];
    if (answer === undefined) continue;
    if (!isShaded(question, answer)) continue;

    if (question.part === "A") partAScore++;
    else partBScore++;

    if (question.domain === "inatentie") inattentionScore++;
    else hyperactivityScore++;
  }

  const totalScore = partAScore + partBScore;
  const positiveScreen = partAScore >= PART_A_POSITIVE_CUTOFF;

  let level: Level;
  if (partAScore >= PART_A_POSITIVE_CUTOFF) level = "ridicat";
  else if (partAScore >= 2) level = "moderat";
  else level = "scazut";

  return {
    partAScore,
    partBScore,
    totalScore,
    inattentionScore,
    hyperactivityScore,
    level,
    positiveScreen,
  };
}

export const LEVEL_COPY: Record<Level, LevelCopy> = {
  ridicat: {
    level: "ridicat",
    category: "Nivel ridicat",
    description:
      "Scorurile indică o probabilitate ridicată de ADHD. Se recomandă evaluarea clinică detaliată.",
    tone: "high",
  },
  moderat: {
    level: "moderat",
    category: "Nivel moderat",
    description:
      "Scorurile indică posibile trăsături ADHD. Se recomandă discuție cu un specialist.",
    tone: "moderate",
  },
  scazut: {
    level: "scazut",
    category: "Nivel scăzut",
    description: "Scorurile nu indică un pattern semnificativ de simptome ADHD.",
    tone: "low",
  },
};

/** Interpretation paragraph for the Part A screener. */
export function partAInterpretation(partAScore: number): string {
  if (partAScore >= PART_A_POSITIVE_CUTOFF) {
    return "Scorul din Partea A indică o probabilitate ridicată de ADHD și necesitatea unei evaluări clinice complete.";
  }
  if (partAScore >= 2) {
    return "Scorul din Partea A sugerează posibile simptome ADHD. Se recomandă discuția cu un specialist.";
  }
  return "Scorul din Partea A nu indică un pattern semnificativ de simptome ADHD.";
}

/** Part B is supplementary; ≥ 6 of 12 shaded items is treated as elevated. */
export const PART_B_ELEVATED_CUTOFF = 6;

export function partBInterpretation(partBScore: number): string {
  if (partBScore >= PART_B_ELEVATED_CUTOFF) {
    return "Răspunsurile din Partea B indică prezența unor simptome ADHD suplimentare care pot fi relevante pentru evaluarea clinică.";
  }
  return "Răspunsurile din Partea B indică simptome ADHD ocazionale sau absente în domeniile suplimentare evaluate.";
}

export interface Recommendation {
  tone: "high" | "moderate" | "info";
  text: string;
  href?: string;
  linkLabel?: string;
  /** Partner brand whose logo precedes the link (when present). */
  brand?: BrandKey;
}

/** Build the conditional recommendation list shown beneath the result. */
export function buildRecommendations(result: ScoreResult): Recommendation[] {
  const recs: Recommendation[] = [];

  if (result.partAScore >= PART_A_POSITIVE_CUTOFF) {
    recs.push({
      tone: "high",
      text: "Se recomandă programarea unei evaluări clinice complete cât mai curând.",
    });
  }

  if (result.partAScore >= 2 || result.partBScore >= PART_B_ELEVATED_CUTOFF) {
    recs.push({
      tone: "moderate",
      text: "Se recomandă discutarea rezultatelor cu un specialist în sănătate mintală.",
    });
  }

  recs.push({
    tone: "info",
    text: "Pentru mai multe informații despre ADHD și opțiuni de tratament, vizitați",
    href: RESOURCES.doctoradhd,
    linkLabel: "doctoradhd.com",
    brand: "doctoradhd",
  });

  return recs;
}

export const GENERAL_INTERPRETATION =
  "Acest screening oferă o evaluare inițială a posibilelor simptome ADHD. Partea A (primele 6 întrebări) este cea mai predictivă pentru diagnosticul ADHD. Un scor de 4 sau mai multe răspunsuri peste prag în Partea A sugerează o probabilitate ridicată și necesitatea unei evaluări clinice complete.";

export const SCORE_RANGES = {
  partA: PART_A_COUNT,
  partB: PART_B_COUNT,
  total: TOTAL_QUESTIONS,
  partAPositiveCutoff: PART_A_POSITIVE_CUTOFF,
} as const;
