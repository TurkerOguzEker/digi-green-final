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

  // 2. İlk 6 Haberi Çek
  const { data: newsData } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return {
    initialContent: contentMap,
    initialNews: newsData || [],
    hasMore: newsData ? newsData.length === PAGE_SIZE : false,
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