import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";

export async function getPatientRecord() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("patients")
    .select("id, clinic_id, full_name, email, phone")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!data) {
    return null;
  }

  return data;
}
