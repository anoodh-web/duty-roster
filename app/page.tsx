"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardClient from "./DashboardClient";

export default function Page() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoster = useCallback(async () => {
    try {
      const res = await fetch("/api/roster");
      const json = await res.json();
      if (json.success) {
        setRoster(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roster:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run fetch in browser client side, preventing Vercel build failures
    fetchRoster();
  }, [fetchRoster]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-medium animate-pulse">Loading Duty Roster...</p>
      </div>
    );
  }

  return <DashboardClient initialRoster={roster} refreshData={fetchRoster} />;
}