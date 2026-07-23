'use client';

import { useEffect, useState } from 'react';
import {
  Bike, Phone, Mail, MapPin, ShieldCheck, Calendar, CheckCircle2, LogOut, Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';
import { authApi } from '@/lib/services';
import { riderPortalApi, RiderStats } from '@/lib/rider-portal-services';
import { PageHeader, StatCard, StatusBadge, statusToBadge } from '@/components/admin/ui';
import type { User as UserType } from '@/types';

export default function RiderProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authApi.me(), riderPortalApi.dashboard()])
      .then(([p, s]) => {
        setProfile(p);
        setStats(s);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('flowx_token');
    toast.success('Logged out');
    router.push('/login');
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-cyan2" size={32} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your rider account" />

      {/* ── Profile card ── */}
      <div className="bg-navy border border-white/[0.08] rounded-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-cyan2/20 to-cyan2/5 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric to-cyan2 flex items-center justify-center font-syne font-extrabold text-2xl text-white border-4 border-cyan2/20">
            {profile.name?.[0] || 'R'}
          </div>
          <div>
            <div className="font-syne font-extrabold text-white text-xl mb-1">{profile.name}</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-flowgreen" />
              <span className="text-flowgreen text-xs font-bold uppercase tracking-wide">Approved Rider</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3.5">
          {[
            { icon: Phone, label: 'Phone', value: profile.phone },
            { icon: Mail, label: 'Email', value: profile.email || '—' },
            { icon: MapPin, label: 'Delivery Zone', value: profile.zone?.name || '—' },
            { icon: Bike, label: 'Vehicle', value: profile.vehicleDetails || 'Not provided' },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3.5 py-2.5 border-b border-white/[0.05] last:border-0">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <row.icon size={16} className="text-cyan2" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-white/45 uppercase tracking-wide">{row.label}</div>
                <div className="text-sm text-white font-semibold mt-0.5">{row.value}</div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3.5 py-2.5">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} className="text-cyan2" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-white/45 uppercase tracking-wide">KYC Status</div>
              <div className="mt-1">
                <StatusBadge variant={statusToBadge(profile.kycStatus || 'NOT_SUBMITTED')}>
                  {(profile.kycStatus || 'NOT_SUBMITTED').replace('_', ' ')}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Performance stats ── */}
      {stats && (
        <div className="mb-6">
          <h2 className="font-syne font-bold text-white text-lg mb-4">Performance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Today" value={stats.todayOrders} icon={Calendar} color="blue" />
            <StatCard label="In Progress" value={stats.pendingOrders} icon={MapPin} color="amber" />
            <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle2} color="green" />
            <StatCard label="Total Delivered" value={stats.totalAssigned} icon={Bike} color="cyan" />
          </div>
        </div>
      )}

      {/* ── Help / Logout ── */}
      <div className="bg-navy border border-white/[0.08] rounded-2xl p-6 space-y-3">
        <h3 className="font-syne font-bold text-white mb-2">Need Help?</h3>
        <a
          href="https://wa.me/923158374442"
          target="_blank"
          rel="noopener"
          className="block w-full text-left px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/20 transition"
        >
          💬 Contact FlowX Support on WhatsApp
        </a>
        <a
          href="tel:+923158374442"
          className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition"
        >
          📞 Call FlowX Support
        </a>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition flex items-center gap-2"
        >
          <LogOut size={14} /> Logout from Rider Portal
        </button>
      </div>
    </>
  );
}
