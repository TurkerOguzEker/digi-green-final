import type { Metadata } from "next";
import "./globals.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { supabase } from '../lib/supabase'; 
import { LanguageProvider } from '../context/LanguageContext';
import CookieBanner from '../components/CookieBanner';
import Script from 'next/script';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { data } = await supabase.from('settings').select('*');
  const settings: Record<string, string> = {};
  
  if (data) {
    data.forEach(item => {
      settings[item.key] = item.value;
    });
  }

  const logoUrl = settings['header_logo_image'] 
    ? `${settings['header_logo_image']}?v=${new Date().getTime()}` 
    : '/favicon.ico';

  return {
    title: 'DIGI-GREEN FUTURE | Dijital Yeşil Dönüşüm',
    description: 'Kapaklı Belediyesi liderliğinde yürütülen, iklim değişikliği ile mücadelede dijital araçları kullanmayı hedefleyen Erasmus+ projesi.',
    keywords: 'çevre, dijital dönüşüm, sürdürülebilirlik, erasmus+, kapaklı belediyesi, yeşil gelecek',
    icons: {
      icon: logoUrl,
    },
    openGraph: {
      title: 'DIGI-GREEN FUTURE',
      description: 'Vatandaş Odaklı Yerel Yeşil Gelecek İçin Dijital Dönüşüm Projesi',
      url: 'https://digigreenfuture.eu', 
      siteName: 'DIGI-GREEN FUTURE',
      images: [
        {
          url: '/assets/images/eu-flag.png',
          width: 800,
          height: 600,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  const { data } = await supabase.from('settings').select('*');
  const settings: Record<string, string> = {};
  if (data) {
    data.forEach(item => {
      settings[item.key] = item.value;
    });
  }

  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      
      {/* className'deki hata çıkartan geist fontlarını temizledik */}
      <body suppressHydrationWarning>
        
        {/* GOOGLE ANALYTICS SCRIPTS */}
        <Script id="google-analytics-consent" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied'
            });

            if (localStorage.getItem('cookie_consent') === 'granted') {
              gtag('consent', 'update', {
                'analytics_storage': 'granted'
              });
            }
          `}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <LanguageProvider>
            {/* @ts-ignore */}
            <Header initialSettings={settings} />
            
            <main style={{ minHeight: '80vh' }}>
                {children}
            </main>
            
            {/* @ts-ignore */}
            <Footer initialSettings={settings} />
            
            <ScrollToTop />
            <CookieBanner />
        </LanguageProvider>
        
      </body>
    </html>
  )
}