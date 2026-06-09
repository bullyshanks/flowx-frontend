'use client';

import { useEffect, useState } from 'react';
import {
  Users, Truck, Clock, Package, ShoppingBag, Repeat, DollarSign, TrendingUp, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, AdminStats } from '@/lib/admin-services';
import { StatCard, PageHeader, Table, Th, Td, StatusBadge, statusToBadge } from '@/components/admin/ui';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [byStatus, setByStatus] = useState<Array<{ status: string; _count: { _all: number } }>>([]);
  const [topZones, setTopZones] = useState<Array<{ zone: string; orderCount: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.ordersByStatus(), adminApi.topZones()])
      .then(([s, bs, tz]) => {
        setStats(s);
        setByStatus(bs);
        setTopZones(tz);
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-electric" size={32} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your FlowX operations" />

      {/* ── Top stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.revenue.total)}
          sublabel={`${formatPrice(stats.revenue.month)} this month`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Today's Orders"
          value={stats.orders.today}
          sublabel={`${stats.orders.month} this month`}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          label="Pending Orders"
          value={stats.orders.pending}
          sublabel="Awaiting confirmation"
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.subscriptions.active}
          sublabel="Recurring deliveries"
          icon={Repeat}
          color="purple"
        />
      </div>

      {/* ── User stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Customers"
          value={stats.users.customers}
          sublabel="Registered customers"
          icon={Users}
          color="cyan"
        />
        <StatCard
          label="Approved Vendors"
          value={stats.users.vendors}
          sublabel="Active delivery partners"
          icon={Truck}
          color="green"
        />
        <StatCard
          label="Pending Vendors"
          value={stats.users.pendingVendors}
          sublabel={stats.users.pendingVendors > 0 ? '⚠️ Needs your review' : 'All caught up'}
          icon={Clock}
          color={stats.users.pendingVendors > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* ── Two columns: orders by status + top zones ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-navy border border-white/[0.08] rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white text-lg mb-5 flex items-center gap-2">
            <Package size={18} className="text-electric" /> Orders by Status
          </h3>
          {byStatus.length === 0 ? (
            <p className="text-white/45 text-sm py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map((item) => {
                const total = byStatus.reduce((s, i) => s + i._count._all, 0);
                const percent = ((item._count._all / total) * 100).toFixed(0);
                return (
                  <div key={item.status} className="flex items-center gap-4">
                    <StatusBadge variant={statusToBadge(item.status)}>
                      {item.status.replace('_', ' ')}
                    </StatusBadge>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-electric to-cyan2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {item._count._all}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-navy border border-white/[0.08] rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white text-lg mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-flowgreen" /> Top Zones
          </h3>
          {topZones.length === 0 ? (
            <p className="text-white/45 text-sm py-8 text-center">No data yet</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Zone</Th>
                  <Th className="text-right">Orders</Th>
                </tr>
              </thead>
              <tbody>
                {topZones.slice(0, 6).map((z) => (
                  <tr key={z.zone}>
                    <Td>{z.zone}</Td>
                    <Td className="text-right font-semibold text-white">{z.orderCount}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
