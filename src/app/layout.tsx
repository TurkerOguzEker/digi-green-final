import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    // suppressHydrationWarning: Tarayıcı eklentilerinin HTML'e müdahale etmesinden 
    // kaynaklanan hydration hatalarını engellemek için eklendi.
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Fonts ve Font Awesome */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Proje CSS dosyası */}
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body>
        <Header />
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}