import { signOut } from "@/app/auth/actions";
import type { UserProfile } from "@/lib/auth/require-auth";

export default function TopBar({ profile }: { profile: UserProfile }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <div className="text-muted small">Welcome back</div>
        <h2 className="h4 section-title mb-0">
          {profile.full_name || "Clinic team"}
        </h2>
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="badge badge-soft text-uppercase">{profile.role}</span>
        <form action={signOut}>
          <button className="btn btn-outline-primary btn-sm" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
