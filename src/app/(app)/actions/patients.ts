"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createPatient(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const payload = {
    clinic_id: clinicId,
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    gender: String(formData.get("gender") || "").trim(),
  };

  const result = await supabase.from("patients").insert(payload);
  assertSupabaseOk(result);
  revalidatePath("/patients");
}

export async function updatePatient(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");

  const payload = {
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
  };

  const result = await supabase.from("patients").update(payload).eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/patients");
}

export async function deletePatient(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("patients").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/patients");
}
