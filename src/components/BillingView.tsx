'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Invoice } from '@/types';
import { formatCurrencyMYR } from '@/lib/utils';
import { downloadInvoiceReceipt } from '@/lib/receipt';
import {
  CreditCard,
  CheckCircle2,
  FileText,
  X,
  QrCode,
  Building,
  Smartphone,
  ShieldCheck,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BillingView: React.FC = () => {
  const { invoices, payInvoice, currentStudent, showToast } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'fpx' | 'duitnow' | 'tng' | 'grabpay'>('fpx');
  const [selectedBank, setSelectedBank] = useState('Maybank2u');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const studentInvoices = invoices.filter((i) => i.studentId === currentStudent.id);
  const unpaidInvoices = studentInvoices.filter((i) => i.status === 'UNPAID');
  const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.total, 0);

  const fpxBanks = ['Maybank2u', 'CIMB Clicks', 'RHB Now', 'Public Bank', 'Bank Islam', 'Hong Leong Connect'];

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentSuccess(false);
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      payInvoice(selectedInvoice.id, paymentMethod);
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    }, 1700);
  };

  const handleOpenReceipt = (inv: Invoice) => {
    setReceiptInvoice(inv);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-600/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-50">
              Baki Belum Berbayar
            </span>
            <span className="p-2 bg-white/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-50" />
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {formatCurrencyMYR(totalOutstanding)}
          </h2>
          <p className="text-xs text-emerald-50 mt-2">
            {unpaidInvoices.length > 0
              ? `Terdapat ${unpaidInvoices.length} bil aktif bagi ${currentStudent.preferredName}`
              : 'Semua yuran bulanan telah diselesaikan!'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Pelan Yuran Murid
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{currentStudent.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentStudent.className}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tarikh Akhir Yuran:</span>
            <span className="font-semibold text-rose-600">07 hb Setiap Bulan</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Kaedah Pembayaran Tempatan
            </span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">FPX, DuitNow QR & eWallet</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Bayaran disahkan secara automatik dan resit rasmi tersedia serta-merta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              FPX Banking
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">
              DuitNow QR
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              T&G / GrabPay
            </span>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Senarai Invois Yuran Persekolahan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semak pecahan item yuran bulanan dan rekod transaksi terdahulu
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full whitespace-nowrap">
            {studentInvoices.length} Invois
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {studentInvoices.map((inv) => (
            <div key={inv.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {inv.status === 'PAID' ? 'DIBAYAR (PAID)' : 'MENUNGGU BAYARAN (UNPAID)'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Yuran Bulan {inv.month}</h4>
                  <p className="text-xs text-slate-500">
                    Dikeluarkan: {inv.issueDate} • Tarikh Akhir: {inv.dueDate}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] text-slate-400 block">Jumlah Perlu Dibayar:</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatCurrencyMYR(inv.total)}
                    </span>
                  </div>
                  {inv.status === 'UNPAID' ? (
                    <button
                      onClick={() => handleOpenPay(inv)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Sekarang</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReceipt(inv)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Lihat Resit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Pecahan Item Yuran:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {inv.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100"
                    >
                      <span className="text-slate-600">{item.description}</span>
                      <span className="font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrencyMYR(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                {inv.status === 'PAID' && (
                  <p className="text-[11px] text-emerald-700 mt-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dibayar pada {inv.paidDate} melalui{' '}
                    <span className="font-bold uppercase">{inv.paymentMethod}</span> (Ref:{' '}
                    {inv.transactionId})
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Payment Gateway Modal (Malaysian Gateway Simulation) */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Gerbang Pembayaran Selamat
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Pembayaran Yuran {selectedInvoice.month}
                  </h3>
                  <p className="text-xs text-slate-500">
                    No. Invois: {selectedInvoice.invoiceNumber} • Murid: {selectedInvoice.studentName}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Jumlah Perlu Dibayar:</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {formatCurrencyMYR(selectedInvoice.total)}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Pilih Kaedah Pembayaran Tempatan:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fpx')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'fpx'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-slate-700" />
                      <span className="text-[11px] block">FPX Banking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('duitnow')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'duitnow'
                          ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/20 text-pink-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                      <span className="text-[11px] block">DuitNow QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tng')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'tng'
                          ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20 text-sky-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                      <span className="text-[11px] block">Touch 'n Go</span>
                    </button>
                  </div>
                </div>
                {paymentMethod === 'fpx' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Pilih Bank Dalam Talian (FPX Online Banking):
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {fpxBanks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod === 'duitnow' && (
                  <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 text-center space-y-2">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-pink-200 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white text-[10px] p-2 text-center">
                        <QrCode className="w-12 h-12 text-pink-400 mb-1" />
                        <span>DuitNow QR Interoperable</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Imbas menggunakan aplikasi perbankan (MAE, CIMB Octo, RHB) atau eWallet.
                    </p>
                  </div>
                )}

                {paymentMethod === 'tng' && (
                  <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-xs font-bold text-sky-900">Touch 'n Go eWallet Direct Link</p>
                    <p className="text-[11px] text-slate-600">
                      Anda akan dialihkan ke aplikasi T&G eWallet untuk pengesahan PIN 6-digit.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghubungi Gerbang Bank...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Sahkan Bayaran {formatCurrencyMYR(selectedInvoice.total)}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Bayaran Berjaya!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Transaksi disahkan oleh gerbang FPX / DuitNow. Status invois kini{' '}
                    <span className="font-bold text-emerald-700">PAID</span>.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-left space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">No. Invois:</span>
                    <span className="font-semibold">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Kaedah Bayaran:</span>
                    <span className="font-bold uppercase">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Jumlah Dibayar:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrencyMYR(selectedInvoice.total)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      handleOpenReceipt(selectedInvoice);
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Cetak / Simpan Resit
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Official PDF-Style Receipt Preview */}
      {showReceiptModal && receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/50 space-y-6">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">TADIKA CAHAYA BINTANG</h3>
                  <p className="text-[11px] text-slate-500">No. Pendaftaran JPS: B4A/9912/2019</p>
                  <p className="text-[11px] text-slate-500">Seksyen 7, 40000 Shah Alam, Selangor</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Resit Rasmi
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                    {receiptInvoice.invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Diterima Daripada:
                  </span>
                  <span className="font-bold text-slate-800">{receiptInvoice.parentName}</span>
                  <p className="text-slate-500">Waris kepada: {receiptInvoice.studentName}</p>
                  <p className="text-slate-500">Kelas: {receiptInvoice.className}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Tarikh Transaksi:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {receiptInvoice.paidDate || receiptInvoice.issueDate}
                  </span>
                  <p className="text-slate-500">
                    Kaedah:{' '}
                    <span className="uppercase font-bold text-slate-700">
                      {receiptInvoice.paymentMethod || 'FPX'}
                    </span>
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 break-all">
                    Ref: {receiptInvoice.transactionId || 'FPX-SYS-772190'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="text-left py-2">Keterangan Item Yuran</th>
                      <th className="text-right py-2">Jumlah (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receiptInvoice.items.map((item) => (
                      <tr key={item.id} className="text-slate-700">
                        <td className="py-2 pr-3">{item.description}</td>
                        <td className="text-right py-2 font-mono font-medium whitespace-nowrap">
                          {item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold text-slate-900 text-sm">
                      <td className="py-2.5">JUMLAH KESELURUHAN (MYR):</td>
                      <td className="text-right py-2.5 font-mono text-emerald-700 whitespace-nowrap">
                        {formatCurrencyMYR(receiptInvoice.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-2 text-center border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed">
                Resit cetakan komputer ini adalah sah dan tidak memerlukan tandatangan fizikal.
                Terima kasih atas kerjasama anda bersama Tadika Cahaya Bintang.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={() => {
                  try {
                    const { fileName } = downloadInvoiceReceipt(receiptInvoice, {
                      transactionId: receiptInvoice.transactionId,
                      paymentMethod: receiptInvoice.paymentMethod,
                      paidDate: receiptInvoice.paidDate,
                    });
                    showToast(`Resit PDF berjaya dimuat turun: ${fileName}`);
                  } catch {
                    showToast('Gagal menjana resit PDF. Sila cuba lagi.');
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Muat Turun Resit PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Cetak
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
