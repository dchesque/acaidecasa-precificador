"use client";

import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Visible warning shown to users when the app is running on mock data because
 * `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing.
 * Renders nothing once a Supabase backend is configured.
 */
export function MockModeBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-900 flex items-center gap-2"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>
        <strong>Modo de demonstração:</strong> Supabase não configurado — alterações
        não serão salvas. Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no <code>.env.local</code> para
        habilitar persistência.
      </span>
    </div>
  );
}
