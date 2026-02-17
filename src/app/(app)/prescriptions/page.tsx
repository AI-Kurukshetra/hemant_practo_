import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import { createPrescription, deletePrescription } from "../actions/prescriptions";
import { formatDateTime } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  await requireRole(["admin", "doctor"]);
  await requireUser();
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const [{ data: prescriptions }, { data: patients }, { data: doctors }] =
    await Promise.all([
      supabase
        .from("prescriptions")
        .select(
          "id, issued_at, diagnosis, patients(full_name), doctors(id, specialization)"
        )
        .eq("clinic_id", clinicId)
        .order("issued_at", { ascending: false })
        .limit(50),
      supabase
        .from("patients")
        .select("id, full_name")
        .eq("clinic_id", clinicId)
        .order("full_name", { ascending: true }),
      supabase
        .from("doctors")
        .select("id, specialization, profiles(full_name)")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: true }),
    ]);

  const doctorLabel = (doctor: {
    id: string;
    specialization: string | null;
    profiles?: { full_name: string | null };
  }) => {
    const name = doctor.profiles?.full_name;
    const shortId = doctor.id.slice(0, 8);
    const specialty = doctor.specialization || "General";
    return name ? `${name} (${specialty})` : `Doctor ${shortId} (${specialty})`;
  };

  return (
    <div className="d-grid gap-4">
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">New prescription</h3>
        <form action={createPrescription} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Patient</label>
            <select name="patient_id" className="form-select" required>
              <option value="">Select patient</option>
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Doctor</label>
            <select name="doctor_id" className="form-select">
              <option value="">Select doctor</option>
              {doctors?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctorLabel(doctor)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Diagnosis</label>
            <input name="diagnosis" className="form-control" />
          </div>
          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-control" rows={2} />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Creating...">
              Create prescription
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Prescriptions</h3>
        {prescriptions && prescriptions.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>{prescription.patients?.full_name || "Patient"}</td>
                    <td>{prescription.doctors?.specialization || "Doctor"}</td>
                    <td>{prescription.diagnosis || "-"}</td>
                    <td>{formatDateTime(prescription.issued_at)}</td>
                    <td>
                      <form action={deletePrescription}>
                        <input type="hidden" name="id" value={prescription.id} />
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted">No prescriptions issued yet.</div>
        )}
      </div>
    </div>
  );
}
