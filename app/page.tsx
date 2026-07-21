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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading duty roster...</p>
      </div>
    );
  }

  return <DashboardClient initialRoster={roster} />;
}