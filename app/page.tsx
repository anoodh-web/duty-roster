"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardClient from "./DashboardClient";
import { getRoster } from "./actions";

export default function Page() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoster = useCallback(async () => {
    try {
      const data = await getRoster();
      setRoster(data || []);
    } catch (err) {
      console.error("Failed to load roster:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-medium animate-pulse">Loading Duty Roster from Supabase...</p>
      </div>
    );
  }

  return <DashboardClient initialRoster={roster} refreshData={fetchRoster} />;
}