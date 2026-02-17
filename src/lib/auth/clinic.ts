import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile, requireUser } from "./require-auth";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function getActiveClinicId() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("clinic_users")
    .select("clinic_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!data?.clinic_id) {
    const profile = await getUserProfile();
    if (profile.role !== "patient") {
      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (clinic?.id) {
        const membershipResult = await supabase.from("clinic_users").insert({
          clinic_id: clinic.id,
          user_id: user.id,
          role: profile.role,
        });
        assertSupabaseOk(membershipResult);
        return clinic.id as string;
      }
    }
    redirect("/clinics");
  }

  return data.clinic_id as string;
}
