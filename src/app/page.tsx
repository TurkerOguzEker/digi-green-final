'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// TypeScript için veri tiplerini tanımlıyoruz
interface ContentState {
  [key: string]: string; // Objenin içinde herhangi bir string anahtar olabilir
}

interface CounterProps {
  end: number;
  duration?: number;
}

// Sayaç Bileşeni
const Counter = ({ end, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); 
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
};

export default function Home() {
  // content state'ine tipini belirtiyoruz: <ContentState>
  const [content, setContent] = useState<ContentState>({});

  // Admin panelinden verileri çek
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map: ContentState = {};
        // Gelen verinin tipini belirtiyoruz
        data.forEach((item: { key: string; value: string }) => {
             map[item.key] = item.value;
        });
        setContent(map);
      }
    }
    fetchSettings();
  }, []);

  return (
    <main className="overflow-hidden">
      
      {/* 1️⃣ HERO ALANI (Admin Panel Bağlantılı) */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-white" 
        style={{
            backgroundImage: content.hero_bg_image ? `url(${content.hero_bg_image})` : 'linear-gradient(135deg, #1B5E20 0%, #004d40 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
        {/* Karartma ve Desen */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-green opacity-20 z-0 pointer-events-none"></div>

        <div className="container relative z-10 px-4">
            <span className="inline-block py-2 px-6 border-2 border-white/30 rounded-full font-bold tracking-widest mb-6 bg-white/10 backdrop-blur-md anim-text">
                {content.header_logo_text || 'DIGI-GREEN FUTURE'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg anim-text delay-1">
                {content.hero_title || 'Vatandaş Odaklı Yerel Yeşil Gelecek İçin Dijital Dönüşüm'}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90 leading-relaxed anim-text delay-2">
                {content.hero_desc || 'Erasmus+ KA220-ADU kapsamında 3 ülkede sürdürülebilir ve dijital belediyecilik çözümleri geliştiriyoruz.'}
            </p>
            <div className="flex flex-wrap justify-center gap-5 anim-text delay-3">
                <a href="#solutions" className="px-8 py-4 bg-[#00C853] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#00E676] transition transform hover:scale-105">
                    📱 Mobil Çözümleri Keşfet
                </a>
                <a href="/about" className="px-8 py-4 bg-white text-[#1B5E20] rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                    🌍 Projeyi İncele
                </a>
            </div>
        </div>
      </section>

      {/* 2️⃣ HIZLI ÖZET KARTLARI (Glassmorphism) */}
      <section className="py-20 bg-[#f9fcf9] relative -mt-20 z-20">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                      { icon: 'fa-clock', val: '24 Ay', label: 'Proje Süresi' },
                      { icon: 'fa-euro-sign', val: '250.000€', label: 'Toplam Bütçe' },
                      { icon: 'fa-handshake', val: '5 Kurum', label: 'Ortak Sayısı' },
                      { icon: 'fa-users', val: '2.000+', label: 'Hedef Vatandaş' }
                  ].map((item, i) => (
                      <div key={i} className="glass-card p-8 rounded-2xl text-center">
                          <i className={`fas ${item.icon} text-4xl text-[#2E7D32] mb-4`}></i>
                          <h3 className="text-2xl font-bold text-gray-800">{item.val}</h3>
                          <p className="text-gray-500 font-medium">{item.label}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 3️⃣ PROJENİN AMACI (Resimli) */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2 relative">
                  {/* Temsili Görsel Alanı */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#e8f5e9]">
                      <img src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000&auto=format&fit=crop" alt="Smart City" className="w-full h-auto object-cover transform hover:scale-105 transition duration-700" />
                      <div className="absolute bottom-0 left-0 bg-[#2E7D32] text-white px-6 py-3 rounded-tr-xl font-bold">
                          %29 Geri Dönüşüm Hedefi
                      </div>
                  </div>
              </div>
              <div className="w-full md:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1B5E20] mb-6">İklim Değişikliğiyle Dijital Mücadele</h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      Kapaklı Belediyesi liderliğinde yürütülen bu proje, iklim değişikliğinin yerel etkilerini azaltmak için teknolojiyi kullanıyor. Mobil uygulamalar ve yapay zeka destekli atık yönetimi ile karbon ayak izini düşürmeyi hedefliyoruz.
                  </p>
                  <ul className="space-y-4">
                      {[
                          'Dijital Belediyecilik Entegrasyonu',
                          'Geri Dönüşüm Oranını %24\'ten %29\'a Çıkarma',
                          'Aktif Vatandaş Katılımı ve Ödül Sistemi',
                          'Hava Kalitesi İzleme Ağı'
                      ].map((li, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                              <i className="fas fa-check-circle text-[#00C853]"></i> {li}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </section>

      {/* 4️⃣ 3 ÜLKE - 3 ŞEHİR (Basit Harita Görünümü) */}
      <section className="py-24 bg-[#e8f5e9] relative">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-[#1B5E20] mb-12">3 Ülke – 3 Stratejik Ortak 🌍</h2>
              
              {/* Basit Harita Temsili */}
              <div className="relative max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 overflow-hidden">
                  <img src="/globe.svg" alt="Map Map" className="w-full h-auto opacity-20 absolute top-0 left-0" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                      <div className="p-6 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="text-4xl mb-4">🇹🇷</div>
                          <h3 className="text-xl font-bold text-[#003399]">Kapaklı, Türkiye</h3>
                          <p className="text-sm text-gray-600 mt-2">Proje Koordinatörü & Pilot Uygulama Alanı</p>
                      </div>
                      <div className="p-6 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="text-4xl mb-4">🇱🇻</div>
                          <h3 className="text-xl font-bold text-[#003399]">Liepāja, Letonya</h3>
                          <p className="text-sm text-gray-600 mt-2">Akıllı Şehir & Dijital Atık Uzmanlığı</p>
                      </div>
                      <div className="p-6 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="text-4xl mb-4">🇵🇹</div>
                          <h3 className="text-xl font-bold text-[#003399]">Cascais, Portekiz</h3>
                          <p className="text-sm text-gray-600 mt-2">İklim Eylemi & Vatandaş Katılımı</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 5️⃣ DİJİTAL ÇÖZÜMLER (Grid) */}
      <section id="solutions" className="py-24 bg-white">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1B5E20] mb-4">Dijital Çözümlerimiz</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Yeşil bir gelecek için geliştirdiğimiz teknolojik araçlar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { icon: 'fa-mobile-screen', title: 'Mobil Belediye', desc: '5.000+ İndirme Hedefi, Geri Bildirim Sistemi', color: '#2E7D32' },
                      { icon: 'fa-recycle', title: 'AI Atık Yönetimi', desc: 'Yapay Zeka Destekli Akıllı Atık Kutuları', color: '#1565C0' },
                      { icon: 'fa-wind', title: 'Hava Kalitesi', desc: '100 Adet IoT Tabanlı Hava Sensör Ağı', color: '#F9A825' },
                      { icon: 'fa-bottle-water', title: 'İade Makineleri', desc: 'Depozito İadeli Otomatlar (Pilot)', color: '#00838F' }
                  ].map((item, i) => (
                      <div key={i} className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl transition duration-300 text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl mb-6 shadow-lg transform group-hover:rotate-12 transition`} style={{backgroundColor: item.color}}>
                              <i className={`fas ${item.icon}`}></i>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 6️⃣ EĞİTİM & ETKİ (Sayaçlar) */}
      <section className="py-20 bg-[#1B5E20] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/file.svg')] bg-repeat space-x-10"></div>
          <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {[
                      { val: 2000, label: 'Vatandaş Eğitimi', icon: 'fa-users' },
                      { val: 50, label: 'Belediye Personeli', icon: 'fa-user-tie' },
                      { val: 1, label: 'SECAP Planı', icon: 'fa-file-contract' },
                      { val: 4, label: 'Eğitim Videosu', icon: 'fa-video' }
                  ].map((stat, i) => (
                      <div key={i}>
                          <i className={`fas ${stat.icon} text-3xl mb-4 text-[#69F0AE]`}></i>
                          <div className="text-4xl md:text-5xl font-bold mb-2">
                              <Counter end={stat.val} />
                          </div>
                          <p className="text-[#C8E6C9] font-medium">{stat.label}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 7️⃣ FARKINDALIK & GÖRÜNÜRLÜK */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-[#333] mb-10">Farkındalık & Görünürlük Çalışmaları</h2>
              <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-70">
                  <div className="flex flex-col items-center gap-3">
                      <i className="fab fa-instagram text-4xl text-pink-600 icon-bounce"></i>
                      <span className="font-bold">Sosyal Medya</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-newspaper text-4xl text-gray-600 icon-bounce"></i>
                      <span className="font-bold">Basın Bültenleri</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-book-open text-4xl text-blue-600 icon-bounce"></i>
                      <span className="font-bold">1000+ Broşür</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-video text-4xl text-red-600 icon-bounce"></i>
                      <span className="font-bold">Tanıtım Filmleri</span>
                  </div>
              </div>
          </div>
      </section>

      {/* 9️⃣ GÜÇLÜ KAPANIŞ (CTA) */}
      <section className="py-24 text-center relative bg-gray-900 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473341304170-5799a28c3463?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
          <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">“Dijitalleşerek Yeşil Geleceğe”</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Siz de bu dönüşümün bir parçası olun. Proje çıktılarını inceleyin veya bizimle iletişime geçin.
              </p>
              <div className="flex justify-center gap-5">
                  <a href="/results" className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition">
                      Proje Dokümanları
                  </a>
                  <a href="/contact" className="px-8 py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-gray-900 transition">
                      İletişime Geçin
                  </a>
              </div>
          </div>
      </section>

    </main>
  );
}