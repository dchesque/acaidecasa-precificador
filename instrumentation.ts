/**
 * Next.js instrumentation hook — runs once per server startup.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * The implementation degrades gracefully when `@sentry/nextjs` is not
 * installed or `NEXT_PUBLIC_SENTRY_DSN` is unset.
 */
export async function register() {
  const { initObservability } = await import("./src/lib/observability");
  await initObservability();
}
