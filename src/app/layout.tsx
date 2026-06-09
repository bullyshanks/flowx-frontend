import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'FlowX — Pure Water · Fast Delivery',
  description:
    'Premium 19-litre purified water delivered to your door across Karachi. Same-day delivery, BPA-free bottles, subscription plans.',
  keywords: ['water delivery', 'flowx', 'karachi', 'water bottle', '19l water'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
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
