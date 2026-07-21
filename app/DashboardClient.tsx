"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addEmployeeToDb, deleteEmployeeFromDb } from "./actions";

interface RosterItem {
  id: string;
  employee: string;
  shifts: string[];
  hours: Record<string, string>;
}

interface DashboardClientProps {
  initialRoster: RosterItem[];
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function DashboardClient({ initialRoster }: DashboardClientProps) {
  const router = useRouter();

  // Strict state bound ONLY to database data
  const [roster, setRoster] = useState<RosterItem[]>(initialRoster || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    Array(7).fill("Off")
  );
  const [startTimes, setStartTimes] = useState<string[]>(Array(7).fill("09:00"));
  const [endTimes, setEndTimes] = useState<string[]>(Array(7).fill("18:00"));

  // Synchronize component state whenever server revalidates initialRoster
  useEffect(() => {
    setRoster(initialRoster || []);
  }, [initialRoster]);

  // Handle Shift Selection Changes
  const handleShiftChange = (index: number, val: string) => {
    const updated = [...selectedShifts];
    updated[index] = val;
    setSelectedShifts(updated);
  };

  const handleStartTimeChange = (index: number, val: string) => {
    const updated = [...startTimes];
    updated[index] = val;
    setStartTimes(updated);
  };

  const handleEndTimeChange = (index: number, val: string) => {
    const updated = [...endTimes];
    updated[index] = val;
    setEndTimes(updated);
  };

  // Add Employee directly to DB
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const dailyHoursObj: Record<string, string> = {};
    daysOfWeek.forEach((day, index) => {
      if (selectedShifts[index] === "Off") {
        dailyHoursObj[day] = "Off";
      } else {
        dailyHoursObj[day] = `${startTimes[index]} to ${endTimes[index]}`;
      }
    });

    try {
      const res = await addEmployeeToDb(
        newEmployeeName.trim(),
        selectedShifts,
        dailyHoursObj
      );

      if (res && res.success) {
        setIsModalOpen(false);
        setNewEmployeeName("");
        setSelectedShifts(Array(7).fill("Off"));
        setStartTimes(Array(7).fill("09:00"));
        setEndTimes(Array(7).fill("18:00"));
        
        // Refresh server components to retrieve updated database state
        router.refresh();
      } else {
        alert(
          `❌ DATABASE SAVE FAILED:\n${
            res?.error || "Could not write to Supabase database."
          }`
        );
      }
    } catch (err) {
      alert(`💥 UNCAUGHT ERROR:\n${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Employee directly from DB
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;

    try {
      const res = await deleteEmployeeFromDb(id);
      if (res && res.success) {
        router.refresh();
      } else {
        alert(
          `❌ DATABASE DELETE FAILED:\n${
            res?.error || "Could not delete from Supabase database."
          }`
        );
      }
    } catch (err) {
      alert(`💥 UNCAUGHT DELETE ERROR:\n${String(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Duty Roster
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Weekly Schedule & Staff Allocations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-colors cursor-pointer"
        >
          + Add Employee
        </button>
      </div>

      {/* Main Roster Table */}
      <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700">
                <th className="py-4 px-6 font-semibold">Employee</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="py-4 px-4 font-semibold text-center">
                    {day}
                  </th>
                ))}
                <th className="py-4 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {roster.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-500 italic"
                  >
                    No employees found in schedule. Click "+ Add Employee" to create one.
                  </td>
                </tr>
              ) : (
                roster.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                      {item.employee}
                    </td>
                    {daysOfWeek.map((day, idx) => {
                      const shift = item.shifts[idx] || "Off";
                      const hours = item.hours[day];
                      const isOff = shift === "Off";

                      return (
                        <td key={day} className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                              isOff
                                ? "bg-slate-800 text-slate-500 border border-slate-700"
                                : "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50"
                            }`}
                          >
                            {shift}
                          </span>
                          {!isOff && hours && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              {hours}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEmployee(item.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-3 py-1 rounded border border-rose-900/50 transition-colors text-xs cursor-pointer"
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

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
              <h2 className="text-xl font-bold text-white">Add New Employee Schedule</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-3">
                  Weekly Shift Schedule
                </label>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {daysOfWeek.map((day, idx) => (
                    <div
                      key={day}
                      className="grid grid-cols-12 gap-3 items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50"
                    >
                      <span className="col-span-3 text-sm font-medium text-slate-300">
                        {day}
                      </span>
                      <select
                        value={selectedShifts[idx]}
                        onChange={(e) => handleShiftChange(idx, e.target.value)}
                        className="col-span-3 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Off">Off</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                        <option value="Full Day">Full Day</option>
                      </select>

                      {selectedShifts[idx] !== "Off" ? (
                        <div className="col-span-6 flex items-center space-x-2">
                          <input
                            type="time"
                            value={startTimes[idx]}
                            onChange={(e) => handleStartTimeChange(idx, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full"
                          />
                          <span className="text-slate-500 text-xs">to</span>
                          <input
                            type="time"
                            value={endTimes[idx]}
                            onChange={(e) => handleEndTimeChange(idx, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full"
                          />
                        </div>
                      ) : (
                        <div className="col-span-6 text-xs text-slate-500 italic pl-2">
                          Scheduled Day Off
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}