'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsDetail() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/news'); // Haber bulunamazsa listeye dön
      } else {
        setNews(data);
      }
      setLoading(false);
    }
    fetchNewsDetail();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="news-detail-page">
      <section className="page-header-clean">
        <div className="container">
          <Link href="/news" className="back-btn">
            <i className="fas fa-arrow-left"></i> Haberlere Dön
          </Link>
          <div className="news-meta">
             <span className="news-date">{new Date(news.created_at).toLocaleDateString('tr-TR')}</span>
             <span className="news-category">{news.category || 'Duyuru'}</span>
          </div>
          <h1 className="header-title-dark">{news.title}</h1>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container narrow">
          {news.image_url && (
            <div className="detail-image-wrapper">
              <img src={news.image_url} alt={news.title} />
            </div>
          )}
          
          <div className="news-content">
            {/* Admin panelinden girilen metni satır başlarına göre gösterir */}
            {news.content?.split('\n').map((paragraph, index) => (
              <p key={index} className="section-text">{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .news-detail-page { background: #fff; min-height: 100vh; }
        .page-header-clean { padding: 140px 0 40px; background: #f9fafb; border-bottom: 1px solid #eee; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; color: #003399; font-weight: 600; text-decoration: none; margin-bottom: 30px; transition: 0.3s; }
        .back-btn:hover { transform: translateX(-5px); }
        .news-meta { display: flex; gap: 15px; margin-bottom: 15px; }
        .news-date { font-size: 0.9rem; color: #6b7280; }
        .news-category { font-size: 0.9rem; color: #27ae60; font-weight: 700; text-transform: uppercase; }
        .header-title-dark { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: #111827; line-height: 1.2; }
        .container.narrow { max-width: 800px; margin: 0 auto; }
        .detail-image-wrapper { width: 100%; margin-bottom: 40px; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .detail-image-wrapper img { width: 100%; height: auto; display: block; }
        .news-content { font-size: 1.15rem; color: #374151; line-height: 1.8; }
        .section-text { margin-bottom: 20px; }
        
        @media (max-width: 768px) {
          .page-header-clean { padding: 100px 0 40px; }
        }
      `}</style>
    </div>
  );
}