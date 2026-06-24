"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of the children after a render/runtime error. Defaults to nothing. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Minimal client error boundary used to *isolate* a fragile island so a runtime
 * exception inside it can never propagate to the React root and unmount the rest
 * of the page.
 *
 * This matters specifically because the page reveals its above-the-fold content
 * with `motion` (elements are server-rendered at `opacity:0` and only become
 * visible once the client animation runs). If any island threw during render
 * with no boundary in place, React would tear down the whole tree, the entrance
 * animations would never run, and every section would stay frozen at
 * `opacity:0` — i.e. "the Hero and everything else fails to load".
 *
 * The default fallback is `null`: a failed island simply disappears, leaving the
 * screening tool fully usable. No telemetry is emitted (the app sends nothing to
 * any network); errors are logged to the console in development only.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] isolated a client island failure:", error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
