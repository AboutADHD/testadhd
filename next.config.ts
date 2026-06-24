import type { NextConfig } from "next";

/**
 * Next.js 16 configuration for testadhd.ro
 *
 * The app sits behind nginx (reverse proxy on 127.0.0.1:9460) which terminates
 * the Cloudflare Origin TLS. Security + caching headers are emitted here so the
 * Node origin is self-contained and identical in dev and prod.
 */

// Content-Security-Policy: the app itself loads zero third-party runtime
// resources (fonts are self-hosted via next/font + the local OpenDyslexic face,
// there is no analytics, no CDN, no XHR to external origins). The ONE exception
// is the accessibility widget's optional "Support" panel, which embeds a Buy Me
// a Coffee iframe — and ONLY after an explicit user click. No BMC script runs in
// this document, and the embedded BMC page is a separate browsing context with
// its own CSP, so we only need to allow the frame itself (`frame-src`); the
// parent makes no XHR to BMC, so `connect-src` stays 'self'. The Stripe origin
// covers BMC's payment checkout sub-frame. The screening test never sends data
// anywhere. `unsafe-inline`/`unsafe-eval` are required by the Next hydration
// bootstrap, RSC inline scripts and the widget's injected <style>.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' https://buymeacoffee.com https://*.stripe.com",
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
  // `payment` is delegated to the Buy Me a Coffee iframe (allow="payment *" on it)
  // so the donation checkout works; everything else stays denied.
  { key: "Permissions-Policy", value: 'geolocation=(), microphone=(), camera=(), browsing-topics=(), payment=(self "https://buymeacoffee.com")' },
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
      {
        // The HTML document must ALWAYS be revalidated. Next's default for a
        // statically-prerendered page is `s-maxage=31536000` with no browser
        // directive, which lets a browser (or a misconfigured shared cache) keep
        // serving an old document. Because every build emits new hashed
        // /_next/static chunk filenames, a stale document points at chunks that
        // were deleted by the next deploy → they 404 → client JS never runs.
        // `max-age=0, must-revalidate` makes the browser send a conditional
        // request (ETag) on every load: 304 when unchanged, fresh HTML the moment
        // a deploy changes it. Scoped to the document only — `/_next/static`
        // matches `/:path*` above, not this rule, so assets keep their immutable
        // year-long cache.
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
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
