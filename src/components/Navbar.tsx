'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { logoutUser } from '@/lib/auth';
import {
  GraduationCap,
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { role, students, currentStudent, setCurrentStudentId, userName, showToast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    showToast('Anda telah log keluar. Jumpa lagi!');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                  Tadika Cahaya Bintang
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Tabika & Taska
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Portal Sambungan Ibu Bapa & Pengurusan Prasekolah Malaysia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {role === 'parent' && (
              <div className="relative hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                />
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px]">Anak:</span>
                  <span className="font-bold text-slate-700">{currentStudent.preferredName}</span>
                </div>
                <select
                  value={currentStudent.id}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Tukar Murid"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>
            )}

            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                role === 'parent'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              <UserRound className="w-3.5 h-3.5" />
              {role === 'parent' ? 'Ibu Bapa' : 'Cikgu / Pentadbir'}
            </span>

            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="relative cursor-pointer p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-2.5 bg-slate-100/80 rounded-xl px-2.5 py-1.5 hover:bg-slate-200/70 transition-colors"
                >
                  <img
                    src={
                      role === 'parent'
                        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
                    }
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                  />
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 max-w-[140px] truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500">
                      {role === 'parent' ? 'Waris (Bapa)' : 'Guru Kelas'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {menuOpen && (
                  <>
                    <button
                      aria-label="Tutup menu profil"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 z-50 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 text-sm">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-800 truncate">{userName}</p>
                        <p className="text-[11px] text-slate-500">
                          {role === 'parent' ? 'Akaun Ibu Bapa' : 'Akaun Cikgu / Pentadbir'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="sm:hidden p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                title="Log Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
