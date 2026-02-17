import { requireRole } from "@/lib/auth/require-role";
import { getUserProfile } from "@/lib/auth/require-auth";

export default async function PatientProfilePage() {
  await requireRole(["patient"]);
  const profile = await getUserProfile();

  return (
    <div className="brand-card p-4">
      <h3 className="h5 section-title mb-3">Profile</h3>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="text-muted small">Full name</div>
          <div className="fw-semibold">{profile.full_name || "-"}</div>
        </div>
        <div className="col-md-6">
          <div className="text-muted small">Role</div>
          <div className="fw-semibold text-capitalize">{profile.role}</div>
        </div>
      </div>
    </div>
  );
}
