'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ActivityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      const { data } = await supabase.from('activities').select('*').eq('id', id).single();
      if (data) {
        setActivity(data);
      } else {
        router.push('/activities'); // Bulunamazsa geri gönder
      }
      setLoading(false);
    }
    if (id) fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f2' }}>
        <h3 style={{ color: '#27ae60', fontFamily: 'Inter' }}>Faaliyet Detayı Yükleniyor...</h3>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="activity-detail-page">
      {/* HERO ALANI (Resimli) */}
      <section className="detail-hero" style={{ backgroundImage: `url(${activity.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1200'})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          
          <div className="meta-info">
             <span className="badge-type">{activity.type}</span>
             <span className="badge-date"><i className="far fa-calendar-alt"></i> {activity.date}</span>
             <span className="badge-location"><i className="fas fa-map-marker-alt"></i> {activity.location}</span>
          </div>

          <h1 className="activity-title">{activity.title}</h1>
        </div>
      </section>

      {/* İÇERİK ALANI */}
      <section className="detail-content-section">
        <div className="container" style={{ maxWidth: '900px' }}>
            
          <Link href="/activities" className="back-btn">
            <i className="fas fa-arrow-left"></i> Faaliyetlere Dön
          </Link>

          <div className="content-box">
             {/* Admin panelinden girilen uzun açıklama (paragraf boşluklarını korumak için map ile render ediliyor) */}
             <div className="description-text">
                {activity.description ? (
                   activity.description.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                   ))
                ) : (
                   <p>{activity.summary}</p>
                )}
             </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .activity-detail-page {
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

        .meta-info {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .badge-type { background: #27ae60; color: white; padding: 6px 14px; border-radius: 50px; font-weight: 700; font-size: 0.85rem; }
        .badge-date, .badge-location { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); color: white; padding: 6px 14px; border-radius: 50px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.2); }

        .activity-title {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1.2;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .detail-content-section {
          padding: 0;
          position: relative;
          z-index: 5;
          margin-top: -40px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #1a5c38;
          text-decoration: none;
          font-weight: 700;
          margin-bottom: 30px;
          transition: transform 0.3s;
          background: white;
          padding: 10px 20px;
          border-radius: 50px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          position: relative;
          top: -20px;
        }
        .back-btn:hover { transform: translateX(-5px); color: #27ae60; }

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
          .activity-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}