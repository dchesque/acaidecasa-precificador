import { getSupabase } from "@/lib/supabase/client";

export const requireUserId = async (): Promise<string> => {
  const supabase = getSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Usuário não autenticado");
  }
  return user.id;
};

export class SupabaseError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "SupabaseError";
  }
}
