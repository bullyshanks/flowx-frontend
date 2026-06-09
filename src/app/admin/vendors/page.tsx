'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, RefreshCw, Check, X, MapPin, Phone, IdCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, VendorListItem } from '@/lib/admin-services';
import { productsApi } from '@/lib/services';
import {
  PageHeader, Table, Th, Td, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';
import type { Zone } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingZone, setEditingZone] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listVendors({ status: statusFilter || undefined });
      setVendors(list);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  useEffect(() => {
    productsApi.getZones().then(setZones).catch(() => {});
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveVendor(id);
      toast.success('Vendor approved — SMS sent');
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    try {
      await adminApi.rejectVendor(id, reason || undefined);
      toast.success('Vendor rejected');
      load();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleChangeZone = async (vendorId: string, zoneId: string) => {
    try {
      await adminApi.changeVendorZone(vendorId, zoneId);
      toast.success('Zone updated');
      setEditingZone(null);
      load();
    } catch {
      toast.error('Failed to update zone');
    }
  };

  const pendingCount = vendors.filter((v) => v.vendorStatus === 'PENDING').length;

  return (
    <>
      <PageHeader
        title="Vendors"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} vendor${pendingCount !== 1 ? 's' : ''} awaiting approval`
            : 'Manage delivery partners'
        }
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

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
      ) : vendors.length === 0 ? (
        <EmptyState icon={Users} title="No vendors found" description="Vendor applications will appear here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Phone</Th>
              <Th>CNIC</Th>
              <Th>Zone</Th>
              <Th>Status</Th>
              <Th>Orders</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-flowgreen flex items-center justify-center font-syne font-bold text-sm flex-shrink-0">
                      {v.name?.[0]}
                    </div>
                    <span className="font-semibold text-white">{v.name}</span>
                  </div>
                </Td>
                <Td className="text-white/75 text-xs font-mono">{v.phone}</Td>
                <Td className="text-white/45 text-xs font-mono">{v.cnic || '—'}</Td>
                <Td>
                  {editingZone === v.id ? (
                    <select
                      autoFocus
                      defaultValue={v.zone?.id || ''}
                      onChange={(e) => handleChangeZone(v.id, e.target.value)}
                      onBlur={() => setEditingZone(null)}
                      className="bg-navy border border-electric rounded-lg text-white text-xs px-2 py-1.5"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id} className="bg-navy">
                          {z.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingZone(v.id)}
                      className="text-cyan2 text-sm hover:underline cursor-pointer"
                    >
                      {v.zone?.name || 'Set zone'}
                    </button>
                  )}
                </Td>
                <Td>
                  {v.vendorStatus && (
                    <StatusBadge variant={statusToBadge(v.vendorStatus)}>
                      {v.vendorStatus}
                    </StatusBadge>
                  )}
                </Td>
                <Td className="font-semibold text-white">{v._count?.assignedOrders || 0}</Td>
                <Td className="text-white/55 text-xs">{formatDate(v.createdAt)}</Td>
                <Td>
                  <div className="flex gap-1.5">
                    {v.vendorStatus === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleApprove(v.id)}>
                          <Check size={12} /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(v.id)}>
                          <X size={12} /> Reject
                        </Button>
                      </>
                    )}
                    {v.vendorStatus === 'APPROVED' && (
                      <span className="text-xs text-white/45">Active</span>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
