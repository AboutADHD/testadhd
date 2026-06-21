import type { NextConfig } from "next";

/**
 * Next.js 16 configuration for testadhd.ro
 *
 * The app sits behind nginx (reverse proxy on 127.0.0.1:9460) which terminates
 * the Cloudflare Origin TLS. Security + caching headers are emitted here so the
 * Node origin is self-contained and identical in dev and prod.
 */

// Content-Security-Policy: the app loads zero third-party runtime resources
// (fonts are self-hosted via next/font, there is no analytics, no CDN, no XHR
// to external origins). `unsafe-inline`/`unsafe-eval` are required by the Next
// hydration bootstrap and React Server Components inline scripts.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

// The production nginx already emits X-Frame-Options, X-Content-Type-Options,
// X-XSS-Protection and Referrer-Policy globally for every site, so we only set
// the headers it does NOT (CSP, HSTS, Permissions-Policy) to avoid duplicates.
// These also keep the app self-contained when run without nginx (dev/preview).
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // The screening tool stores nothing server-side; trust the X-Forwarded-* set
  // by nginx so canonical/absolute URLs resolve to https://www.testadhd.ro.
  async headers() {
    // Next.js already serves hashed /_next/static assets with immutable caching;
    // we only add the security headers here, across every route.
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Legacy clean-URL canonicalisation from the previous static deployment.
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
