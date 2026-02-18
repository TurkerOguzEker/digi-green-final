import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop'; // ✨ 1. YUKARI ÇIK BUTONU BURADA İÇE AKTARILDI

export const metadata = {
  title: 'DIGI-GREEN FUTURE | Kapaklı Belediyesi',
  description: 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm - Erasmus+ Projesi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 1. suppressHydrationWarning buraya eklendi (HTML seviyesi eklentiler için)
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Fonts ve Font Awesome */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Proje CSS dosyası */}
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      {/* 2. suppressHydrationWarning buraya da eklendi (Body seviyesi eklentiler için - Örn: Grammarly) */}
      <body suppressHydrationWarning>
        <Header />
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        <Footer />

        {/* ✨ 2. YUKARI ÇIK BUTONU BURAYA EKLENDİ ✨ */}
        <ScrollToTop />
      </body>
    </html>
  )
}