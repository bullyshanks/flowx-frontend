// ─── Auth state (with localStorage persistence) ──
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Sentry from '@sentry/nextjs';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        // Id and role only — never the phone number. See beforeSend in
        // lib/sentry-shared.ts, which enforces this a second time.
        Sentry.setUser({ id: user.id, role: user.role });
        set({ token, user });
      },
      logout: () => {
        Sentry.setUser(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: 'flowx_auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);
