import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireSuperadmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // After OAuth, there can be a short window where the session cookie exists
  // but the `profiles` row has not been created/updated yet (DB triggers, etc.).
  // A small retry avoids the "click login twice" symptom.
  let profile:
    | {
        id: string;
        is_superadmin: boolean;
        is_matrix_admin: boolean;
      }
    | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase
      .from("profiles")
      .select("id, is_superadmin, is_matrix_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      profile = data as {
        id: string;
        is_superadmin: boolean;
        is_matrix_admin: boolean;
      };
      break;
    }

    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }

  const isAllowed = !!profile?.is_superadmin || !!profile?.is_matrix_admin;
  if (!isAllowed) {
    redirect("/login");
  }

  return { supabase, user, profile };
}

