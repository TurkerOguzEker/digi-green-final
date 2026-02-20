'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from('news').select('*').eq('id', id).single();
      if (data) {
        setNewsItem(data);
      } else {
        router.push('/news');
      }
      setLoading(false);
    }
    if (id) fetchNews();
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f2' }}>
        <h3 style={{ color: '#27ae60', fontFamily: 'Inter' }}>Haber Detayı Yükleniyor...</h3>
      </div>
    );
  }

  if (!newsItem) return null;

  return (
    <div className="news-detail-page">
      {/* HERO ALANI */}
      <section className="detail-hero" style={{ backgroundImage: `url(${newsItem.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          {/* Tarih bölümü buradan kaldırıldı */}
          <h1 className="news-title">{newsItem.title}</h1>
        </div>
      </section>

      {/* İÇERİK ALANI */}
      <section className="detail-content-section">
        <div className="container" style={{ maxWidth: '900px' }}>
            
          {/* ✨ BUTON BEYAZ KUTUNUN HEMEN ÜSTÜNDE ✨ */}
          <Link 
            href="/news" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ffffff',
              backgroundColor: '#27ae60',
              textDecoration: 'none',
              fontWeight: '700',
              marginBottom: '25px', 
              padding: '12px 25px',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.backgroundColor = '#1a5c38';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 92, 56, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#27ae60';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.4)';
            }}
          >
            <i className="fas fa-arrow-left"></i> Haberlere Dön
          </Link>

          <div className="content-box">
             <div className="description-text">
                {newsItem.description ? (
                   newsItem.description.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                   ))
                ) : (
                   <p>{newsItem.summary}</p>
                )}
             </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .news-detail-page {
          background: #f4f7f2;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-bottom: 80px;
        }
        .detail-hero {
          position: relative;
          height: 60vh;
          min-height: 450px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding-bottom: 60px;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13, 43, 31, 0.98) 0%, rgba(13, 43, 31, 0.5) 50%, rgba(0,0,0,0.15) 100%);
        }
        .container {
          width: 100%;
          padding: 0 24px;
          margin: 0 auto;
        }
        .hero-content {
          position: relative;
          z-index: 2;
        }
        .news-title {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1.2;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .detail-content-section {
          padding-top: 40px; 
          position: relative;
          z-index: 5;
        }
        .content-box {
          background: white;
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }
        .description-text p {
          font-size: 1.15rem;
          line-height: 1.8;
          color: #444;
          margin-bottom: 25px;
        }
        @media (max-width: 768px) {
          .detail-hero { height: auto; padding-top: 150px; padding-bottom: 40px; }
          .content-box { padding: 30px 20px; }
          .news-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}