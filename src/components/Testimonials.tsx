const reviews = [
  {
    name: 'Rajesh Kumar',
    role: 'Restaurant Owner, PECHS',
    initials: 'RK',
    color: 'from-electric to-cyan2',
    text: 'FlowX has been our go-to water supplier for over 2 years. Quality is consistently excellent and delivery is always on time.',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Office Manager, Clifton',
    initials: 'SM',
    color: 'from-purple-600 to-indigo-600',
    text: 'The subscription plan saves us money and the water quality is noticeably better. Our whole office loves FlowX!',
  },
  {
    name: 'Fatima Ali',
    role: 'Homeowner, North Karachi',
    initials: 'FA',
    color: 'from-emerald-600 to-emerald-700',
    text: 'The monthly subscription keeps us stocked without any hassle. The taste is pure and refreshing every time.',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-[6vw] bg-soft">
      <div className="flex flex-wrap gap-5 justify-between items-end mb-12 max-w-7xl mx-auto">
        <div>
          <div className="section-tag">⭐ Customer Reviews</div>
          <h2 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight">
            What Our <span className="text-electric">Customers</span> Say
          </h2>
        </div>
        <div>
          <div className="text-amber-400 text-xl">★★★★★</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-syne font-bold text-[22px] text-navy">4.9</span>
            <span className="text-slate-500 text-[13px]">from 2,500+ reviews</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="bg-white rounded-2xl p-7 border border-light hover:-translate-y-1 hover:shadow-lg transition"
          >
            <div className="text-light font-syne font-extrabold text-4xl leading-none mb-2">
              &ldquo;
            </div>
            <div className="text-amber-400 text-sm mb-3.5">★★★★★</div>
            <p className="text-slate-500 text-sm leading-[1.7] mb-5">
              {r.text.replace('FlowX', '')}
              <span className="font-semibold">
                Flow<span className="x-green">X</span>
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${r.color} flex items-center justify-center font-syne font-bold text-base text-white`}
              >
                {r.initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-navy">{r.name}</div>
                <div className="text-xs text-slate-500">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
