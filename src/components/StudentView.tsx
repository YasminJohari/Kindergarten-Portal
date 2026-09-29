'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldAlert,
  Car,
  HeartPulse,
  Plus,
  Trash2,
  Clock,
  X,
  ShieldCheck,
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const { currentStudent, attendance, addPickupPerson, deletePickupPerson } = useApp();

  const [showAddPickupModal, setShowAddPickupModal] = useState(false);
  const [newPickupName, setNewPickupName] = useState('');
  const [newPickupRelation, setNewPickupRelation] = useState('');
  const [newPickupMykad, setNewPickupMykad] = useState('');
  const [newPickupPhone, setNewPickupPhone] = useState('');
  const [newPickupCarPlate, setNewPickupCarPlate] = useState('');

  const studentAttendanceHistory = attendance.filter((a) => a.studentId === currentStudent.id);

  const handleAddPickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPickupName || !newPickupRelation) return;
    addPickupPerson(currentStudent.id, {
      name: newPickupName,
      relationship: newPickupRelation,
      mykad: newPickupMykad || '900000-10-0000',
      phone: newPickupPhone || '+60 12-345 6789',
      carPlate: newPickupCarPlate || 'WXX 1234',
      photoUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    setNewPickupName('');
    setNewPickupRelation('');
    setNewPickupMykad('');
    setNewPickupPhone('');
    setNewPickupCarPlate('');
    setShowAddPickupModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Student Profile Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <img
              src={currentStudent.avatarUrl}
              alt={currentStudent.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-emerald-100 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentStudent.name}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {currentStudent.preferredName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                No. MyKid/MyKad:{' '}
                <span className="font-mono font-semibold text-slate-700">{currentStudent.mykad}</span>{' '}
                • Tarikh Lahir: {currentStudent.dob} ({currentStudent.age} Tahun)
              </p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                {currentStudent.className}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Kumpulan Darah
              </span>
              <span className="font-bold text-slate-800">{currentStudent.bloodType}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Jantina</span>
              <span className="font-bold text-slate-800">
                {currentStudent.gender === 'male' ? 'Lelaki' : 'Perempuan'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase mb-2">
              <HeartPulse className="w-4 h-4" />
              <span>Alahan & Sensitiviti</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentStudent.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="bg-white border border-rose-200 text-rose-800 text-xs px-2.5 py-1 rounded-lg font-semibold"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Pantang Larang Makanan</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {currentStudent.dietaryRestrictions}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase mb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Waris Kecemasan</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{currentStudent.emergencyContact.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {currentStudent.emergencyContact.phone}
            </p>
          </div>
        </div>
      </div>
      {/* Attendance & Health Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rekod Kehadiran & Suhu Harian</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemeriksaan pintu masuk setiap pagi oleh pihak tadika
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Kehadiran Bulan Ini: 95%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">Tarikh</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Masa Masuk</th>
                <th className="py-3 px-3">Suhu Badan</th>
                <th className="py-3 px-3">Catatan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentAttendanceHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {rec.date}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.status === 'sick'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rec.status === 'present'
                        ? 'HADIR'
                        : rec.status === 'late'
                        ? 'LEWAT'
                        : rec.status === 'sick'
                        ? 'SAKIT'
                        : 'TIDAK HADIR'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">
                    {rec.checkInTime || '-'}
                  </td>
                  <td className="py-3 px-3">
                    {rec.temperature ? (
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          rec.temperature > 37.5
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {rec.temperature.toFixed(1)} C
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{rec.notes || 'Normal dan sihat'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Authorized Pickup Management */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pengurusan Pengambil Sah</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hanya penama yang berdaftar dibenarkan menjemput anak anda demi keselamatan
            </p>
          </div>
          <button
            onClick={() => setShowAddPickupModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengambil Sah</span>
          </button>
        </div>

        {currentStudent.pickupPersons.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Tiada pengambil sah berdaftar untuk murid ini
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Sila tambah sekurang-kurangnya seorang waris yang dibenarkan menjemput anak anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentStudent.pickupPersons.map((person) => (
              <div
                key={person.id}
                className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 relative hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 pr-6 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{person.name}</h4>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {person.relationship}
                    </span>
                    <div className="space-y-1 mt-2 text-slate-600">
                      <p className="text-[11px]">
                        No. MyKad: <span className="font-mono">{person.mykad}</span>
                      </p>
                      <p className="text-[11px]">
                        Telefon: <span className="font-mono">{person.phone}</span>
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white p-1.5 rounded-lg border border-slate-200">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{person.carPlate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deletePickupPerson(currentStudent.id, person.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Padam kebenaran"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Pickup Person Modal */}
      {showAddPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddPickupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Daftar Pengambil Sah Baharu
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sila pastikan maklumat kad pengenalan dan kenderaan adalah tepat untuk semakan pos
              pengawal keselamatan.
            </p>

            <form onSubmit={handleAddPickupSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Penuh (Seperti MyKad):
                </label>
                <input
                  type="text"
                  required
                  value={newPickupName}
                  onChange={(e) => setNewPickupName(e.target.value)}
                  placeholder="cth. Wan Kamaruzzaman bin Wan Ahmad"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hubungan dengan Murid:
                </label>
                <input
                  type="text"
                  required
                  value={newPickupRelation}
                  onChange={(e) => setNewPickupRelation(e.target.value)}
                  placeholder="cth. Bapa Saudara / Pemandu Van Berdaftar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. Kad Pengenalan:
                  </label>
                  <input
                    type="text"
                    value={newPickupMykad}
                    onChange={(e) => setNewPickupMykad(e.target.value)}
                    placeholder="900101-10-1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. Telefon Bimbit:
                  </label>
                  <input
                    type="tel"
                    value={newPickupPhone}
                    onChange={(e) => setNewPickupPhone(e.target.value)}
                    placeholder="+60 1X-XXX XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  No. Plat & Model Kenderaan:
                </label>
                <input
                  type="text"
                  value={newPickupCarPlate}
                  onChange={(e) => setNewPickupCarPlate(e.target.value)}
                  placeholder="cth. VAB 4321 (Toyota Vios Putih)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPickupModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Kebenaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
