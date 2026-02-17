"use client";

import { useEffect, useMemo, useState } from "react";

const stats = [
  { label: "Appointments coordinated", value: 1280 },
  { label: "Prescriptions issued", value: 760 },
  { label: "Bills settled", value: 540 },
  { label: "Clinics onboarded", value: 24 },
];

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function HeroStats() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const animated = useMemo(() => {
    return stats.map((stat, index) => {
      const variance = (tick + index) % 7;
      return {
        ...stat,
        display: formatValue(stat.value + variance * 3),
      };
    });
  }, [tick]);

  return (
    <div className="row g-3">
      {animated.map((stat) => (
        <div className="col-6" key={stat.label}>
          <div className="p-3 rounded-4 border bg-white shadow-sm">
            <div className="fw-semibold fs-4">{stat.display}</div>
            <div className="text-muted small">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
