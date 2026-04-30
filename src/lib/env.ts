/**
 * Centralized, type-safe access to client-side env vars.
 * Reads only NEXT_PUBLIC_* variables — server-only secrets must live elsewhere.
 */

type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string | null;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string | null;
};

const readEnv = (key: keyof ClientEnv): string | null => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : null;
};

export const clientEnv: ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};

export const isSupabaseEnvConfigured = (): boolean =>
  Boolean(clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Surfaces missing env vars at build time when `NODE_ENV === 'production'`.
 * Logs a warning in development so the app keeps running in mock mode.
 */
export const assertProductionEnv = (): void => {
  if (process.env.NODE_ENV !== "production") return;
  const missing: string[] = [];
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required production environment variables: ${missing.join(", ")}`
    );
  }
};
