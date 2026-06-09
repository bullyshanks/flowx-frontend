'use client';

import { Settings, User, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { PageHeader } from '@/components/admin/ui';

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <PageHeader title="Settings" subtitle="Account and system info" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-navy border border-white/[0.08] rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white text-lg mb-5 flex items-center gap-2">
            <User size={18} className="text-electric" /> Your Account
          </h3>
          <dl className="space-y-3.5">
            {[
              { label: 'Name', value: user?.name, icon: User },
              { label: 'Phone', value: user?.phone, icon: Phone },
              { label: 'Email', value: user?.email || '—', icon: Mail },
              { label: 'Role', value: user?.role, icon: Settings },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <row.icon size={15} className="text-cyan2" />
                </div>
                <div className="flex-1">
                  <dt className="text-[11px] text-white/45 uppercase tracking-wide">{row.label}</dt>
                  <dd className="text-sm text-white font-semibold mt-0.5">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-navy border border-white/[0.08] rounded-2xl p-6">
          <h3 className="font-syne font-bold text-white text-lg mb-5 flex items-center gap-2">
            <Settings size={18} className="text-flowgreen" /> System Info
          </h3>
          <dl className="space-y-3.5 text-sm">
            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <dt className="text-white/55">API URL</dt>
              <dd className="text-white font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <dt className="text-white/55">Brand</dt>
              <dd className="text-white">FlowX</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.05]">
              <dt className="text-white/55">WhatsApp</dt>
              <dd className="text-white font-mono text-xs">+{process.env.NEXT_PUBLIC_WHATSAPP}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-white/55">Version</dt>
              <dd className="text-white">1.0.0</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
