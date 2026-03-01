// src/app/activities/[id]/page.js
import { supabase } from '../../../lib/supabase';
import ActivityDetailClient from './ActivityDetailClient';
import { notFound } from 'next/navigation';

// ✨ Google, WhatsApp, LinkedIn Paylaşımları İçin Dinamik SEO (Metadata) ✨
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: activity } = await supabase.from('activities').select('*').eq('id', id).single();

  if (!activity) {
    return { title: 'Faaliyet Bulunamadı | DIGI-GREEN FUTURE' };
  }

  return {
    title: `${activity.title} | DIGI-GREEN FUTURE`,
    description: activity.summary || 'DIGI-GREEN FUTURE projesi kapsamında gerçekleştirilen faaliyetin detayları.',
    openGraph: {
      title: activity.title,
      description: activity.summary,
      images: [activity.image_url || '/assets/images/eu-flag.png'],
    },
  };
}

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  
  // Veriyi sunucuda (Server) anında çekiyoruz. Yükleniyor ekranına gerek yok!
  const { data: activity } = await supabase.from('activities').select('*').eq('id', id).single();

  // Eğer faaliyet silinmişse veya yoksa otomatik Next.js 404 sayfasına atar
  if (!activity) {
    notFound(); 
  }

  // Çekilen veriyi dili yönetmesi ve tasarımı çizmesi için Client Component'e gönderiyoruz
  return <ActivityDetailClient activity={activity} />;
}