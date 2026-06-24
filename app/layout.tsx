import type { Metadata, Viewport } from "next";
import { Sora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/JsonLd";
import AccessibilityWidgetIsland from "@/components/accessibility/AccessibilityWidgetIsland";
import "./globals.css";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | Test ADHD România",
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.author.name, url: SITE.author.linkedin }],
  creator: SITE.author.name,
  publisher: SITE.name,
  applicationName: "Test ADHD ASRS v1.1",
  category: "health",
  alternates: {
    canonical: "/",
    languages: { ro: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "Test ADHD România - ASRS v1.1",
    title: "Test Gratuit ADHD pentru Adulți - ASRS v1.1 OMS | Rezultate Instantanee",
    description:
      "Test online confidențial ADHD pentru adulți folosind ASRS v1.1 dezvoltată de Organizația Mondială a Sănătății. Fără colectarea datelor. Începe testul gratuit acum!",
    url: `${SITE.url}/`,
    locale: SITE.locale,
    images: [
      {
        url: SITE.ogImage.url,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    creator: SITE.twitter,
    title: "Test Gratuit ADHD Adulți - ASRS v1.1 | Screening Confidențial",
    description:
      "Test online ADHD pentru adulți cu ASRS v1.1 OMS. Confidențial, fără colectarea datelor, rezultate instantanee. Începe testul gratuit!",
    images: [SITE.ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "Test ADHD",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ro"
      className={`${sora.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        {/* No-JS failsafe: the scroll-reveal sections are server-rendered at
            opacity:0 by `motion` and only become visible once the client
            animation runs. If JavaScript is disabled the animation never fires,
            so force every motion-hidden block visible. The Hero does not rely on
            this (its entrance is pure CSS), and the widget is never present
            without JS, so this only ever reveals the Reveal-wrapped content. */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Sari la conținut
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
        {/* Floating accessibility toolbar — lazy client island, never SSR'd. */}
        <AccessibilityWidgetIsland />
      </body>
    </html>
  );
}
