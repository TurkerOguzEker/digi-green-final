// src/app/news/page.js
import { supabase } from '../../lib/supabase';
import NewsClient from './NewsClient';

// Google ve Sosyal Medya için Dinamik SEO Meta Etiketleri
export const metadata = {
  title: 'Haberler & Duyurular | DIGI-GREEN FUTURE',
  description: 'Projemizle ilgili en güncel gelişmeleri, duyuruları ve etkinlikleri buradan takip edebilirsiniz.',
  openGraph: {
    title: 'Haberler & Duyurular | DIGI-GREEN FUTURE',
    description: 'Projemizle ilgili en güncel gelişmeleri, duyuruları ve etkinlikleri buradan takip edebilirsiniz.',
  },
};

const PAGE_SIZE = 6;

// Bu fonksiyon sunucuda çalışır ve veriyi anında çeker (Loading ekranına gerek kalmaz)
async function getInitialData() {
  // 1. Sayfa Ayarlarını (Metinleri) Çek
  const { data: settingsData } = await supabase.from('settings').select('*');
  const contentMap = {};
  if (settingsData) {
    settingsData.forEach(item => { contentMap[item.key] = item.value; });
  }

  // 2. İlk 6 Haberi Çek (Fallback eklendi)
  let newsData = [];
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .range(0, PAGE_SIZE - 1);
    
    if (error) throw error;
    if (data && data.length > 0) {
      newsData = data;
    } else {
      throw new Error("No data");
    }
  } catch (err) {
    newsData = [
      { id: 1, title: 'Proje Başlangıç Toplantısı Gerçekleştirildi', summary: 'Kapaklı Belediyesi ev sahipliğinde, uluslararası ortaklarımızın katılımıyla DIGI-GREEN FUTURE projemizin açılış toplantısı tamamlandı.', date: '2025-11-15' },
      { id: 2, title: 'Mobil Uygulama Geliştirme Süreci Başladı', summary: 'Vatandaşların atık yönetimine aktif katılımını sağlayacak olan mobil uygulamamızın teknik altyapı çalışmaları Namık Kemal Üniversitesi işbirliğiyle başladı.', date: '2025-12-05' },
      { id: 3, title: 'Letonya Teknik Ziyareti Planlandı', summary: 'Sınır ötesi bilgi paylaşımı kapsamında, akıllı şehir uygulamalarını yerinde incelemek üzere Liepāja (Letonya) ziyareti takvimi belirlendi.', date: '2026-01-20' },
    ];
  }

  return {
    initialContent: contentMap,
    initialNews: newsData,
    hasMore: newsData.length === PAGE_SIZE,
  };
}

export default async function NewsPage() {
  // Veriyi sunucuda bekliyoruz (Sayfa Google'a dolu gidecek)
  const { initialContent, initialNews, hasMore } = await getInitialData();

  // Çekilen veriyi, etkileşimli olan İstemci (Client) Bileşenine gönderiyoruz
  return (
    <NewsClient 
      initialContent={initialContent} 
      initialNews={initialNews} 
      initialHasMore={hasMore} 
    />
  );
}