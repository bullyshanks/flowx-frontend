import Navbar from '@/components/Navbar';
import CornerPopup from '@/components/CornerPopup';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Products from '@/components/Products';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import { CTABanner, Footer } from '@/components/CTAFooter';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <CornerPopup />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Products />
        <Testimonials />
        <Contact />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
