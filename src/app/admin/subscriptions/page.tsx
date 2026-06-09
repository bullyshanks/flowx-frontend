'use client';

import { useEffect, useState } from 'react';
import { Repeat, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/admin-services';
import {
  PageHeader, Table, Th, Td, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';

interface Subscription {
  id: string;
  customer: { name: string; phone: string };
  product: { name: string; price: number };
  zone: { name: string };
  quantity: number;
  frequency: string;
  status: string;
  preferredTimeSlot?: string;
  deliveryAddress: string;
  nextDeliveryDate?: string;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listSubscriptions();
      setSubs(list);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="All customer recurring deliveries"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-electric" size={32} />
        </div>
      ) : subs.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No subscriptions yet"
          description="Customer subscription plans will appear here."
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Product</Th>
              <Th>Qty</Th>
              <Th>Frequency</Th>
              <Th>Zone</Th>
              <Th>Status</Th>
              <Th>Next Delivery</Th>
              <Th>Started</Th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="font-semibold text-white">{s.customer.name}</div>
                  <div className="text-[11px] text-white/45 font-mono">{s.customer.phone}</div>
                </Td>
                <Td>
                  <div className="text-white">{s.product.name}</div>
                  <div className="text-[11px] text-white/45">{formatPrice(s.product.price)}</div>
                </Td>
                <Td className="font-semibold text-white">{s.quantity}</Td>
                <Td>
                  <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold">
                    {s.frequency}
                  </span>
                </Td>
                <Td>{s.zone.name}</Td>
                <Td>
                  <StatusBadge variant={statusToBadge(s.status)}>{s.status}</StatusBadge>
                </Td>
                <Td className="text-white/65 text-xs">
                  {s.nextDeliveryDate ? formatDate(s.nextDeliveryDate) : '—'}
                </Td>
                <Td className="text-white/55 text-xs">{formatDate(s.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
