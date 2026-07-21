"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

export default function Page() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRoster();
        setRoster(data);
      } catch (err) {
        console.error("Failed to load roster:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="animate-pulse text-lg font-medium">Loading Roster...</p>
      </div>
    );
  }

  // Renders your EXACT original interface and layout
  return <DashboardClient initialRoster={roster} />;
}