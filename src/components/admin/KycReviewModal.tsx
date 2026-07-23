'use client';

import { useEffect, useState } from 'react';
import { X, Check, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, KycSubmission } from '@/lib/admin-services';
import { StatusBadge, statusToBadge, Button } from './ui';

// Shared by /admin/vendors and /admin/riders — KYC is one identity-verification
// gate independent of either role's own account-approval status.
export default function KycReviewModal({
  userId,
  onClose,
  onReviewed,
}: {
  userId: string;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const [submission, setSubmission] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    adminApi.getKycSubmission(userId)
      .then(setSubmission)
      .catch(() => toast.error('Failed to load KYC submission'))
      .finally(() => setLoading(false));
  }, [userId]);

  const approve = async () => {
    setActing(true);
    try {
      await adminApi.approveKyc(userId);
      toast.success('KYC approved');
      onReviewed();
    } catch {
      toast.error('Failed to approve KYC');
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    setActing(true);
    try {
      await adminApi.rejectKyc(userId, reason || undefined);
      toast.success('KYC rejected');
      onReviewed();
    } catch {
      toast.error('Failed to reject KYC');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-navy border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <ShieldAlert className="text-white/60" size={18} />
            </div>
            <div>
              <div className="font-syne font-bold text-white text-lg">KYC Review</div>
              {submission && <div className="text-white/50 text-sm">{submission.name} · {submission.phone}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-electric" size={28} /></div>
        ) : !submission ? (
          <div className="text-center py-16 text-white/50 text-sm">Submission not found</div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-white/60 uppercase tracking-wide">Status</span>
              <StatusBadge variant={statusToBadge(submission.kycStatus)}>{submission.kycStatus.replace('_', ' ')}</StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <DocPreview label="CNIC Front" src={submission.cnicFront} />
              <DocPreview label="CNIC Back" src={submission.cnicBack} />
              <DocPreview label="Selfie" src={submission.selfieUrl} />
            </div>

            {submission.kycStatus === 'PENDING' ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="success" disabled={acting} onClick={approve}>
                  {acting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Approve KYC
                </Button>
                <Button variant="danger" disabled={acting} onClick={reject}>
                  <X size={14} /> Reject KYC
                </Button>
              </div>
            ) : submission.kycStatus === 'NOT_SUBMITTED' ? (
              <p className="text-white/50 text-sm">No documents submitted yet.</p>
            ) : (
              <p className="text-white/50 text-sm">This submission has already been reviewed.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DocPreview({ label, src }: { label: string; src?: string }) {
  return (
    <div>
      <div className="text-[11px] text-white/60 uppercase tracking-wide mb-1.5">{label}</div>
      <div className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URIs, not a static asset
          <img src={src} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/35 text-xs">Not provided</span>
        )}
      </div>
    </div>
  );
}
