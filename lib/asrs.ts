/**
 * ASRS v1.1 — Adult ADHD Self-Report Scale (World Health Organisation).
 *
 * Canonical questionnaire data for the screening tool. The Romanian wording is
 * carried over verbatim from the previous deployment so the clinical instrument
 * is unchanged.
 *
 * Scoring note (important): the official ASRS v1.1 uses TWO shaded zones. For
 * items 1-3, 9, 12, 16, 18 a response of "Uneori" or higher counts as a
 * symptomatic ("shaded") answer; for the remaining items only "Adesea" or
 * higher counts. This two-zone rule is encoded per-question via `thresholdIndex`
 * (2 = "Uneori+", 3 = "Adesea+"). The legacy JavaScript applied a single uniform
 * "Uneori+" threshold to every item, which over-counted positives; this
 * implementation follows the official scale (and the scoring tables that the
 * page itself documents).
 */

export type Part = "A" | "B";
export type Domain = "inatentie" | "hiperactivitate";

/** Minimum 0-based response index that scores as a symptomatic answer. */
export type ThresholdIndex = 2 | 3;

export interface AsrsQuestion {
  /** 1-based question number as presented to the user (1-18). */
  number: number;
  /** Part A = the 6-item screener; Part B = the 12 supplementary items. */
  part: Part;
  /** Symptom domain the item loads onto. */
  domain: Domain;
  /** 2 = counts from "Uneori"; 3 = counts only from "Adesea". */
  thresholdIndex: ThresholdIndex;
  /** Verbatim Romanian item text. */
  text: string;
}

export interface ResponseOption {
  /** 0-based index (0 = Niciodată … 4 = Foarte des). */
  index: number;
  label: string;
  description: string;
}

/** The 5-point Likert frequency scale shared by every item. */
export const RESPONSE_OPTIONS: readonly ResponseOption[] = [
  { index: 0, label: "Niciodată", description: "Nu se întâmplă niciodată sau foarte rar." },
  { index: 1, label: "Rareori", description: "Se întâmplă ocazional, dar nu frecvent." },
  { index: 2, label: "Uneori", description: "Se întâmplă din când în când." },
  { index: 3, label: "Adesea", description: "Se întâmplă frecvent, în mod regulat." },
  { index: 4, label: "Foarte des", description: "Se întâmplă aproape tot timpul." },
] as const;

export const ASRS_QUESTIONS: readonly AsrsQuestion[] = [
  {
    number: 1,
    part: "A",
    domain: "inatentie",
    thresholdIndex: 2,
    text: "Cât de des vă este greu să puneți la punct ultimele detalii ale unui proiect, după ce părțile dificile au fost realizate?",
  },
  {
    number: 2,
    part: "A",
    domain: "inatentie",
    thresholdIndex: 2,
    text: "Cât de des aveți dificultăți în a pune lucrurile în ordine atunci când aveți de îndeplinit o sarcină care necesită organizare?",
  },
  {
    number: 3,
    part: "A",
    domain: "inatentie",
    thresholdIndex: 2,
    text: "Cât de des aveți probleme în a vă aminti că aveți stabilite întâlniri sau de îndeplinit obligații?",
  },
  {
    number: 4,
    part: "A",
    domain: "inatentie",
    thresholdIndex: 3,
    text: "Atunci când ai o sarcină care necesită multă gândire/efort susținut de concentrare, cât de des eviți sau întârzii să începeți?",
  },
  {
    number: 5,
    part: "A",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des vă agitați sau mișcați mâinile sau picioarele atunci când trebuie să stați așezat pentru o perioadă lungă de timp?",
  },
  {
    number: 6,
    part: "A",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des vă simțiți excesiv de activ și obligat(ă) să faceți lucruri, ca și cum ați fi condus(ă) de un motor?",
  },
  {
    number: 7,
    part: "B",
    domain: "inatentie",
    thresholdIndex: 3,
    text: "Cât de des faceți greșeli din neglijență atunci când trebuie să lucrați la un proiect plictisitor sau dificil?",
  },
  {
    number: 8,
    part: "B",
    domain: "inatentie",
    thresholdIndex: 3,
    text: "Cât de des aveți dificultăți în a vă menține atenția atunci când faceți o muncă plictisitoare sau repetitivă?",
  },
  {
    number: 9,
    part: "B",
    domain: "inatentie",
    thresholdIndex: 2,
    text: "Cât de des aveți dificultăți în a vă concentra asupra a ceea ce vă spun oamenii, chiar și atunci când aceștia vi se adresează direct?",
  },
  {
    number: 10,
    part: "B",
    domain: "inatentie",
    thresholdIndex: 3,
    text: "Cât de des rătăciți obiecte sau aveți dificultăți în găsirea acestora acasă sau la serviciu?",
  },
  {
    number: 11,
    part: "B",
    domain: "inatentie",
    thresholdIndex: 3,
    text: "Cât de des sunteți distras(ă) de activități sau zgomote din jurul dvs.?",
  },
  {
    number: 12,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 2,
    text: "Cât de des vă părăsiți locul în ședințe sau în alte situații în care se așteaptă să stați așezat(ă)?",
  },
  {
    number: 13,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des vă simțiți neliniștit(ă) sau agitat(ă)?",
  },
  {
    number: 14,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des aveți dificultăți în a vă destinde și relaxa atunci când aveți timp pentru dvs.?",
  },
  {
    number: 15,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des vi se întâmplă să vorbiți prea mult în contexte sociale?",
  },
  {
    number: 16,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 2,
    text: "Când purtați o conversație, cât de des vă surprindeți terminând propozițiile celor cu care vorbiți, înainte ca ei să le poată termina?",
  },
  {
    number: 17,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 3,
    text: "Cât de des întâmpinați dificultăți în a vă aștepta rândul în situații în care este necesar să așteptați să vă vină rândul?",
  },
  {
    number: 18,
    part: "B",
    domain: "hiperactivitate",
    thresholdIndex: 2,
    text: "Cât de des îi întrerupeți din activitate pe ceilalți atunci când sunt ocupați?",
  },
] as const;

export const PART_A_QUESTIONS = ASRS_QUESTIONS.filter((q) => q.part === "A");
export const PART_B_QUESTIONS = ASRS_QUESTIONS.filter((q) => q.part === "B");

export const TOTAL_QUESTIONS = ASRS_QUESTIONS.length; // 18
export const PART_A_COUNT = PART_A_QUESTIONS.length; // 6
export const PART_B_COUNT = PART_B_QUESTIONS.length; // 12

/** ≥ this many shaded Part A items = positive screen per the official scale. */
export const PART_A_POSITIVE_CUTOFF = 4;

/** A user's answers, keyed by 1-based question number → 0-based response index. */
export type AnswerMap = Record<number, number | undefined>;

/** True when the selected response counts as a symptomatic answer for the item. */
export function isShaded(question: AsrsQuestion, responseIndex: number): boolean {
  return responseIndex >= question.thresholdIndex;
}
