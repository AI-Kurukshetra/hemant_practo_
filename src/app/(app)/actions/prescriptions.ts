"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createPrescription(formData: FormData) {
  await requireRole(["admin", "doctor"]);
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const payload = {
    clinic_id: clinicId,
    patient_id: String(formData.get("patient_id") || ""),
    doctor_id: String(formData.get("doctor_id") || "") || null,
    appointment_id: String(formData.get("appointment_id") || "") || null,
    diagnosis: String(formData.get("diagnosis") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    items: [],
  };

  const result = await supabase.from("prescriptions").insert(payload);
  assertSupabaseOk(result);
  revalidatePath("/prescriptions");
}

export async function deletePrescription(formData: FormData) {
  await requireRole(["admin", "doctor"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("prescriptions").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/prescriptions");
}
