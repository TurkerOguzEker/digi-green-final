'use client';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

export default function NewsDetailClient({ newsItem }) {
  // Aktif dili çekiyoruz ('tr' veya 'en')
  const { language } = useLanguage();

  // Dile göre veritabanından veri çekiyoruz
  const displayTitle = language === 'en' && newsItem.title_en ? newsItem.title_en : newsItem.title;
  const displayDesc = language === 'en' && newsItem.description_en ? newsItem.description_en : newsItem.description;
  const displaySummary = language === 'en' && newsItem.summary_en ? newsItem.summary_en : newsItem.summary;

  return (
    <div className="news-detail-page">
      {/* HERO ALANI */}
      <section className="detail-hero" style={{ backgroundImage: `url(${newsItem.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="news-title">
            {displayTitle}
          </h1>
        </div>
      </section>

      {/* İÇERİK ALANI */}
      <section className="detail-content-section">
        <div className="container" style={{ maxWidth: '900px' }}>
            
          {/* ✨ BUTON BEYAZ KUTUNUN HEMEN ÜSTÜNDE ✨ */}
          <Link href="/news" className="custom-back-btn">
            <i className="fas fa-arrow-left"></i> 
            {language === 'en' ? 'Back to News' : 'Haberlere Dön'}
          </Link>

          <div className="content-box">
             <div 
                className="description-text quill-content" 
                dangerouslySetInnerHTML={{ __html: displayDesc || displaySummary }} 
             />
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

      {/* ✨ BUTON İÇİN GLOBAL CSS ✨ */}
      <style jsx global>{`
        .custom-back-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 10px !important;
          color: #ffffff !important;
          background-color: #27ae60 !important;
          text-decoration: none !important;
          font-weight: 700 !important;
          margin-bottom: 25px !important;
          padding: 12px 25px !important;
          border-radius: 50px !important;
          box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4) !important;
          transition: all 0.3s ease !important;
        }
        .custom-back-btn:hover {
          transform: translateY(-3px) !important;
          background-color: #1a5c38 !important;
          box-shadow: 0 8px 25px rgba(26, 92, 56, 0.5) !important;
        }
      `}</style>
    </div>
  );
}