'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// The accessibility widget is a large client-only island: it mutates the live
// DOM, drives the Web Speech narrator, and lazily embeds the support iframe.
// Loading it via next/dynamic with `ssr: false` keeps it out of the
// server-rendered HTML and out of the initial JS — it streams in after
// hydration, so it never blocks first paint for users who never open it.
//
// `ssr: false` is only legal inside a Client Component, which is exactly why
// this thin wrapper exists: app/layout.tsx stays a Server Component and simply
// renders <AccessibilityWidgetIsland />.
const AccessibilityWidget = dynamic(() => import('./AccessibilityWidget'), {
  ssr: false,
});

// The widget is wrapped in an ErrorBoundary so that — should this large island
// ever throw at runtime (Web Speech quirks, a malformed saved setting, a DOM
// edge case) — the failure is contained to the widget. Without it, an uncaught
// throw would unmount the React root and, because the page reveals its content
// with motion (opacity:0 → 1), leave the Hero and every section permanently
// invisible. The fallback is nothing: the screening tool stays fully usable.
export default function AccessibilityWidgetIsland() {
  return (
    <ErrorBoundary>
      <AccessibilityWidget />
    </ErrorBoundary>
  );
}
