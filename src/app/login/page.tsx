'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { authApi } from '@/lib/services';
import { useAuthStore } from '@/lib/auth-store';
import { validatePhone } from '@/lib/utils';

type Mode = 'otp-phone' | 'otp-code' | 'password';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<Mode>('otp-phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid Pakistani phone number');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      toast.success('OTP sent! Check your SMS.');
      setMode('otp-code');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (code.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(phone, code);
      setAuth(data.token, data.user);
      localStorage.setItem('flowx_token', data.token);
      toast.success('Logged in!');
      setTimeout(() => router.push('/'), 800);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const passwordLogin = async () => {
    if (!phone || !password) {
      toast.error('Phone and password are required');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(phone, password);
      setAuth(data.token, data.user);
      localStorage.setItem('flowx_token', data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        if (data.user.role === 'ADMIN') router.push('/admin');
        else if (data.user.role === 'VENDOR') router.push('/vendor-portal/dashboard');
        else router.push('/');
      }, 800);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-32 pb-24 px-[6vw] bg-navy flex items-center relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-50" />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-syne text-4xl font-extrabold text-white mb-2">
              Welcome <span className="text-electric">back</span>
            </h1>
            <p className="text-white/55 text-sm">Sign in to your Flow<span className="x-green">X</span> account</p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">
            <div className="flex gap-1.5 mb-6 bg-white/[0.06] rounded-xl p-1">
              <button
                onClick={() => setMode('otp-phone')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition ${
                  mode !== 'password' ? 'bg-white/10 text-white' : 'text-white/50'
                }`}
              >
                📱 OTP Login
              </button>
              <button
                onClick={() => setMode('password')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition ${
                  mode === 'password' ? 'bg-white/10 text-white' : 'text-white/50'
                }`}
              >
                🔑 Password
              </button>
            </div>

            {mode === 'otp-phone' && (
              <>
                <label className="field-label">Phone Number</label>
                <div className="relative mb-5">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="field-dark pl-11"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-br from-electric to-flowgreen rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
                </button>
              </>
            )}

            {mode === 'otp-code' && (
              <>
                <label className="field-label">Enter the 6-digit OTP sent to {phone}</label>
                <div className="relative mb-5">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="field-dark pl-11 text-center tracking-[0.4em] font-bold text-lg"
                  />
                </div>
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-br from-electric to-flowgreen rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Login'}
                </button>
                <button
                  onClick={() => setMode('otp-phone')}
                  className="w-full text-white/50 text-xs mt-3 hover:text-white"
                >
                  ← Use a different number
                </button>
              </>
            )}

            {mode === 'password' && (
              <>
                <div className="mb-4">
                  <label className="field-label">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      placeholder="03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="field-dark pl-11"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="field-label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && passwordLogin()}
                      className="field-dark pl-11"
                    />
                  </div>
                </div>
                <button
                  onClick={passwordLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-br from-electric to-flowgreen rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
                </button>
              </>
            )}

            <div className="text-center mt-6 text-xs text-white/45">
              New here?{' '}
              <a href="/vendor" className="text-cyan2 hover:underline">
                Register as a Vendor
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
