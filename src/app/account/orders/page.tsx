'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, PackageOpen, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { useAuthStore } from '@/lib/auth-store';
import { ordersApi } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CONFIRMED: 'bg-cyan2/15 text-cyan2 border-cyan2/25',
  ASSIGNED: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  OUT_FOR_DELIVERY: 'bg-electric/15 text-electric border-electric/25',
  DELIVERED: 'bg-flowgreen/15 text-flowgreen border-flowgreen/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  ASSIGNED: 'Vendor Assigned',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const current = useAuthStore.getState().user;
      if (!current) {
        toast.error('Please login first');
        router.replace('/login');
      } else if (current.role !== 'CUSTOMER') {
        toast.error('Customer access only');
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

  useEffect(() => {
    if (!authChecked) return;
    ordersApi.myOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [authChecked]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-flowgreen" size={40} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="pt-32 pb-24 px-[6vw] bg-soft min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="section-tag !bg-electric/8 !border-electric/20 !text-electric">
            📦 My Orders
          </div>
          <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight mb-6">
            Your Order History
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-electric" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-light p-10 text-center text-slate-500">
              <PackageOpen className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="mb-1 font-semibold text-navy">No orders yet</p>
              <p className="text-sm">Your placed orders will show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/track?order=${encodeURIComponent(o.orderNumber)}`}
                  className="bg-white rounded-2xl border border-light p-5 no-underline hover:border-electric/40 transition block"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-syne font-bold text-navy">#{o.orderNumber}</div>
                      <div className="text-[13px] text-slate-500">{formatDate(o.createdAt)}</div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>

                  <div className="text-[13px] text-slate-500 mb-3">
                    {o.items.map((i) => `${i.product.name} × ${i.quantity}`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-syne font-extrabold text-navy">{formatPrice(o.total)}</span>
                    <span className="inline-flex items-center gap-1 text-electric text-xs font-semibold">
                      Track order <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
