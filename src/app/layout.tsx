import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk, Noto_Nastaliq_Urdu } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

// Display face — liquid, characterful grotesque for headings/numerals.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
});

// Body face — warm, highly legible grotesque for UI text and data.
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

// Urdu face — proper Nastaliq rendering for the bilingual wallet copy.
// Loaded app-wide but only applied where lang="ur" is set (see .font-urdu below).
const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '600'],
  variable: '--font-urdu',
});

export const metadata: Metadata = {
  title: 'FlowX — Pure Water · Fast Delivery',
  description:
    'Premium 19-litre purified water delivered to your door across Karachi. Same-day delivery, BPA-free bottles, subscription plans.',
  keywords: ['water delivery', 'flowx', 'karachi', 'water bottle', '19l water'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${notoNastaliq.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0A1628',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
