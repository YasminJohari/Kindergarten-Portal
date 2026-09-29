'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Send, Paperclip, CheckCheck, Clock, Phone, Info } from 'lucide-react';

export const MessagesView: React.FC = () => {
  const { messages, sendMessage, role, currentStudent } = useApp();
  const [inputText, setInputText] = useState('');

  const quickTemplates = [
    'Anak saya tidak hadir hari ini kerana demam panas.',
    'Pemberitahuan: Datuk/Nenek akan mengambil anak petang ini.',
    'Mohon guru bantu pantau pengambilan ubat batuk jam 1:00 tengah hari.',
    'Terima kasih Cikgu atas gambar dan perkembangan anak hari ini!',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendMessage(text.trim(), role === 'parent' ? 'parent' : 'teacher');
    setInputText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[720px]">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={
                role === 'parent'
                  ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
                  : currentStudent.avatarUrl
              }
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                {role === 'parent'
                  ? 'Cikgu Sarah (Guru Kelas Little Stars)'
                  : `Waris: Faiz Razali (Bapa ${currentStudent.preferredName})`}
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Saluran Rasmi 1-on-1 Tadika Cahaya Bintang
            </p>
          </div>
        </div>

        <a
          href="tel:+60193321109"
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Panggilan Tadika</span>
        </a>
      </div>

      <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-start sm:items-center gap-2 text-amber-800 text-[11px]">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <span>Perbualan disimpan selamat untuk rekod penjagaan dan keselamatan murid.</span>
      </div>
      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isMe =
            (role === 'parent' && msg.senderRole === 'parent') ||
            (role === 'admin' && msg.senderRole === 'teacher');

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-500">{msg.senderName}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {msg.timestamp}
                </span>
              </div>

              <div
                className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm leading-relaxed ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.attachmentName && (
                  <div
                    className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs ${
                      isMe ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="underline font-medium break-all">{msg.attachmentName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                <span>Dihantar</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Reply Templates */}
      <div className="p-3 bg-white border-t border-slate-100">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 px-1">
          Templat Balasan Pantas:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {quickTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(tmpl)}
              className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2.5">
        <button
          onClick={() => {
            const fileName =
              typeof window !== 'undefined'
                ? window.prompt('Simulasi Lampiran - Nama fail (cth. Sijil Sakit Harith 28-09.pdf):')
                : null;
            if (fileName) {
              sendMessage(
                `[Lampiran Fail Rasmi]: ${fileName}`,
                role === 'parent' ? 'parent' : 'teacher',
                fileName
              );
            }
          }}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
          title="Lampirkan dokumen atau gambar"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Taip mesej kepada guru kelas anda di sini..."
          className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />

        <button
          onClick={() => handleSend()}
          className="px-4 sm:px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <span className="hidden sm:inline">Hantar</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
