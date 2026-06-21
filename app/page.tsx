import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { ConfidentialBanner } from "@/components/ConfidentialBanner";
import { AboutSection } from "@/components/AboutSection";
import { ScoringSection } from "@/components/ScoringSection";
import { ValiditySection } from "@/components/ValiditySection";
import { TestSection } from "@/components/test/TestSection";
import { Downloads } from "@/components/Downloads";
import { Resources } from "@/components/Resources";
import { Faq } from "@/components/Faq";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  faqSchema,
  medicalWebPageSchema,
} from "@/lib/structured-data";

export default function Home() {
  return (
    <>
      <JsonLd data={[medicalWebPageSchema(), faqSchema(), breadcrumbSchema()]} />
      <SiteHeader />
      <main id="main">
        <Hero />
        <ConfidentialBanner />
        <AboutSection />
        <ScoringSection />
        <ValiditySection />
        <TestSection />
        <Downloads />
        <Resources />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
