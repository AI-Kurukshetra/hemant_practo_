import { requireRole } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPatientRecord } from "@/lib/auth/patient";
import { formatDateTime } from "@/lib/format";

export default async function PatientPrescriptionsPage() {
  await requireRole(["patient"]);
  const patient = await getPatientRecord();
  if (!patient) {
    return (
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-2">No patient profile</h3>
        <p className="text-muted">
          Ask your clinic to link your patient profile to see prescriptions.
        </p>
      </div>
    );
  }
  const supabase = await createServerSupabaseClient();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, issued_at, diagnosis, notes, doctors(specialization)")
    .eq("patient_id", patient.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="brand-card p-4">
      <h3 className="h5 section-title mb-3">Your prescriptions</h3>
      {prescriptions && prescriptions.length > 0 ? (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Issued</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{formatDateTime(prescription.issued_at)}</td>
                  <td>{prescription.doctors?.specialization || "Doctor"}</td>
                  <td>{prescription.diagnosis || "-"}</td>
                  <td>{prescription.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-muted">No prescriptions yet.</div>
      )}
    </div>
  );
}
