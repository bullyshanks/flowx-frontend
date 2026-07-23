'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Wallet, User, LogOut, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';
import { authApi } from '@/lib/services';
import KycGate from '@/components/KycGate';
import type { User as UserType } from '@/types';

const NAV_ITEMS = [
  { href: '/rider-portal/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/rider-portal/orders', label: 'Orders', icon: Package },
  { href: '/rider-portal/wallet', label: 'Wallet', icon: Wallet },
  { href: '/rider-portal/profile', label: 'Profile', icon: User },
];

export default function RiderPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, setAuth, token } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<UserType | null>(null);

  // ── Auth guard: must be APPROVED rider ──
  useEffect(() => {
    const checkAuth = () => {
      const current = useAuthStore.getState().user;
      if (!current) {
        toast.error('Please login first');
        router.replace('/login');
      } else if (current.role !== 'RIDER') {
        toast.error('Rider access only');
        router.replace('/');
      } else if (current.vendorStatus !== 'APPROVED') {
        toast.error(`Account ${current.vendorStatus?.toLowerCase()} — awaiting approval`);
        router.replace('/');
      } else {
        setAuthChecked(true);
      }
    };

    if (user === null) {
      const t = setTimeout(checkAuth, 200);
      return () => clearTimeout(t);
    }
    checkAuth();
  }, [user, router]);

  // Live profile so KYC status reflects admin decisions made since login
  const loadProfile = () => {
    authApi.me()
      .then((p) => {
        setProfile(p);
        if (token) setAuth(token, p);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (authChecked) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('flowx_token');
    toast.success('Logged out');
    router.push('/login');
  };

  if (!authChecked || !profile) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan2" size={40} />
      </div>
    );
  }

  if (profile.kycStatus !== 'APPROVED') {
    return <KycGate profile={profile} onSubmitted={loadProfile} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pb-20 lg:pb-0 lg:pl-64">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-7 border-b border-white/[0.06]">
          <Link href="/rider-portal/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-cyan2 text-lg">F</span>
            </div>
            <div>
              <div className="font-syne font-extrabold text-white text-lg leading-none">
                Flow<span className="x-green">X</span>
              </div>
              <div className="text-[10px] text-cyan2 uppercase tracking-[2px] mt-0.5">Rider</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-cyan2/15 text-cyan2 border border-cyan2/25'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-cyan2 flex items-center justify-center font-syne font-bold text-sm">
              {user?.name?.[0] || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-white/50 truncate">{user?.phone}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden sticky top-0 z-30 bg-navy border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="font-syne font-extrabold text-cyan2">F</span>
          </div>
          <div>
            <div className="font-syne font-extrabold text-white text-sm leading-none">
              Flow<span className="x-green">X</span> Rider
            </div>
            <div className="text-[10px] text-white/50 mt-1">{user?.name}</div>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="px-5 lg:px-10 py-6 lg:py-10">{children}</main>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-white/[0.08] grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition ${
                active ? 'text-cyan2' : 'text-white/60'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
