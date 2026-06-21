/**
 * Central site configuration. Single source of truth for URLs, brand strings and
 * SEO defaults consumed by the metadata API, structured data, sitemap and footer.
 */
export const SITE = {
  name: "Test ADHD România",
  shortName: "Test ADHD",
  legalName: "Test ADHD România",
  url: "https://www.testadhd.ro",
  domain: "testadhd.ro",
  lang: "ro",
  locale: "ro_RO",
  localeAlternate: "en_US",
  themeColor: "#4B45D6",
  email: "contact@aboutadhd.ro",
  twitter: "@aboutadhdro",
  githubRepo: "https://github.com/hodorogandrei/testadhd",
  author: {
    name: "Andrei Hodorog",
    linkedin: "https://www.linkedin.com/in/andreihodorog/",
  },
  ogImage: {
    url: "/asrs-adhd.jpg",
    width: 1200,
    height: 675,
    alt: "Test ADHD pentru adulți - ASRS v1.1",
  },
  // Brand logo used as Organization/publisher logo in structured data.
  logo: "https://www.despreadhd.ro/content/images/size/w256h256/2024/03/About-ADHD-brain-icon.png",
  title: "Test ADHD adulți (screening) - ASRS v1.1 (Adult ADHD Self-Report Scale)",
  description:
    "Test online gratuit ADHD pentru adulți folosind ASRS v1.1 dezvoltată de OMS. Screening confidențial cu rezultate instantanee. Fără colectarea datelor personale. Începe testul acum!",
  keywords: [
    "test ADHD",
    "ASRS v1.1",
    "screening ADHD adulți",
    "autoevaluare ADHD",
    "test online ADHD",
    "hiperactivitate",
    "deficit atenție",
    "diagnostic ADHD",
    "OMS",
    "ADHD adulți România",
  ],
  // Estimated completion time, surfaced in copy and structured data.
  estimatedMinutes: 7,
} as const;

/** External resources referenced across the page (also used in structured data). */
export const RESOURCES = {
  doctoradhd: "https://www.doctoradhd.com",
  despreadhd: "https://www.despreadhd.ro",
  facebookGroup: "https://fb.com/groups/aboutadhd",
  lisdex: "https://sos.lisdex.ro",
  ccLicense: "https://creativecommons.org/licenses/by/4.0/",
  romanianPdf: "/scala-de-autoevaluare-simptome-adhd.pdf",
  apaPdf:
    "https://www.apaservices.org/practice/reimbursement/health-registry/self-reporting-sympton-scale.pdf",
  seminalPaper: "https://pubmed.ncbi.nlm.nih.gov/15841682/",
} as const;
