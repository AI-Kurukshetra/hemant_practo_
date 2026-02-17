import PatientNav from "@/components/PatientNav";
import TopBar from "@/components/TopBar";
import { getUserProfile } from "@/lib/auth/require-auth";
import { requireRole } from "@/lib/auth/require-role";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["patient"]);
  const profile = await getUserProfile();

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <aside className="col-lg-2 col-md-3 border-end bg-white p-4">
          <div className="fw-semibold fs-5 mb-4">Patient Portal</div>
          <PatientNav />
        </aside>
        <main className="col-lg-10 col-md-9 p-4">
          <TopBar profile={profile} />
          {children}
        </main>
      </div>
    </div>
  );
}
