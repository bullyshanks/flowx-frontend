'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Truck } from 'lucide-react';

export default function CornerPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = sessionStorage.getItem('flowx_popup_seen');
    if (seen) return;
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setClosing(true);
    sessionStorage.setItem('flowx_popup_seen', '1');
    setTimeout(() => setVisible(false), 350);
  };

  const enter = (role: 'customer' | 'vendor') => {
    close();
    if (role === 'vendor') {
      setTimeout(() => router.push('/vendor'), 400);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] w-[300px] bg-navy border border-white/12 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${
        closing ? 'opacity-0 translate-y-5' : 'animate-popup-in'
      } transition-all duration-300`}
    >
      <button
        onClick={close}
        aria-label="Close"
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 text-white/50 hover:text-white text-sm flex items-center justify-center"
      >
        <X size={14} />
      </button>

      <div className="font-syne font-bold text-[15px] text-white mb-1">
        👋 Welcome to Flow<span className="x-green">X</span>!
      </div>
      <div className="text-xs text-white/50 mb-4 leading-relaxed">
        Pure Water · Fast Delivery
        <br />
        Who are you shopping as today?
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => enter('customer')}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-electric to-[#1565C0] text-white text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition"
        >
          <ShoppingBag size={16} /> I&apos;m a Customer
        </button>
        <button
          onClick={() => enter('vendor')}
          className="w-full px-4 py-3 rounded-xl bg-flowgreen/12 border border-flowgreen/30 text-flowgreen text-[13px] font-bold flex items-center gap-2 hover:bg-flowgreen/20 hover:-translate-y-0.5 transition"
        >
          <Truck size={16} /> I&apos;m a Vendor / Rider
        </button>
      </div>
    </div>
  );
}
