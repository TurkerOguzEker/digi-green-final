import { supabase } from '../../../lib/supabase';
import NewsDetailClient from './NewsDetailClient';
import { notFound } from 'next/navigation';

// ✨ Google, WhatsApp, LinkedIn Paylaşımları İçin Dinamik SEO (Metadata) ✨
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: newsItem } = await supabase.from('news').select('*').eq('id', id).single();

  if (!newsItem) {
    return { title: 'Haber Bulunamadı | DIGI-GREEN FUTURE' };
  }

  return {
    title: `${newsItem.title} | DIGI-GREEN FUTURE`,
    description: newsItem.summary || 'DIGI-GREEN FUTURE projesi ile ilgili en güncel haber detayları.',
    openGraph: {
      title: newsItem.title,
      description: newsItem.summary,
      images: [newsItem.image_url || '/assets/images/eu-flag.png'],
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { id } = await params;
  
  // Veriyi sunucuda (Server) anında çekiyoruz. Yükleniyor ekranına gerek yok!
  const { data: newsItem } = await supabase.from('news').select('*').eq('id', id).single();

  // Eğer haber silinmişse veya yoksa otomatik Next.js 404 sayfasına atar
  if (!newsItem) {
    notFound(); 
  }

  // Çekilen veriyi dili yönetmesi için Client Component'e (İstemci Bileşenine) gönderiyoruz
  return <NewsDetailClient newsItem={newsItem} />;
}