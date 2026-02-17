import { requireRole } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPatientRecord } from "@/lib/auth/patient";
import { formatDateTime } from "@/lib/format";

export default async function PatientAppointmentsPage() {
  await requireRole(["patient"]);
  const patient = await getPatientRecord();
  if (!patient) {
    return (
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-2">No patient profile</h3>
        <p className="text-muted">
          Ask your clinic to link your patient profile to see appointments.
        </p>
      </div>
    );
  }
  const supabase = await createServerSupabaseClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, reason, doctors(specialization)")
    .eq("patient_id", patient.id)
    .order("scheduled_at", { ascending: false });

  return (
    <div className="brand-card p-4">
      <h3 className="h5 section-title mb-3">Your appointments</h3>
      {appointments && appointments.length > 0 ? (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Scheduled</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDateTime(appointment.scheduled_at)}</td>
                  <td>{appointment.doctors?.[0]?.specialization || "Doctor"}</td>
                  <td>{appointment.reason || "-"}</td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-muted">No appointments yet.</div>
      )}
    </div>
  );
}
