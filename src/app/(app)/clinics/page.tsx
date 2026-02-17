import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";
import { createClinic, deleteClinic, updateClinic } from "../actions/clinics";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function ClinicsPage() {
  await requireRole(["admin"]);
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: memberships } = await supabase
    .from("clinic_users")
    .select("role, clinics(id, name, city, state, phone, address)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="d-grid gap-4">
      <div className="brand-card p-4">
        <h3 className="h5 section-title mb-3">Add clinic</h3>
        <form action={createClinic} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input name="name" className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input name="phone" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Address</label>
            <input name="address" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">City</label>
            <input name="city" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">State</label>
            <input name="state" className="form-control" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Timezone</label>
            <input name="timezone" className="form-control" defaultValue="UTC" />
          </div>
          <div className="col-12">
            <SubmitButton className="btn btn-primary" type="submit" pendingText="Creating...">
              Create clinic
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="brand-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="h5 section-title mb-0">Clinics</h3>
        </div>
        {memberships && memberships.length > 0 ? (
          <div className="row g-3">
            {memberships.map((membership) => (
              <div key={membership.clinics?.id} className="col-md-6">
                <div className="border rounded-4 p-3 h-100">
                  <div className="fw-semibold">{membership.clinics?.name}</div>
                  <div className="text-muted small">
                    {membership.clinics?.address}
                  </div>
                  <div className="text-muted small">
                    {membership.clinics?.city}, {membership.clinics?.state}
                  </div>
                  <div className="text-muted small">
                    {membership.clinics?.phone || "Phone not set"}
                  </div>
                  <span className="badge badge-soft mt-2">
                    {membership.role}
                  </span>
                  <div className="d-flex gap-2 mt-3">
                    <form action={updateClinic} className="d-flex gap-2 flex-wrap">
                      <input type="hidden" name="id" value={membership.clinics?.id || ""} />
                      <input
                        name="name"
                        defaultValue={membership.clinics?.name || ""}
                        className="form-control form-control-sm"
                        placeholder="Name"
                      />
                      <input
                        name="city"
                        defaultValue={membership.clinics?.city || ""}
                        className="form-control form-control-sm"
                        placeholder="City"
                      />
                      <input
                        name="state"
                        defaultValue={membership.clinics?.state || ""}
                        className="form-control form-control-sm"
                        placeholder="State"
                      />
                      <input
                        name="phone"
                        defaultValue={membership.clinics?.phone || ""}
                        className="form-control form-control-sm"
                        placeholder="Phone"
                      />
                      <SubmitButton
                        className="btn btn-outline-primary btn-sm"
                        type="submit"
                        pendingText="Updating..."
                      >
                        Update
                      </SubmitButton>
                    </form>
                    <form action={deleteClinic}>
                      <input type="hidden" name="id" value={membership.clinics?.id || ""} />
                      <SubmitButton
                        className="btn btn-outline-danger btn-sm"
                        type="submit"
                        pendingText="Deleting..."
                      >
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted">No clinics assigned yet.</div>
        )}
      </div>
    </div>
  );
}
