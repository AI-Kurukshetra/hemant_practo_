"use client";

import { useEffect, useMemo, useState } from "react";

const messages = [
  "Reception logged patient arrival · 2 mins ago",
  "Prescription signed off by Dr. Roy · 6 mins ago",
  "Invoice generated for Cardiology visit · 9 mins ago",
  "Nurse assigned for vitals · 12 mins ago",
  "Reminder sent to patient · 18 mins ago",
];

export default function LiveFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = useMemo(() => messages[index], [index]);

  return (
    <div className="p-3 border rounded-4 bg-light">
      <div className="text-muted small">Live clinic feed</div>
      <div className="fw-semibold">{current}</div>
    </div>
  );
}