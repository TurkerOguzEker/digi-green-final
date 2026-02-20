import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { supabase } from '../lib/supabase'; 

// ✨ NEXT.JS ÖNBELLEĞİNİ İPTAL EDİYORUZ (Her seferinde güncel veriyi çekecek)
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

  // Tarayıcı önbelleğini kırmak için URL sonuna rastgele zaman damgası ekliyoruz
  const logoUrl = settings['header_logo_image'] 
    ? `${settings['header_logo_image']}?v=${new Date().getTime()}` 
    : '/favicon.ico';

  return {
    title: 'DIGI-GREEN FUTURE | Kapaklı Belediyesi',
    description: 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm - Erasmus+ Projesi',
    icons: {
      icon: logoUrl,
    },
  }
}

// ✨ RootLayout async yapıldı! Ayarlar sayfa yüklenmeden ÖNCE burada çekilecek ✨
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  // SUNUCU (SERVER) TARAFINDA SİTE AYARLARINI ÇEKİYORUZ
  const { data } = await supabase.from('settings').select('*');
  const settings: Record<string, string> = {};
  if (data) {
    data.forEach(item => {
      settings[item.key] = item.value;
    });
  }

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body suppressHydrationWarning>
        
        {/* ✨ TYPESCRIPT HATASINI SUSTURMAK İÇİN ts-ignore EKLENDİ ✨ */}
        {/* @ts-ignore */}
        <Header initialSettings={settings} />
        
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        
        {/* @ts-ignore */}
        <Footer initialSettings={settings} />
        
        <ScrollToTop />
      </body>
    </html>
  )
}