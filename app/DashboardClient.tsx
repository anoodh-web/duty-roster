// app/DashboardClient.tsx
"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { addEmployeeToDb, deleteEmployeeFromDb } from './actions';
import { useRouter } from 'next/navigation';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DashboardClient({ initialRoster }: { initialRoster: any[] }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [selectedShifts, setSelectedShifts] = useState(['Off', 'Off', 'Off', 'Off', 'Off', 'Off', 'Off']);
  const [startTimes, setStartTimes] = useState<string[]>(Array(7).fill('09:00'));
  const [endTimes, setEndTimes] = useState<string[]>(Array(7).fill('18:00'));
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleDeleteEmployee = async (id: string) => {
    const res = await deleteEmployeeFromDb(id);
    if (res.success) {
      router.refresh(); // Permanently tells Next.js to pull the updated roster from the database
    } else {
      alert("Error deleting employee from database.");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    const dailyHoursObj: Record<string, string> = {};
    daysOfWeek.forEach((day, index) => {
      if (selectedShifts[index] === 'Off') {
        dailyHoursObj[day] = 'Off';
      } else {
        dailyHoursObj[day] = `${startTimes[index]} to ${endTimes[index]}`;
      }
    });

    setIsModalOpen(false);
    const res = await addEmployeeToDb(newEmployeeName, selectedShifts, dailyHoursObj);
    
    if (res.success) {
      setNewEmployeeName('');
      setSelectedShifts(Array(7).fill('Off'));
      setStartTimes(Array(7).fill('09:00'));
      setEndTimes(Array(7).fill('18:00'));
      router.refresh();
    } else {
      // THIS WILL SHOW US THE EXACT DATABASE ERROR!
      alert("Database Save Failed:\n" + (res.error || "Unknown Error"));
    }

  const handleShiftTypeChange = (dayIndex: number, val: string) => {
    const updated = [...selectedShifts];
    updated[dayIndex] = val;
    setSelectedShifts(updated);
  };

  const handleTimeChange = (dayIndex: number, type: 'start' | 'end', val: string) => {
    if (type === 'start') {
      const updated = [...startTimes];
      updated[dayIndex] = val;
      setStartTimes(updated);
    } else {
      const updated = [...endTimes];
      updated[dayIndex] = val;
      setEndTimes(updated);
    }
  };

  const handleDownloadImage = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        scale: 2 
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${activeTab}-roster.png`;
      link.click();
    }
  };

  return (
    <div className={`min-h-screen p-8 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 border-slate-200 dark:border-slate-700">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            🏢 Workplace Hub
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Operational Management & Duty Schedule
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border transition cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-750' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
            }`}
          >
            ℹ️ About App
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border transition cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button 
            onClick={handleDownloadImage}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 shadow-sm transition cursor-pointer"
          >
            📥 Download Active View
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            + Add Employee
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'weekly' 
              ? 'border-b-2 border-blue-500 text-blue-500 font-extrabold' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          📅 Weekly Overview
        </button>
        <button 
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'daily' 
              ? 'border-b-2 border-blue-500 text-blue-500 font-extrabold' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🕒 Daily Roster & Hours
        </button>
      </div>

      {initialRoster.length === 0 ? (
        <div className="text-center py-10 text-slate-400">No employees in database. Click "+ Add Employee" to start!</div>
      ) : (
        <>
          {activeTab === 'weekly' && (
            <div ref={printRef} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className={`text-lg font-bold mb-4 px-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Weekly Duty Schedule Overview</h2>
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className={`${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'} border-b`}>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{day.substring(0,3)}</th>
                      ))}
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {initialRoster.map((row) => (
                      <tr key={row.id} className={`${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'}`}>
                        <td className={`whitespace-nowrap px-6 py-4 font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{row.employee}</td>
                        {row.shifts.map((shift: string, i: number) => (
                          <td key={i} className="px-4 py-4">
                            <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                              shift === "Morning" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              shift === "Evening" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              "bg-slate-500/10 text-slate-400 border border-slate-500/10"
                            }`}>
                              {shift}
                            </span>
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteEmployee(row.id)}
                            className="text-red-500 hover:text-red-600 font-medium text-xs rounded border border-red-500/20 px-2 py-1 bg-red-500/5 hover:bg-red-500/10 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button 
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      selectedDay === day 
                        ? 'bg-blue-600 text-white border-blue-600'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div ref={printRef} className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="mb-4 flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedDay}'s Work Schedule</h2>
                    <p className="text-xs text-slate-400">Detailed operating hours for on-duty staff</p>
                  </div>
                  <span className="rounded-lg bg-blue-500/10 text-blue-500 text-xs px-3 py-1 font-bold border border-blue-500/10">
                    {selectedDay}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className={`${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'} border-b`}>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Employee Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Hours</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Shift Type</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {initialRoster.map((row) => {
                        const dayIdx = daysOfWeek.indexOf(selectedDay);
                        const shiftType = row.shifts[dayIdx];
                        const dailyHour = (row.hours as Record<string, string>)[selectedDay] || "Off";

                        return (
                          <tr key={row.id} className={`${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'}`}>
                            <td className={`whitespace-nowrap px-6 py-4 font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{row.employee}</td>
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-sm">
                              {dailyHour === "Off" ? (
                                <span className="text-slate-400 dark:text-slate-500 font-sans italic">No scheduled hours</span>
                              ) : (
                                <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{dailyHour}</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                                shiftType === "Morning" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                shiftType === "Evening" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                "bg-slate-500/10 text-slate-400 border border-slate-500/10"
                              }`}>
                                {shiftType}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-xl p-6 shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Staff Member & Shift Times</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Employee Name</label>
                <input 
                  type="text" 
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="Enter full name"
                  className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="mb-6 max-h-72 overflow-y-auto border-t border-b py-3 my-2 border-slate-200 dark:border-slate-700 space-y-3">
                <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Configure Schedule</label>
                
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-500">{day}</span>
                      <select 
                        value={selectedShifts[index]}
                        onChange={(e) => handleShiftTypeChange(index, e.target.value)}
                        className={`rounded-md border p-1 text-xs font-medium focus:outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="Off">Off</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>

                    {selectedShifts[index] !== 'Off' && (
                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="time" 
                          value={startTimes[index]}
                          onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                          className={`rounded border p-1 text-xs ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                        />
                        <span className="text-xs text-slate-400">until</span>
                        <input 
                          type="time" 
                          value={endTimes[index]}
                          onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                          className={`rounded border p-1 text-xs ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                    darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl border text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-4">
              💻
            </div>
            
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              About Workplace Hub
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-4">
              Developed by Anoodh
            </p>
            
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              This application was designed and engineered to streamline weekly operations, shift tracking, and daily schedule sharing for office managers. Built on modern web technologies including Next.js, Tailwind CSS, and Prisma.
            </p>

            <button 
              onClick={() => setIsAboutOpen(false)}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-sm transition"
            >
              Close Info
            </button>
          </div>
        </div>
      )}

    </div>
  );
}