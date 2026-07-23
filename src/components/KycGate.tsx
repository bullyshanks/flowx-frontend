'use client';

import { useState } from 'react';
import { ShieldAlert, Upload, Loader2, Clock, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/services';
import { Button } from '@/components/admin/ui';
import type { User } from '@/types';

// Gates an entire portal (vendor or rider) behind KYC approval. Rendered by
// the portal layout in place of the nav + page content whenever the signed-in
// user's kycStatus isn't APPROVED.
export default function KycGate({
  profile,
  onSubmitted,
  onLogout,
}: {
  profile: User;
  onSubmitted: () => void;
  onLogout: () => void;
}) {
  const status = profile.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-flowgreen">F</span>
            </div>
            <div className="font-syne font-extrabold text-white text-lg leading-none">
              Flow<span className="x-green">X</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {status === 'PENDING' ? (
          <PendingCard />
        ) : (
          <UploadCard rejected={status === 'REJECTED'} reason={profile.rejectedReason} onSubmitted={onSubmitted} />
        )}
      </div>
    </div>
  );
}

function PendingCard() {
  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl p-8 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
        <Clock className="text-amber-400" size={26} />
      </div>
      <h1 className="font-syne font-bold text-white text-xl mb-2">KYC Under Review</h1>
      <p className="text-white/60 text-sm">
        We&apos;ve received your documents. FlowX admin usually reviews submissions within 24 hours —
        you&apos;ll be able to go live as soon as it&apos;s approved.
      </p>
    </div>
  );
}

function UploadCard({
  rejected, reason, onSubmitted,
}: {
  rejected: boolean;
  reason?: string;
  onSubmitted: () => void;
}) {
  const [cnicFront, setCnicFront] = useState<string | null>(null);
  const [cnicBack, setCnicBack] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const readFile = (file: File, setter: (v: string) => void) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!cnicFront || !cnicBack || !selfieUrl) {
      toast.error('Please upload all three documents');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.submitKyc({ cnicFront, cnicBack, selfieUrl });
      toast.success('KYC submitted for review');
      onSubmitted();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl p-6 sm:p-8">
      <div className="w-14 h-14 rounded-2xl bg-flowgreen/10 flex items-center justify-center mb-4">
        <ShieldAlert className="text-flowgreen" size={26} />
      </div>
      <h1 className="font-syne font-bold text-white text-xl mb-2">Verify Your Identity</h1>
      <p className="text-white/60 text-sm mb-5">
        Upload your CNIC (front and back) and a selfie to unlock the rest of your account.
        This is a one-time step required before you can go live.
      </p>

      {rejected && (
        <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <div className="text-red-400 text-sm font-semibold mb-0.5">Previous submission rejected</div>
          <div className="text-white/70 text-xs">{reason || 'Please re-submit clear photos of your documents.'}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <DocUpload label="CNIC Front" value={cnicFront} onChange={(f) => readFile(f, setCnicFront)} />
        <DocUpload label="CNIC Back" value={cnicBack} onChange={(f) => readFile(f, setCnicBack)} />
        <DocUpload label="Selfie" value={selfieUrl} onChange={(f) => readFile(f, setSelfieUrl)} />
      </div>

      <Button
        variant="success"
        disabled={submitting || !cnicFront || !cnicBack || !selfieUrl}
        onClick={submit}
        className="w-full justify-center"
      >
        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
        Submit for Review
      </Button>
    </div>
  );
}

function DocUpload({ label, value, onChange }: { label: string; value: string | null; onChange: (f: File) => void }) {
  const inputId = `kyc-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <div className="text-[11px] text-white/60 uppercase tracking-wide mb-1.5">{label}</div>
      <label
        htmlFor={inputId}
        className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-dashed border-white/20 hover:border-flowgreen/40 overflow-hidden flex items-center justify-center cursor-pointer transition relative block"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URI preview, not a static asset
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-white/40">
            <Upload size={18} />
            <span className="text-[11px]">Tap to upload</span>
          </div>
        )}
        {value && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
            <X size={11} className="text-white" />
          </span>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        />
      </label>
    </div>
  );
}
