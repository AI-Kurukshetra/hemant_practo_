"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";

export async function syncMyRoleFromAuth() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const role = (user.user_metadata?.role as string | undefined) || "patient";
  await supabase.from("profiles").update({ role }).eq("id", user.id);
  revalidatePath("/settings");
}
