import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { clientEnv, assertProductionEnv } from "@/lib/env";

assertProductionEnv();

export const supabase: SupabaseClient | null =
  clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = () => Boolean(supabase);
