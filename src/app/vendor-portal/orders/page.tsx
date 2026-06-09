'use client';

import { useEffect, useState } from 'react';
import {
  Package, Loader2, RefreshCw, MapPin, Phone, Truck, CheckCircle2, X,
  ChevronDown, ChevronUp, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorPortalApi } from '@/lib/vendor-portal-services';
import {
  PageHeader, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const TABS = [
  { value: 'available', label: 'Available', match: ['PENDING', 'CONFIRMED'] },
  { value: 'active', label: 'Active', match: ['ASSIGNED', 'OUT_FOR_DELIVERY'] },
  { value: 'completed', label: 'Completed', match: ['DELIVERED'] },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await vendorPortalApi.queue();
      setOrders(list);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await vendorPortalApi.accept(orderId);
      toast.success('Order accepted!');
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to accept');
    }
  };

  const handleStatusChange = async (orderId: string, status: string, label: string) => {
    if (!confirm(`Mark this order as "${label}"?`)) return;
    try {
      await vendorPortalApi.updateStatus(orderId, status);
      toast.success(`Order marked as ${label.toLowerCase()}`);
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update');
    }
  };

  const tabMatch = TABS.find((t) => t.value === activeTab)?.match || [];
  const filtered = orders.filter((o) => tabMatch.includes(o.status));

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.value] = orders.filter((o) => t.match.includes(o.status)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Manage your assigned and available orders"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === t.value
                ? 'bg-flowgreen text-white'
                : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10'
            }`}
          >
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === t.value ? 'bg-white/20' : 'bg-white/10 text-white/65'
            }`}>
              {tabCounts[t.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-flowgreen" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            activeTab === 'available' ? 'No new orders' :
            activeTab === 'active' ? 'No active deliveries' :
            'No completed deliveries yet'
          }
          description={
            activeTab === 'available'
              ? 'New orders in your zone will appear here.'
              : activeTab === 'active'
              ? 'Orders you accept will show here.'
              : 'Your delivery history will build up here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <VendorOrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onAccept={() => handleAccept(order.id)}
              onOutForDelivery={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY', 'Out for Delivery')}
              onDelivered={() => handleStatusChange(order.id, 'DELIVERED', 'Delivered')}
              onCancel={() => handleStatusChange(order.id, 'CANCELLED', 'Cancelled')}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────
// Order card with accordion-style detail
// ──────────────────────────────────────────
function VendorOrderCard({
  order, expanded, onToggle,
  onAccept, onOutForDelivery, onDelivered, onCancel,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onOutForDelivery: () => void;
  onDelivered: () => void;
  onCancel: () => void;
}) {
  const isAvailable = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const isAssigned = order.status === 'ASSIGNED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const phone = order.guestPhone || '';

  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl overflow-hidden hover:border-flowgreen/30 transition">
      {/* Header (always visible) */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono font-bold text-cyan2 text-sm">{order.orderNumber}</span>
            <StatusBadge variant={statusToBadge(order.status)}>
              {order.status.replace('_', ' ')}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 truncate">
            <MapPin size={13} className="text-flowgreen flex-shrink-0" />
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

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.06] pt-5 space-y-4">
          {/* Customer info */}
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
              <div className="text-sm text-white font-semibold mb-1">
                {order.paymentMethod.replace('_', ' ')}
              </div>
              <div className="text-xs text-white/65">
                {order.paymentStatus === 'PAID' ? '✓ Paid online' : 'Cash on delivery'}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="text-[10px] text-white/45 uppercase tracking-wide mb-2">Items</div>
            <div className="bg-white/[0.04] rounded-xl divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white">{item.product.name}</div>
                    <div className="text-xs text-white/45 mt-0.5">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </div>
                  </div>
                  <div className="text-white font-semibold">{formatPrice(item.total)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {isAvailable && (
              <Button variant="success" onClick={onAccept}>
                <CheckCircle2 size={14} /> Accept Order
              </Button>
            )}
            {isAssigned && (
              <>
                <Button variant="primary" onClick={onOutForDelivery}>
                  <Truck size={14} /> Mark Out for Delivery
                </Button>
                <Button variant="danger" onClick={onCancel}>
                  <X size={14} /> Cancel
                </Button>
              </>
            )}
            {isOutForDelivery && (
              <>
                <Button variant="success" onClick={onDelivered}>
                  <CheckCircle2 size={14} /> Mark Delivered
                </Button>
                <Button variant="danger" onClick={onCancel}>
                  <X size={14} /> Cancel
                </Button>
              </>
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
