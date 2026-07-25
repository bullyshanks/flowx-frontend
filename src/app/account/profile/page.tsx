'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, User as UserIcon, Gift, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { useAuthStore } from '@/lib/auth-store';
import { authApi, referralApi, type ReferralInfo } from '@/lib/services';
import { formatPrice } from '@/lib/utils';

export default function AccountProfilePage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const current = useAuthStore.getState().user;
      if (!current) {
        toast.error('Please login first');
        router.replace('/login');
      } else if (current.role !== 'CUSTOMER') {
        toast.error('Customer access only');
        router.replace('/');
      } else {
        setAuthChecked(true);
      }
    };

    if (user === null) {
      const t = setTimeout(checkAuth, 200);
      return () => clearTimeout(t);
    }
    checkAuth();
  }, [user, router]);

  useEffect(() => {
    if (!authChecked) return;
    authApi.me()
      .then((u) => {
        setName(u.name || '');
        setEmail(u.email || '');
        setAddress(u.defaultAddress || '');
        setPhone(u.phone || '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
    referralApi.get().then(setReferral).catch(() => {});
  }, [authChecked]);

  const copyReferralLink = async () => {
    if (!referral) return;
    const link = `${window.location.origin}/?ref=${referral.referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy — try selecting the code manually');
    }
  };

  const save = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const updated = await authApi.updateMe({
        name: name.trim(),
        email: email.trim() || null,
        defaultAddress: address.trim() || null,
      });
      if (token) setAuth(token, { ...useAuthStore.getState().user!, ...updated });
      toast.success('Profile updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-flowgreen" size={40} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="pt-32 pb-24 px-[6vw] bg-soft min-h-screen">
        <div className="max-w-xl mx-auto">
          <div className="section-tag !bg-electric/8 !border-electric/20 !text-electric">
            <UserIcon size={14} className="inline mr-1" /> My Profile
          </div>
          <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight mb-6">
            Edit Your Profile
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-electric" size={32} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-light p-6">
              <div className="mb-4">
                <label className="block text-slate-500 text-xs font-semibold mb-1.5">Phone Number</label>
                <input
                  value={phone}
                  disabled
                  className="w-full px-4 py-3 bg-soft border border-light rounded-xl text-slate-400 text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Phone number can&apos;t be changed here — contact support.</p>
              </div>
              <div className="mb-4">
                <label className="block text-slate-500 text-xs font-semibold mb-1.5">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-soft border border-light rounded-xl text-navy text-sm outline-none focus:border-electric"
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-500 text-xs font-semibold mb-1.5">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-soft border border-light rounded-xl text-navy text-sm outline-none focus:border-electric"
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-500 text-xs font-semibold mb-1.5">Default Delivery Address (optional)</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street, Karachi"
                  className="w-full px-4 py-3 bg-soft border border-light rounded-xl text-navy text-sm outline-none focus:border-electric"
                />
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-br from-electric to-flowgreen text-white font-bold text-sm hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
              </button>
            </div>
          )}

          {referral && (
            <div className="bg-navy rounded-2xl p-6 mt-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Gift size={18} className="text-flowgreen" />
                <h2 className="font-syne font-bold text-white text-base">Refer a Friend</h2>
              </div>
              <p className="text-white/50 text-[13px] mb-4">
                Share your code — your friend gets Rs. 50 off their first order, and you get Rs. 50 once it&apos;s delivered.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl font-mono font-bold text-flowgreen text-sm tracking-wide">
                  {referral.referralCode}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
                >
                  {copied ? <Check size={16} className="text-flowgreen" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <div className="text-white/50 text-xs">Wallet Balance</div>
                  <div className="text-white font-syne font-extrabold text-xl">{formatPrice(referral.walletBalance)}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs">Friends Referred</div>
                  <div className="text-white font-syne font-extrabold text-xl">{referral.referralsCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
