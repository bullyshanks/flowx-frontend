'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, User, LogOut, Loader2, Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

const NAV_ITEMS = [
  { href: '/vendor-portal/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/vendor-portal/orders', label: 'Orders', icon: Package },
  { href: '/vendor-portal/profile', label: 'Profile', icon: User },
];

export default function VendorPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Auth guard: must be APPROVED vendor ──
  useEffect(() => {
    const checkAuth = () => {
      const current = useAuthStore.getState().user;
      if (!current) {
        toast.error('Please login first');
        router.replace('/login');
      } else if (current.role !== 'VENDOR') {
        toast.error('Vendor access only');
        router.replace('/');
      } else if (current.vendorStatus !== 'APPROVED') {
        toast.error(`Account ${current.vendorStatus?.toLowerCase()} — awaiting approval`);
        router.replace('/');
      } else {
        setAuthChecked(true);
      }
    };

    if (user === null) {
      // Wait for zustand to hydrate
      const t = setTimeout(checkAuth, 200);
      return () => clearTimeout(t);
    }
    checkAuth();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('flowx_token');
    toast.success('Logged out');
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-flowgreen" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pb-20 lg:pb-0 lg:pl-64">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-7 border-b border-white/[0.06]">
          <Link href="/vendor-portal/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-flowgreen text-lg">F</span>
            </div>
            <div>
              <div className="font-syne font-extrabold text-white text-lg leading-none">
                Flow<span className="x-green">X</span>
              </div>
              <div className="text-[10px] text-flowgreen uppercase tracking-[2px] mt-0.5">Vendor</div>
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
                    ? 'bg-flowgreen/15 text-flowgreen border border-flowgreen/25'
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flowgreen to-flowgreen-dark flex items-center justify-center font-syne font-bold text-sm">
              {user?.name?.[0] || 'V'}
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
            <span className="font-syne font-extrabold text-flowgreen">F</span>
          </div>
          <div>
            <div className="font-syne font-extrabold text-white text-sm leading-none">
              Flow<span className="x-green">X</span> Vendor
            </div>
            <div className="text-[10px] text-white/50 mt-1">{user?.name}</div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/65">
          <Bell size={16} />
        </button>
      </div>

      {/* ── Main ── */}
      <main className="px-5 lg:px-10 py-6 lg:py-10">{children}</main>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-white/[0.08] grid grid-cols-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition ${
                active ? 'text-flowgreen' : 'text-white/45'
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
