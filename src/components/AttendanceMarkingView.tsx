'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AttendanceRecord } from '@/types';
import { CalendarCheck, Save, Thermometer } from 'lucide-react';

type AttendanceDraft = {
  status: AttendanceRecord['status'];
  temp: number;
  notes: string;
  checkInTime: string;
};

const CLASS_OPTIONS = [
  'Tadika 5 Tahun - Class Little Stars',
  'Tadika 6 Tahun - Class Smart Kids',
  'Tadika 4 Tahun - Class Little Explorers',
];

export const AttendanceMarkingView: React.FC = () => {
  const { students, attendance, markBatchAttendance, showToast } = useApp();

  const today = '28/09/2026';
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0]);

  const filteredStudents = students.filter((s) => s.className === selectedClass);

  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceDraft>>(() => {
    const initial: Record<string, AttendanceDraft> = {};
    students.forEach((s) => {
      const existing = attendance.find((a) => a.studentId === s.id);
      initial[s.id] = {
        status: existing?.status || 'present',
        temp: existing?.temperature ?? 36.5,
        notes: existing?.notes || '',
        checkInTime: existing?.checkInTime || '07:50 AM',
      };
    });
    return initial;
  });

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleTempChange = (studentId: string, tempVal: number) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], temp: tempVal } }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
  };

  const handleSaveAll = () => {
    const recordsToUpdate: Partial<AttendanceRecord>[] = Object.keys(attendanceData).map(
      (studentId) => {
        const st = students.find((s) => s.id === studentId);
        const data = attendanceData[studentId];
        return {
          studentId,
          studentName: st?.name || '',
          className: st?.className || '',
          status: data.status,
          temperature: data.temp,
          notes: data.notes,
          checkInTime: data.checkInTime,
          date: today,
        };
      }
    );
    markBatchAttendance(recordsToUpdate);
  };

  const handleMarkAllPresent = () => {
    setAttendanceData((prev) => {
      const next = { ...prev };
      filteredStudents.forEach((s) => {
        next[s.id] = { ...next[s.id], status: 'present', temp: 36.5 };
      });
      return next;
    });
    showToast('Semua murid ditanda Hadir dengan suhu normal 36.5 C');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Pemeriksaan Harian Guru Kelas</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Penandaan Kehadiran & Suhu Pintu Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tarikh: <span className="font-semibold text-slate-800">{today}</span> • Sesi Pagi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500/20"
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
          >
            Tanda Semua Hadir
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Rekod Kelas</span>
          </button>
        </div>
      </div>
      {/* Batch Attendance List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <span className="text-xs font-bold text-slate-700">
            {selectedClass} ({filteredStudents.length} murid)
          </span>
          <span className="text-xs text-slate-400 hidden sm:block">
            Format suhu: Termometer digital (Celsius)
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Tiada murid berdaftar dalam kelas ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((st) => {
              const data = attendanceData[st.id] || {
                status: 'present' as const,
                temp: 36.5,
                notes: '',
                checkInTime: '07:50 AM',
              };
              const isHighFever = data.temp > 37.5;

              return (
                <div
                  key={st.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    data.status === 'sick'
                      ? 'bg-rose-50/40'
                      : data.status === 'absent'
                      ? 'bg-slate-50/60'
                      : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 xl:w-72">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 leading-snug truncate">
                          {st.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-emerald-700">
                            {st.preferredName}
                          </span>
                          <span>•</span>
                          <span className="truncate">{st.emergencyContact.phone}</span>
                        </div>
                        {st.allergies.length > 0 && st.allergies[0] !== 'None' && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-0.5 truncate">
                            Alahan: {st.allergies.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          data.status === 'present'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          data.status === 'late'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Lewat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'sick')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          data.status === 'sick'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          data.status === 'absent'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Tidak Hadir
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 w-fit">
                        <Thermometer
                          className={`w-4 h-4 ${
                            isHighFever ? 'text-rose-600 animate-pulse' : 'text-emerald-600'
                          }`}
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={data.temp}
                          onChange={(e) =>
                            handleTempChange(st.id, parseFloat(e.target.value) || 36.5)
                          }
                          className={`w-14 bg-transparent font-mono font-bold text-xs text-right focus:outline-none ${
                            isHighFever ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        />
                        <span className="text-xs text-slate-400 font-mono">C</span>
                      </div>

                      <input
                        type="text"
                        value={data.notes}
                        onChange={(e) => handleNotesChange(st.id, e.target.value)}
                        placeholder="Catatan guru..."
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
