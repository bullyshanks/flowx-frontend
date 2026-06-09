const steps = [
  { icon: '📋', title: 'Choose Your Plan', desc: 'Pick a quick one-time order or a recurring subscription — daily, weekly, or monthly.' },
  { icon: '📝', title: 'Place Your Order', desc: 'Fill in your details, pick a time slot, and confirm your order in seconds.' },
  { icon: '🚚', title: 'Auto-Assigned Vendor', desc: 'Our system assigns the nearest verified vendor in your zone automatically.' },
  { icon: '💧', title: 'Stay Hydrated', desc: 'Enjoy pure water every day. Track live, reorder in one click, or let your subscription handle it.' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-[6vw] bg-navy relative overflow-hidden">
      <div className="absolute inset-0 hero-bg opacity-60" />
      <div className="text-center mb-16 relative z-10">
        <div className="section-tag !bg-flowgreen/10 !border-flowgreen/20 !text-flowgreen">
          ⚙️ Simple Process
        </div>
        <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight mb-3.5 text-white">
          How It <span className="text-electric">Works</span>
        </h2>
        <p className="text-white/60 text-base leading-[1.7] max-w-[560px] mx-auto">
          Getting fresh water delivered has never been easier. Just four simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-0 relative z-10 max-w-6xl mx-auto">
        <div className="hidden lg:block absolute top-11 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-electric to-flowgreen opacity-40 z-0" />
        {steps.map((s) => (
          <div key={s.title} className="text-center px-5 relative z-10">
            <div className="w-22 h-22 mx-auto mb-6 rounded-full bg-gradient-to-br from-electric to-[#1565C0] flex items-center justify-center text-3xl shadow-[0_0_0_12px_rgba(30,136,229,0.1)]">
              {s.icon}
            </div>
            <div className="font-syne font-bold text-lg text-white mb-2.5">{s.title}</div>
            <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
