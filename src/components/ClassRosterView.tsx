'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users2,
  Search,
  HeartPulse,
} from 'lucide-react';

export const ClassRosterView: React.FC = () => {
  const { students } = useApp();
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [search, setSearch] = useState('');

  const classes = [
    { id: 'all', name: 'Semua Kelas Tadika' },
    { id: '5 Tahun', name: 'Tadika 5 Tahun - Class Little Stars' },
    { id: '6 Tahun', name: 'Tadika 6 Tahun - Class Smart Kids' },
    { id: '4 Tahun', name: 'Tadika 4 Tahun - Class Little Explorers' },
  ];

  const filteredStudents = students.filter((s) => {
    const matchesClass =
      selectedClassFilter === 'all' || s.className.includes(selectedClassFilter);
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.preferredName.toLowerCase().includes(search.toLowerCase()) ||
      s.mykad.includes(search);
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase mb-1">
            <Users2 className="w-4 h-4" />
            <span>Pengurusan Roster Murid</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Senarai Pendaftaran Murid Tadika 2026
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jumlah Berdaftar: {students.length} orang murid
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / MyKid..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <img
                  src={st.avatarUrl}
                  alt={st.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {st.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {st.preferredName} ({st.age} Thn)
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    MyKid: {st.mykad}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kelas:</span>
                  <span className="font-semibold text-slate-800 text-right">{st.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waris:</span>
                  <span className="font-semibold text-slate-800">{st.emergencyContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hubungi:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{st.emergencyContact.phone}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Pengambil Sah:</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {st.pickupPersons.length} Penjaga Sah
                  </span>
                </div>
              </div>

              {st.allergies.length > 0 && st.allergies[0] !== 'None' && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">Alahan: {st.allergies.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status Murid:</span>
              <span className="font-bold text-emerald-600">Aktif Bersekolah</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
