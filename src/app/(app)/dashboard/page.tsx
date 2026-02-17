import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime, formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  await requireRole(["admin", "doctor", "receptionist"]);
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const [{ count: clinicCount }, { data: appointments }, { data: invoices }] =
    await Promise.all([
      supabase
        .from("clinic_users")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("appointments")
        .select(
          "id, scheduled_at, status, patients(full_name), doctors(specialization)"
        )
        .order("scheduled_at", { ascending: true })
        .limit(5),
      supabase
        .from("invoices")
        .select("status, total")
        .order("issued_at", { ascending: false })
        .limit(10),
    ]);

  const pendingInvoices = (invoices || []).filter(
    (invoice) => invoice.status !== "paid"
  );
  const outstandingTotal = pendingInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">
        <div className="col-md-4">
          <div className="brand-card p-4 h-100">
            <div className="text-muted small">Clinics managed</div>
            <div className="fs-2 fw-semibold">{clinicCount || 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="brand-card p-4 h-100">
            <div className="text-muted small">Upcoming appointments</div>
            <div className="fs-2 fw-semibold">{appointments?.length || 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="brand-card p-4 h-100">
            <div className="text-muted small">Outstanding billing</div>
            <div className="fs-2 fw-semibold">
              {formatCurrency(outstandingTotal)}
            </div>
          </div>
        </div>
      </div>

      <div className="brand-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="h5 section-title mb-0">Next appointments</h3>
          <span className="text-muted small">Updated today</span>
        </div>
        {appointments && appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patients?.[0]?.full_name || "Unknown"}</td>
                    <td>{appointment.doctors?.[0]?.specialization || "Assigned"}</td>
                    <td>{formatDateTime(appointment.scheduled_at)}</td>
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
    </div>
  );
}
