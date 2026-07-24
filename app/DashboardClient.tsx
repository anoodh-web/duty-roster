"use client";

import React, { useState } from "react";
import { addEmployeeToDb, deleteEmployeeFromDb } from "./actions";

interface Employee {
  id: string;
  employee: string;
  shifts: string[];
  hours: Record<string, string>;
}

interface DashboardClientProps {
  initialRoster: Employee[];
  refreshData?: () => Promise<void>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardClient({
  initialRoster,
  refreshData,
}: DashboardClientProps) {
  const [roster, setRoster] = useState<Employee[]>(initialRoster);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialRoster prop updates from parent
  React.useEffect(() => {
    setRoster(initialRoster);
  }, [initialRoster]);

  // Handle adding a new employee to Supabase
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmployeeName.trim()) {
      alert("Please enter an employee name.");
      return;
    }

    setIsSubmitting(true);

    const defaultShifts = Array(7).fill("Off");
    const defaultHours: Record<string, string> = {};

    try {
      const result = await addEmployeeToDb(
        newEmployeeName.trim(),
        defaultShifts,
        defaultHours
      );

      if (!result.success) {
        alert(`DATABASE SAVE FAILED: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      setNewEmployeeName("");

      // Re-fetch clean data from Supabase if parent callback exists
      if (refreshData) {
        await refreshData();
      } else if (result.data) {
        setRoster((prev) => [result.data as Employee, ...prev]);
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err?.message || "Failed to save employee"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an employee from Supabase
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setIsSubmitting(true);

    try {
      const result = await deleteEmployeeFromDb(id);

      if (!result.success) {
        alert(`DELETE FAILED: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      if (refreshData) {
        await refreshData();
      } else {
        setRoster((prev) => prev.filter((emp) => emp.id !== id));
      }
    } catch (err: any) {
      alert(`Unexpected error deleting employee: ${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Duty Roster Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage weekly shifts and schedules synced with Supabase.
            </p>
          </div>

          {/* Add Employee Form */}
          <form onSubmit={handleAddEmployee} className="flex gap-2">
            <input
              type="text"
              placeholder="Employee Name..."
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              disabled={isSubmitting}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "+ Add Employee"}
            </button>
          </form>
        </header>

        {/* Schedule Table */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800 text-slate-300">
                <th className="py-3 px-4 font-semibold">Employee</th>
                {DAYS.map((day) => (
                  <th key={day} className="py-3 px-3 font-semibold text-center">
                    {day}
                  </th>
                ))}
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {roster.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No employees found in schedule. Add one above to get started!
                  </td>
                </tr>
              ) : (
                roster.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/80 transition">
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      {emp.employee}
                    </td>
                    {DAYS.map((_, index) => {
                      const shift = emp.shifts?.[index] || "Off";
                      return (
                        <td key={index} className="py-3 px-3 text-center">
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md ${
                              shift === "Off"
                                ? "bg-slate-700/50 text-slate-400"
                                : "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                            }`}
                          >
                            {shift}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.employee)}
                        disabled={isSubmitting}
                        className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-3 py-1.5 rounded-md transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}