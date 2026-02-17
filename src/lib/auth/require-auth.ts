import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  full_name: string | null;
  role: "admin" | "doctor" | "receptionist" | "patient";
};

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function getUserProfile() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    redirect("/auth/login");
  }

  const metaRole = user.user_metadata?.role as UserProfile["role"] | undefined;
  if (metaRole && data.role !== metaRole) {
    const { data: updated } = await supabase
      .from("profiles")
      .update({ role: metaRole })
      .eq("id", user.id)
      .select("id, full_name, role")
      .single();
    if (updated) {
      return updated as UserProfile;
    }
  }

  return data as UserProfile;
}
