import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { createDoctor, deleteDoctor, updateDoctor } from "../actions/doctors";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  await requireRole(["admin"]);
  await requireUser();
  const supabase = await createServerSupabaseClient();

  const activeClinicId = await getActiveClinicId();
  const [{ data: doctors }, { data: profiles }, { data: activeClinic }] =
    await Promise.all([
      supabase
        .from("doctors")
        .select(
          "id, specialization, license_number, clinics(name), profiles(full_name)"
        )
        .eq("clinic_id", activeClinicId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "doctor"),
      supabase
        .from("clinics")
        .select("name")
        .eq("id", activeClinicId)
        .single(),
    ]);

  const profileLabel = (profile: { id: string; full_name: string | null }) => {
    if (profile.full_name) {
      return profile.full_name;
    }
    return `Doctor profile (${profile.id.slice(0, 8)})`;
  };

  return (
    <div className="d-grid gap-4">
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Add doctor</h3>
        <form action={createDoctor} className="row g-3">
          <div className="col-md-12">
            <div className="text-muted small mb-2">
              Active clinic: {activeClinic?.name || "Clinic"}
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Doctor profile</label>
            <select name="user_id" className="form-select" required>
              <option value="">Select profile</option>
              {profiles?.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profileLabel(profile)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Specialization</label>
            <input name="specialization" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">License number</label>
            <input name="license_number" className="form-control" />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Adding...">
              Add doctor
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Doctors</h3>
        {doctors && doctors.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Clinic</th>
                  <th>License</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => {
                  const clinic = doctor.clinics?.[0];
                  const profile = doctor.profiles?.[0];
                  const formId = `update-doctor-${doctor.id}`;
                  return (
                    <tr key={doctor.id}>
                      <td>{profile?.full_name || "Doctor"}</td>
                      <td>
                        <input
                          form={formId}
                          name="specialization"
                          defaultValue={doctor.specialization || ""}
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td>{clinic?.name || "Clinic"}</td>
                      <td>
                        <input
                          form={formId}
                          name="license_number"
                          defaultValue={doctor.license_number || ""}
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="d-flex gap-2">
                        <form id={formId} action={updateDoctor}>
                          <input type="hidden" name="id" value={doctor.id} />
                          <SubmitButton
                            className="btn btn-outline-primary btn-sm"
                            type="submit"
                            pendingText="Updating..."
                          >
                            Update
                          </SubmitButton>
                        </form>
                        <form action={deleteDoctor}>
                          <input type="hidden" name="id" value={doctor.id} />
                          <SubmitButton
                            className="btn btn-outline-danger btn-sm"
                            type="submit"
                            pendingText="Deleting..."
                          >
                            Delete
                          </SubmitButton>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted">No doctors yet.</div>
        )}
      </div>
    </div>
  );
}
