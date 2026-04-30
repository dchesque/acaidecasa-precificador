import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv, assertProductionEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

assertProductionEnv();

let cached: SupabaseClient<Database> | null = null;

const buildClient = (): SupabaseClient<Database> | null => {
  if (cached) return cached;
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  cached = createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return cached;
};

export const supabase: SupabaseClient<Database> | null = buildClient();

export const isSupabaseConfigured = (): boolean => Boolean(supabase);

// Convenience helper for hooks/components that should fail loudly when called
// without configuration (after a runtime check has been done elsewhere).
export const getSupabase = (): SupabaseClient<Database> => {
  const c = supabase;
  if (!c) {
    throw new Error("Supabase client requested but env vars are missing.");
  }
  return c;
};
