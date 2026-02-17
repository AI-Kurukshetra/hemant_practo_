import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveClinicId } from "@/lib/auth/clinic";
import {
  createAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} from "../actions/appointments";
import { formatDateTime } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const statusOptions = [
  "scheduled",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

export default async function AppointmentsPage() {
  await requireRole(["admin", "doctor", "receptionist"]);
  await requireUser();
  const clinicId = await getActiveClinicId();
  const supabase = await createServerSupabaseClient();

  const [{ data: appointments }, { data: patients }, { data: doctors }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select(
          "id, scheduled_at, status, clinics(name), patients(full_name), doctors(id, specialization)"
        )
        .eq("clinic_id", clinicId)
        .order("scheduled_at", { ascending: false })
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
        <h3 className="h5 section-title mb-3">New appointment</h3>
        <form action={createAppointment} className="row g-3">
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
              <option value="">Unassigned</option>
              {doctors?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctorLabel(doctor)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Scheduled at</label>
            <input
              name="scheduled_at"
              type="datetime-local"
              className="form-control"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" defaultValue="scheduled">
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label">Reason</label>
            <input name="reason" className="form-control" />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Creating...">
              Create appointment
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Appointments</h3>
        {appointments && appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const formId = `status-${appointment.id}`;
                  return (
                    <tr key={appointment.id}>
                      <td>{appointment.clinics?.name || "Clinic"}</td>
                      <td>{appointment.patients?.full_name || "Patient"}</td>
                      <td>{appointment.doctors?.specialization || "Doctor"}</td>
                      <td>{formatDateTime(appointment.scheduled_at)}</td>
                      <td>
                        <select
                          form={formId}
                          name="status"
                          defaultValue={appointment.status}
                          className="form-select form-select-sm"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="d-flex gap-2">
                        <form id={formId} action={updateAppointmentStatus}>
                          <input type="hidden" name="id" value={appointment.id} />
                          <SubmitButton
                            className="btn btn-outline-primary btn-sm"
                            type="submit"
                            pendingText="Updating..."
                          >
                            Update
                          </SubmitButton>
                        </form>
                        <form action={deleteAppointment}>
                          <input type="hidden" name="id" value={appointment.id} />
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
          <div className="text-muted">No appointments scheduled.</div>
        )}
      </div>
    </div>
  );
}
