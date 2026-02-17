import Link from "next/link";
import HeroStats from "@/components/HeroStats";
import LiveFeed from "@/components/LiveFeed";
import {
  IconBilling,
  IconCalendar,
  IconPrescription,
  IconShield,
} from "@/components/Icons";

export default function Home() {
  return (
    <div>
      <header className="brand-gradient py-4">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="fw-semibold fs-4">Practo Clinic Suite</div>
          <div className="d-flex gap-3">
            <Link className="btn btn-outline-light btn-sm" href="/auth/login">
              Sign in
            </Link>
            <Link className="btn btn-light btn-sm" href="/auth/register">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-5">
        <div className="row align-items-center g-4 hero-shell p-4">
          <div className="hero-orb" />
          <div className="hero-orb secondary" />
          <div className="col-lg-6">
            <span className="badge badge-soft mb-3">Clinic management</span>
            <h1 className="display-4 fw-semibold section-title mb-3">
              A calmer clinic day starts with a smarter workflow.
            </h1>
            <p className="text-muted fs-5">
              Manage appointments, prescriptions, and billing across multiple
              clinics with role-ready access for your entire staff.
            </p>
            <div className="d-flex gap-3 mt-4 flex-wrap">
              <Link className="btn btn-primary btn-lg" href="/auth/register">
                Start your clinic
              </Link>
              <Link className="btn btn-outline-primary btn-lg" href="/auth/login">
                Sign in
              </Link>
            </div>
            <div className="mt-4 d-flex flex-wrap gap-3 text-muted">
              <span>Admin</span>
              <span>Doctor</span>
              <span>Receptionist</span>
              <span>Patient</span>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="brand-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div className="fw-semibold">Clinic pulse</div>
                  <div className="text-muted small">Downtown Clinic</div>
                </div>
                <span className="badge bg-success">Open</span>
              </div>
              <HeroStats />
              <div className="mt-3">
                <LiveFeed />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-5">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="brand-card p-4 h-100">
                <div className="icon-pill mb-3">
                  <IconCalendar />
                </div>
                <h5 className="section-title">Smart scheduling</h5>
                <p className="text-muted">
                  Coordinate doctors, rooms, and patients with clear status
                  updates and reminders.
                </p>
                <div className="text-muted small">Auto reminders · Waitlist</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="brand-card p-4 h-100">
                <div className="icon-pill mb-3">
                  <IconPrescription />
                </div>
                <h5 className="section-title">Prescription workflows</h5>
                <p className="text-muted">
                  Capture diagnosis, dosage, and follow-ups in a secure medical
                  record.
                </p>
                <div className="text-muted small">Templates · Drug history</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="brand-card p-4 h-100">
                <div className="icon-pill mb-3">
                  <IconBilling />
                </div>
                <h5 className="section-title">Billing clarity</h5>
                <p className="text-muted">
                  Generate invoices, track payments, and keep finance teams in
                  sync.
                </p>
                <div className="text-muted small">Payment links · Aging view</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="brand-card p-4 h-100">
                <h3 className="h5 section-title mb-3">Day plan at a glance</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded-4 bg-light">
                      <div className="text-muted small">Next 2 hours</div>
                      <div className="fw-semibold">4 appointments</div>
                      <div className="text-muted small">2 check-ins pending</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 border rounded-4 bg-light">
                      <div className="text-muted small">Billing focus</div>
                      <div className="fw-semibold">$1,240 outstanding</div>
                      <div className="text-muted small">3 invoices due</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 border rounded-4">
                      <div className="text-muted small">Staff coverage</div>
                      <div className="fw-semibold">Dr. Roy · Dr. Khan</div>
                      <div className="text-muted small">
                        Reception: Mira Singh
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="brand-card p-4 h-100 brand-gradient">
                <h3 className="h4 section-title mb-3">Ready in days, not weeks</h3>
                <p className="mb-4">
                  Spin up a new clinic workflow with roles, data, and patient
                  access already prepared.
                </p>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <IconShield />
                  <div>
                    <div className="fw-semibold">Secure by design</div>
                    <div className="small opacity-75">
                      Role-based access + audit-ready workflows
                    </div>
                  </div>
                </div>
                <Link className="btn btn-light btn-lg" href="/auth/register">
                  Launch your clinic
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
