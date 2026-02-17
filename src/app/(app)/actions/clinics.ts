"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import { requireUser } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { assertSupabaseOk } from "@/lib/supabase/ensure";

export async function createClinic(formData: FormData) {
  await requireRole(["admin"]);
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const payload = {
    name: String(formData.get("name") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    timezone: String(formData.get("timezone") || "UTC").trim(),
  };

  const result = await supabase
    .from("clinics")
    .insert(payload)
    .select("id")
    .single();

  assertSupabaseOk(result);
  const data = result.data;
  if (data?.id) {
    const membershipResult = await supabase.from("clinic_users").insert({
      clinic_id: data.id,
      user_id: user.id,
      role: "admin",
    });
    assertSupabaseOk(membershipResult);
  }
  revalidatePath("/clinics");
}

export async function updateClinic(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
  };

  const result = await supabase.from("clinics").update(payload).eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/clinics");
}

export async function deleteClinic(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") || "");
  const result = await supabase.from("clinics").delete().eq("id", id);
  assertSupabaseOk(result);
  revalidatePath("/clinics");
}
