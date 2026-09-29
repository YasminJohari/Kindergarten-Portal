'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/lib/auth';

/**
 * Client-side providers shared by every route (dashboard, login, ...).
 * Keeping them at the root layout means the session state is available
 * to whichever page Next.js renders.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>{children}</AuthProvider>
    </AppProvider>
  );
}
