'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useApp } from '@/context/AppContext';

export { isFirebaseConfigured };
export type { User };

type DemoRole = 'parent' | 'admin';

interface SeedProfile {
  name: string;
  role: DemoRole;
  school: string;
}

const DEMO_SEEDS: Record<string, SeedProfile> = {
  'parent@tadika.my': { name: 'Faiz bin Razali', role: 'parent', school: 'Tadika Cahaya Bintang' },
  'admin@tadika.my': { name: 'Cikgu Sarah binti Mansor', role: 'admin', school: 'Tadika Cahaya Bintang' },
};

const ADMIN_EMAILS = ['admin@tadika.my', 'cikgu@tadika.my', 'pengetua@tadika.my'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setRole, setUserName, setUserUid, setChildIds } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  // On the public /login route we render immediately; protected routes show
  // the session splash until the auth check completes.
  const [ready, setReady] = useState(pathname === '/login');

  useEffect(() => {
    const isLoginPath = pathname === '/login';

    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setUserUid(null);
          setChildIds([]);
          if (!isLoginPath) router.replace('/login');
          setReady(true);
          return;
        }
        let name = user.displayName || user.email || 'Pengguna';
        let role: DemoRole = inferRole(user.email);
        setUserUid(user.uid);
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const data = snap.data();
          if (data?.role === 'admin' || data?.role === 'parent') role = data.role;
          if (data?.displayName) name = String(data.displayName);
          // The children staff linked to this account. Everything a guardian is
          // allowed to read (fees, attendance) is scoped to this list.
          setChildIds(Array.isArray(data?.childIds) ? (data.childIds as string[]) : []);
        } catch {
          // Offline / rules-restricted: keep defaults derived from the email.
          setChildIds([]);
        }
        setRole(role);
        setUserName(name);
        if (isLoginPath) router.replace('/');
        setReady(true);
      });
      return () => unsub();
    }

    // Demo mode: restore the saved local session, otherwise send to login.
    const saved = restoreDemoUser();
    if (saved) {
      setRole(saved.role);
      setUserName(saved.name);
      if (isLoginPath) router.replace('/');
    } else if (!isLoginPath) {
      router.replace('/login');
    }
    setReady(true);
    return undefined;
  }, [router, pathname, setRole, setUserName, setUserUid, setChildIds]);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white animate-pulse">
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Menyemak sesi log masuk...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function inferRole(email?: string | null): DemoRole {
  if (!email) return 'parent';
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'parent';
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: { name: string; email: string; role: DemoRole }; isDemo: boolean }> {
  if (!isFirebaseConfigured) {
    return loginDemo(email, password);
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = cred.user;
  const snap = await getDoc(doc(db, 'users', fbUser.uid));
  const role = ((snap.data()?.role as DemoRole | undefined) || inferRole(fbUser.email)) as DemoRole;
  try {
    await setDoc(
      doc(db, 'users', fbUser.uid),
      {
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email,
        role,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Offline / rules-restricted: app still works from local state.
  }
  return {
    user: { name: fbUser.displayName || fbUser.email || 'Pengguna', email: fbUser.email || email, role },
    isDemo: false,
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  role: DemoRole
): Promise<{ name: string; email: string; role: DemoRole }> {
  if (!isFirebaseConfigured) {
    throw new Error('Pendaftaran akaun memerlukan Firebase. Sila isi konfigurasi .env.local dahulu.');
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName: name,
    email,
    role,
    school: 'Tadika Cahaya Bintang',
    // Staff fill this in from the Firestore console: the student ids this
    // guardian may see. It is never written on sign-in (that would wipe the
    // link) and the rules exclude it from self-update.
    childIds: [],
    createdAt: serverTimestamp(),
  });
  return { name, email, role };
}

export async function logoutUser(): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tcb-demo-user');
    }
  } catch {
    // ignore storage errors
  }
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch {
      // ignore sign-out errors in demo/offline mode
    }
  }
}

export function loginDemo(
  email: string,
  password: string
): { user: { name: string; email: string; role: DemoRole }; isDemo: boolean } {
  const key = email.trim().toLowerCase();
  const seed = DEMO_SEEDS[key] || {
    name: key.split('@')[0] || 'Ibu Bapa Demo',
    role: inferRole(key),
    school: 'Tadika Cahaya Bintang',
  };
  if (password.length < 4) {
    throw new Error('Kata laluan demo mestilah sekurang-kurangnya 4 aksara.');
  }
  const user = { name: seed.name, email: key, role: seed.role };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tcb-demo-user', JSON.stringify(user));
    }
  } catch {
    // ignore storage errors
  }
  return { user, isDemo: true };
}

export function restoreDemoUser(): { name: string; email: string; role: DemoRole } | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('tcb-demo-user');
    return raw ? (JSON.parse(raw) as { name: string; email: string; role: DemoRole }) : null;
  } catch {
    return null;
  }
}

/**
 * Firebase returns verbose English error codes that mean very little to a
 * parent using the portal. Map the common ones to short Malay messages.
 */
const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Emel atau kata laluan tidak sah. Sila semak dan cuba lagi.',
  'auth/invalid-login-credentials': 'Emel atau kata laluan tidak sah. Sila semak dan cuba lagi.',
  'auth/user-not-found': 'Tiada akaun berdaftar dengan emel ini.',
  'auth/wrong-password': 'Kata laluan tidak sah. Gunakan "Lupa kata laluan?" jika perlu.',
  'auth/email-already-in-use': 'Emel ini sudah berdaftar. Sila log masuk sebagai gantinya.',
  'auth/weak-password': 'Kata laluan terlalu lemah — gunakan sekurang-kurangnya 6 aksara.',
  'auth/invalid-email': 'Format emel tidak sah. Cth: nama@tadika.my',
  'auth/too-many-requests': 'Terlalu banyak percubaan. Sila tunggu sebentar sebelum mencuba lagi.',
  'auth/user-disabled': 'Akaun ini telah dinyahdayakan. Sila hubungi pihak tadika.',
  'auth/popup-closed-by-user': 'Tetingkap Google ditutup sebelum log masuk selesai.',
  'auth/popup-blocked': 'Pelayar anda menyekat tetingkap Google. Benarkan pop-up untuk tapak ini.',
  'auth/operation-not-allowed':
    'Provider log masuk ini belum dibenarkan. Aktifkannya dalam Firebase Console.',
  'auth/network-request-failed': 'Masalah rangkaian. Sila periksa sambungan internet anda.',
  'auth/requires-recent-login': 'Sila log masuk semula sebelum membuat perubahan keselamatan ini.',
};

export function firebaseErrorMessage(err: unknown, fallback = 'Operasi gagal. Sila cuba lagi.'): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: unknown }).code || '');
    if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Email a Firebase password-reset link to the given address. */
export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Reset kata laluan memerlukan Firebase. Dalam Mod Demo, gunakan butang akaun demo di bawah.'
    );
  }
  const target = email.trim();
  if (!target) {
    throw new Error('Sila masukkan emel anda untuk hantar pautan reset.');
  }
  await sendPasswordResetEmail(auth, target);
}

/**
 * Google sign-in (free on the Firebase Blaze-free Spark plan). The resolved role
 * always comes from the Firestore profile doc when present, otherwise from the
 * staff email allow-list, and is written back so future sign-ins stay stable.
 */
export async function loginWithGoogle(): Promise<{
  name: string;
  email: string;
  role: DemoRole;
}> {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Log masuk Google memerlukan Firebase. Dalam Mod Demo, gunakan butang akaun demo di bawah.'
    );
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const fbUser = cred.user;
  const fallbackName = fbUser.displayName || fbUser.email || 'Pengguna';
  const email = fbUser.email || '';
  const guessedRole = inferRole(fbUser.email);

  try {
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    const data = snap.data();
    const storedRole = data?.role === 'admin' || data?.role === 'parent' ? data.role : guessedRole;
    const name = data?.displayName ? String(data.displayName) : fallbackName;
    await setDoc(
      doc(db, 'users', fbUser.uid),
      {
        email,
        displayName: name,
        role: storedRole,
        provider: 'google',
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { name, email, role: storedRole };
  } catch {
    // Offline / rules-restricted: sign-in still succeeded, use the email guess.
    return { name: fallbackName, email, role: guessedRole };
  }
}
