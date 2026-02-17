import SidebarNav from "@/components/SidebarNav";
import TopBar from "@/components/TopBar";
import { getUserProfile } from "@/lib/auth/require-auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (profile.role === "patient") {
    redirect("/patient");
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <aside className="col-lg-2 col-md-3 border-end bg-white p-4">
          <div className="fw-semibold fs-5 mb-4">Practo Suite</div>
          <SidebarNav role={profile.role} />
        </aside>
        <main className="col-lg-10 col-md-9 p-4">
          <TopBar profile={profile} />
          {children}
        </main>
      </div>
    </div>
  );
}
