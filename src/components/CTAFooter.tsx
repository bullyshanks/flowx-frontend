import Link from 'next/link';
import { Truck, MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';
import Logo from './Logo';

export function CTABanner() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP || '923158374442';
  return (
    <section className="bg-gradient-to-br from-navy via-[#0D2752] to-[#0A3560] py-20 px-[6vw] relative overflow-hidden">
      <div className="absolute inset-0 hero-bg opacity-50" />
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-8 max-w-7xl mx-auto">
        <div>
          <h2 className="font-syne text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold text-white mb-2.5">
            Ready to Order Fresh Water?
          </h2>
          <p className="text-white/60 text-base">
            Get pure, refreshing water delivered to your door today. Free delivery on all orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <Link href="/#products" className="btn-primary">
            <Truck size={18} /> Order Now
          </Link>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2.5 bg-gradient-to-br from-[#25D366] to-[#1DAA56] text-white px-7 py-4 rounded-2xl font-bold text-[15px] hover:-translate-y-0.5 transition shadow-[0_8px_24px_rgba(37,211,102,0.3)]"
          >
            <MessageCircle size={18} /> WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy2 text-white px-[6vw] py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <Logo />
            <p className="text-white/50 text-sm leading-[1.7] mt-4 mb-5.5 max-w-[260px]">
              Premium purified water delivery trusted by thousands of families and businesses across Karachi.
            </p>
            <div className="flex gap-2.5">
              {['f', '📷', '💬'].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/60 hover:bg-electric/20 hover:border-electric hover:text-cyan2 transition"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-syne font-bold text-[15px] text-white mb-4.5">Quick Links</h4>
            <ul className="list-none">
              {[
                ['Home', '/'],
                ['Products', '/#products'],
                ['How It Works', '/#how'],
                ['Become a Vendor', '/vendor'],
                ['Track Order', '/track'],
                ['Contact', '/#contact'],
              ].map(([label, href]) => (
                <li key={label} className="mb-2.5">
                  <Link href={href} className="text-white/50 text-sm hover:text-cyan2 transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-bold text-[15px] text-white mb-4.5">Our Products</h4>
            <ul className="list-none">
              {[
                '19L Dispenser Bottle',
                '19L Refill (4+ bottles)',
                '1.5L Bottle (Set of 6)',
                '500ml Bottle (Set of 12)',
                '1000L Water Tank',
                'Subscribe & Save',
              ].map((p) => (
                <li key={p} className="mb-2.5">
                  <Link href="/#products" className="text-white/50 text-sm hover:text-cyan2 transition">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-bold text-[15px] text-white mb-4.5">Contact Info</h4>
            {[
              { Icon: Phone, val: '+92 315 8374442' },
              { Icon: Mail, val: 'orders@flowx.pk' },
              { Icon: MapPin, val: 'North Karachi, Karachi' },
              { Icon: Clock, val: 'Mon–Sat: 7AM–9PM' },
            ].map(({ Icon, val }, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-3 text-white/50 text-[13px]">
                <Icon className="text-cyan2 flex-shrink-0 mt-0.5" size={14} />
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-7 flex flex-wrap justify-between items-center gap-4">
          <p className="text-white/35 text-[13px]">
            © 2026 Flow<span className="x-green">X</span> Water Delivery. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/35 text-[13px] hover:text-cyan2">Privacy</Link>
            <Link href="/terms" className="text-white/35 text-[13px] hover:text-cyan2">Terms</Link>
            <Link href="/refund" className="text-white/35 text-[13px] hover:text-cyan2">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
