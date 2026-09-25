import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18453245198';
const metaPixelId = '1026193607099709';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://el-tanque-motors.com'),
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
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAdsId}');`}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,
'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
