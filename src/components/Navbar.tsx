'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';

const links = [
  { href: '/#home', label: 'Home' },
  { href: '/#products', label: 'Products' },
  { href: '/#how', label: 'How It Works' },
  { href: '/#features', label: 'Why Us' },
  { href: '/vendor', label: 'Become a Vendor' },
  { href: '/rider', label: 'Become a Rider' },
  { href: '/track', label: 'Track Order' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Only reflect persisted (localStorage) store values after mount,
  // so the first client render matches the server render and we avoid
  // hydration mismatches (#418 / #423).
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showCartBadge = mounted && cartCount > 0;
  const showUser = mounted && user;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[6vw] transition-all backdrop-blur-2xl border-b border-white/[0.06] ${
          scrolled ? 'py-2.5 shadow-2xl' : 'py-4'
        }`}
        style={{ background: 'rgba(10,22,40,0.92)' }}
      >
        <Logo />

        <ul className="hidden lg:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-white/75 text-sm font-medium hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <Link
            href="/cart"
            className="relative bg-white/10 border border-white/15 text-white p-2.5 rounded-xl hover:bg-white/[0.18] transition"
          >
            <ShoppingCart size={18} />
            {showCartBadge && (
              <span className="absolute -top-1.5 -right-1.5 bg-flowgreen text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {showUser ? (
            <button
              onClick={logout}
              className="hidden md:inline-flex bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/15 transition"
            >
              {user.name?.split(' ')[0]} ▾
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex bg-gradient-to-br from-electric to-flowgreen text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition"
            >
              Login
            </Link>
          )}

          <button
            className="lg:hidden text-white p-1.5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1001] bg-navy p-[100px_6vw_40px] flex flex-col">
          <button
            className="absolute top-6 right-6 text-white p-2"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <ul className="list-none">
            {links.map((l) => (
              <li key={l.href} className="py-4 border-b border-white/[0.06]">
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-white font-syne font-semibold text-2xl no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {!showUser && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-8 text-center bg-gradient-to-br from-electric to-flowgreen text-white py-4 rounded-xl font-bold"
            >
              Login →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
