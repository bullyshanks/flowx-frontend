'use client';

import { useState } from 'react';
import { Search, Loader2, Package, CheckCircle2, Truck, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/CTAFooter';
import { ordersApi } from '@/lib/services';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  ASSIGNED: 'Vendor Assigned',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const track = async () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter your order ID');
      return;
    }
    setLoading(true);
    try {
      const o = await ordersApi.track(orderNumber.trim());
      setOrder(o);
    } catch {
      toast.error('Order not found. Please check your order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-32 pb-24 px-[6vw] bg-navy relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-70" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="section-tag !bg-cyan2/10 !border-cyan2/20 !text-cyan2">
            📦 Order Tracking
          </div>
          <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold text-white mb-3">
            Track Your <span className="text-electric">Delivery</span>
          </h2>
          <p className="text-white/60 mb-10 max-w-md mx-auto">
            Enter your order ID to see real-time delivery status. You&apos;ll receive your ID via SMS after placing an order.
          </p>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-9 backdrop-blur-2xl">
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter your Order ID (e.g., FLW-2026-12345)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && track()}
                className="flex-1 px-5 py-4 bg-white/8 border border-white/15 rounded-2xl text-white outline-none focus:border-cyan2"
              />
              <button
                onClick={track}
                disabled={loading}
                className="px-6 py-4 bg-gradient-to-br from-cyan2 to-electric rounded-2xl text-white font-bold flex items-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                Track
              </button>
            </div>

            {order ? (
              <div className={`rounded-2xl p-6 text-left ${
                order.status === 'CANCELLED'
                  ? 'bg-red-500/10 border border-red-500/25'
                  : 'bg-flowgreen/10 border border-flowgreen/25'
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-3 h-3 rounded-full ${order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-flowgreen pulse-dot'}`}
                    style={order.status !== 'CANCELLED' ? { boxShadow: '0 0 0 4px rgba(34,197,94,0.2)' } : undefined}
                  />
                  <div>
                    <div className="font-syne font-bold text-lg text-white">
                      Order #{order.orderNumber}
                    </div>
                    <div className="text-white/60 text-[13px]">
                      Placed: {formatDate(order.createdAt)} · Total: {formatPrice(order.total)}
                    </div>
                  </div>
                </div>

                {order.status === 'CANCELLED' ? (
                  <div className="mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500 text-white">
                      <Package size={14} />
                    </div>
                    <div className="font-semibold text-sm text-red-400">
                      {STATUS_LABEL.CANCELLED} — this order will not be delivered
                    </div>
                  </div>
                ) : (
                <div className="space-y-3 mb-6">
                  {STATUS_FLOW.map((status, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const Icon =
                      i === 0 ? CheckCircle2 :
                      i === 1 ? CheckCircle2 :
                      i === 2 ? Package :
                      i === 3 ? Truck : Home;
                    return (
                      <div key={status} className="flex items-start gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            done
                              ? 'bg-flowgreen text-white'
                              : active
                              ? 'bg-cyan2 text-white pulse-dot'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div
                            className={`font-semibold text-sm ${
                              done ? 'text-flowgreen' : active ? 'text-cyan2' : 'text-white/40'
                            }`}
                          >
                            {STATUS_LABEL[status]}
                          </div>
                          {active && status !== 'OUT_FOR_DELIVERY' && order.vendor && (
                            <div className="text-xs text-white/50 mt-0.5">
                              Vendor: {order.vendor.name} · {order.vendor.phone}
                            </div>
                          )}
                          {active && status === 'OUT_FOR_DELIVERY' && order.rider && (
                            <div className="text-xs text-white/50 mt-0.5">
                              Rider: {order.rider.name} · {order.rider.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="text-white/50 text-xs mb-2 uppercase tracking-wide">Items</div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1.5">
                      <span className="text-white/80">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-white font-semibold">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-white/45">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-sm">Enter your order ID above to track your delivery</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
