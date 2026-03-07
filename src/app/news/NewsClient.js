'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import ScrollToTop from '../../components/ScrollToTop';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
// ✨ Ortak animasyonları tek satırda dışarıdan çağırıyoruz ✨
import { NetworkBackground, HeroAnimation } from '../../components/BackgroundAnimations';
import '../globals.css';

const PAGE_SIZE = 6; 

export default function NewsClient() {
  const [content, setContent]       = useState({}); 
  const [news, setNews]             = useState([]);
  
  // ✨ YÜKLENME DURUMU
  const [loading, setLoading]       = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false); 
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(0);        
  
  const [searchQuery, setSearchQuery] = useState('');

  const sentinelRef = useRef(null);
  const { language, t } = useLanguage();

  // ✨ İLK YÜKLEME (Sayfa açılır açılmaz çalışır)
  useEffect(() => {
    async function fetchInitialData() {
      // 1. Ayarları Çek
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const map = {}; settingsData.forEach(item => map[item.key] = item.value);
        setContent(map);
      }

      // 2. İlk Haberleri Çek
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (newsData) {
        setNews(newsData);
        setHasMore(newsData.length === PAGE_SIZE);
      }
      
      setLoading(false); // Yükleme bitti, ekranı aç!
    }
    
    fetchInitialData();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const from = nextPage * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      setNews(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (searchQuery) return; // Arama yapılıyorsa sonsuz kaydırmayı durdur

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' } 
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore, searchQuery]);

  // YENİ: Arama Filtreleme İşlemi
  const filteredNews = news.filter(item => {
    const searchVal = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchVal) ||
      item.title_en?.toLowerCase().includes(searchVal) ||
      item.summary?.toLowerCase().includes(searchVal) ||
      item.summary_en?.toLowerCase().includes(searchVal)
    );
  });

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal:not(.active)').forEach(el => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, [filteredNews, loading]); 

  const getDynamicContent = (trKey, defaultTranslationKey) => {
    if (language === 'en') {
      const enKey = `${trKey}_en`;
      if (content[enKey] !== undefined) return content[enKey];
      const translation = t(defaultTranslationKey);
      if (translation !== defaultTranslationKey) return translation;
      if (content[trKey] !== undefined) return content[trKey];
    }
    if (content[trKey] !== undefined) return content[trKey];
    const translationFallback = t(defaultTranslationKey);
    return translationFallback === defaultTranslationKey ? '' : translationFallback;
  };

  // ✨ YÜKLENİYOR EKRANI
  if (loading) {
    return (
      <div className="loading-screen" style={{ background: 'transparent', position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div className="loader-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <span className="loader-text">{t('news.loading') || 'Yükleniyor...'}</span>
      </div>
    );
  }

  return (
    <div className="news-page">
      {/* ✨ Ortak Arka Plan Ağı Bileşeni ✨ */}
      <NetworkBackground />

      {/* ── HERO ─────────────────────────── */}
      <section className="page-header">
        {/* ✨ Ortak Yaprak Animasyonu Bileşeni ✨ */}
        <HeroAnimation />
        <div className="hero-noise"></div>
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>

        <div className="container hero-content">
          <div className="eyebrow reveal active">
            <span className="eyebrow-dot"></span>{getDynamicContent('news_hero_eyebrow', 'news.hero.eyebrow')}<span className="eyebrow-dot"></span>
          </div>
          <h1 className="header-title reveal active">
            {getDynamicContent('news_hero_title1', 'news.hero.title1')}<br /><em>{getDynamicContent('news_hero_title2', 'news.hero.title2')}</em>
          </h1>
          <p className="header-subtitle reveal active" style={{ transitionDelay: '0.25s' }}>
            {getDynamicContent('news_page_desc', 'news.hero.desc')}
          </p>
          <div className="hero-divider reveal active" style={{ transitionDelay: '0.4s' }}>
            <span></span><span className="dot"></span><span></span>
          </div>
        </div>

        <button
          className="hero-scroll-btn"
          onClick={() => document.getElementById('icerik')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="İçeriğe git"
        >
          <span className="scroll-btn-label">{getDynamicContent('news_hero_scroll', 'news.hero.scrollBtn')}</span>
          <span className="scroll-btn-icon"><i className="fas fa-chevron-down"></i></span>
        </button>
      </section>

      {/* ── HABER KARTLARI ───────────────────────────────────────────── */}
      <section id="icerik" className="section-padding">
        <div className="container" style={{ maxWidth: '1160px' }}>
          
          {/* ✨ ARAMA KUTUSU VE BAŞLIK YAN YANA ✨ */}
          <div className="section-head reveal active" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
            <div>
              <p className="section-label">{getDynamicContent('news_sec_label', 'news.section.label')}</p>
              <h2 className="section-title">{getDynamicContent('news_sec_title', 'news.section.title')}</h2>
            </div>

            <div className="client-search-wrap">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                className="client-search-input" 
                placeholder={language === 'en' ? 'Search news...' : 'Haberlerde ara...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="client-search-clear" onClick={() => setSearchQuery('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className="news-grid">
            {filteredNews.length === 0 ? (
              <div className="empty-state reveal active">
                <i className="far fa-newspaper"></i>
                <p>{searchQuery ? (language === 'en' ? 'No results found.' : 'Arama sonucu bulunamadı.') : t('news.list.empty')}</p>
              </div>
            ) : (
              filteredNews.map((item, index) => {
                const delay = `${(index % 3) * 0.12 + 0.1}s`;
                const dateParts = item.date ? item.date.split(' ') : [];
                const displayDate = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : item.date;

                const displayTitle = language === 'en' && item.title_en ? item.title_en : item.title;
                const displaySummary = language === 'en' && item.summary_en ? item.summary_en : item.summary;

                return (
                  <article key={item.id} className="news-card reveal" style={{ transitionDelay: delay }}>
                    <div className="card-shine"></div>

                    <div className="news-image-container">
                      <div className="news-image" style={{ position: 'relative' }}>
                        {item.image_url ? (
                          <Image 
                            src={item.image_url} 
                            alt={displayTitle} 
                            fill 
                            style={{ objectFit: 'cover' }} 
                            sizes="(max-width: 768px) 100vw, 330px"
                            unoptimized={true} 
                          />
                        ) : (
                          <div className="placeholder-img"><i className="far fa-image"></i></div>
                        )}
                        <div className="news-date-badge">
                          <i className="far fa-calendar-alt"></i>
                          {displayDate}
                        </div>
                      </div>
                    </div>

                    <div className="news-content">
                      <h3 className="news-title">
                        {displayTitle}
                      </h3>
                      <p className="news-desc">
                        {displaySummary}
                      </p>
                      <div className="news-footer">
                        <Link href={`/news/${item.id}`} className="read-more" style={{ textDecoration: 'none' }}>
                          {t('news.list.readMore')} <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ── SENTINEL + YÜKLEME GÖSTERGESİ ─────────────────────── */}
          <div ref={sentinelRef} style={{ height: '1px' }} />

          {loadingMore && !searchQuery && (
            <div className="load-more-indicator">
              <div className="loader-ring small">
                <div></div><div></div><div></div><div></div>
              </div>
              <span className="loader-text">{t('news.list.loadMore')}</span>
            </div>
          )}

          {!hasMore && news.length > 0 && !searchQuery && (
            <p className="end-of-list">{t('news.list.end')}</p>
          )}
        </div>
      </section>
      
      <ScrollToTop />
      <style jsx>{`
        .news-page {
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          --green-deep:   #1a5c38;
          --green-mid:    #27ae60;
          --green-light:  #4cd680;
          --green-pale:   #e8f5ee;
          --cream:        #f4f6f8;
          --gold:         #c9a84c;
          --text-dark:    #1a1a1a;
          --text-mid:     #3d5448;
          --text-soft:    #6b8277;
          --card-bg:      rgba(255,255,255,0.88);
          --border:       rgba(39,174,96,0.15);
          --shadow-card:  0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --shadow-hover: 0 20px 60px rgba(26,92,56,0.18), 0 4px 16px rgba(0,0,0,0.06);
          --radius:       24px;
        }

        /* YENİ ARAMA KUTUSU (ÖN YÜZ İÇİN UYUMLU) */
        .client-search-wrap {
          position: relative;
          width: 100%;
          max-width: 350px;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 18px;
          color: var(--green-mid);
          font-size: 1rem;
        }
        .client-search-input {
          width: 100%;
          background: #fff;
          border: 2px solid var(--border);
          border-radius: 50px;
          padding: 14px 20px 14px 44px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: var(--text-dark);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          outline: none;
        }
        .client-search-input:focus {
          border-color: var(--green-mid);
          box-shadow: 0 6px 20px rgba(39,174,96,0.15);
        }
        .client-search-input::placeholder {
          color: #a0aec0;
        }
        .client-search-clear {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 6px;
          font-size: 1rem;
          transition: color 0.2s ease;
        }
        .client-search-clear:hover {
          color: var(--red);
        }

        /* LOADER */
        .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .loader-ring { display: inline-block; position: relative; width: 60px; height: 60px; }
        .loader-ring.small { width: 36px; height: 36px; }
        .loader-ring div { box-sizing: border-box; display: block; position: absolute; width: 46px; height: 46px; margin: 7px; border: 3px solid transparent; border-top-color: var(--green-mid); border-radius: 50%; animation: loader-spin 1.2s cubic-bezier(0.5,0,0.5,1) infinite; }
        .loader-ring.small div { width: 28px; height: 28px; margin: 4px; }
        .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
        .loader-ring div:nth-child(2) { animation-delay: -0.3s; border-top-color: var(--gold); }
        .loader-ring div:nth-child(3) { animation-delay: -0.15s; }
        .loader-text { font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.1em; text-transform: uppercase; }
        @keyframes loader-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* LOAD MORE INDICATOR */
        .load-more-indicator { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 40px 0 20px; }
        .end-of-list { text-align: center; color: var(--text-soft); font-size: 0.85rem; padding: 30px 0 10px; letter-spacing: 0.05em; }

        /* REVEAL */
        .reveal:not(.news-card) {
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.active:not(.news-card) { opacity: 1; transform: translateY(0); }

        /* HERO - ORİJİNAL ARKA PLAN */
        .page-header {
          position: relative; min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; overflow: hidden;
          background: linear-gradient(160deg, #071a0f 0%, #0f3320 35%, #1a5c38 65%, #0d2b1f 100%);
        }
        .hero-noise { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.6;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 256px; }
        .hero-orb { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(80px); opacity: 0.35; }
        .orb-1 { width: 500px; height: 500px; top: -120px; left: -80px; background: radial-gradient(circle, rgba(39,174,96,0.5) 0%, transparent 70%); animation: orbFloat 14s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%); animation: orbFloat 18s ease-in-out infinite reverse; }
        .orb-3 { width: 300px; height: 300px; top: 50%; left: 55%; background: radial-gradient(circle, rgba(100,220,150,0.3) 0%, transparent 70%); animation: orbFloat 10s ease-in-out infinite 3s; }
        @keyframes orbFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.06); } }
        .hero-content { position: relative; z-index: 3; }
        .eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 22px; }
        .eyebrow-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
        .header-title { font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.1; color: #fff; margin-bottom: 20px; text-shadow: 0 2px 20px rgba(0,0,0,0.4); letter-spacing: -0.02em; }
        .header-title em { font-style: normal; background: linear-gradient(90deg, #6ee8a2, #a8f0c0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header-subtitle { font-size: 1.05rem; font-weight: 400; line-height: 1.7; color: rgba(220,240,228,0.75); max-width: 500px; margin: 0 auto 36px; letter-spacing: 0.01em; }
        .hero-divider { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .hero-divider span { height: 1px; width: 80px; background: rgba(201,168,76,0.5); }
        .hero-divider .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
        .hero-scroll-btn { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; padding: 0; }
        .scroll-btn-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); transition: color 0.3s ease; }
        .hero-scroll-btn:hover .scroll-btn-label { color: rgba(255,255,255,0.9); }
        .scroll-btn-icon { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); font-size: 0.9rem; transition: all 0.3s ease; animation: scrollBounce 2.2s ease-in-out infinite; background: rgba(255,255,255,0.05); }
        .hero-scroll-btn:hover .scroll-btn-icon { border-color: var(--green-mid); background: rgba(39,174,96,0.2); color: #fff; animation-play-state: paused; }
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 0.7; } 50% { transform: translateY(7px); opacity: 1; } }

        /* SECTION */
        .section-padding { padding: 50px 0 100px; }
        .section-head { margin-bottom: 40px; }
        .section-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green-mid); margin-bottom: 10px; }
        .section-title { font-size: 2rem; font-weight: 800; color: var(--text-dark); letter-spacing: -0.02em; border-left: 3px solid var(--green-mid); padding-left: 18px; margin: 0; }
        .container { width: 100%; padding: 0 24px; margin: 0 auto; }

        /* GRID */
        .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 30px; }

        /* NEWS CARD */
        .news-card {
          background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow-card);
          border: 1px solid var(--border); backdrop-filter: blur(14px); position: relative; overflow: hidden;
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2), box-shadow 0.45s ease, border-color 0.3s ease;
          display: flex; flex-direction: column; will-change: transform;
        }
        .news-card.reveal { opacity: 0; transform: translateY(40px) scale(0.98); }
        .news-card.reveal.active { opacity: 1; transform: translateY(0) scale(1); }
        .news-card.reveal.active:hover { transform: translateY(-10px) scale(1.01); box-shadow: var(--shadow-hover); border-color: rgba(39,174,96,0.3); transition-delay: 0s; }
        .card-shine { position: absolute; top: 0; left: -120%; width: 60%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); transition: left 0.65s ease; pointer-events: none; z-index: 5; }
        .news-card.reveal.active:hover .card-shine { left: 180%; }
        .news-image-container { padding: 16px 16px 0 16px; position: relative; z-index: 2; }
        .news-image { width: 100%; height: 220px; border-radius: 14px; overflow: hidden; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); background: #f0f4f2; }
        .news-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .placeholder-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #cbd5e1; }
        .news-card.reveal.active:hover .news-image img { transform: scale(1.08); }
        .news-date-badge { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); color: var(--green-deep); padding: 6px 12px; border-radius: 30px; font-size: 0.75rem; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px; z-index: 3; }
        .news-content { padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; position: relative; z-index: 3; }
        .news-title { font-size: 1.25rem; font-weight: 800; line-height: 1.35; color: var(--text-dark); margin: 0; transition: color 0.3s ease; }
        .news-card.reveal.active:hover .news-title { color: var(--green-deep); }
        .news-desc { font-size: 0.95rem; color: var(--text-soft); line-height: 1.65; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .news-footer { display: flex; align-items: center; margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(39,174,96,0.1); }
        .read-more { font-size: 0.85rem; font-weight: 700; color: var(--green-mid); display: flex; align-items: center; gap: 6px; transition: gap 0.3s ease; cursor: pointer; }
        .news-card.reveal.active:hover .read-more { gap: 10px; color: var(--green-deep); }

        /* EMPTY */
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 40px; color: var(--text-soft); }
        .empty-state i { font-size: 3rem; opacity: 0.4; margin-bottom: 20px; display: block; }
        .empty-state p { font-size: 1rem; }

        @media (max-width: 768px) {
          .section-head { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .client-search-wrap { max-width: 100%; }
        }

        @media (max-width: 640px) {
          .page-header { min-height: 100svh; padding: 0; }
          .header-title { font-size: 2rem; }
          .news-grid { grid-template-columns: 1fr; }
          .news-content { padding: 20px 16px; }
          .hero-scroll-btn { bottom: 28px; }
        }
      `}</style>
    </div>
  );
}