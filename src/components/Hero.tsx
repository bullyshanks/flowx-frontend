import Link from 'next/link';
import { Truck, Recycle, Package } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen bg-navy relative overflow-hidden flex items-center px-[6vw] pt-[100px] pb-16"
    >
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 hero-grid" />
      <div className="water-orb w-[500px] h-[500px] bg-electric/15 -top-24 right-[5%]" />
      <div
        className="water-orb w-[350px] h-[350px] bg-flowgreen/10 -bottom-12 right-[25%]"
        style={{ animationDelay: '3s' }}
      />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-flowgreen/15 border border-flowgreen/30 text-flowgreen px-4 py-1.5 rounded-full text-[13px] font-medium mb-7">
          <span className="pulse-dot" />
          Delivering Fresh Water Across Karachi
        </div>

        <h1 className="font-syne font-extrabold text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] text-white mb-5">
          Pure Water
          <span className="block text-cyan2">Delivered Fast</span>
          To Your <span className="x-green">Door</span>
        </h1>

        <p className="text-white/65 text-[17px] leading-[1.7] max-w-[480px] mb-9">
          Premium 19-litre purified water dispensers delivered to your home or office. Same-day
          delivery, BPA-free bottles, zero compromise on quality.
        </p>

        <div className="flex flex-wrap gap-3.5 mb-12">
          <Link href="/#products" className="btn-primary">
            <Truck size={18} /> Order Now
          </Link>
          <Link href="/#products" className="btn-subscribe">
            <Recycle size={18} /> Subscribe & Save
          </Link>
          <Link href="/track" className="btn-secondary">
            <Package size={18} /> Track Order
          </Link>
        </div>

        <div className="flex flex-wrap gap-8">
          {[
            { num: '10K', suffix: '+', label: 'Deliveries Made' },
            { num: '4.9', suffix: '★', label: 'Customer Rating' },
            { num: '2', suffix: 'hrs', label: 'Avg Delivery Time' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="font-syne text-[28px] font-extrabold text-white">
                {s.num}
                <span className="text-flowgreen">{s.suffix}</span>
              </span>
              <span className="text-xs text-white/50 tracking-wide mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
