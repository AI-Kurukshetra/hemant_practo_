"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/roles";
import { canAccess } from "@/lib/auth/roles";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clinics", label: "Clinics" },
  { href: "/appointments", label: "Appointments" },
  { href: "/patients", label: "Patients" },
  { href: "/doctors", label: "Doctors" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/billing", label: "Billing" },
];

export default function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="nav nav-pills flex-column gap-2">
      {navItems
        .filter((item) => canAccess(role, item.href.replace("/", "") as any))
        .map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${active ? "active" : "text-muted"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
