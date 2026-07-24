'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { useAuthStore } from '@/lib/auth-store';
import { authApi } from '@/lib/services';

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
  }, [authChecked]);

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
        </div>
      </section>
      <Footer />
    </>
  );
}
