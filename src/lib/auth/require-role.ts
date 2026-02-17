import { redirect } from "next/navigation";
import { UserRole } from "./roles";
import { getUserProfile } from "./require-auth";

export async function requireRole(allowed: UserRole[]) {
  const profile = await getUserProfile();
  if (!allowed.includes(profile.role)) {
    if (profile.role === "patient") {
      redirect("/patient");
    }
    redirect("/dashboard");
  }
  return profile;
}
