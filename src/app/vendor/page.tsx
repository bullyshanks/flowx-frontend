'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Loader2, MapPin, BarChart3, Lock, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { authApi, productsApi } from '@/lib/services';
import { validatePhone } from '@/lib/utils';
import type { Zone } from '@/types';

// Every claim here has to match what the system actually does — a vendor who
// signs up on a promise we don't keep churns immediately, and the earlier copy
// had three: it promised an SMS (no gateway is configured), called the wallet
// "coming soon" (it shipped), and never mentioned KYC (which gates going live).
const STEPS = [
  {
    n: 1,
    title: 'Register & Pick Your Area',
    desc: 'Name, phone, CNIC and the area you can deliver in. Takes two minutes. Areas with no vendor yet are open — you would be the first there.',
  },
  {
    n: 2,
    title: 'Verification',
    desc: 'Upload your CNIC (front and back) and a selfie. Both admin approval and KYC must clear before you can take orders — usually within 24 hours.',
  },
  {
    n: 3,
    title: 'Orders Come to You',
    desc: 'Every order placed in your area is offered straight to you. You have 90 seconds to accept before it passes to another vendor, so keep the app open during your hours.',
  },
  {
    n: 4,
    title: 'Deliver & Get Settled',
    desc: 'Mark the order delivered and the product value lands in your wallet, less FlowX commission. Cash you collect on COD orders is tracked against your account and settled with FlowX.',
  },
];

const FEATURES = [
  { icon: MapPin, text: 'Orders auto-assigned by area — no bidding, no searching' },
  { icon: BarChart3, text: 'Open and closed switches — stop receiving offers whenever you need to' },
  { icon: Lock, text: 'You only ever see your own area\'s orders, and customer details only after you accept' },
  { icon: Wallet, text: 'Live wallet: every order, commission and settlement itemised' },
];

// Sourced from the commission logic in ledger.service — vendors are credited
// the product value and debited a commission, 20% unless admin has changed the
// global default or set a per-product rate.
const TERMS = [
  { label: 'You keep', value: '80%', note: 'of product value; FlowX commission is 20% by default' },
  { label: 'Delivery fee', value: 'Rs. 0', note: 'free delivery is FlowX\'s offer, not deducted from you' },
  { label: 'Accept window', value: '90 sec', note: 'before an order is offered to the next vendor' },
  { label: 'Cost to join', value: 'Free', note: 'no signup fee, no monthly charge' },
];

export default function VendorPage() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
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
      await authApi.registerVendor({ name, phone, password, cnic, zoneId });
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
            <div className="section-tag !bg-flowgreen/8 !border-flowgreen/20 !text-flowgreen-dark">
              🚚 Become a Vendor
            </div>
            <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-3.5">
              Deliver with<br />
              <span className="text-electric">Flow<span className="x-green">X</span></span>
            </h2>
            <p className="text-slate-500 text-base leading-[1.7] max-w-[560px] mb-8">
              You already have the water and the customers nearby. FlowX brings you
              the orders — placed, tracked and settled — so you deliver instead of
              chasing calls. Most of Karachi has no FlowX vendor yet; the area you
              pick could be yours alone.
            </p>

            {/* The numbers a supplier actually decides on. Vague copy gets a
                shrug; "you keep 80%, it costs nothing to join" gets a call. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {TERMS.map((t) => (
                <div key={t.label} className="bg-white rounded-2xl border border-light p-4">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">{t.label}</div>
                  <div className="font-syne font-extrabold text-navy text-xl mt-0.5">{t.value}</div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-1">{t.note}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-light hover:translate-x-1 hover:shadow transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flowgreen to-flowgreen-dark text-white font-syne font-extrabold flex items-center justify-center flex-shrink-0">
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
            <div className="font-syne font-bold text-xl text-white mb-1.5">Vendor Registration</div>
            <div className="text-white/50 text-sm mb-7">
              Join Flow<span className="x-green">X</span> as a delivery partner
            </div>

            {[
              { label: 'Full Name', val: name, set: setName, type: 'text', placeholder: 'Muhammad Ali' },
              { label: 'Phone Number', val: phone, set: setPhone, type: 'tel', placeholder: '03001234567' },
              { label: 'CNIC (optional)', val: cnic, set: setCnic, type: 'text', placeholder: 'XXXXX-XXXXXXX-X' },
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
                {/* Every zone stays selectable here, including ones we don't
                    serve yet — signing up in an uncovered area is how it
                    becomes covered. Flagging them as open territory turns the
                    gap into a reason to join. */}
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-navy2">
                    {z.name}
                    {z.isServiceable === false ? ' — no vendor yet, be the first' : ''}
                  </option>
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
              className="w-full py-4 bg-gradient-to-br from-flowgreen to-flowgreen-dark rounded-2xl text-white font-syne font-bold text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Truck size={18} /> Register as Vendor</>}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
