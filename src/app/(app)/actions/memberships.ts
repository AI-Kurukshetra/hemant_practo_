"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function joinAllClinics() {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: clinics } = await supabase.from("clinics").select("id");
  if (!clinics || clinics.length === 0) return;

  const payload = clinics.map((clinic) => ({
    clinic_id: clinic.id,
    user_id: user.id,
    role: "admin",
  }));

  const result = await supabase.from("clinic_users").insert(payload, {
    ignoreDuplicates: true,
  });
  assertSupabaseOk(result);
  revalidatePath("/clinics");
  revalidatePath("/doctors");
  revalidatePath("/patients");
  revalidatePath("/appointments");
  revalidatePath("/prescriptions");
  revalidatePath("/billing");
}
