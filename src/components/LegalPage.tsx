import Navbar from './Navbar';
import { Footer } from './CTAFooter';

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-32 pb-24 px-[6vw] bg-navy relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-70" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="font-syne text-[clamp(2rem,4vw,3rem)] font-extrabold text-white mb-2">
            {title}
          </h1>
          <p className="text-white/40 text-sm mb-10">Last updated: {updated}</p>
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-9 backdrop-blur-2xl space-y-6 text-white/70 text-[15px] leading-[1.75]">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-syne font-bold text-lg text-white mb-2.5">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
