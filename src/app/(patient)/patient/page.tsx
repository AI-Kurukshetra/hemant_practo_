import { requireRole } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPatientRecord } from "@/lib/auth/patient";
import { formatDateTime, formatCurrency } from "@/lib/format";

export default async function PatientHome() {
  await requireRole(["patient"]);
  const patient = await getPatientRecord();
  if (!patient) {
    return (
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-2">Patient profile pending</h3>
        <p className="text-muted">
          Your clinic account is active, but a patient profile has not been
          linked yet. Please contact the clinic to finish onboarding.
        </p>
      </div>
    );
  }
  const supabase = await createServerSupabaseClient();

  const [{ data: appointments }, { data: invoices }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, doctors(specialization)")
      .eq("patient_id", patient.id)
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("invoices")
      .select("id, total, status, issued_at")
      .eq("patient_id", patient.id)
      .order("issued_at", { ascending: false })
      .limit(5),
  ]);

  const outstanding = (invoices || []).filter((i) => i.status !== "paid");
  const outstandingTotal = outstanding.reduce(
    (sum, i) => sum + Number(i.total || 0),
    0
  );

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="brand-card p-4 h-100">
            <div className="text-muted small">Upcoming appointments</div>
            <div className="fs-2 fw-semibold">{appointments?.length || 0}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="brand-card p-4 h-100">
            <div className="text-muted small">Outstanding balance</div>
            <div className="fs-2 fw-semibold">
              {formatCurrency(outstandingTotal)}
            </div>
          </div>
        </div>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Next appointments</h3>
        {appointments && appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Scheduled</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatDateTime(appointment.scheduled_at)}</td>
                    <td>{appointment.doctors?.specialization || "Doctor"}</td>
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
          <div className="text-muted">No upcoming appointments.</div>
        )}
      </div>
    </div>
  );
}
