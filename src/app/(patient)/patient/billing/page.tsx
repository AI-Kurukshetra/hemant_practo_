import { requireRole } from "@/lib/auth/require-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPatientRecord } from "@/lib/auth/patient";
import { formatDateTime, formatCurrency } from "@/lib/format";

export default async function PatientBillingPage() {
  await requireRole(["patient"]);
  const patient = await getPatientRecord();
  if (!patient) {
    return (
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-2">No patient profile</h3>
        <p className="text-muted">
          Ask your clinic to link your patient profile to see invoices.
        </p>
      </div>
    );
  }
  const supabase = await createServerSupabaseClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, status, total, issued_at")
    .eq("patient_id", patient.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="brand-card p-4">
      <h3 className="h5 section-title mb-3">Your billing</h3>
      {invoices && invoices.length > 0 ? (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Issued</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{formatDateTime(invoice.issued_at)}</td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {invoice.status}
                    </span>
                  </td>
                  <td>{formatCurrency(Number(invoice.total || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-muted">No invoices yet.</div>
      )}
    </div>
  );
}
