'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, CheckCircle2, Clock, TrendingUp, Loader2, MapPin, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorPortalApi, VendorStats } from '@/lib/vendor-portal-services';
import {
  StatCard, PageHeader, StatusBadge, statusToBadge, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import type { Order } from '@/types';

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        vendorPortalApi.dashboard(),
        vendorPortalApi.queue(),
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

  // Auto-refresh every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-flowgreen" size={32} />
      </div>
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const liveOrders = orders.filter(
    (o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY'
  );
  const availableOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  );

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Vendor'}`}
        subtitle={`Your zone: ${user?.zone?.name || '—'}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's Orders"
          value={stats.todayOrders}
          icon={Package}
          color="blue"
        />
        <StatCard
          label="In Progress"
          value={stats.pendingOrders}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completedOrders}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Total Delivered"
          value={stats.totalAssigned}
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      {/* ── Active deliveries ── */}
      {liveOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-white text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-flowgreen rounded-full animate-pulse" />
              Active Deliveries
            </h2>
            <Link
              href="/vendor-portal/orders"
              className="text-sm text-flowgreen hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveOrders.slice(0, 4).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}

      {/* ── Available orders ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-white text-lg">
            Available in Your Zone
          </h2>
          <Link
            href="/vendor-portal/orders"
            className="text-sm text-flowgreen hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {availableOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No new orders right now"
            description="New orders in your zone will appear here. We'll notify you."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOrders.slice(0, 4).map((o) => (
              <OrderCard key={o.id} order={o} showAccept />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Inline order card ──
function OrderCard({ order, showAccept = false }: { order: Order; showAccept?: boolean }) {
  const [accepting, setAccepting] = useState(false);

  const accept = async () => {
    setAccepting(true);
    try {
      await vendorPortalApi.accept(order.id);
      toast.success('Order accepted!');
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to accept');
      setAccepting(false);
    }
  };

  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl p-5 hover:border-flowgreen/30 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-cyan2 text-sm">{order.orderNumber}</div>
          <div className="text-[11px] text-white/40 mt-0.5">{formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge variant={statusToBadge(order.status)}>
          {order.status.replace('_', ' ')}
        </StatusBadge>
      </div>

      <div className="flex items-start gap-2 text-sm text-white/75 mb-2">
        <MapPin size={14} className="text-flowgreen flex-shrink-0 mt-0.5" />
        <span className="line-clamp-2">{order.deliveryAddress}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div>
          <div className="text-[11px] text-white/40 uppercase tracking-wide">Total</div>
          <div className="font-syne font-bold text-white text-lg">{formatPrice(order.total)}</div>
        </div>
        {showAccept ? (
          <button
            onClick={accept}
            disabled={accepting}
            className="px-4 py-2.5 bg-gradient-to-br from-flowgreen to-flowgreen-dark rounded-xl text-white text-sm font-bold hover:-translate-y-0.5 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {accepting ? <Loader2 className="animate-spin" size={14} /> : 'Accept Order'}
          </button>
        ) : (
          <Link
            href="/vendor-portal/orders"
            className="px-4 py-2.5 bg-white/8 border border-white/15 rounded-xl text-white text-sm font-bold hover:bg-white/12 transition"
          >
            Manage →
          </Link>
        )}
      </div>
    </div>
  );
}
