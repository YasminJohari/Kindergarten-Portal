'use client';

import React, { useState } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  restoreDemoUser,
  isFirebaseConfigured,
  sendPasswordReset,
  loginWithGoogle,
  firebaseErrorMessage,
} from '@/lib/auth';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  UserRound,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  WifiOff,
  Chrome,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { isFirebaseConfigured as firebaseOn } from '@/lib/firebase';

export default function LoginPage() {
  const { setRole, setUserName, showToast } = useApp();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'parent' | 'admin'>('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fillDemo = (which: 'parent' | 'admin') => {
    setMode('login');
    setAccountType(which);
    setEmail(which === 'parent' ? 'parent@tadika.my' : 'admin@tadika.my');
    setPassword(which === 'parent' ? 'sayang1' : 'cikgu1');
    setError(null);
  };

  const rememberAndGo = (user: { name: string; email: string; role: 'parent' | 'admin' }, msg: string) => {
    setRole(user.role);
    setUserName(user.name);
    try {
      localStorage.setItem('tcb-demo-user', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(msg);
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Sila masukkan nama penuh anda.');
        const created = await registerWithEmail(name.trim(), email.trim(), password, accountType);
        rememberAndGo(created, `Selamat datang, ${created.name}! Akaun berjaya dicipta.`);
      } else {
        const result = await loginWithEmail(email.trim(), password);
        rememberAndGo(
          result.user,
          result.isDemo
            ? `Selamat datang kembali, ${result.user.name}! (Mod Demo)`
            : `Selamat datang kembali, ${result.user.name}!`
        );
      }
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Log masuk gagal. Sila cuba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setGoogleBusy(true);
    try {
      const user = await loginWithGoogle();
      rememberAndGo(user, `Selamat datang, ${user.name}! Log masuk Google berjaya.`);
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Log masuk Google gagal. Sila cuba lagi.'));
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    try {
      await sendPasswordReset(email);
      setNotice(`Pautan reset kata laluan telah dihantar ke ${email.trim()}. Sila semak peti masuk anda.`);
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Gagal menghantar pautan reset. Sila cuba lagi.'));
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <p className="font-bold text-xl leading-tight">Tadika Cahaya Bintang</p>
                <p className="text-xs text-emerald-100">Tabika • Taska • Tadika Berdaftar</p>
              </div>
            </div>
            <h1 className="mt-10 text-3xl font-black leading-tight">
              Satu portal untuk ibu bapa & guru.
            </h1>
            <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
              Lihat aktiviti harian anak, bayar yuran dengan FPX / DuitNow / eWallet, berhubung
              dengan guru kelas, dan urus kehadiran — semuanya dalam satu tempat yang selamat.
            </p>
            <div className="mt-8 space-y-3 text-xs">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                Foto aktiviti & nota guru dihantar setiap hari
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-200 shrink-0" />
                Senarai pengambil sah & rekod suhu disemak setiap pagi
              </div>
            </div>
          </div>
          <p className="text-[11px] text-emerald-200/80">
            KSPK • Seksyen 7, Shah Alam, Selangor
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="md:hidden flex items-center gap-2.5 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Tadika Cahaya Bintang</p>
              <p className="text-[11px] text-slate-500">Portal Ibu Bapa & Guru</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log Masuk
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar
            </button>
          </div>

          {!firebaseOn && (
            <div className="mt-4 flex items-start gap-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2.5">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Firebase belum dikonfigurasi — aplikasi berjalan dalam <b>Mod Demo</b>. Gunakan
                butang akaun demo di bawah, atau tambah kunci Firebase dalam{' '}
                <code className="font-mono">.env.local</code>.
              </span>
            </div>
          )}

          <h2 className="mt-5 text-xl font-black text-slate-900">
            {mode === 'login' ? 'Selamat kembali!' : 'Cipta akaun portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Log masuk untuk melihat perkembangan anak anda hari ini.'
              : 'Daftar sebagai ibu bapa atau guru untuk mengakses portal.'}
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <UserRound className="w-3.5 h-3.5 text-slate-400" />
                  Nama Penuh
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Nurul Ain binti Razak"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Emel
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth. parent@tadika.my"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Kata Laluan
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isFirebaseConfigured ? 'Min. 6 aksara' : 'Min. 4 aksara (demo)'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Sembunyi kata laluan' : 'Papar kata laluan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    <KeyRound className="w-3 h-3" />
                    Lupa kata laluan?
                  </button>
                </div>
              )}
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Jenis Akaun
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('parent')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      accountType === 'parent'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Ibu Bapa / Waris
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('admin')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      accountType === 'admin'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Cikgu / Pentadbir
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sila tunggu...
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Log Masuk Portal
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Cipta Akaun
                </>
              )}
            </button>

            {isFirebaseConfigured && (
              <>
                <div className="flex items-center gap-3 pt-1">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    atau
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleBusy}
                  className="w-full py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {googleBusy ? (
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4 text-slate-600" />
                  )}
                  Teruskan dengan Google
                </button>
              </>
            )}
          </form>

          <div className="mt-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Akaun Demo Pantas (tanpa Firebase)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('parent')}
                className="px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors"
              >
                Demo Ibu Bapa
                <span className="block text-[10px] font-mono font-normal text-emerald-600">
                  parent@tadika.my
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-3 py-2.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-50 text-sky-800 text-xs font-bold transition-colors"
              >
                Demo Cikgu
                <span className="block text-[10px] font-mono font-normal text-sky-600">
                  admin@tadika.my
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const saved = restoreDemoUser();
                if (saved) {
                  setEmail(saved.email);
                  setError(null);
                  showToast('Sesi demo terakhir dipulihkan — tekan Log Masuk Portal.');
                } else {
                  setError('Tiada sesi demo tersimpan pada peranti ini.');
                }
              }}
              className="mt-2 text-[11px] text-slate-500 hover:text-slate-700 hover:underline"
            >
              Pulihkan sesi demo terakhir pada peranti ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

