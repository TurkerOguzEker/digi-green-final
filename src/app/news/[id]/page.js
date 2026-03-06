import { supabase } from '../../../lib/supabase';
import NewsDetailClient from './NewsDetailClient';
import { notFound } from 'next/navigation';

// ✨ NEXT.JS CACHE'İ İPTAL ETME (HER ZAMAN EN GÜNCEL VERİYİ GÖSTERİR) ✨
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ✨ Google, WhatsApp, LinkedIn Paylaşımları İçin Dinamik SEO (Metadata) ✨
export async function generateMetadata({ params }) {
  // Next.js 15 kurallarına göre params artık asenkron olarak çözülmeli
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
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
  // Next.js 15 kurallarına göre params asenkron
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Veriyi sunucuda (Server) anında çekiyoruz. 
  const { data: newsItem } = await supabase.from('news').select('*').eq('id', id).single();

  // Eğer haber silinmişse veya yoksa otomatik Next.js 404 sayfasına atar
  if (!newsItem) {
    notFound(); 
  }

  // Çekilen veriyi dili yönetmesi ve CSS ile şekillendirmesi için Client Component'e gönderiyoruz
  return <NewsDetailClient newsItem={newsItem} />;
}