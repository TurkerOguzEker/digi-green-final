'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

export default function ActivityDetailClient({ activity }) {
  const { language } = useLanguage();

  // Çoklu Görsel State'leri (Slider & Büyütme)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Dile göre veritabanından veri çekiyoruz
  const displayTitle = language === 'en' && activity.title_en ? activity.title_en : activity.title;
  const displayDesc = language === 'en' && activity.description_en ? activity.description_en : activity.description;
  const displaySummary = language === 'en' && activity.summary_en ? activity.summary_en : activity.summary;

  // ✨ METİN İÇİ LİNKLERİ YENİ SEKMEYE YÖNLENDİRME ✨
  useEffect(() => {
    const links = document.querySelectorAll('.quill-content a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }, [displayDesc, displaySummary]);

  // ✨ ÇOKLU GÖRSEL GALERİSİ HAZIRLIĞI ✨
  let galleryImages = [];
  if (activity.gallery) {
    try {
      galleryImages = Array.isArray(activity.gallery) ? activity.gallery : JSON.parse(activity.gallery);
    } catch (e) {
      galleryImages = [];
    }
  }

  // Ana resmi ve varsa diğer galeri resimlerini tek bir dizide birleştiriyoruz
  const allImages = [
    activity.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1200',
    ...galleryImages
  ].filter(Boolean); // Boş olanları at

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  // Klavyedeki yön tuşları ve ESC ile galeriyi kontrol etme
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext(e);
      if (e.key === 'ArrowLeft') handlePrev(e);
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  return (
    <div className="activity-detail-page">
      
      {/* HERO ALANI (SLIDER & BÜYÜTME) */}
      <section 
        className="detail-hero" 
        style={{ backgroundImage: `url(${allImages[currentImageIndex]})` }}
        onClick={openLightbox}
      >
        <div className="hero-overlay"></div>

        {/* 📸 Sağ Sol Oklar (Sadece birden fazla resim varsa görünür) */}
        {allImages.length > 1 && (
          <>
            <button className="slider-btn left" onClick={handlePrev} title="Önceki Resim">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="slider-btn right" onClick={handleNext} title="Sonraki Resim">
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* 📸 Büyütme İkonu */}
        <div className="expand-icon" onClick={openLightbox} title="Tam Ekran Görüntüle">
          <i className="fas fa-expand"></i>
        </div>

        <div className="container hero-content">
          <h1 className="activity-title">
            {displayTitle}
          </h1>
        </div>
      </section>

      {/* İÇERİK ALANI */}
      <section className="detail-content-section">
        <div className="container" style={{ maxWidth: '900px' }}>
            
          {/* BUTON BEYAZ KUTUNUN HEMEN ÜSTÜNDE */}
          <Link href="/activities" className="custom-back-btn">
            <i className="fas fa-arrow-left"></i> 
            {language === 'en' ? 'Back to Activities' : 'Faaliyetlere Dön'}
          </Link>

          <div className="content-box">
             <div 
                className="description-text quill-content" 
                dangerouslySetInnerHTML={{ __html: displayDesc || displaySummary }} 
             />
          </div>
        </div>
      </section>

      {/* ✨ TAM EKRAN (LIGHTBOX) GALERİ ✨ */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <i className="fas fa-times"></i>
          </button>

          {allImages.length > 1 && (
            <button className="lightbox-btn left" onClick={handlePrev}>
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          <img 
            src={allImages[currentImageIndex]} 
            alt="Detay Görseli" 
            className="lightbox-image" 
            onClick={(e) => e.stopPropagation()} 
          />

          {allImages.length > 1 && (
            <button className="lightbox-btn right" onClick={handleNext}>
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
          
          {/* Altta Hangi Resimde Olduğunu Gösterme */}
          {allImages.length > 1 && (
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}

      {/* SAYFA DÜZENİ CSS */}
      <style jsx>{`
        .activity-detail-page {
          background: #f4f7f2;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-bottom: 80px;
        }
        
        /* ─── KAHRAMAN (HERO) ALANI VE SLIDER ─── */
        .detail-hero {
          position: relative;
          height: 60vh;
          min-height: 450px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding-bottom: 60px;
          cursor: pointer;
          transition: background-image 0.4s ease-in-out;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13, 43, 31, 0.98) 0%, rgba(13, 43, 31, 0.4) 50%, rgba(0,0,0,0.2) 100%);
          pointer-events: none;
        }
        
        /* Slider Butonları */
        .slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.4);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .slider-btn:hover { background: rgba(39, 174, 96, 0.9); border-color: #27ae60; transform: translateY(-50%) scale(1.1); }
        .slider-btn.left { left: 30px; }
        .slider-btn.right { right: 30px; }

        /* Büyütme İkonu */
        .expand-icon {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(0,0,0,0.5);
          color: white;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.2rem;
          z-index: 10;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .expand-icon:hover { background: #27ae60; transform: scale(1.05); }

        .container {
          width: 100%;
          padding: 0 24px;
          margin: 0 auto;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          pointer-events: none;
        }
        .activity-title {
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
          overflow: hidden; 
        }

        /* ─── LIGHTBOX MODAL (TAM EKRAN GALERİ) ─── */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .lightbox-image {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 50px rgba(0,0,0,0.5);
          user-select: none;
        }
        .lightbox-close {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-close:hover { background: #e74c3c; transform: rotate(90deg); }
        
        .lightbox-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .lightbox-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-50%) scale(1.1); }
        .lightbox-btn.left { left: 40px; }
        .lightbox-btn.right { right: 40px; }
        
        .lightbox-counter {
          position: absolute;
          bottom: 30px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          background: rgba(0,0,0,0.5);
          padding: 8px 16px;
          border-radius: 20px;
          letter-spacing: 2px;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @media (max-width: 768px) {
          .detail-hero { height: auto; padding-top: 150px; padding-bottom: 40px; }
          .content-box { padding: 30px 20px; }
          .activity-title { font-size: 2rem; }
          .slider-btn { width: 40px; height: 40px; font-size: 1rem; }
          .slider-btn.left { left: 10px; }
          .slider-btn.right { right: 10px; }
          .lightbox-btn { width: 45px; height: 45px; font-size: 1.2rem; }
          .lightbox-btn.left { left: 15px; }
          .lightbox-btn.right { right: 15px; }
          .lightbox-close { top: 15px; right: 15px; width: 40px; height: 40px; font-size: 1.2rem; }
        }
      `}</style>

      {/* ✨ İÇERİK (QUILL) VE BUTON İÇİN GLOBAL CSS ✨ */}
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

        .quill-content {
          width: 100%;
          max-width: 100%;
          color: #444;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
        }
        
        .quill-content p {
          font-size: 1.15rem;
          line-height: 1.8;
          margin-bottom: 25px;
        }

        .quill-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 12px;
          margin: 20px 0;
          display: block;
        }

        .quill-content iframe, 
        .quill-content video {
          max-width: 100% !important;
          border-radius: 12px;
        }

        .quill-content ul, 
        .quill-content ol {
          padding-left: 25px;
          margin-bottom: 25px;
          line-height: 1.8;
          font-size: 1.15rem;
        }

        .quill-content li { margin-bottom: 10px; }

        .quill-content h1, 
        .quill-content h2, 
        .quill-content h3, 
        .quill-content h4 {
          color: #1a1a1a;
          margin-top: 35px;
          margin-bottom: 15px;
          font-weight: 700;
          line-height: 1.3;
        }

        .quill-content a {
          color: #27ae60;
          text-decoration: underline;
        }

        .quill-content .ql-align-center { text-align: center !important; }
        .quill-content .ql-align-right { text-align: right !important; }
        .quill-content .ql-align-justify { text-align: justify !important; }
        
        .quill-content .ql-indent-1 { padding-left: 3rem; }
        .quill-content .ql-indent-2 { padding-left: 6rem; }
        
        @media (max-width: 768px) {
          .quill-content p,
          .quill-content ul,
          .quill-content ol {
            font-size: 1.05rem;
          }
          .quill-content .ql-indent-1,
          .quill-content .ql-indent-2 {
            padding-left: 1rem; 
          }
        }
      `}</style>
    </div>
  );
}