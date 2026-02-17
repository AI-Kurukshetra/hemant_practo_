import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import {
  addPayment,
  createInvoice,
  deleteInvoice,
  deletePayment,
  updateInvoiceStatus,
} from "../actions/billing";
import { formatCurrency, formatDateTime } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const invoiceStatuses = ["draft", "issued", "paid", "void"];

export default async function BillingPage() {
  await requireRole(["admin", "doctor", "receptionist"]);
  await requireUser();
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const [
    { data: invoices },
    { data: patients },
    { data: appointments },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, status, total, issued_at, patients(full_name)")
      .eq("clinic_id", clinicId)
      .order("issued_at", { ascending: false })
      .limit(50),
    supabase
      .from("patients")
      .select("id, full_name")
      .eq("clinic_id", clinicId)
      .order("full_name", { ascending: true }),
    supabase
      .from("appointments")
      .select("id, scheduled_at, patients(full_name)")
      .eq("clinic_id", clinicId)
      .order("scheduled_at", { ascending: false })
      .limit(50),
    supabase
      .from("payments")
      .select("id, amount, method, reference, paid_at, invoices(id)")
      .order("paid_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="d-grid gap-4">
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Create invoice</h3>
        <form action={createInvoice} className="row g-3">
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
            <label className="form-label">Appointment (optional)</label>
            <select name="appointment_id" className="form-select">
              <option value="">Select appointment</option>
              {appointments?.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.patients?.full_name} - {formatDateTime(appointment.scheduled_at)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Total</label>
            <input name="total" type="number" className="form-control" required />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" defaultValue="issued">
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Due date</label>
            <input name="due_date" type="date" className="form-control" />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Creating...">
              Create invoice
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Invoices</h3>
        {invoices && invoices.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const formId = `invoice-${invoice.id}`;
                  return (
                    <tr key={invoice.id}>
                      <td>{invoice.patients?.full_name || "Patient"}</td>
                      <td>{formatDateTime(invoice.issued_at)}</td>
                      <td>
                        <select
                          form={formId}
                          name="status"
                          defaultValue={invoice.status}
                          className="form-select form-select-sm"
                        >
                          {invoiceStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{formatCurrency(Number(invoice.total || 0))}</td>
                      <td className="d-flex gap-2">
                        <form id={formId} action={updateInvoiceStatus}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <SubmitButton
                            className="btn btn-outline-primary btn-sm"
                            type="submit"
                            pendingText="Updating..."
                          >
                            Update
                          </SubmitButton>
                        </form>
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={invoice.id} />
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
          <div className="text-muted">No invoices yet.</div>
        )}
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Record payment</h3>
        <form action={addPayment} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Invoice</label>
            <select name="invoice_id" className="form-select" required>
              <option value="">Select invoice</option>
              {invoices?.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.patients?.full_name} - {formatCurrency(Number(invoice.total || 0))}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Amount</label>
            <input name="amount" type="number" className="form-control" required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Method</label>
            <input name="method" className="form-control" placeholder="card" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Reference</label>
            <input name="reference" className="form-control" placeholder="PAY-1001" />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Adding...">
              Add payment
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Recent payments</h3>
        {payments && payments.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.invoices?.id}</td>
                    <td>{formatCurrency(Number(payment.amount || 0))}</td>
                    <td>{payment.method || "-"}</td>
                    <td>{formatDateTime(payment.paid_at)}</td>
                    <td>
                      <form action={deletePayment}>
                        <input type="hidden" name="id" value={payment.id} />
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
          <div className="text-muted">No payments recorded.</div>
        )}
      </div>
    </div>
  );
}
