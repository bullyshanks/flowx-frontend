'use client';

// "Know another supplier?" — the vendor-portal side of the referral scheme.
//
// The reward is paid when the referred vendor completes their FIRST DELIVERY,
// not when they sign up or get approved. The copy has to say so plainly: a
// vendor who expects money at signup and doesn't get it assumes they were
// cheated, which costs more goodwill than the scheme ever earns.

import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Loader2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorPortalApi, VendorReferralInfo } from '@/lib/vendor-portal-services';
import { formatPrice } from '@/lib/utils';

export default function VendorReferralCard() {
  const [info, setInfo] = useState<VendorReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    vendorPortalApi.referral()
      .then(setInfo)
      .catch(() => { /* non-critical panel — never block the page it sits on */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-navy border border-white/[0.08] rounded-2xl p-6 flex justify-center">
        <Loader2 className="animate-spin text-flowgreen" size={20} />
      </div>
    );
  }
  if (!info) return null;

  // Points at the vendor signup page, not the homepage — the person receiving
  // this is being invited to supply, not to buy water.
  const link = `${window.location.origin}/vendor?ref=${info.referralCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Invite link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — long-press the link to copy it manually');
    }
  };

  const shareOnWhatsapp = () => {
    const message =
      `Assalam-o-Alaikum. I supply water through FlowX — orders come to me directly, ` +
      `no signup fee. If you cover an area they don't yet, you'd be the only vendor there. ` +
      `Sign up here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-flowgreen/10 flex items-center justify-center">
          <Gift className="text-flowgreen" size={18} />
        </div>
        <div>
          <div className="font-syne font-bold text-white">Invite another supplier</div>
          <div className="text-white/50 text-xs">
            Earn {formatPrice(info.rewardPerVendor)} for every vendor you bring on
          </div>
        </div>
      </div>

      <p className="text-white/60 text-sm leading-relaxed mt-3 mb-4">
        Know someone who supplies water in an area FlowX doesn&apos;t cover? Send them your
        link. Your bonus is paid once they complete their first delivery — not at signup,
        so give them a nudge to get started.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <code className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 font-mono truncate">
          {link}
        </code>
        <button
          onClick={copy}
          className="px-4 py-2.5 bg-white/8 border border-white/15 rounded-xl text-white text-sm font-bold hover:bg-white/12 transition flex items-center gap-1.5"
        >
          {copied ? <Check size={14} className="text-flowgreen" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={shareOnWhatsapp}
          className="px-4 py-2.5 bg-gradient-to-br from-flowgreen to-flowgreen-dark rounded-xl text-white text-sm font-bold hover:-translate-y-0.5 transition flex items-center gap-1.5"
        >
          <Share2 size={14} /> WhatsApp
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Invited', value: info.signedUp },
          { label: 'Delivering', value: info.credited },
          { label: 'Earned', value: formatPrice(info.totalEarned) },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="text-[11px] text-white/45 uppercase tracking-wide">{s.label}</div>
            <div className="font-syne font-bold text-white text-lg mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {info.referrals.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4">
          <div className="text-[11px] text-white/45 uppercase tracking-wide mb-2">Your invites</div>
          <div className="flex flex-col gap-2">
            {info.referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="text-white/80">{r.name}</span>
                  {r.zone && <span className="text-white/40 text-xs"> · {r.zone}</span>}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                    r.status === 'CREDITED'
                      ? 'bg-flowgreen/15 text-flowgreen border-flowgreen/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {r.status === 'CREDITED' ? `+${formatPrice(r.bonus)}` : 'Not delivered yet'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
