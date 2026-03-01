// src/app/activities/page.js
import { supabase } from '../../lib/supabase';
import ActivitiesClient from './ActivitiesClient';

// Google ve Sosyal Medya için Dinamik SEO Meta Etiketleri
export const metadata = {
  title: 'Faaliyetler & Etkinlikler | DIGI-GREEN FUTURE',
  description: 'Proje kapsamında gerçekleştirdiğimiz toplantılar ve faaliyetleri buradan inceleyebilirsiniz.',
  openGraph: {
    title: 'Faaliyetler & Etkinlikler | DIGI-GREEN FUTURE',
    description: 'Proje kapsamında gerçekleştirdiğimiz toplantılar ve faaliyetleri buradan inceleyebilirsiniz.',
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

  // 2. İlk 6 Faaliyeti Çek
  const { data: actData } = await supabase
    .from('activities')
    .select('*')
    .order('id', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return {
    initialContent: contentMap,
    initialActivities: actData || [],
    hasMore: actData ? actData.length === PAGE_SIZE : false,
  };
}

export default async function ActivitiesPage() {
  // Veriyi sunucuda bekliyoruz (Sayfa Google'a dolu gidecek)
  const { initialContent, initialActivities, hasMore } = await getInitialData();

  // Çekilen veriyi, etkileşimli olan İstemci (Client) Bileşenine gönderiyoruz
  return (
    <ActivitiesClient 
      initialContent={initialContent} 
      initialActivities={initialActivities} 
      initialHasMore={hasMore} 
    />
  );
}