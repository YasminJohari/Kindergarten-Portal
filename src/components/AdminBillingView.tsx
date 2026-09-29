'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrencyMYR } from '@/lib/utils';
import { Invoice, InvoiceItem } from '@/types';
import {
  Receipt,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  X,
} from 'lucide-react';

export const AdminBillingView: React.FC = () => {
  const { invoices, students, addInvoice, remindInvoiceWhatsApp, showToast } = useApp();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [invoiceMonth, setInvoiceMonth] = useState('November 2026');
  const [baseFee, setBaseFee] = useState(480);
  const [mealFee, setMealFee] = useState(150);
  const [activityFee, setActivityFee] = useState(50);
  const [extraDesc, setExtraDesc] = useState('');
  const [extraAmount, setExtraAmount] = useState(0);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalCollected = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.total, 0);
  const totalPending = invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((acc, curr) => acc + curr.total, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      inv.studentName.toLowerCase().includes(query) ||
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.parentName.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) {
      showToast('Sila pilih murid yang sah untuk menjana invois.');
      return;
    }

    const items: InvoiceItem[] = [
      {
        id: 'it-1',
        description: 'Yuran Bulanan Asas (Monthly Tuition)',
        amount: Number(baseFee),
        category: 'tuition',
      },
      {
        id: 'it-2',
        description: 'Pelan Pemakanan Sihat (Nutritious Meals)',
        amount: Number(mealFee),
        category: 'meal',
      },
      {
        id: 'it-3',
        description: 'Bahan Aktiviti Seni & STEAM',
        amount: Number(activityFee),
        category: 'activity',
      },
    ];

    if (extraDesc.trim() && Number(extraAmount) > 0) {
      items.push({
        id: 'it-4',
        description: extraDesc.trim(),
        amount: Number(extraAmount),
        category: 'other',
      });
    }

    const subtotal = items.reduce((a, b) => a + b.amount, 0);

    addInvoice({
      studentId: st.id,
      studentName: st.name,
      className: st.className,
      parentName: st.emergencyContact.name.replace(/\(.*?\)/g, '').trim(),
      month: invoiceMonth,
      issueDate: '28/09/2026',
      dueDate: '07/11/2026',
      status: 'UNPAID',
      items,
      subtotal,
      discount: 0,
      total: subtotal,
    });

    setExtraDesc('');
    setExtraAmount(0);
    setShowGenerateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Yuran Dikutip
            </span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrencyMYR(totalCollected)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Kadar kutipan: {collectionRate}%</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Belum Dijelaskan
            </span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {formatCurrencyMYR(totalPending)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoices.filter((i) => i.status === 'UNPAID').length} invois menunggu bayaran
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Jumlah Keseluruhan Bil
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrencyMYR(totalInvoiced)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sesi persekolahan 2026</p>
          </div>
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>
      {/* Invoices Control Panel & Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari murid, penjaga atau no invois..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('UNPAID')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'UNPAID'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Belum Bayar
              </button>
              <button
                onClick={() => setFilterStatus('PAID')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'PAID'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Jana Invois Yuran Baharu</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/60">
                <th className="py-3 px-4">No. Invois</th>
                <th className="py-3 px-4">Murid & Waris</th>
                <th className="py-3 px-4">Bulan</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan / Peringatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{inv.studentName}</p>
                    <p className="text-[11px] text-slate-500">Waris: {inv.parentName}</p>
                    <p className="text-[10px] text-slate-400">{inv.className}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {inv.month}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrencyMYR(inv.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status === 'UNPAID' ? (
                      <button
                        onClick={() => remindInvoiceWhatsApp(inv.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Peringatan WhatsApp</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">
                        Dibayar via {inv.paymentMethod ? inv.paymentMethod.toUpperCase() : 'FPX'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Tiada invois sepadan dengan carian anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Jana Invois Yuran Murid Baharu</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih murid dan masukkan struktur yuran itemized untuk bulan berkenaan.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Murid:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500/20"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bulan Invois:</label>
                <input
                  type="text"
                  required
                  value={invoiceMonth}
                  onChange={(e) => setInvoiceMonth(e.target.value)}
                  placeholder="cth. November 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asas (RM):</label>
                  <input
                    type="number"
                    value={baseFee}
                    onChange={(e) => setBaseFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Makan (RM):</label>
                  <input
                    type="number"
                    value={mealFee}
                    onChange={(e) => setMealFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Aktiviti (RM):</label>
                  <input
                    type="number"
                    value={activityFee}
                    onChange={(e) => setActivityFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Item Tambahan (Pilihan):
                  </label>
                  <input
                    type="text"
                    value={extraDesc}
                    onChange={(e) => setExtraDesc(e.target.value)}
                    placeholder="cth. Pakaian Sukan Ekstra"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jumlah Tambahan (RM):
                  </label>
                  <input
                    type="number"
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 flex items-center justify-between gap-2">
                <span className="font-bold text-sky-900">Jumlah Invois Dijana:</span>
                <span className="font-mono font-black text-sm text-sky-900">
                  {formatCurrencyMYR(
                    Number(baseFee) + Number(mealFee) + Number(activityFee) + Number(extraAmount)
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Keluarkan Invois
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
