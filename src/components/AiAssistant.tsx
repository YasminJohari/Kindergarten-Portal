'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  askAssistant,
  fetchAiStatus,
  PARENT_SUGGESTIONS,
  ADMIN_SUGGESTIONS,
  type AssistantMessage,
  type AssistantContext,
  type AiProvider,
} from '@/lib/ai';
import { Sparkles, Send, X, Bot, UserRound, Zap } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { role, userName, currentStudent, invoices, posts, attendance, students } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiProviders, setAiProviders] = useState<AiProvider[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hai! Saya Asisten AI Tadika Cahaya Bintang. Tanya saya tentang yuran, kehadiran, aktiviti anak, atau minta saya draf mesej untuk guru.',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const ctx: AssistantContext = useMemo(() => {
    const scoped = role === 'parent' ? invoices.filter((i) => i.studentId === currentStudent.id) : invoices;
    const unpaid = scoped.filter((i) => i.status === 'UNPAID');
    const paid = scoped.filter((i) => i.status === 'PAID');
    const presentToday = attendance.filter((a) => a.status === 'present').length;
    const latest = posts[0];
    return {
      role,
      userName,
      childName: currentStudent.preferredName,
      childClass: currentStudent.className,
      outstanding: unpaid.reduce((sum, i) => sum + i.total, 0),
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      presentToday,
      totalStudents: students.length,
      latestPostTitle: latest?.title || 'Tiada pos lagi',
      latestPostCategory: latest?.category || '-',
    };
  }, [role, userName, currentStudent, invoices, posts, attendance, students]);

  // Ask the server which free-tier AI providers have keys configured.
  useEffect(() => {
    let active = true;
    fetchAiStatus().then((status) => {
      if (active) setAiProviders(status.providers);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, busy]);

  const suggestions = role === 'parent' ? PARENT_SUGGESTIONS : ADMIN_SUGGESTIONS;
  const liveAi = aiProviders.length > 0;

  const handleSend = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: question }]);
    setBusy(true);
    try {
      const { answer, provider } = await askAssistant(question, ctx);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'ai', text: answer, provider },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: 'Maaf, saya menghadapi masalah menjawab. Sila cuba lagi sebentar lagi.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-4 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">Asisten AI Tadika</p>
                <p className="text-[10px] text-emerald-100 truncate">
                  {liveAi
                    ? `${aiProviders.join(' + ').toUpperCase()} (Percuma)`
                    : 'Enjin Pandai Luar Talian — percuma'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup asisten AI"
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[220px]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  {msg.sender === 'ai' && msg.provider && (
                    <span className="mt-2 block text-[9px] uppercase tracking-wide text-slate-400">
                      {msg.provider === 'offline'
                        ? 'Enjin luar talian'
                        : `${msg.provider} · AI langsung`}
                    </span>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <UserRound className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400">
                  Sedang berfikir...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-white space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={busy}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition-colors disabled:opacity-50 text-left"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya apa sahaja..."
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors"
                aria-label="Hantar soalan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-4 z-50 flex items-center gap-2 pl-3 pr-4 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xl transition-colors"
        aria-label="Buka Asisten AI"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span className="hidden sm:inline">Asisten AI</span>
        <Zap className="w-3.5 h-3.5 text-emerald-400 sm:hidden" />
      </button>
    </>
  );
};
