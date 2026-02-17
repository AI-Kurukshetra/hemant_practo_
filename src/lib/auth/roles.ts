export type UserRole = "admin" | "doctor" | "receptionist" | "patient";

type NavKey =
  | "dashboard"
  | "clinics"
  | "appointments"
  | "patients"
  | "doctors"
  | "prescriptions"
  | "billing"
  ;

export const roleNavAccess: Record<UserRole, NavKey[]> = {
  admin: [
    "dashboard",
    "clinics",
    "appointments",
    "patients",
    "doctors",
    "prescriptions",
    "billing",
  ],
  doctor: [
    "dashboard",
    "appointments",
    "patients",
    "prescriptions",
    "billing",
  ],
  receptionist: [
    "dashboard",
    "appointments",
    "patients",
    "billing",
  ],
  patient: ["dashboard"],
};

export function canAccess(role: UserRole, key: NavKey) {
  return roleNavAccess[role].includes(key);
}
