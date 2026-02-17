"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createAppointment(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const payload = {
    clinic_id: clinicId,
    patient_id: String(formData.get("patient_id") || ""),
    doctor_id: String(formData.get("doctor_id") || "") || null,
    scheduled_at: String(formData.get("scheduled_at") || ""),
    status: String(formData.get("status") || "scheduled"),
    reason: String(formData.get("reason") || "").trim(),
  };

  const result = await supabase.from("appointments").insert(payload);
  assertSupabaseOk(result);
  revalidatePath("/appointments");
}

export async function updateAppointmentStatus(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "scheduled");
  const result = await supabase.from("appointments").update({ status }).eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/appointments");
}

export async function deleteAppointment(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("appointments").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/appointments");
}
