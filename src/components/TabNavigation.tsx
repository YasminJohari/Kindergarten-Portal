'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Newspaper,
  CreditCard,
  MessageCircle,
  UserCheck,
  CalendarCheck,
  PlusCircle,
  Receipt,
  Users2,
  Sparkles
} from 'lucide-react';

interface TabNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab, setCurrentTab }) => {
  const { role, invoices, messages } = useApp();

  const unpaidCount = invoices.filter((i) => i.status === 'UNPAID').length;
  const unreadMsgCount = 1;

  interface TabDef {
    id: string;
    label: string;
    icon: typeof Newspaper;
    badge: number | null;
    badgeColor: string | null;
  }

  const parentTabs: TabDef[] = [
    { id: 'feed', label: 'Aktiviti & Notis', icon: Newspaper, badge: null, badgeColor: null },
    { id: 'billing', label: 'Yuran & Bayaran', icon: CreditCard, badge: unpaidCount > 0 ? unpaidCount : null, badgeColor: 'bg-rose-500' },
    { id: 'messages', label: 'Mesej Guru', icon: MessageCircle, badge: unreadMsgCount, badgeColor: 'bg-emerald-500' },
    { id: 'student', label: 'Profil & Kehadiran', icon: UserCheck, badge: null, badgeColor: null },
  ];

  const adminTabs: TabDef[] = [
    { id: 'attendance-marking', label: 'Semak Kehadiran Kelas', icon: CalendarCheck, badge: null, badgeColor: null },
    { id: 'post-creator', label: 'Cipta Log & Gambar Aktiviti', icon: PlusCircle, badge: null, badgeColor: null },
    { id: 'admin-billing', label: 'Pengurusan Yuran & Invois', icon: Receipt, badge: null, badgeColor: null },
    { id: 'roster', label: 'Senarai Murid & Kelas', icon: Users2, badge: null, badgeColor: null },
  ];

  const tabs = role === 'parent' ? parentTabs : adminTabs;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? role === 'parent'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                      : 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? role === 'parent'
                        ? 'text-emerald-600'
                        : 'text-sky-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] text-white px-1.5 py-0.2 rounded-full font-bold ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
