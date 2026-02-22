'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// ─── SAYAC BİLEŞENİ ───
const Counter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);

  return <span ref={counterRef}>{count}{suffix}</span>;
};

// ─── ANA SAYFA BİLEŞENİ ───
export default function AboutPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  // Veritabanından verileri çekme
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        setContent(map);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Scroll Animasyonları
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>Yükleniyor...</span>
      </div>
    );
  }

  // Veriler
  const stats = [
    { value: 500, suffix: '+', label: 'Eğitilen Vatandaş' },
    { value: 29, suffix: '%', label: 'Geri Dönüşüm' },
    { value: 24, suffix: '', label: 'Proje Süresi (Ay)' },
    { value: 3, suffix: '+', label: 'Ortak Ülke' },
  ];

  const tableRows = [
    { label: 'Proje Adı', key: 'about_project_name', default: 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm' },
    { label: 'Kısaltma', key: 'about_project_code', default: 'DIGI-GREEN FUTURE' },
    { label: 'Program', key: 'about_project_program', default: 'Erasmus+ Yetişkin Eğitimi Alanında İşbirliği Ortaklıkları (KA220-ADU)' },
    { label: 'Süre', key: 'about_project_duration', default: '24 ay (1 Kasım 2025 – 31 Ekim 2027)' },
    { label: 'Toplam Bütçe', key: 'about_project_budget', default: '250.000,00 €' },
  ];

  const targets = [
    { num: '01', title: 'Yerel Halk & Yetişkinler', desc: 'Dijital okuryazarlık ve çevre bilincini artırmak isteyen tüm vatandaşlar.' },
    { num: '02', title: 'Belediye Personeli', desc: 'Yeşil dönüşüm süreçlerini yönetecek ve dijital araçları kullanacak çalışanlar.' },
    { num: '03', title: 'Eğitimciler', desc: 'Çevre ve dijitalleşme alanında farkındalık yaratmayı hedefleyen kurumlar.' },
  ];

  return (
    <div className="about-page">
      
      {/* 1️⃣ HERO ALANI */}
      <section className="hero">
        <div className="container">
          <span className="eyebrow reveal active">Erasmus+ Destekli Proje</span>
          <h1 className="hero-title reveal active">
            Daha Yeşil Bir <br /> Gelecek İçin <span>Dijital Dönüşüm</span>
          </h1>
          <p className="hero-desc reveal active">
            {content.about_page_desc || 'Kapaklı Belediyesi öncülüğünde sürdürülebilir, doğa dostu ve teknoloji odaklı bir yarın inşa ediyoruz.'}
          </p>
        </div>
      </section>

      {/* 2️⃣ VİZYON */}
      <section className="section">
        <div className="container grid-2 align-center">
          <div className="reveal">
            <span className="section-label">Stratejik Bakış</span>
            <h2 className="section-title">{content.about_vision_title || 'İklim ve Dijital Dönüşümün Kesişimi'}</h2>
            <p className="section-text">
              {content.about_vision_text || 'Projemiz, iklim değişikliği ile mücadele ve dijital dönüşüm gerekliliklerini tek bir potada eritmeyi hedefler. Somut adımlar, ölçülebilir çıktılar ve kalıcı etki bırakmak için çalışıyoruz.'}
            </p>
            <ul className="vision-list">
              <li>Çevre dostu dijital çözümler ve uygulamalar</li>
              <li>Vatandaş katılımı ile tabandan yukarı farkındalık</li>
              <li>Ölçülebilir çevresel çıktı ve etki raporlama</li>
            </ul>
          </div>
          <div className="reveal image-wrapper">
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800" alt="Yeşil Şehir" />
          </div>
        </div>
      </section>

      {/* 3️⃣ İSTATİSTİKLER */}
      <section className="section bg-light">
        <div className="container">
          <div className="reveal text-center mb-5">
            <span className="section-label">Rakamlarla Proje</span>
            <h2 className="section-title">Somut Hedeflerimiz</h2>
          </div>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <h3 className="stat-number">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ HEDEF KİTLE */}
      <section className="section">
        <div className="container">
          <div className="reveal text-center mb-5">
            <span className="section-label">Odak Noktamız</span>
            <h2 className="section-title">Kimler İçin Çalışıyoruz?</h2>
          </div>
          <div className="targets-grid">
            {targets.map((kitle, i) => (
              <div key={i} className="target-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <span className="target-num">{kitle.num}</span>
                <h4 className="target-title">{kitle.title}</h4>
                <p className="target-desc">{kitle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ PROJE KÜNYESİ */}
      <section className="section">
        <div className="container narrow">
          <div className="reveal mb-5">
            <span className="section-label">Kimlik Bilgileri</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Proje Künyesi</h2>
          </div>
          <div className="spec-sheet reveal">
            {tableRows.map((row, i) => (
              <div key={i} className="spec-row">
                <div className="spec-label">{row.label}</div>
                <div className="spec-value">{content[row.key] || row.default}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ CTA (KOYU VE MODERN TASARIM) */}
      <section className="cta-section reveal">
        <div className="cta-container">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <span className="cta-badge">Hemen Katılın</span>
            <h2 className="cta-title">
              Dijital ve Yeşil Bir <br /> Geleceği Birlikte İnşa Edelim
            </h2>
            <p className="cta-desc">
              Digi-Green Future; yerel yönetimler, sivil toplum kuruluşları ve bireyler için yenilikçi, açık ve sürdürülebilir bir iş birliği platformudur.
            </p>
            
            <div className="cta-actions">
              <Link href="/contact" className="btn-primary-solid">
                İletişime Geç <i className="fas fa-arrow-right"></i>
              </Link>
              <Link href="/about" className="btn-outline-light">
                Daha Fazla Bilgi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* GENEL DEĞİŞKENLER VE AYARLAR */
        .about-page {
          font-family: 'Inter', system-ui, sans-serif;
          color: #111827;
          background-color: #ffffff;
          line-height: 1.6;
          --primary: #003399;
          --green-mid: #27ae60;
          --green-deep: #1a5c38;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .container.narrow {
          max-width: 900px;
        }

        .section {
          padding: 120px 0;
        }

        .bg-light { background-color: #f9fafb; }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 32px; }
        .mb-5 { margin-bottom: 64px; }

        /* YÜKLEME EKRANI */
        .loading-screen {
          height: 100vh; display: flex; flex-direction: column; 
          align-items: center; justify-content: center; gap: 16px;
        }
        .spinner {
          width: 40px; height: 40px; border: 3px solid #f3f4f6;
          border-top-color: #10b981; border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* REVEAL ANİMASYONU */
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        /* TİPOGRAFİ */
        .section-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #10b981; 
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          color: #111827;
        }
        .section-text {
          font-size: 1.125rem;
          color: #4b5563;
          margin-bottom: 32px;
        }

        /* HERO BÖLÜMÜ */
        .hero {
          padding: 160px 0 100px;
          text-align: center;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
        }
        .eyebrow {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 99px;
          background: #ecfdf5;
          color: #059669;
          margin-bottom: 32px;
        }
        .hero-title {
          font-size: clamp(3rem, 8vw, 5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .hero-title span {
          color: #10b981; 
        }
        .hero-desc {
          font-size: 1.25rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        /* GRİDLER */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
        }
        .align-center { align-items: center; }

        /* VİZYON */
        .vision-list {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 16px;
        }
        .vision-list li {
          font-size: 1.05rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vision-list li::before {
          content: '—';
          color: #10b981;
          font-weight: bold;
        }
        .image-wrapper img {
          width: 100%;
          border-radius: 24px;
          object-fit: cover;
          aspect-ratio: 4/3;
        }

        /* İSTATİSTİKLER */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          text-align: center;
        }
        .stat-number {
          font-size: 4rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
        }

        /* HEDEF KİTLE */
        .targets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }
        .target-card {
          padding: 40px;
          background: #f9fafb;
          border-radius: 24px;
          transition: background 0.3s ease;
        }
        .target-card:hover {
          background: #f3f4f6;
        }
        .target-num {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 16px;
        }
        .target-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .target-desc {
          color: #4b5563;
        }

        /* PROJE KÜNYESİ (SPEC SHEET) */
        .spec-sheet {
          border-top: 1px solid #e5e7eb;
        }
        .spec-row {
          display: grid;
          grid-template-columns: 240px 1fr;
          padding: 32px 24px;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        .spec-row:hover {
          background-color: #f9fafb;
          border-left-color: #10b981;
        }
        .spec-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          align-self: center;
        }
        .spec-value {
          font-size: 1.125rem;
          font-weight: 500;
          color: #111827;
          line-height: 1.6;
        }

        /* =========================================
           ✨ YENİ CTA ALANI (KOYU KAPSÜL) ✨
           ========================================= */
        .cta-section {
          padding: 40px 24px 80px;
        }
        .cta-container {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
          background: linear-gradient(145deg, var(--green-deep) 0%, #2a953c 100%);
          border-radius: 40px;
          padding: 80px 40px;
          text-align: center;
          overflow: hidden;
          box-shadow: 0 24px 50px rgba(26, 92, 56, 0.2);
        }
        /* Üstten gelen hafif ışık süzmesi efekti */
        .cta-glow {
          position: absolute;
          top: 0; 
          left: 50%;
          transform: translateX(-50%);
          width: 80%; 
          height: 100%;
          background: radial-gradient(circle at top, rgba(76, 214, 128, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-content {
          position: relative;
          z-index: 2;
        }
        .cta-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          color: #4cd680;
          padding: 8px 20px;
          border-radius: 99px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .cta-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        .cta-desc {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }
        
        /* ÇİFTLİ BUTON YAPISI */
        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btn-primary-solid {
          background: #ffffff;
          color: var(--green-deep);
          padding: 18px 36px;
          border-radius: 99px;
          font-weight: 700;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-primary-solid:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.25);
          background: #f0fdf4;
        }
        .btn-outline-light {
          background: transparent;
          color: #ffffff;
          padding: 18px 36px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .btn-outline-light:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.6);
        }

        /* MOBİL UYUM */
        @media (max-width: 768px) {
          .section { padding: 80px 0; }
          .hero { padding: 120px 0 60px; }
          .grid-2 { grid-template-columns: 1fr; gap: 40px; }
          .section-title { font-size: 2rem; }
          .stat-number { font-size: 3rem; }
          
          .spec-row { 
            grid-template-columns: 1fr; 
            gap: 8px; 
            padding: 24px 16px; 
          }
          .spec-value { font-size: 1.05rem; }

          .cta-section { padding: 20px 16px 60px; }
          .cta-container {
            padding: 60px 20px;
            border-radius: 28px;
          }
          .cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .cta-actions a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}