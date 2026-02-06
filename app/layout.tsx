import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'DIGI-GREEN FUTURE | Kapaklı Belediyesi',
  description: 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm - Erasmus+ Projesi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Google Fonts ve Font Awesome */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Bizim CSS dosyamız */}
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