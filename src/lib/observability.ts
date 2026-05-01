/**
 * Tiny Sentry façade.
 *
 * The app must keep working without `@sentry/nextjs` installed (so we don't
 * force the dependency on people running locally / in mock mode). When
 * Sentry IS installed and `NEXT_PUBLIC_SENTRY_DSN` is set, errors are
 * forwarded; otherwise everything degrades to console.* in dev and a no-op
 * in production.
 *
 * To enable:
 *   1. `npm install @sentry/nextjs`
 *   2. Add NEXT_PUBLIC_SENTRY_DSN to .env.local
 *   3. Restart the dev server
 */

import { isSentryEnabled, clientEnv } from "@/lib/env";

type Severity = "fatal" | "error" | "warning" | "info" | "debug";

interface SentryLike {
  init?: (options: {
    dsn: string;
    environment?: string | null;
    tracesSampleRate?: number;
  }) => void;
  captureException?: (error: unknown, context?: Record<string, unknown>) => void;
  captureMessage?: (message: string, level?: Severity) => void;
  setUser?: (user: { id?: string; email?: string } | null) => void;
}

let sentry: SentryLike | null = null;
let initialized = false;

const tryLoadSentry = async (): Promise<SentryLike | null> => {
  if (sentry) return sentry;
  if (!isSentryEnabled()) return null;
  try {
    // Dynamic import so the bundler doesn't require the package to be installed.
    sentry = (await import(/* webpackIgnore: true */ "@sentry/nextjs")) as SentryLike;
    return sentry;
  } catch {
    return null;
  }
};

export const initObservability = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;
  const s = await tryLoadSentry();
  if (s?.init && clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
    s.init({
      dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
      environment: clientEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      tracesSampleRate: 0.1,
    });
  }
};

export const captureException = (
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (sentry?.captureException) {
    sentry.captureException(error, context);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[observability]", error, context);
  }
};

export const captureMessage = (message: string, level: Severity = "info"): void => {
  if (sentry?.captureMessage) {
    sentry.captureMessage(message, level);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    const fn = level === "error" || level === "fatal" ? console.error : console.warn;
    fn(`[observability:${level}]`, message);
  }
};

export const identifyUser = (user: { id?: string; email?: string } | null): void => {
  sentry?.setUser?.(user);
};
