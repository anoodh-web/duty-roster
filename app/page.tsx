"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

export default function Page() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoster()
      .then((data) => {
        setRoster(data || []);
      })
      .catch((err) => {
        console.error("Failed to load roster on client:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-medium animate-pulse">Loading Duty Roster...</p>
      </div>
    );
  }

  return <DashboardClient initialRoster={roster} />;
}