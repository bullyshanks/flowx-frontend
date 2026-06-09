'use client';

import { useEffect, useState } from 'react';
import { Package, Loader2, RefreshCw, X, UserCheck, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, VendorListItem } from '@/lib/admin-services';
import {
  PageHeader, Table, Th, Td, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'OUT_FOR_DELIVERY', label: 'Delivering' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const { orders } = await adminApi.listOrders({
        status: statusFilter || undefined,
        limit: 100,
      });
      setOrders(orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  // ── Load approved vendors for the assign modal ──
  useEffect(() => {
    adminApi
      .listVendors({ status: 'APPROVED' })
      .then(setVendors)
      .catch(() => {});
  }, []);

  const handleAssign = async (orderId: string, vendorId: string) => {
    try {
      await adminApi.assignVendor(orderId, vendorId);
      toast.success('Vendor assigned');
      setSelectedOrder(null);
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to assign');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Manage all customer orders"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {/* ── Filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              statusFilter === f.value
                ? 'bg-electric text-white'
                : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-electric" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={statusFilter ? 'Try removing the filter' : 'Orders will appear here when customers place them'}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Zone</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Vendor</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="font-mono font-bold text-cyan2">{order.orderNumber}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </Td>
                <Td>
                  <div className="font-semibold text-white">
                    {order.guestName || '—'}
                  </div>
                  <div className="text-[11px] text-white/45 mt-0.5">
                    {order.guestPhone || '—'}
                  </div>
                </Td>
                <Td>{order.zone?.name || '—'}</Td>
                <Td className="font-bold text-white">{formatPrice(order.total)}</Td>
                <Td>
                  <StatusBadge variant={statusToBadge(order.status)}>
                    {order.status.replace('_', ' ')}
                  </StatusBadge>
                </Td>
                <Td>
                  {order.vendor ? (
                    <span className="text-flowgreen text-sm">{order.vendor.name}</span>
                  ) : (
                    <span className="text-white/35 text-sm">Unassigned</span>
                  )}
                </Td>
                <Td className="text-white/55 text-xs">{formatDate(order.createdAt)}</Td>
                <Td>
                  <div className="flex gap-1.5">
                    {!order.vendor && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Assign
                      </Button>
                    )}
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                                      if (confirm(`Cancel order ${order.orderNumber}?`)) {
                                      handleStatusUpdate(order.id, 'CANCELLED');
                        }
                      }}
                    >
                    Cancel
                    </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ── Assign vendor modal ── */}
      {selectedOrder && (
        <AssignVendorModal
          order={selectedOrder}
          vendors={vendors.filter((v) => v.zone?.id === selectedOrder.zone?.id || !selectedOrder.zone)}
          onClose={() => setSelectedOrder(null)}
          onAssign={(vendorId) => handleAssign(selectedOrder.id, vendorId)}
        />
      )}
    </>
  );
}

function AssignVendorModal({
  order,
  vendors,
  onClose,
  onAssign,
}: {
  order: Order;
  vendors: VendorListItem[];
  onClose: () => void;
  onAssign: (vendorId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-navy border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-syne font-bold text-white text-lg mb-1">Assign Vendor</div>
            <div className="text-white/50 text-sm">
              Order <span className="font-mono text-cyan2">{order.orderNumber}</span> · {order.zone?.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Order details ── */}
        <div className="bg-white/[0.04] rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2 text-sm text-white/75 mb-2">
            <MapPin size={14} className="text-cyan2 flex-shrink-0 mt-0.5" />
            <span>{order.deliveryAddress}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-white/75">
            <Phone size={14} className="text-cyan2 flex-shrink-0 mt-0.5" />
            <span>{order.guestPhone || '—'}</span>
          </div>
        </div>

        <div className="text-xs text-white/50 uppercase tracking-wide mb-3">
          Available Vendors in this zone
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-8 text-white/45 text-sm">
            No approved vendors in this zone yet
          </div>
        ) : (
          <div className="space-y-2 mb-2">
            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => onAssign(v.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-electric/10 hover:border-electric/30 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-flowgreen flex items-center justify-center font-syne font-bold text-sm">
                  {v.name?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{v.name}</div>
                  <div className="text-xs text-white/45">{v.phone} · {v.zone?.name}</div>
                </div>
                <UserCheck size={16} className="text-flowgreen" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
