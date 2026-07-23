'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Loader2, MapPin, Wallet, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { authApi, productsApi } from '@/lib/services';
import { validatePhone } from '@/lib/utils';
import type { Zone } from '@/types';

const STEPS = [
  { n: 1, title: 'Register & Select Your Zone', desc: 'Sign up with your name, phone, vehicle details, and select your delivery area.' },
  { n: 2, title: 'Admin Approval', desc: 'Our admin team reviews and approves your account. SMS notification once activated.' },
  { n: 3, title: 'Verify Your Identity', desc: 'Upload your CNIC and a selfie — a one-time KYC check before you can go live.' },
  { n: 4, title: 'Go Online & Earn', desc: 'Toggle online, accept delivery offers in your zone, and get paid per delivery.' },
];

const FEATURES = [
  { icon: MapPin, text: 'Delivery offers auto-routed by your zone' },
  { icon: Zap, text: 'Go online/offline anytime — work on your schedule' },
  { icon: ShieldCheck, text: 'Quick one-time KYC verification, then you\'re set' },
  { icon: Wallet, text: 'Earnings tracking & wallet with weekly settlements' },
];

export default function RiderPage() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [password, setPassword] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productsApi.getZones().then(setZones).catch(() => {
      toast.error('Failed to load zones');
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password || !zoneId) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid Pakistani phone number');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.registerRider({ name, phone, password, vehicleDetails, zoneId });
      toast.success('Application submitted! Admin will review within 24 hours.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="pt-32 pb-24 px-[6vw] bg-soft min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start max-w-7xl mx-auto">
          <div>
            <div className="section-tag !bg-electric/8 !border-electric/20 !text-electric">
              🏍️ Become a Rider
            </div>
            <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-3.5">
              Ride with<br />
              <span className="text-electric">Flow<span className="x-green">X</span></span>
            </h2>
            <p className="text-slate-500 text-base leading-[1.7] max-w-[560px] mb-8">
              Join our delivery fleet. Get zone-matched delivery offers, go online whenever you want, and earn per delivery.
            </p>
            <div className="flex flex-col gap-4">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-light hover:translate-x-1 hover:shadow transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-cyan2 text-white font-syne font-extrabold flex items-center justify-center flex-shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-navy mb-1">{s.title}</div>
                    <div className="text-slate-500 text-[13px] leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="bg-navy rounded-3xl p-9 border border-white/8"
          >
            <div className="font-syne font-bold text-xl text-white mb-1.5">Rider Registration</div>
            <div className="text-white/50 text-sm mb-7">
              Join Flow<span className="x-green">X</span> as a delivery rider
            </div>

            {[
              { label: 'Full Name', val: name, set: setName, type: 'text', placeholder: 'Muhammad Ali' },
              { label: 'Phone Number', val: phone, set: setPhone, type: 'tel', placeholder: '03001234567' },
              { label: 'Vehicle Details (optional)', val: vehicleDetails, set: setVehicleDetails, type: 'text', placeholder: 'e.g. Honda 125, Reg: ABC-123' },
              { label: 'Password', val: password, set: setPassword, type: 'password', placeholder: 'Min 6 characters' },
            ].map((f) => (
              <div key={f.label} className="mb-4">
                <label className="field-label">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="field-dark"
                />
              </div>
            ))}

            <div className="mb-5">
              <label className="field-label">Select Delivery Area / Zone</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="field-dark">
                <option value="">Select your zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-navy2">{z.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 mb-7">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 bg-white/[0.05] rounded-xl border border-white/8"
                >
                  <f.icon size={18} className="text-cyan2 flex-shrink-0" />
                  <span className="text-[13px] text-white/75">{f.text}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-br from-electric to-cyan2 rounded-2xl text-white font-syne font-bold text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Bike size={18} /> Register as Rider</>}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
