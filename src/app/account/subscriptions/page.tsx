'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PackageOpen, Pause, Play, X, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { useAuthStore } from '@/lib/auth-store';
import { subscriptionsApi } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Subscription } from '@/types';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-flowgreen/15 text-flowgreen border-flowgreen/25',
  PAUSED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CANCELLED: 'bg-white/10 text-white/50 border-white/15',
};

export default function AccountSubscriptionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

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

  const load = () => {
    setLoading(true);
    subscriptionsApi.my()
      .then(setSubs)
      .catch(() => toast.error('Failed to load subscriptions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authChecked) load();
  }, [authChecked]);

  const act = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && !confirm('Cancel this subscription? This cannot be undone.')) return;
    setActingId(id);
    try {
      const fn = action === 'pause' ? subscriptionsApi.pause : action === 'resume' ? subscriptionsApi.resume : subscriptionsApi.cancel;
      await fn(id);
      toast.success(
        action === 'pause' ? 'Subscription paused' : action === 'resume' ? 'Subscription resumed' : 'Subscription cancelled'
      );
      load();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActingId(null);
    }
  };

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
          <div className="section-tag !bg-flowgreen/8 !border-flowgreen/20 !text-flowgreen-dark">
            ♻️ My Subscriptions
          </div>
          <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight mb-6">
            Manage Your Recurring Deliveries
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-electric" size={32} />
            </div>
          ) : subs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-light p-10 text-center text-slate-500">
              <PackageOpen className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="mb-1 font-semibold text-navy">No subscriptions yet</p>
              <p className="text-sm">Start one from the Products section on the homepage.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {subs.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-light p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-soft flex items-center justify-center text-2xl flex-shrink-0">
                        💧
                      </div>
                      <div>
                        <div className="font-syne font-bold text-navy">{s.product.name}</div>
                        <div className="text-[13px] text-slate-500">
                          {s.quantity} {s.product.unit}{s.quantity > 1 ? 's' : ''} · {s.frequency.charAt(0) + s.frequency.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[s.status]}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[13px] text-slate-500 mb-4">
                    <div>
                      <span className="text-slate-400">Zone</span>
                      <div className="text-navy font-medium">{s.zone.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Per delivery</span>
                      <div className="text-navy font-medium">{formatPrice(Number(s.product.price) * s.quantity)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Address</span>
                      <div className="text-navy font-medium truncate">{s.deliveryAddress}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">{s.status === 'CANCELLED' ? 'Ended' : 'Next delivery'}</span>
                      <div className="text-navy font-medium">
                        {s.status === 'CANCELLED' ? (s.endDate ? formatDate(s.endDate) : '—') : (s.nextDeliveryDate ? formatDate(s.nextDeliveryDate) : '—')}
                      </div>
                    </div>
                  </div>

                  {s.status !== 'CANCELLED' && (
                    <div className="flex gap-2">
                      {s.status === 'ACTIVE' ? (
                        <button
                          onClick={() => act(s.id, 'pause')}
                          disabled={actingId === s.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-light text-sm font-semibold text-navy hover:bg-soft transition disabled:opacity-50"
                        >
                          {actingId === s.id ? <Loader2 className="animate-spin" size={14} /> : <Pause size={14} />} Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => act(s.id, 'resume')}
                          disabled={actingId === s.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-flowgreen/30 bg-flowgreen/8 text-sm font-semibold text-flowgreen-dark hover:bg-flowgreen/15 transition disabled:opacity-50"
                        >
                          {actingId === s.id ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />} Resume
                        </button>
                      )}
                      <button
                        onClick={() => act(s.id, 'cancel')}
                        disabled={actingId === s.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <a
            href="/#products"
            className="inline-flex items-center gap-2 mt-6 text-electric text-sm font-semibold hover:underline"
          >
            <Repeat size={14} /> Start another subscription
          </a>
        </div>
      </section>
      <Footer />
    </>
  );
}
