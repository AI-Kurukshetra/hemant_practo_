"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/patient", label: "Overview" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/prescriptions", label: "Prescriptions" },
  { href: "/patient/billing", label: "Billing" },
  { href: "/patient/profile", label: "Profile" },
];

export default function PatientNav() {
  const pathname = usePathname();
  return (
    <nav className="nav nav-pills flex-column gap-2">
      {navItems.map((item) => {
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
