'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package, Loader2, RefreshCw, MapPin, Phone, Truck, CheckCircle2, X,
  ChevronDown, ChevronUp, MessageCircle, Timer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { riderPortalApi } from '@/lib/rider-portal-services';
import {
  PageHeader, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const TABS = [
  { value: 'offered', label: 'Offered' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function isOffered(o: Order) { return !!o.riderAcceptDeadline; }
function isActive(o: Order) { return !o.riderAcceptDeadline && (o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY'); }
function isCompleted(o: Order) { return o.status === 'DELIVERED'; }

export default function RiderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offered');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const list = await riderPortalApi.queue();
      setOrders(list);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Network poll every 5s — offers expire in 60-120s, so refresh often
  useEffect(() => {
    const poll = setInterval(load, 5000);
    return () => clearInterval(poll);
  }, [load]);

  // Local 1s tick purely for the countdown display
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await riderPortalApi.accept(orderId);
      toast.success('Delivery accepted!');
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to accept');
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await riderPortalApi.reject(orderId);
      toast('Delivery declined', { icon: '👋' });
      load();
    } catch {
      toast.error('Failed to decline');
    }
  };

  const handleStatusChange = async (orderId: string, status: string, label: string) => {
    if (!confirm(`Mark this order as "${label}"?`)) return;
    try {
      await riderPortalApi.updateStatus(orderId, status);
      toast.success(`Order marked as ${label.toLowerCase()}`);
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update');
    }
  };

  const groups: Record<string, Order[]> = {
    offered: orders.filter(isOffered),
    active: orders.filter(isActive),
    completed: orders.filter(isCompleted),
  };
  const filtered = groups[activeTab] || [];

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Accept deliveries and manage your route"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === t.value
                ? 'bg-cyan2 text-navy'
                : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10'
            }`}
          >
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === t.value ? 'bg-navy/20' : 'bg-white/10 text-white/65'
            }`}>
              {groups[t.value]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan2" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            activeTab === 'offered' ? 'No pending offers' :
            activeTab === 'active' ? 'No active deliveries' :
            'No completed deliveries yet'
          }
          description={
            activeTab === 'offered'
              ? "You'll see new delivery offers here — go online on the dashboard first."
              : activeTab === 'active'
              ? 'Deliveries you accept will show here.'
              : 'Your delivery history will build up here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <RiderOrderCard
              key={order.id}
              order={order}
              now={now}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onAccept={() => handleAccept(order.id)}
              onReject={() => handleReject(order.id)}
              onPickedUp={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY', 'Picked Up')}
              onDelivered={() => handleStatusChange(order.id, 'DELIVERED', 'Delivered')}
            />
          ))}
        </div>
      )}
    </>
  );
}

function RiderOrderCard({
  order, now, expanded, onToggle, onAccept, onReject, onPickedUp, onDelivered,
}: {
  order: Order;
  now: number;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onReject: () => void;
  onPickedUp: () => void;
  onDelivered: () => void;
}) {
  const offered = isOffered(order);
  const isAssigned = !offered && order.status === 'ASSIGNED';
  const isOutForDelivery = !offered && order.status === 'OUT_FOR_DELIVERY';
  const phone = order.guestPhone || '';

  const secondsLeft = offered && order.riderAcceptDeadline
    ? Math.max(0, Math.floor((new Date(order.riderAcceptDeadline).getTime() - now) / 1000))
    : null;
  const mm = secondsLeft != null ? Math.floor(secondsLeft / 60) : 0;
  const ss = secondsLeft != null ? secondsLeft % 60 : 0;
  const urgent = secondsLeft != null && secondsLeft <= 20;

  return (
    <div className={`bg-navy border rounded-2xl overflow-hidden transition ${offered ? (urgent ? 'border-red-500/40' : 'border-amber-500/30') : 'border-white/[0.08] hover:border-cyan2/30'}`}>
      {/* Countdown bar for offered deliveries */}
      {offered && secondsLeft != null && (
        <div className={`px-5 py-2 flex items-center justify-between text-xs font-semibold ${urgent ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <span className="flex items-center gap-1.5">
            <Timer size={13} /> Respond within
          </span>
          <span className="font-mono tabular-nums">{mm}:{ss.toString().padStart(2, '0')}</span>
        </div>
      )}

      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono font-bold text-cyan2 text-sm">{order.orderNumber}</span>
            <StatusBadge variant={statusToBadge(order.status)}>{order.status.replace('_', ' ')}</StatusBadge>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 truncate">
            <MapPin size={13} className="text-cyan2 flex-shrink-0" />
            <span className="truncate">{order.deliveryAddress}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="font-syne font-bold text-white">{formatPrice(order.total)}</div>
            <div className="text-[10px] text-white/40">{formatDate(order.createdAt).split(',')[0]}</div>
          </div>
          {expanded ? <ChevronUp size={18} className="text-white/45" /> : <ChevronDown size={18} className="text-white/45" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.06] pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/[0.04] rounded-xl p-3.5">
              <div className="text-[10px] text-white/45 uppercase tracking-wide mb-1.5">Customer</div>
              <div className="text-sm text-white font-semibold mb-1">{order.guestName || '—'}</div>
              <div className="text-xs text-white/65 font-mono flex items-center gap-1.5">
                <Phone size={12} /> {phone}
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3.5">
              <div className="text-[10px] text-white/45 uppercase tracking-wide mb-1.5">Payment</div>
              <div className="text-sm text-white font-semibold mb-1">{order.paymentMethod.replace('_', ' ')}</div>
              <div className="text-xs text-white/65">
                {order.paymentStatus === 'PAID'
                  ? '✓ Paid online'
                  : order.paymentMethod === 'COD'
                    ? 'Collect cash on delivery'
                    : 'Payment pending'}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-white/45 uppercase tracking-wide mb-2">Items</div>
            <div className="bg-white/[0.04] rounded-xl divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white">{item.product.name}</div>
                    <div className="text-xs text-white/45 mt-0.5">{item.quantity} × {formatPrice(item.unitPrice)}</div>
                  </div>
                  <div className="text-white font-semibold">{formatPrice(item.total)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {offered && (
              <>
                <Button variant="success" onClick={onAccept}>
                  <CheckCircle2 size={14} /> Accept
                </Button>
                <Button variant="danger" onClick={onReject}>
                  <X size={14} /> Decline
                </Button>
              </>
            )}
            {isAssigned && (
              <Button variant="primary" onClick={onPickedUp}>
                <Truck size={14} /> Mark Picked Up
              </Button>
            )}
            {isOutForDelivery && (
              <Button variant="success" onClick={onDelivered}>
                <CheckCircle2 size={14} /> Mark Delivered
              </Button>
            )}
            {phone && (
              <>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white text-sm font-semibold hover:bg-white/12 transition"
                >
                  <Phone size={14} /> Call
                </a>
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '92')}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/25 transition"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
