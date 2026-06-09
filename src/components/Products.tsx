'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Minus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, ordersApi } from '@/lib/services';
import { formatPrice, validatePhone } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import type { Product, Zone, PaymentMethod } from '@/types';

type Tab = 'onetime' | 'subscription';
type OrderTab = 'quick' | 'subscribe';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('onetime');
  const [orderTab, setOrderTab] = useState<OrderTab>('quick');

  // ── Quick order form state ──
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(3);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);

  // ── Load products + zones ──
  useEffect(() => {
    Promise.all([productsApi.getAll(), productsApi.getZones()])
      .then(([p, z]) => {
        setProducts(p);
        setZones(z);
        if (p.length) {
          setSelectedProduct(p[0]);
          setQty(p[0].minQuantity);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load products. Is the backend running?');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectProduct = (p: Product) => {
    setSelectedProduct(p);
    setQty(p.minQuantity);
  };

  const changeQty = (delta: number) => {
    if (!selectedProduct) return;
    setQty((q) => Math.max(selectedProduct.minQuantity, Math.min(99, q + delta)));
  };

  const total = selectedProduct ? Number(selectedProduct.price) * qty : 0;

  const placeOrder = async () => {
    if (!selectedProduct) return;
    if (!name || !phone || !address || !zoneId) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid Pakistani phone number');
      return;
    }

    setSubmitting(true);
    try {
      const order = await ordersApi.place({
        items: [{ productId: selectedProduct.id, quantity: qty }],
        zoneId,
        deliveryAddress: address,
        paymentMethod,
        guestName: name,
        guestPhone: phone,
      });
      toast.success(`Order placed! Your order #: ${order.orderNumber}`);
      // Reset form
      setName(''); setPhone(''); setAddress('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="products" className="py-24 px-[6vw] flex items-center justify-center">
        <Loader2 className="animate-spin text-electric" size={32} />
      </section>
    );
  }

  return (
    <section id="products" className="py-24 px-[6vw] bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start max-w-7xl mx-auto">
        {/* ─── LEFT: Product list ─── */}
        <div>
          <div className="section-tag">🛒 Our Products</div>
          <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-3.5">
            Choose Your<br />
            <span className="text-electric">Water Plan</span>
          </h2>
          <p className="text-slate-500 text-base leading-[1.7] max-w-[560px] mb-7">
            Free delivery on all orders across Karachi.
          </p>

          <div className="flex gap-2 mb-10 bg-soft rounded-2xl p-1.5 w-fit">
            {(['onetime', 'subscription'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t
                    ? 'bg-white text-navy font-semibold shadow'
                    : 'text-slate-500 hover:text-navy'
                }`}
              >
                {t === 'onetime' ? 'One-Time Order' : 'Subscribe & Save'}
                {t === 'subscription' && (
                  <span className="ml-1 bg-gradient-to-br from-flowgreen to-flowgreen-dark text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Save 30%
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProduct(p)}
                className={`text-left border-2 rounded-2xl p-5 flex items-center gap-4 transition relative overflow-hidden ${
                  selectedProduct?.id === p.id
                    ? 'border-electric bg-gradient-to-br from-electric/[0.03] to-flowgreen/[0.02]'
                    : 'border-light bg-white hover:border-electric hover:translate-x-1.5 hover:shadow-md'
                }`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-soft flex items-center justify-center text-4xl">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    '💧'
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-syne font-bold text-[15px] text-navy mb-1">{p.name}</div>
                  <div className="text-slate-500 text-[13px] mb-2">{p.description}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-slate-500 bg-soft rounded px-2 py-0.5">
                      Min {p.minQuantity} {p.unit}{p.minQuantity > 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-slate-500 bg-soft rounded px-2 py-0.5">
                      Free delivery
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-syne font-extrabold text-lg text-navy">
                    {formatPrice(p.price)}
                  </div>
                  <div className="text-[11px] text-slate-500">/ {p.unit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Order form ─── */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-navy rounded-3xl p-8 border border-white/8 shadow-[0_40px_80px_rgba(10,22,40,0.25)]">
            <div className="font-syne font-bold text-xl text-white mb-1.5">Quick Order</div>
            <div className="text-white/50 text-sm mb-6">Fast checkout — delivery within 2 hours</div>

            <div className="flex gap-1.5 mb-5 bg-white/[0.06] rounded-xl p-1">
              {(['quick', 'subscribe'] as OrderTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderTab(t)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition ${
                    orderTab === t ? 'bg-white/10 text-white' : 'text-white/50'
                  }`}
                >
                  {t === 'quick' ? '⚡ Quick Order' : '♻️ Subscribe'}
                </button>
              ))}
            </div>

            {orderTab === 'quick' ? (
              <>
                <div className="mb-4">
                  <label className="field-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Ahmed Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field-dark"
                  />
                </div>
                <div className="mb-4">
                  <label className="field-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="field-dark"
                  />
                </div>
                <div className="mb-4">
                  <label className="field-label">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="House #, Street, Karachi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="field-dark"
                  />
                </div>
                <div className="mb-4">
                  <label className="field-label">Area / Zone</label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="field-dark"
                  >
                    <option value="">Select your area</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} className="bg-navy2">
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="field-label">Quantity</label>
                  <div className="flex items-center gap-0">
                    <button
                      onClick={() => changeQty(-1)}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/12 text-white text-xl"
                    >
                      <Minus size={16} className="mx-auto" />
                    </button>
                    <div className="flex-1 text-center font-syne font-bold text-xl text-white">
                      {qty}
                    </div>
                    <button
                      onClick={() => changeQty(1)}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/12 text-white text-xl"
                    >
                      <Plus size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
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

                <div className="bg-white/[0.04] rounded-xl p-3.5 mb-5">
                  <div className="flex justify-between py-1 text-white/55 text-sm">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-white/55 text-sm">
                    <span>Delivery</span>
                    <span className="text-flowgreen font-semibold">FREE</span>
                  </div>
                  <div className="h-px bg-white/8 my-2" />
                  <div className="flex justify-between py-1">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-base">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={submitting || !selectedProduct}
                  className="w-full py-4 bg-gradient-to-br from-electric to-flowgreen rounded-2xl text-white font-syne font-bold text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Place Order
                    </>
                  )}
                </button>
                <div className="text-center mt-3 text-xs text-white/40">
                  🔒 <span className="text-flowgreen">Secure</span> · Cash on delivery available
                </div>
              </>
            ) : (
              <div className="text-white/60 text-sm py-8 text-center">
                <div className="text-3xl mb-3">♻️</div>
                <div className="font-syne font-bold text-white text-base mb-2">
                  Subscribe & Save Up To 30%
                </div>
                <p className="mb-4">Login to set up daily, weekly, or monthly recurring deliveries.</p>
                <a
                  href="/login"
                  className="inline-block bg-gradient-to-br from-flowgreen to-flowgreen-dark text-white px-6 py-3 rounded-xl font-bold text-sm"
                >
                  Login to Subscribe →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
