'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bike, Loader2, RefreshCw, Check, X, ShieldAlert, Wallet, Snowflake, Save, Ban, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, RiderListItem } from '@/lib/admin-services';
import { productsApi } from '@/lib/services';
import {
  PageHeader, Table, Th, Td, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import KycReviewModal from '@/components/admin/KycReviewModal';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Zone } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderListItem[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [kycTarget, setKycTarget] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listRiders({ status: statusFilter || undefined });
      setRiders(list);
    } catch {
      toast.error('Failed to load riders');
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
      await adminApi.approveRider(id);
      toast.success('Rider account approved');
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
      await adminApi.rejectRider(id, reason || undefined);
      toast.success('Rider rejected');
      load();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleSuspend = async (id: string) => {
    const reason = prompt('Reason for suspension (optional):');
    if (reason === null) return;
    try {
      const { message } = await adminApi.suspendRider(id, reason || undefined);
      toast.success(message);
      load();
    } catch {
      toast.error('Failed to suspend rider');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const { message } = await adminApi.suspendRider(id);
      toast.success(message);
      load();
    } catch {
      toast.error('Failed to reactivate rider');
    }
  };

  const handleChangeZone = async (riderId: string, zoneId: string) => {
    try {
      await adminApi.changeRiderZone(riderId, zoneId);
      toast.success('Zone updated');
      setEditingZone(null);
      load();
    } catch {
      toast.error('Failed to update zone');
    }
  };

  const startEditLimit = (r: RiderListItem) => {
    setEditingLimit(r.id);
    setLimitInput(r.codLimit != null ? String(Number(r.codLimit)) : '');
  };

  const saveLimit = async (riderId: string) => {
    const value = limitInput.trim() === '' ? null : Number(limitInput);
    if (value !== null && (isNaN(value) || value < 0)) {
      toast.error('Enter a valid limit (or leave empty for unlimited)');
      return;
    }
    try {
      await adminApi.setRiderCodLimit(riderId, value);
      toast.success(value === null ? 'COD limit removed (unlimited)' : `COD limit set to ${formatPrice(value)}`);
      setEditingLimit(null);
      load();
    } catch {
      toast.error('Failed to update COD limit');
    }
  };

  const handleToggleFreeze = async (r: RiderListItem) => {
    const verb = r.isFrozen ? 'Unfreeze' : 'Freeze';
    if (!confirm(`${verb} ${r.name}? ${r.isFrozen ? 'They will be able to accept deliveries again.' : 'They will not be able to accept deliveries or be settled until unfrozen.'}`)) return;
    try {
      await adminApi.setRiderFrozen(r.id, !r.isFrozen);
      toast.success(r.isFrozen ? 'Rider unfrozen' : 'Rider frozen');
      load();
    } catch {
      toast.error('Failed to update freeze status');
    }
  };

  const pendingCount = riders.filter((r) => r.vendorStatus === 'PENDING').length;

  return (
    <>
      <PageHeader
        title="Riders"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} rider${pendingCount !== 1 ? 's' : ''} awaiting approval`
            : 'Manage delivery riders'
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
      ) : riders.length === 0 ? (
        <EmptyState icon={Bike} title="No riders found" description="Rider applications will appear here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Rider</Th>
              <Th>Phone</Th>
              <Th>Vehicle</Th>
              <Th>Zone</Th>
              <Th>Status</Th>
              <Th>KYC</Th>
              <Th>Online</Th>
              <Th>COD Limit</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-flowgreen flex items-center justify-center font-syne font-bold text-sm flex-shrink-0">
                      {r.name?.[0]}
                    </div>
                    <span className="font-semibold text-white">{r.name}</span>
                  </div>
                </Td>
                <Td className="text-white/75 text-xs font-mono">{r.phone}</Td>
                <Td className="text-white/65 text-xs max-w-[160px] truncate">{r.vehicleDetails || '—'}</Td>
                <Td>
                  {editingZone === r.id ? (
                    <select
                      autoFocus
                      defaultValue={r.zone?.id || ''}
                      onChange={(e) => handleChangeZone(r.id, e.target.value)}
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
                      onClick={() => setEditingZone(r.id)}
                      className="text-cyan2 text-sm hover:underline cursor-pointer"
                    >
                      {r.zone?.name || 'Set zone'}
                    </button>
                  )}
                </Td>
                <Td>
                  {r.vendorStatus && (
                    <StatusBadge variant={statusToBadge(r.vendorStatus)}>
                      {r.vendorStatus}
                    </StatusBadge>
                  )}
                  {r.isFrozen && <div className="mt-1"><StatusBadge variant="cancelled">FROZEN</StatusBadge></div>}
                </Td>
                <Td>
                  <button
                    onClick={() => setKycTarget(r.id)}
                    className="inline-flex items-center gap-1.5 hover:opacity-80 transition"
                    title="View KYC submission"
                  >
                    <StatusBadge variant={statusToBadge(r.kycStatus || 'NOT_SUBMITTED')}>
                      {(r.kycStatus || 'NOT_SUBMITTED').replace('_', ' ')}
                    </StatusBadge>
                    <ShieldAlert size={13} className="text-white/40" />
                  </button>
                </Td>
                <Td>
                  <span className={`text-[11px] font-semibold ${r.isOnline ? 'text-flowgreen' : 'text-white/45'}`}>
                    {r.isOnline ? 'Online' : 'Offline'}
                  </span>
                </Td>
                <Td>
                  {editingLimit === r.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        placeholder="Unlimited"
                        className="w-24 bg-white/10 border border-electric rounded-lg text-white text-xs px-2 py-1.5 placeholder:text-white/50 outline-none"
                      />
                      <button onClick={() => saveLimit(r.id)} className="text-flowgreen hover:opacity-80">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingLimit(null)} className="text-white/50 hover:opacity-80">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditLimit(r)}
                      className="text-cyan2 text-sm hover:underline cursor-pointer"
                    >
                      {r.codLimit != null ? formatPrice(r.codLimit) : 'Unlimited'}
                    </button>
                  )}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {r.vendorStatus === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleApprove(r.id)}>
                          <Check size={12} /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(r.id)}>
                          <X size={12} /> Reject
                        </Button>
                      </>
                    )}
                    {r.vendorStatus === 'APPROVED' && (
                      <>
                        <Link href={`/admin/finance?tab=riders&rider=${r.id}`}>
                          <Button size="sm" variant="secondary">
                            <Wallet size={12} /> View Ledger
                          </Button>
                        </Link>
                        <Button size="sm" variant={r.isFrozen ? 'success' : 'danger'} onClick={() => handleToggleFreeze(r)}>
                          <Snowflake size={12} /> {r.isFrozen ? 'Unfreeze' : 'Freeze'}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleSuspend(r.id)}>
                          <Ban size={12} /> Suspend
                        </Button>
                      </>
                    )}
                    {r.vendorStatus === 'SUSPENDED' && (
                      <Button size="sm" variant="success" onClick={() => handleReactivate(r.id)}>
                        <RotateCcw size={12} /> Reactivate
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {kycTarget && (
        <KycReviewModal
          userId={kycTarget}
          onClose={() => setKycTarget(null)}
          onReviewed={() => { setKycTarget(null); load(); }}
        />
      )}
    </>
  );
}
