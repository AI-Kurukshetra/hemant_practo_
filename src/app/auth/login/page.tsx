import Link from "next/link";
import { signIn } from "../actions";
import HeroStats from "@/components/HeroStats";
import LiveFeed from "@/components/LiveFeed";
import { IconBilling, IconCalendar, IconPrescription } from "@/components/Icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container py-5">
      <div className="row align-items-stretch g-4">
        <div className="col-lg-6">
          <div className="brand-card h-100 p-5 d-flex flex-column justify-content-between">
            <div>
              <span className="badge badge-soft mb-3">Practo Clinic Suite</span>
              <h1 className="display-6 section-title mb-3">
                Welcome back to your clinic workspace.
              </h1>
              <p className="text-muted fs-5">
                Track appointments, manage staff, and keep billing organized with
                real-time visibility.
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
        <div className="col-lg-6">
          <div className="brand-card p-5">
            <h2 className="h3 section-title mb-2">Sign in</h2>
            <p className="text-muted mb-4">
              Use your clinic account to continue.
            </p>
            {resolvedSearchParams?.error ? (
              <div className="alert alert-danger">
                {resolvedSearchParams.error}
              </div>
            ) : null}
            <form action={signIn} className="d-grid gap-3">
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
              <button className="btn btn-primary btn-lg" type="submit">
                Sign in
              </button>
            </form>
            <div className="mt-4 text-muted">
              New here? <Link href="/auth/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}