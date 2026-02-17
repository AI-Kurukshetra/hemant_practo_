"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createDoctor(formData: FormData) {
  await requireRole(["admin"]);
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const userId = String(formData.get("user_id") || "").trim();
  const payload = {
    clinic_id: clinicId,
    user_id: userId,
    specialization: String(formData.get("specialization") || "").trim(),
    license_number: String(formData.get("license_number") || "").trim(),
  };

  const result = await supabase
    .from("doctors")
    .upsert(payload, { onConflict: "clinic_id,user_id" });
  assertSupabaseOk(result);

  if (userId) {
    const membershipResult = await supabase.from("clinic_users").insert(
      {
        clinic_id: clinicId,
        user_id: userId,
        role: "doctor",
      },
      { ignoreDuplicates: true }
    );
    assertSupabaseOk(membershipResult);
  }
  revalidatePath("/doctors");
}

export async function updateDoctor(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get("id") || "");
  const payload = {
    specialization: String(formData.get("specialization") || "").trim(),
    license_number: String(formData.get("license_number") || "").trim(),
  };

  const result = await supabase.from("doctors").update(payload).eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/doctors");
}

export async function deleteDoctor(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("doctors").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/doctors");
}
