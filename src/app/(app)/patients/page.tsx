import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { createPatient, deletePatient, updatePatient } from "../actions/patients";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  await requireRole(["admin", "doctor", "receptionist"]);
  await requireUser();
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, email, phone, clinics(name)")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="d-grid gap-4">
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Add patient</h3>
        <form action={createPatient} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Full name</label>
            <input name="full_name" className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input name="email" className="form-control" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <input name="phone" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-select">
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Adding...">
              Add patient
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Patients</h3>
        {patients && patients.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Clinic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const formId = `update-patient-${patient.id}`;
                  return (
                    <tr key={patient.id}>
                      <td>
                        <input
                          form={formId}
                          name="full_name"
                          defaultValue={patient.full_name}
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td>
                        <input
                          form={formId}
                          name="email"
                          defaultValue={patient.email || ""}
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td>
                        <input
                          form={formId}
                          name="phone"
                          defaultValue={patient.phone || ""}
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td>{patient.clinics?.name || "Clinic"}</td>
                      <td className="d-flex gap-2">
                        <form id={formId} action={updatePatient}>
                          <input type="hidden" name="id" value={patient.id} />
                          <SubmitButton
                            className="btn btn-outline-primary btn-sm"
                            type="submit"
                            pendingText="Updating..."
                          >
                            Update
                          </SubmitButton>
                        </form>
                        <form action={deletePatient}>
                          <input type="hidden" name="id" value={patient.id} />
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
          <div className="text-muted">No patients added yet.</div>
        )}
      </div>
    </div>
  );
}
