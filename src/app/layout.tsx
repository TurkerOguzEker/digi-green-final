import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { supabase } from '../lib/supabase'; 

// ✨ STATİK YERİNE DİNAMİK METADATA EKLENDİ (Favicon için) ✨
export async function generateMetadata() {
  // Veritabanından ayarları çekiyoruz
  const { data } = await supabase.from('settings').select('*');
  const settings: Record<string, string> = {};
  
  if (data) {
    data.forEach(item => {
      settings[item.key] = item.value;
    });
  }

  return {
    title: 'DIGI-GREEN FUTURE | Kapaklı Belediyesi',
    description: 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm - Erasmus+ Projesi',
    icons: {
      // ✨ DEĞİŞİKLİK BURADA: Artık sekme logosu olarak doğrudan Header Logosu kullanılıyor ✨
      icon: settings['header_logo_image'] || '/favicon.ico',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning buraya eklendi (HTML seviyesi eklentiler için)
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Fonts ve Font Awesome */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Proje CSS dosyası */}
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      {/* suppressHydrationWarning buraya da eklendi (Body seviyesi eklentiler için) */}
      <body suppressHydrationWarning>
        <Header />
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        <Footer />

        {/* YUKARI ÇIK BUTONU */}
        <ScrollToTop />
      </body>
    </html>
  )
}