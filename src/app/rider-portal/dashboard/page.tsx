'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, CheckCircle2, Clock, TrendingUp, Loader2, MapPin, ArrowRight, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { riderPortalApi, RiderStats } from '@/lib/rider-portal-services';
import {
  StatCard, PageHeader, StatusBadge, statusToBadge, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import type { Order } from '@/types';

export default function RiderDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        riderPortalApi.dashboard(),
        riderPortalApi.queue(),
      ]);
      setStats(s);
      setOrders(o);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh every 15 seconds — deliveries are time-sensitive
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleOnline = async () => {
    if (!user) return;
    setTogglingOnline(true);
    try {
      const updated = await riderPortalApi.setOnline(!(user.isOnline ?? false));
      if (token) setAuth(token, { ...user, isOnline: updated.isOnline });
      toast.success(updated.isOnline ? "You're online — offers will come through" : 'You&apos;re offline — no new offers');
      load();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-cyan2" size={32} />
      </div>
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const isOnline = user?.isOnline ?? false;
  const offered = orders.filter((o) => o.riderId && o.riderAcceptDeadline);
  const activeOrders = orders.filter((o) => !o.riderAcceptDeadline && (o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY'));

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Rider'}`}
        subtitle={`Your zone: ${user?.zone?.name || '—'}`}
      />

      {/* ── Online/offline toggle ── */}
      <div className={`bg-navy border rounded-2xl p-5 flex items-center justify-between gap-4 mb-8 ${isOnline ? 'border-flowgreen/30' : 'border-white/[0.08]'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOnline ? 'bg-flowgreen/10' : 'bg-white/[0.06]'}`}>
            <Zap className={isOnline ? 'text-flowgreen' : 'text-white/50'} size={20} />
          </div>
          <div className="min-w-0">
            <div className={`font-syne font-bold ${isOnline ? 'text-flowgreen' : 'text-white/70'}`}>
              {isOnline ? "You're Online" : "You're Offline"}
            </div>
            <div className="text-[11px] text-white/45 mt-0.5">
              {isOnline ? 'Ready to receive delivery offers' : 'Go online to start receiving offers'}
            </div>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          disabled={togglingOnline}
          role="switch"
          aria-checked={isOnline}
          aria-label="Toggle online status"
          className={`relative w-12 h-7 rounded-full transition flex-shrink-0 disabled:opacity-50 ${isOnline ? 'bg-flowgreen' : 'bg-white/15'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Deliveries" value={stats.todayOrders} icon={Package} color="blue" />
        <StatCard label="In Progress" value={stats.pendingOrders} icon={Clock} color="amber" />
        <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle2} color="green" />
        <StatCard label="Total Delivered" value={stats.totalAssigned} icon={TrendingUp} color="cyan" />
      </div>

      {/* ── Awaiting my response ── */}
      {offered.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-white text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Awaiting Your Response
            </h2>
            <Link href="/rider-portal/orders" className="text-sm text-cyan2 hover:underline flex items-center gap-1">
              Respond <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offered.slice(0, 4).map((o) => <RiderOrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}

      {/* ── Active deliveries ── */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-white text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-flowgreen rounded-full animate-pulse" />
              Active Deliveries
            </h2>
            <Link href="/rider-portal/orders" className="text-sm text-cyan2 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.slice(0, 4).map((o) => <RiderOrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}

      {offered.length === 0 && activeOrders.length === 0 && (
        <EmptyState
          icon={Package}
          title={isOnline ? 'No deliveries right now' : 'Go online to receive deliveries'}
          description={isOnline ? "We'll notify you when a delivery comes in." : 'Flip the switch above when you’re ready to ride.'}
        />
      )}
    </>
  );
}

// ─── Compact order preview card ──
function RiderOrderCard({ order }: { order: Order }) {
  return (
    <Link
      href="/rider-portal/orders"
      className="block bg-navy border border-white/[0.08] rounded-2xl p-5 hover:border-cyan2/30 transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-cyan2 text-sm">{order.orderNumber}</div>
          <div className="text-[11px] text-white/40 mt-0.5">{formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge variant={statusToBadge(order.status)}>{order.status.replace('_', ' ')}</StatusBadge>
      </div>
      <div className="flex items-start gap-2 text-sm text-white/75 mb-2">
        <MapPin size={14} className="text-cyan2 flex-shrink-0 mt-0.5" />
        <span className="line-clamp-2">{order.deliveryAddress}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div>
          <div className="text-[11px] text-white/40 uppercase tracking-wide">Total</div>
          <div className="font-syne font-bold text-white text-lg">{formatPrice(order.total)}</div>
        </div>
        <span className="text-cyan2 text-sm font-semibold">Manage →</span>
      </div>
    </Link>
  );
}
