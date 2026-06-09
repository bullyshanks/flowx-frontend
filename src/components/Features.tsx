const features = [
  { icon: '🧪', title: 'Lab Tested Quality', desc: 'Every batch undergoes rigorous 7-stage purification and quality testing before reaching you.' },
  { icon: '🚫', title: 'BPA-Free Bottles', desc: 'Food-grade, BPA-free polycarbonate bottles that keep your water safe, clean, and fresh.' },
  { icon: '⚡', title: 'Same-Day Delivery', desc: 'Order before 2 PM and get your water delivered the same day, anywhere in Karachi.' },
  { icon: '🏆', title: 'ISO Certified', desc: 'Our facility is ISO 9001:2015 certified for quality management and food safety standards.' },
  { icon: '♻️', title: 'Subscribe & Save', desc: 'Set daily, weekly, or monthly delivery schedules and save up to 30% vs one-time orders.' },
  { icon: '🛎️', title: '24/7 Support', desc: 'Our dedicated customer support team is always available via call, WhatsApp, or chat.' },
  { icon: '💎', title: 'Mineral Rich', desc: 'Essential minerals retained through our advanced RO+UV+UF purification process.' },
  { icon: '🗺️', title: 'Zone-Based Delivery', desc: 'Orders auto-routed to the nearest verified vendor in your area for fastest delivery.' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-[6vw] bg-soft">
      <div className="text-center mb-14">
        <div className="section-tag">✦ Why Choose Flow<span className="x-green">X</span></div>
        <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-3.5">
          The Flow<span className="x-green">X</span> <span className="text-electric">Difference</span>
        </h2>
        <p className="text-slate-500 text-base leading-[1.7] max-w-[560px] mx-auto">
          We don&apos;t just deliver water — we deliver peace of mind with every single bottle, every single time.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {features.map((f) => (
          <div
            key={f.title}
            className="group bg-white rounded-2xl p-7 border border-light hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(30,136,229,0.12)] hover:border-electric/20 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-electric to-flowgreen scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
            <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br from-electric/10 to-flowgreen/8">
              {f.icon}
            </div>
            <div className="font-syne font-bold text-[17px] mb-2 text-navy">{f.title}</div>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
