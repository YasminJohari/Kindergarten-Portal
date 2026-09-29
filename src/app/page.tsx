'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { TabNavigation } from '@/components/TabNavigation';
import { FeedView } from '@/components/FeedView';
import { BillingView } from '@/components/BillingView';
import { MessagesView } from '@/components/MessagesView';
import { StudentView } from '@/components/StudentView';
import { AttendanceMarkingView } from '@/components/AttendanceMarkingView';
import { PostCreatorView } from '@/components/PostCreatorView';
import { AdminBillingView } from '@/components/AdminBillingView';
import { ClassRosterView } from '@/components/ClassRosterView';
import { AiAssistant } from '@/components/AiAssistant';

function DashboardContent() {
  const { role, dataSource } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('feed');

  useEffect(() => {
    setCurrentTab(role === 'parent' ? 'feed' : 'attendance-marking');
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <TabNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {dataSource === 'firebase' ? (
        <div className="bg-emerald-600 text-white text-center text-[11px] font-semibold py-1.5">
          Disambungkan ke Firebase — data disegerakkan secara langsung
        </div>
      ) : (
        <div className="bg-amber-500 text-white text-center text-[11px] font-semibold py-1.5">
          Mod Demo — tambah kunci Firebase dalam .env.local untuk data sebenar
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'parent' && (
          <>
            {currentTab === 'feed' && <FeedView />}
            {currentTab === 'billing' && <BillingView />}
            {currentTab === 'messages' && <MessagesView />}
            {currentTab === 'student' && <StudentView />}
          </>
        )}

        {role === 'admin' && (
          <>
            {currentTab === 'attendance-marking' && <AttendanceMarkingView />}
            {currentTab === 'post-creator' && <PostCreatorView />}
            {currentTab === 'admin-billing' && <AdminBillingView />}
            {currentTab === 'roster' && <ClassRosterView />}
          </>
        )}
      </main>

      <AiAssistant />

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            Tadika Cahaya Bintang © 2026 • Sistem Portal Sambungan Ibu Bapa & Pengurusan Prasekolah Malaysia
          </p>
          <p className="text-slate-400">
            Disokong oleh Kaedah Pembayaran Tempatan (FPX Online Banking, DuitNow QR, T&G eWallet) • Mematuhi Kurikulum Standard Prasekolah Kebangsaan (KSPK)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return <DashboardContent />;
}

