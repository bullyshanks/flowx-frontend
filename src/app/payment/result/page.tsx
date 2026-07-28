'use client';

// Where the gateway drops the customer after checkout.
//
// The ?status= in the URL is only a hint for what to show while loading — the
// customer's browser carries it back from the gateway, so it is user-editable
// and must never decide whether an order counts as paid. The real answer comes
// from /payments/status, which reads what the verified callback recorded.

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Clock, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { paymentsApi, type PaymentStatus } from '@/lib/services';
import { formatPrice } from '@/lib/utils';

// A gateway callback can land a moment after the customer does, so a PENDING
// first read is normal rather than a failure. Poll briefly before saying so.
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 5;

export default function PaymentResultPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polls, setPolls] = useState(0);
  const [cancelled, setCancelled] = useState(false);

  const load = useCallback(async (order: string, guestPhone?: string) => {
    try {
      const status = await paymentsApi.status(order, guestPhone);
      setResult(status);
      setError('');
      return status;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      // A guest with no phone on hand can't prove ownership — say so plainly
      // rather than implying the payment failed.
      setError(
        e?.response?.status === 403
          ? 'We cannot show this order here. Please use Track Order with your order number.'
          : e?.response?.data?.message || 'Could not load payment status'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order') || '';
    setOrderNumber(order);
    setCancelled(params.get('cancelled') === '1');
    if (!order) {
      setError('No order reference in the link');
      setLoading(false);
      return;
    }
    load(order, params.get('guestPhone') || undefined);
  }, [load]);

  // Keep checking only while the answer could still change.
  useEffect(() => {
    if (!result || !orderNumber) return;
    if (result.paymentStatus !== 'PENDING' || polls >= MAX_POLLS) return;
    const t = setTimeout(() => {
      setPolls((p) => p + 1);
      load(orderNumber);
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [result, polls, orderNumber, load]);

  const paid = result?.paymentStatus === 'PAID';
  const stillPending = result?.paymentStatus === 'PENDING' && polls < MAX_POLLS;
  const lastAttempt = result?.payments?.[0];

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-32 pb-24 px-[6vw] bg-navy flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl text-center">
            {loading || stillPending ? (
              <>
                <Loader2 className="animate-spin text-electric mx-auto mb-4" size={44} />
                <h1 className="font-syne text-2xl font-extrabold text-white mb-2">
                  {stillPending ? 'Confirming your payment…' : 'Checking payment…'}
                </h1>
                <p className="text-white/55 text-sm">
                  {stillPending
                    ? 'Your bank is still confirming. This usually takes a few seconds.'
                    : 'One moment.'}
                </p>
              </>
            ) : error ? (
              <>
                <XCircle className="text-red-400 mx-auto mb-4" size={44} />
                <h1 className="font-syne text-2xl font-extrabold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-white/55 text-sm mb-6">{error}</p>
                <Link href="/track" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition">
                  Track your order <ArrowRight size={15} />
                </Link>
              </>
            ) : paid ? (
              <>
                <CheckCircle2 className="text-flowgreen mx-auto mb-4" size={48} />
                <h1 className="font-syne text-2xl font-extrabold text-white mb-2">Payment successful</h1>
                <p className="text-white/55 text-sm mb-6">
                  We&apos;ve received {formatPrice(Number(result?.total || 0))} for order{' '}
                  <span className="text-white font-semibold">{result?.orderNumber}</span>. Your water is on its way.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href={`/track?order=${result?.orderNumber}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-electric to-flowgreen text-white text-sm font-bold hover:-translate-y-0.5 transition">
                    Track order <ArrowRight size={15} />
                  </Link>
                  <Link href="/" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition">
                    Home
                  </Link>
                </div>
              </>
            ) : (
              <>
                {cancelled ? (
                  <Clock className="text-amber-400 mx-auto mb-4" size={44} />
                ) : (
                  <XCircle className="text-red-400 mx-auto mb-4" size={44} />
                )}
                <h1 className="font-syne text-2xl font-extrabold text-white mb-2">
                  {cancelled ? 'Payment cancelled' : 'Payment not completed'}
                </h1>
                <p className="text-white/55 text-sm mb-2">
                  Order <span className="text-white font-semibold">{result?.orderNumber || orderNumber}</span> is
                  still unpaid. You have not been charged.
                </p>
                {lastAttempt?.failureReason && (
                  <p className="text-white/40 text-xs mb-6">Reason: {lastAttempt.failureReason}</p>
                )}
                <div className="flex gap-2 justify-center mt-4">
                  <Link href="/cart" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-electric to-flowgreen text-white text-sm font-bold hover:-translate-y-0.5 transition">
                    Try again <ArrowRight size={15} />
                  </Link>
                  <Link href="/track" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition">
                    Track order
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-white/35 text-xs mt-5">
            Payment issues? Contact us at{' '}
            <a href="tel:+923158374442" className="text-cyan2 hover:underline">+92 315 8374442</a>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
