"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createInvoice(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const payload = {
    clinic_id: clinicId,
    patient_id: String(formData.get("patient_id") || ""),
    appointment_id: String(formData.get("appointment_id") || "") || null,
    status: String(formData.get("status") || "issued"),
    total: Number(formData.get("total") || 0),
    due_date: String(formData.get("due_date") || "") || null,
  };

  const result = await supabase.from("invoices").insert(payload);
  assertSupabaseOk(result);
  revalidatePath("/billing");
}

export async function updateInvoiceStatus(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "issued");
  const result = await supabase.from("invoices").update({ status }).eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/billing");
}

export async function deleteInvoice(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("invoices").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/billing");
}

export async function addPayment(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const invoiceId = String(formData.get("invoice_id") || "");
  const payload = {
    invoice_id: invoiceId,
    amount: Number(formData.get("amount") || 0),
    method: String(formData.get("method") || "").trim(),
    reference: String(formData.get("reference") || "").trim(),
  };
  const result = await supabase.from("payments").insert(payload);
  assertSupabaseOk(result);
  revalidatePath("/billing");
}

export async function deletePayment(formData: FormData) {
  await requireRole(["admin", "doctor", "receptionist"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("payments").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/billing");
}
