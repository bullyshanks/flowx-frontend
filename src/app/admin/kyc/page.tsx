'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, KycSubmission } from '@/lib/admin-services';
import {
  PageHeader, Table, Th, Td, StatusBadge, statusToBadge, Button, EmptyState,
} from '@/components/admin/ui';
import KycReviewModal from '@/components/admin/KycReviewModal';

type RoleFilter = 'ALL' | 'VENDOR' | 'RIDER';

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.listPendingKyc(roleFilter === 'ALL' ? undefined : roleFilter)
      .then(setSubmissions)
      .catch(() => toast.error('Failed to load pending KYC submissions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  return (
    <>
      <PageHeader
        title="KYC Review"
        subtitle="Vendors and riders whose identity documents are awaiting review"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      <div className="flex gap-2 mb-6">
        {(['ALL', 'VENDOR', 'RIDER'] as RoleFilter[]).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              roleFilter === r
                ? 'bg-electric-dark text-white'
                : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10'
            }`}
          >
            {r === 'ALL' ? 'All' : r === 'VENDOR' ? 'Vendors' : 'Riders'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>
      ) : submissions.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Nothing pending review" description="KYC submissions awaiting review will appear here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Zone</Th>
              <Th>KYC Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <Td className="font-semibold text-white">{s.name}</Td>
                <Td className="text-white/65 text-xs font-mono">{s.phone}</Td>
                <Td>
                  <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold">
                    {s.role}
                  </span>
                </Td>
                <Td className="text-white/65 text-xs">{s.zone?.name || '—'}</Td>
                <Td><StatusBadge variant={statusToBadge(s.kycStatus)}>{s.kycStatus.replace('_', ' ')}</StatusBadge></Td>
                <Td>
                  <Button size="sm" variant="primary" onClick={() => setReviewingId(s.id)}>
                    <ShieldAlert size={12} /> Review
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {reviewingId && (
        <KycReviewModal
          userId={reviewingId}
          onClose={() => setReviewingId(null)}
          onReviewed={() => { setReviewingId(null); load(); }}
        />
      )}
    </>
  );
}
