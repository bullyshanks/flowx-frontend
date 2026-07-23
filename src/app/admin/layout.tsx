'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Users, Bike, Repeat, ShoppingCart,
  Wallet, Settings, LogOut, Menu, X, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/vendors', label: 'Vendors', icon: Users },
  { href: '/admin/riders', label: 'Riders', icon: Bike },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/admin/products', label: 'Products', icon: ShoppingCart },
  { href: '/admin/finance', label: 'Finance', icon: Wallet },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (user === null) {
      // Wait one tick for zustand to hydrate from localStorage
      const t = setTimeout(() => {
        const current = useAuthStore.getState().user;
        if (!current) {
          toast.error('Please login first');
          router.replace('/login');
        } else if (current.role !== 'ADMIN') {
          toast.error('Admin access required');
          router.replace('/');
        } else {
          setAuthChecked(true);
        }
      }, 200);
      return () => clearTimeout(t);
    } else if (user.role !== 'ADMIN') {
      toast.error('Admin access required');
      router.replace('/');
    } else {
      setAuthChecked(true);
    }
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
        <Loader2 className="animate-spin text-electric" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-7 border-b border-white/[0.06]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-electric text-lg">F</span>
            </div>
            <div>
              <div className="font-syne font-extrabold text-white text-lg leading-none">
                Flow<span className="x-green">X</span>
              </div>
              <div className="text-[10px] text-cyan2 uppercase tracking-[2px] mt-0.5">Admin Panel</div>
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
                    ? 'bg-electric/15 text-cyan2 border border-electric/25'
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-flowgreen flex items-center justify-center font-syne font-bold text-sm">
              {user?.name?.[0] || 'A'}
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="font-syne font-extrabold text-electric">F</span>
          </div>
          <span className="font-syne font-extrabold text-white">
            Flow<span className="x-green">X</span> Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-navy flex flex-col">
            <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-syne font-extrabold text-white text-lg">
                Flow<span className="x-green">X</span> Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      active
                        ? 'bg-electric/15 text-cyan2'
                        : 'text-white/65 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="m-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition border border-white/[0.06]"
            >
              <LogOut size={16} /> Logout
            </button>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      {/* min-w-0 keeps table intrinsic width from escaping overflow-x wrappers */}
      <main className="flex-1 min-w-0 lg:ml-64 pt-20 lg:pt-0 min-h-screen">
        <div className="px-5 lg:px-10 py-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
