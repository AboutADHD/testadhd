/**
 * Editorial + clinical content for the informational sections. Kept as data so
 * the components stay presentational and the Romanian copy lives in one place.
 */
import { RESOURCES } from "./site";

export interface ResourceCard {
  kind: "educational" | "clinical" | "community";
  title: string;
  description: string;
  linkLabel: string;
  href: string;
}

export const RESOURCE_CARDS: ResourceCard[] = [
  {
    kind: "educational",
    title: "Despre ADHD din surse de autoritate",
    description:
      "O colecție de referințe bibliografice, precum ghidurile internaționale de practică medicală și convențiile de consens.",
    linkLabel: "despreadhd.ro",
    href: RESOURCES.despreadhd,
  },
  {
    kind: "clinical",
    title: "Diagnostic și tratament ADHD",
    description:
      "Profesioniști cu experiență în evaluarea, diagnosticul și tratamentul ADHD la adulți, copii și adolescenți.",
    linkLabel: "doctoradhd.com",
    href: RESOURCES.doctoradhd,
  },
  {
    kind: "community",
    title: "Comunitate de sprijin ADHD",
    description: "Grup de suport cu peste 7.700 de membri.",
    linkLabel: "Grup Facebook",
    href: RESOURCES.facebookGroup,
  },
];

export const ABOUT_INTRO =
  "Adult ADHD Self-Report Scale (ASRS v1.1) este un instrument de screening pentru tulburarea de deficit de atenție și hiperactivitate (ADHD) la adulți, constând din două părți. Partea A reprezintă testul principal, în timp ce Partea B oferă informații suplimentare care pot fi discutate cu specialistul dumneavoastră.";

export interface InfoFact {
  label: string;
  value: string;
  href?: string;
}

export const INFO_FACTS: InfoFact[] = [
  { label: "Tip", value: "Instrument de screening" },
  { label: "An publicare", value: "2005" },
  { label: "Autori", value: "Ronald C. Kessler et al." },
  {
    label: "Lucrare seminală",
    value: "The WHO Adult ADHD Self-Report Scale (ASRS v1.1)",
    href: RESOURCES.seminalPaper,
  },
];

export const AUDIENCE = "Adulți (18+) cu IQ în intervalul de referință (IQ ≥ 80)";

export const COMPONENTS = {
  inattention: { label: "Inatenție", items: "Întrebările 1-4, 7-11" },
  hyperactivity: { label: "Hiperactivitate-impulsivitate", items: "Întrebările 5-6, 12-18" },
  note:
    "ASRS v1.1 este doar un instrument de screening, nu un test diagnostic. Un rezultat pozitiv necesită o evaluare completă din partea unui specialist.",
};

/** Official two-zone scoring tables (transparent documentation of the rule). */
export interface ScoringTable {
  caption: string;
  rows: { option: string; score: 0 | 1 }[];
}

export const SCORING_TABLES: ScoringTable[] = [
  {
    caption: "Pentru întrebările 1-3, 9, 12, 16, 18",
    rows: [
      { option: "Niciodată", score: 0 },
      { option: "Rareori", score: 0 },
      { option: "Uneori", score: 1 },
      { option: "Adesea", score: 1 },
      { option: "Foarte des", score: 1 },
    ],
  },
  {
    caption: "Pentru întrebările 4-8, 10, 11, 13-15, 17",
    rows: [
      { option: "Niciodată", score: 0 },
      { option: "Rareori", score: 0 },
      { option: "Uneori", score: 0 },
      { option: "Adesea", score: 1 },
      { option: "Foarte des", score: 1 },
    ],
  },
];

export const VALIDITY_INTRO =
  "Deși ASRS v1.1 poate diagnostica eficient ADHD la adulți, nu poate exclude alte afecțiuni medicale care ar putea impacta diagnosticul ADHD. Validitatea variază în funcție de versiunea utilizată (screening sau completă).";

export interface ValidityRow {
  measure: string;
  tooltip: string;
  sixItems: string;
  eighteenItems: string;
}

export const VALIDITY_ROWS: ValidityRow[] = [
  {
    measure: "Sensibilitate",
    tooltip: "Capacitatea testului de a identifica corect pacienții cu ADHD",
    sixItems: "68,7%",
    eighteenItems: "56,3%",
  },
  {
    measure: "Specificitate",
    tooltip: "Capacitatea testului de a identifica corect persoanele fără ADHD",
    sixItems: "99,5%",
    eighteenItems: "98,3%",
  },
  {
    measure: "Acuratețe clasificare",
    tooltip: "Raportul dintre predicțiile corecte și numărul total de cazuri",
    sixItems: "97,9%",
    eighteenItems: "96,2%",
  },
  {
    measure: "Kappa",
    tooltip: "Gradul de acord între diferite măsurători sau interpretări",
    sixItems: "0,76",
    eighteenItems: "0,58",
  },
];

export const VALIDITY_NOTE =
  "ASRS v1.1 este mai eficient în identificarea persoanelor care nu au ADHD decât în identificarea celor care au, dar primele 6 întrebări pot identifica aproape 70% dintre persoanele cu ADHD. Pentru o precizie mai mare, se recomandă versiunea ASRS-5, care identifică corect peste 90% dintre cazuri.";

export interface Reference {
  authors: string;
  title: string;
  href: string;
}

export const REFERENCES: Reference[] = [
  {
    authors: "Kessler et al., 2005",
    title:
      "The World Health Organisation Adult ADHD Self-Report Scale (ASRS v1.1): a short screening scale for use in the general population",
    href: "https://doi.org/10.1017/s0033291704002892",
  },
  {
    authors: "Harvard Medical School",
    title: "Adult ADHD Self-Report Scale (ASRS v1.1) — Background Information",
    href: "https://www.hcp.med.harvard.edu/ncs/ftpdir/adhd/background_memo_rev_2023_edit.pdf",
  },
  {
    authors: "Gray et al., 2014",
    title:
      "The Adult ADHD Self-Report Scale (ASRS v1.1): utility in college students with attention-deficit/hyperactivity disorder",
    href: "https://doi.org/10.7717/peerj.324",
  },
  {
    authors: "Harvard Medical School / APA",
    title: "Adult ADHD Self-Report Scale (ASRS-v1.1) Symptom Checklist",
    href: "https://www.apaservices.org/practice/reimbursement/health-registry/self-reporting-sympton-scale.pdf",
  },
  {
    authors: "Young et al., 2019",
    title:
      "Establishing US norms for the Adult ADHD Self-Report Scale (ASRS-v1.1) and characterising symptom burden among adults with self-reported ADHD",
    href: "https://doi.org/10.1111/jcpp.13063",
  },
  {
    authors: "Adler et al., 2018",
    title:
      "Validation of the Expanded Versions of the Adult ADHD Self-Report Scale v1.1 Symptom Checklist and the Adult ADHD Investigator Symptom Rating Scale",
    href: "https://doi.org/10.1177/1087054718756197",
  },
  {
    authors: "Nilsson et al., 2024",
    title:
      "The WHO Adult ADHD self-report Scale used in a clinical sample of patients with overlapping symptoms — psychometric properties of and scoring methods for the Swedish translation",
    href: "https://doi.org/10.1080/08039488.2024.2333079",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question: "Ce este testul ASRS v1.1 și cât de precis este?",
    answer:
      "ASRS v1.1 (Adult ADHD Self-Report Scale) este un instrument de screening dezvoltat de Organizația Mondială a Sănătății pentru identificarea simptomelor ADHD la adulți. Testul are o acuratețe de aproximativ 90% în identificarea persoanelor fără ADHD și poate identifica corect circa 70% dintre persoanele cu ADHD folosind primele 6 întrebări.",
  },
  {
    question: "Este testul ASRS v1.1 un diagnostic oficial pentru ADHD?",
    answer:
      "Nu, testul ASRS v1.1 este doar un instrument de screening, nu un diagnostic. Rezultatele pot indica prezența trăsăturilor ADHD, dar un diagnostic oficial poate fi stabilit doar de un psiholog sau psihiatru calificat prin evaluare clinică cuprinzătoare.",
  },
  {
    question: "Cine poate folosi testul ASRS v1.1?",
    answer:
      "Testul se adresează adulților (18+ ani) cu IQ în intervalul de referință (IQ ≥ 80). Este util pentru persoanele care suspectează că ar putea avea ADHD și doresc o evaluare preliminară a simptomelor înainte de a consulta un specialist.",
  },
  {
    question: "Sunt datele mele personale colectate sau stocate?",
    answer:
      "Nu, aplicația este complet confidențială. Nu colectăm, stocăm sau transmitem nicio informație personală. Toate calculele se fac local în browserul dumneavoastră și rezultatele nu sunt salvate nicăieri.",
  },
  {
    question: "Cât timp durează completarea testului?",
    answer:
      "Testul ASRS v1.1 conține 18 întrebări și durează în medie 5-10 minute pentru completare. Rezultatele sunt disponibile imediat după finalizare, cu explicații detaliate pentru interpretarea scorurilor.",
  },
  {
    question: "Ce înseamnă rezultatele testului ADHD?",
    answer:
      "Testul oferă două scoruri: unul pentru Partea A (6 întrebări de screening) și unul pentru testul complet (18 întrebări). Un scor ridicat poate indica prezența simptomelor ADHD, dar este necesar să consultați un specialist pentru evaluare și diagnostic corect.",
  },
  {
    question: "Este testul ASRS v1.1 actualizat conform criteriilor DSM-5?",
    answer:
      "Da, testul ASRS v1.1 rămâne compatibil cu criteriile DSM-5-TR. Simptomele de bază pentru ADHD la adulți sunt în esență neschimbate între DSM-IV și DSM-5, iar întrebările ASRS au fost deja adaptate pentru manifestarea simptomelor la adulți.",
  },
  {
    question: "Pot folosi testul pentru copii sau adolescenți?",
    answer:
      "Nu, testul ASRS v1.1 este destinat exclusiv adulților (18+ ani). Pentru copii și adolescenți există alte instrumente de evaluare specifice vârstei, care trebuie administrate de specialiști în sănătate mintală.",
  },
];

export const DISCLAIMER_IMPORTANT =
  "Acest test este destinat EXCLUSIV în scop informativ (de screening) și NU trebuie utilizat ca instrument de diagnostic. Vă încurajăm să consultați un profesionist calificat (medic psihiatru sau psiholog clinician) pentru o evaluare completă.";

export const WHO_COPYRIGHT =
  "ADHD-ASRS Screener v1.1 și ADHD-ASRS Symptom Checklist v1.1 sunt protejate prin drepturi de autor de către World Health Organisation.";

export const CONFIDENTIAL_BANNER =
  "100% CONFIDENȚIAL — nu colectăm nicio informație despre tine, nu folosim cookie-uri și nu stocăm rezultatele.";

/** Page anchors used by the in-page navigation and structured data. */
export const SECTIONS = {
  about: "despre-asrs",
  scoring: "structura-scoring",
  validity: "validitate",
  test: "test",
  faq: "intrebari-frecvente",
} as const;

export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Despre ASRS", href: `#${SECTIONS.about}` },
  { label: "Structură & Scoring", href: `#${SECTIONS.scoring}` },
  { label: "Validitate", href: `#${SECTIONS.validity}` },
  { label: "Începe testul", href: `#${SECTIONS.test}` },
];

/**
 * Motivational progress copy. Selected by completion ratio and whether Part A is
 * done — keeps ADHD users in momentum without being patronising.
 */
export function progressMessage(percent: number, partAComplete: boolean): string {
  if (percent <= 0) return "Hai să începem — primul pas este cel mai important.";
  if (percent < 33) return "Mergi bine. Răspunde sincer, gândindu-te la ultimele 6 luni.";
  if (partAComplete && percent < 40) return "Ai terminat Partea A. Continuăm cu Partea B.";
  if (percent < 75) return "Ești pe drumul cel bun — a mai rămas mai puțin de jumătate.";
  if (percent < 100) return "Aproape gata. Încă puțin.";
  return "Ai completat tot. Apasă „Calculează scorul” pentru rezultat.";
}
