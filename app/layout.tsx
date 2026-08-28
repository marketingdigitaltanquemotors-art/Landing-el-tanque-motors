import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'El Tanque Motors | Tu próximo vehículo',
  description: 'Conoce este vehículo, su financiamiento flexible y la GARANTÍA EL TANQUE MOTORS.',
  openGraph: {
    title: 'El Tanque Motors | Tu próximo vehículo',
    description: 'Conoce el vehículo en video, sus características y financiamiento a tu medida.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'El Tanque Motors' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Tanque Motors | Tu próximo vehículo',
    description: 'Conoce el vehículo en video, sus características y financiamiento a tu medida.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
