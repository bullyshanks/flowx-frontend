'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, Loader2, ShoppingBag, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import {
  productsApi, ordersApi, authApi, referralApi, paymentsApi, redirectToGateway, rememberGuestPayment,
} from '@/lib/services';
import { formatPrice, validatePhone } from '@/lib/utils';
import type { Zone, PaymentMethod } from '@/types';

// Methods settled through a gateway, so checkout redirects instead of ending
// on this page. BANK_TRANSFER is deliberately absent — it's reconciled by hand
// against a receipt, like COD.
const ONLINE_METHODS: PaymentMethod[] = ['JAZZCASH', 'EASYPAISA', 'CARD'];

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());
  const user = useAuthStore((s) => s.user);
  const isLoggedInCustomer = !!user && user.role === 'CUSTOMER';

  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    setMounted(true);
    productsApi.getZones().then(setZones).catch(() => {});
  }, []);

  // Pre-fill from the account instead of making a logged-in customer retype
  // their own name/phone/address every time. The login-time snapshot in the
  // auth store doesn't carry defaultAddress/zone, so fetch the full profile.
  useEffect(() => {
    if (!isLoggedInCustomer || !user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    authApi.me()
      .then((full) => {
        if (full.defaultAddress) setAddress(full.defaultAddress);
        if (full.zone?.id) setZoneId(full.zone.id);
      })
      .catch(() => {});
    referralApi.get().then((r) => setWalletBalance(Number(r.walletBalance))).catch(() => {});
  }, [isLoggedInCustomer, user]);

  // Best-effort estimate only — a first-order referral discount also exists
  // server-side but isn't predicted here (would need an extra round trip to
  // know "is this truly my first order"); the actual amount always comes
  // back correctly on the order response regardless of what's shown here.
  const estimatedDiscount = isLoggedInCustomer ? Math.min(walletBalance, subtotal) : 0;
  const estimatedTotal = subtotal - estimatedDiscount;

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!isLoggedInCustomer && (!name || !phone)) {
      toast.error('Please fill in all delivery details');
      return;
    }
    if (!address || !zoneId) {
      toast.error('Please fill in all delivery details');
      return;
    }
    if (!isLoggedInCustomer && !validatePhone(phone)) {
      toast.error('Please enter a valid Pakistani phone number');
      return;
    }

    setSubmitting(true);
    try {
      const order = await ordersApi.place({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        zoneId,
        deliveryAddress: address,
        paymentMethod,
        ...(isLoggedInCustomer ? {} : { guestName: name, guestPhone: phone }),
      });
      const discount = Number(order.discountAmount || 0);

      // Online methods hand off to a gateway before the order is really done.
      // Clear the cart first: the customer is about to leave the site, and
      // coming back to a still-full cart invites a duplicate order. The order
      // already exists server-side, so nothing is lost by clearing here.
      if (ONLINE_METHODS.includes(paymentMethod)) {
        clear();
        toast.success('Redirecting to payment…');
        // A guest has no JWT to prove ownership when they come back from the
        // gateway — remember the phone locally so the result page can.
        if (!isLoggedInCustomer) rememberGuestPayment(order.orderNumber, phone);
        const payment = await paymentsApi.initiate({
          orderId: order.id,
          ...(isLoggedInCustomer ? {} : { guestPhone: phone }),
        });
        redirectToGateway(payment.redirect);
        return; // navigating away — don't fall through to the COD messaging
      }

      toast.success(
        discount > 0
          ? `Order placed! Rs. ${discount} discount applied. Your order #: ${order.orderNumber}`
          : `Order placed! Your order #: ${order.orderNumber}`
      );
      clear();
      if (!isLoggedInCustomer) { setName(''); setPhone(''); setAddress(''); }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid hydration mismatch — cart loads from localStorage
  if (!mounted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-navy flex items-center justify-center">
          <Loader2 className="animate-spin text-electric" size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-28 pb-20 px-[6vw] bg-soft">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-electric text-sm font-medium mb-6 transition"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>

          <h1 className="font-syne text-3xl lg:text-4xl font-extrabold text-navy mb-8">
            Your <span className="text-electric">Cart</span>
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-light">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-soft flex items-center justify-center mb-5">
                <ShoppingCart className="text-slate-300" size={36} />
              </div>
              <h2 className="font-syne font-bold text-navy text-xl mb-2">Your cart is empty</h2>
              <p className="text-slate-500 text-sm mb-6">
                Add some water products to get started.
              </p>
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-electric to-flowgreen text-white px-6 py-3 rounded-xl font-bold text-sm"
              >
                <ShoppingBag size={16} /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
              {/* ── Cart items ── */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl p-5 border border-light flex items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-soft flex items-center justify-center text-4xl">
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        '💧'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-syne font-bold text-navy text-[15px]">{item.product.name}</div>
                      <div className="text-slate-500 text-xs mb-2">
                        {formatPrice(item.product.price)} / {item.product.unit}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Min order: {item.product.minQuantity}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {/* Quantity control */}
                      <div className="flex items-center gap-0 border border-light rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-soft transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-syne font-bold text-navy">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-soft transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-syne font-extrabold text-navy">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-600 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => { clear(); toast.success('Cart cleared'); }}
                  className="text-slate-400 hover:text-red-500 text-sm font-medium transition"
                >
                  Clear cart
                </button>
              </div>

              {/* ── Checkout form ── */}
              <div className="bg-navy rounded-3xl p-7 lg:sticky lg:top-24">
                <h2 className="font-syne font-bold text-white text-xl mb-1.5">Checkout</h2>
                <p className="text-white/50 text-sm mb-6">Delivery within 2 hours</p>

                {isLoggedInCustomer ? (
                  <div className="mb-4 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm">
                    <span className="text-white/50">Checking out as </span>
                    <span className="text-white font-semibold">{name}</span>
                    <span className="text-white/50"> · {phone}</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="field-label">Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" className="field-dark" />
                    </div>
                    <div className="mb-4">
                      <label className="field-label">Phone Number</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="03001234567" className="field-dark" />
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <label className="field-label">Delivery Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House #, Street, Karachi" className="field-dark" />
                </div>
                <div className="mb-4">
                  <label className="field-label">Area / Zone</label>
                  <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="field-dark">
                    <option value="">Select your area</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} className="bg-navy2">{z.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-5">
                  <label className="field-label">Payment Method</label>
                  <div className="flex flex-wrap gap-2">
                    {(['COD', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER'] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`flex-1 min-w-[80px] py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                          paymentMethod === m
                            ? 'border-cyan2 bg-cyan2/12 text-white'
                            : 'border-white/15 bg-white/5 text-white/70'
                        }`}
                      >
                        {m === 'BANK_TRANSFER' ? 'Bank' : m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/[0.04] rounded-xl p-4 mb-5">
                  <div className="flex justify-between py-1 text-white/55 text-sm">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-white/55 text-sm">
                    <span>Delivery</span>
                    <span className="text-flowgreen font-semibold">FREE</span>
                  </div>
                  {estimatedDiscount > 0 && (
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-flowgreen">Wallet Credit Applied</span>
                      <span className="text-flowgreen font-semibold">-{formatPrice(estimatedDiscount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/8 my-2" />
                  <div className="flex justify-between py-1">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-lg">{formatPrice(estimatedTotal)}</span>
                  </div>
                  {isLoggedInCustomer && estimatedDiscount === 0 && (
                    <div className="text-[11px] text-white/40 mt-1">
                      New here? A referred first order gets Rs. 50 off automatically at checkout.
                    </div>
                  )}
                </div>

                <button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-br from-electric to-flowgreen rounded-2xl text-white font-syne font-bold text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <><ShoppingBag size={18} /> Place Order</>}
                </button>
                <div className="text-center mt-3 text-xs text-white/40">
                  🔒 <span className="text-flowgreen">Secure</span> · Cash on delivery available
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
