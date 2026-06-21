/**
 * JSON-LD structured data. Returns plain objects that are serialised into
 * <script type="application/ld+json"> tags. Mirrors (and tidies) the rich
 * results the previous deployment shipped: MedicalWebPage/WebApplication,
 * FAQPage, BreadcrumbList, Organization and WebSite.
 */
import { SITE } from "./site";
import { FAQ, SECTIONS } from "./content";

const BASE = SITE.url;

export function medicalWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalWebPage", "WebApplication"],
    name: "Test ADHD Adulți (screening) - Adult ADHD Self-Report Scale (ASRS v1.1)",
    headline: "Test ADHD Adulți (screening). Adult ADHD Self-Report Scale (ASRS v1.1)",
    description:
      "Test online gratuit pentru screening-ul ADHD la adulți folosind scala ASRS v1.1 recomandată de OMS. Confidențial, fără colectarea datelor, rezultate instantanee.",
    url: `${BASE}/`,
    mainEntityOfPage: `${BASE}/`,
    inLanguage: "ro",
    datePublished: "2024-11-08T14:37:01.000Z",
    dateModified: new Date().toISOString(),
    image: {
      "@type": "ImageObject",
      url: `${BASE}${SITE.ogImage.url}`,
      width: SITE.ogImage.width,
      height: SITE.ogImage.height,
      caption: SITE.ogImage.alt,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: `${BASE}/`,
      logo: { "@type": "ImageObject", url: SITE.logo, width: 256, height: 256 },
    },
    medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
    about: {
      "@type": "MedicalCondition",
      name: "ADHD",
      alternateName: [
        "Attention Deficit Hyperactivity Disorder",
        "Tulburare de hiperactivitate cu deficit de atenție",
      ],
      description:
        "Tulburare neurodezvoltamentală caracterizată prin dificultăți de atenție, hiperactivitate și impulsivitate",
    },
    mainEntity: {
      "@type": "MedicalTest",
      name: "Adult ADHD Self-Report Scale (ASRS v1.1)",
      description:
        "Scala de autoevaluare pentru ADHD la adulți, versiunea 1.1, dezvoltată de Organizația Mondială a Sănătății",
      testType: "Screening test",
      usedToDiagnose: { "@type": "MedicalCondition", name: "ADHD la adulți" },
    },
    applicationCategory: "HealthApplication",
    operatingSystem: "Web browser",
    softwareVersion: "2.0",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RON",
      availability: "https://schema.org/InStock",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Adulți (18+) cu suspiciuni de ADHD",
    },
    keywords: SITE.keywords.join(", "),
    isAccessibleForFree: true,
    isFamilyFriendly: true,
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema() {
  const items: { name: string; anchor: string }[] = [
    { name: "Despre ASRS", anchor: SECTIONS.about },
    { name: "Structură & Scoring", anchor: SECTIONS.scoring },
    { name: "Validitate", anchor: SECTIONS.validity },
    { name: "Începe testul", anchor: SECTIONS.test },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE}/#${item.anchor}`,
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: BASE,
    logo: SITE.logo,
    description:
      "Platformă online gratuită pentru screening-ul ADHD la adulți folosind scala ASRS v1.1 dezvoltată de Organizația Mondială a Sănătății",
    foundingDate: "2024",
    knowsAbout: [
      "ADHD",
      "Adult ADHD",
      "ASRS v1.1",
      "Screening psihologic",
      "Sănătate mintală",
    ],
    areaServed: "RO",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "support",
      email: SITE.email,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Test ADHD România - ASRS v1.1",
    alternateName: "Test ADHD Adulți",
    url: BASE,
    description:
      "Test online gratuit pentru screening-ul ADHD la adulți folosind ASRS v1.1",
    inLanguage: "ro",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

export function allSchemas() {
  return [
    medicalWebPageSchema(),
    faqSchema(),
    breadcrumbSchema(),
    organizationSchema(),
    websiteSchema(),
  ];
}
