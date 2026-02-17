import Link from "next/link";
import { signUp } from "../actions";
import HeroStats from "@/components/HeroStats";
import LiveFeed from "@/components/LiveFeed";
import { IconBilling, IconCalendar, IconPrescription } from "@/components/Icons";

const roles = ["admin", "doctor", "receptionist", "patient"] as const;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container py-5">
      <div className="row align-items-stretch g-4">
        <div className="col-lg-6">
          <div className="brand-card p-5">
            <h2 className="h3 section-title mb-2">Create your account</h2>
            <p className="text-muted mb-4">
              Set up your profile to manage clinics, appointments, and billing.
            </p>
            {resolvedSearchParams?.error ? (
              <div className="alert alert-danger">
                {resolvedSearchParams.error}
              </div>
            ) : null}
            <form action={signUp} className="d-grid gap-3">
              <div>
                <label className="form-label">Full name</label>
                <input
                  name="full_name"
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Dr. Priya Shah"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="name@clinic.com"
                  required
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="form-control form-control-lg"
                  required
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select form-select-lg"
                  defaultValue="admin"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role[0].toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  Admins can invite doctors and receptionists later.
                </div>
              </div>
              <button className="btn btn-primary btn-lg" type="submit">
                Create account
              </button>
            </form>
            <div className="mt-4 text-muted">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="brand-card h-100 p-5 d-flex flex-column justify-content-between">
            <div>
              <span className="badge badge-soft mb-3">Multi-clinic ready</span>
              <h1 className="display-6 section-title mb-3">
                Launch a clinic experience patients will trust.
              </h1>
              <p className="text-muted fs-5">
                Coordinate teams, prescriptions, and billing with a clear
                clinical workflow from day one.
              </p>
            </div>
            <div className="d-grid gap-3">
              <HeroStats />
              <LiveFeed />
              <div className="d-flex gap-3 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <span className="icon-pill">
                    <IconCalendar />
                  </span>
                  <span className="small text-muted">Scheduling</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="icon-pill">
                    <IconPrescription />
                  </span>
                  <span className="small text-muted">Prescriptions</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="icon-pill">
                    <IconBilling />
                  </span>
                  <span className="small text-muted">Billing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}