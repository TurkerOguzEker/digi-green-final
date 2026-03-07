'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ScrollToTop from '../../components/ScrollToTop';
import { useLanguage } from '../../context/LanguageContext';
import { NetworkBackground, HeroAnimation } from '../../components/BackgroundAnimations';

export default function PartnersPage() {
  const [content, setContent] = useState({});
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dil fonksiyonlarını alıyoruz
  const { language, t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      // Önce ayarları çek
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const map = {}; settingsData.forEach(item => map[item.key] = item.value);
        setContent(map);
      }

      // Sonra ortakları çek
      const { data: partnersData } = await supabase.from('partners').select('*').order('id');
      if (partnersData) setPartners(partnersData);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .reveal-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, partners]);

  // ✨ AKILLI YEDEKLEME
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

  return (
    <div className="partners-page">
      <NetworkBackground />

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring"><div></div><div></div><div></div><div></div></div>
          <span className="loader-text">{t('partners.loading')}</span>
        </div>
      ) : (
        <>
          <section className="page-header">
            <HeroAnimation />
            <div className="hero-noise"></div>
            <div className="hero-orb orb-1"></div>
            <div className="hero-orb orb-2"></div>
            <div className="hero-orb orb-3"></div>

            <div className="container hero-content">
              <div className="eyebrow reveal active">
                <span className="eyebrow-dot"></span>{getDynamicContent('partners_hero_eyebrow', 'partners.hero.eyebrow')}<span className="eyebrow-dot"></span>
              </div>
              <h1 className="header-title reveal active">
                {getDynamicContent('partners_hero_title1', 'partners.hero.title1')}<br /><em>{getDynamicContent('partners_hero_title2', 'partners.hero.title2')}</em>
              </h1>
              <p className="header-subtitle reveal active" style={{ transitionDelay: '0.25s' }}>
                {getDynamicContent('partners_page_desc', 'partners.hero.desc')}
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
              <span className="scroll-btn-label">{getDynamicContent('partners_hero_scroll', 'partners.hero.scrollBtn')}</span>
              <span className="scroll-btn-icon"><i className="fas fa-chevron-down"></i></span>
            </button>
          </section>

          <section id="icerik" className="section-padding">
            <div className="container" style={{ maxWidth: '1100px' }}>
              <div className="section-head reveal-up">
                <p className="section-label">{getDynamicContent('partners_sec_label', 'partners.section.label')}</p>
                <h2 className="section-title">{getDynamicContent('partners_sec_title', 'partners.section.title')}</h2>
              </div>

              <div className="partners-list">
                {partners.length === 0 ? (
                  <div className="empty-state reveal-up">
                    <i className="fas fa-users"></i>
                    <p>{t('partners.list.empty')}</p>
                  </div>
                ) : (
                  partners.map((partner, index) => {
                    const isReverse = index % 2 !== 0;
                    const animationClass = isReverse ? 'reveal-right' : 'reveal-left';
                    const isCoordinator = partner.role === 'Koordinatör' || partner.role === 'Coordinator';

                    // ✨ YENİ: Dile göre veritabanından veri çekiyoruz
                    const displayName = language === 'en' && partner.name_en ? partner.name_en : partner.name;
                    const displayCountry = language === 'en' && partner.country_en ? partner.country_en : partner.country;
                    const displayDesc = language === 'en' && partner.description_en ? partner.description_en : partner.description;
                    const displayRole = language === 'en' && partner.role_en ? partner.role_en : (partner.role || t('partners.list.partner'));

                    return (
                      <div key={partner.id} className={`partner-row reveal ${animationClass} ${isReverse ? 'row-reverse' : ''}`}>
                        <div className="card-shine"></div>

                        <div className="partner-identity-side">
                          <div className="logo-box">
                            {partner.image_url
                              ? <img src={partner.image_url} alt={displayName} />
                              : <i className="fas fa-building fa-4x" style={{ color: '#c9a84c' }}></i>}
                          </div>
                          <div className="identity-info">
                            <h2 className="partner-name">
                                {displayName}
                            </h2>
                            <div className="tags-wrapper">
                              <span className={`status-tag ${isCoordinator ? 'coordinator-tag' : ''}`}>
                                <span className={`status-dot ${isCoordinator ? 'coordinator-dot' : ''}`}></span>
                                {displayRole}
                              </span>
                              <div className="country-tag">
                                {partner.flag_url && <img src={partner.flag_url} alt={displayCountry} />}
                                <span>{displayCountry}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="partner-content-side">
                          <div className="content-inner">
                            <h4 className="about-title">{t('partners.list.aboutTitle')}</h4>
                            
                            {displayDesc
                              ? <p className="partner-desc">{displayDesc}</p>
                              : <p className="partner-desc empty-desc">{t('partners.list.emptyDesc')}</p>}
                            
                            {/* ✨ DÜZELTME: Buton tamamen merkeze (ortaya) hizalandı ✨ */}
                            <div className="button-group" style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', width: '100%' }}>
                              
                              {partner.website && (
                                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="action-btn">
                                  <span>{t('partners.list.websiteBtn')}</span>
                                  <span className="btn-icon"><i className="fas fa-arrow-right"></i></span>
                                </a>
                              )}
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </>
      )}
    <ScrollToTop />
      <style jsx>{`
        .partners-page {
          font-family: 'Inter', sans-serif; overflow-x: hidden;
          --green-deep: #1a5c38; --green-mid: #27ae60; --green-light: #4cd680;
          --green-pale: #e8f5ee; --cream: #f4f6f8; --primary: #003399;
          --gold: #c9a84c; --text-dark: #1a1a1a; --text-mid: #3d5448; --text-soft: #6b8277;
          --card-bg: rgba(255,255,255,0.88); --border: rgba(39,174,96,0.15);
          --shadow-card: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --shadow-hover: 0 20px 60px rgba(26,92,56,0.18), 0 4px 16px rgba(0,0,0,0.06);
          --radius: 20px;
        }

      
       /* LOADER (ZARİF VE ŞEFFAF YAPI) */
        .loading-screen { 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          gap: 24px;
          background: transparent; /* Arka planı tamamen şeffaf yaptık ki ağ animasyonu görünsün */
          position: relative;
          z-index: 10;
        }
        .loader-ring { 
          display: inline-block; 
          position: relative; 
          width: 60px; 
          height: 60px; 
        }
        .loader-ring div { 
          box-sizing: border-box; 
          display: block; 
          position: absolute; 
          width: 46px; 
          height: 46px; 
          margin: 7px; 
          border: 3px solid transparent; 
          border-top-color: var(--green-mid); 
          border-radius: 50%; 
          animation: loader-spin 1.2s cubic-bezier(0.5,0,0.5,1) infinite; 
        }
        .loader-ring div:nth-child(1){ animation-delay: -0.45s; } 
        .loader-ring div:nth-child(2){ animation-delay: -0.3s; border-top-color: var(--gold); } 
        .loader-ring div:nth-child(3){ animation-delay: -0.15s; }
        .loader-text { 
          font-size: 0.9rem; 
          font-weight: 600; 
          color: var(--text-soft); 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
        }
        @keyframes loader-spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }

        /* REVEAL */
        .reveal { opacity:0; transition:all 1s cubic-bezier(0.165,0.84,0.44,1); }
        .reveal.active { opacity:1; transform:translate(0,0); }
        .reveal-left { transform:translateX(-80px); }
        .reveal-right { transform:translateX(80px); }
        .reveal-up { opacity:0; transform:translateY(30px); transition:all 0.8s ease; }
        .reveal-up.active { opacity:1; transform:translateY(0); }

        /* HERO */
        .page-header {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; text-align:center; overflow:hidden;
          background:linear-gradient(160deg,#071a0f 0%,#0f3320 35%,#1a5c38 65%,#0d2b1f 100%);
        }
        .hero-noise { position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.6;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:256px; }
        .hero-orb { position:absolute; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); opacity:0.35; }
        .orb-1 { width:500px; height:500px; top:-120px; left:-80px; background:radial-gradient(circle,rgba(39,174,96,0.5) 0%,transparent 70%); animation:orbFloat 14s ease-in-out infinite; }
        .orb-2 { width:400px; height:400px; bottom:-100px; right:-60px; background:radial-gradient(circle,rgba(201,168,76,0.4) 0%,transparent 70%); animation:orbFloat 18s ease-in-out infinite reverse; }
        .orb-3 { width:300px; height:300px; top:50%; left:55%; background:radial-gradient(circle,rgba(100,220,150,0.3) 0%,transparent 70%); animation:orbFloat 10s ease-in-out infinite 3s; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.06);} }

        .hero-content { position:relative; z-index:3; }
        .eyebrow { display:inline-flex; align-items:center; gap:12px; font-size:0.75rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); margin-bottom:22px; }
        .eyebrow-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--gold); }
        .header-title { font-size:clamp(2.2rem,5vw,3.8rem); font-weight:800; line-height:1.1; color:#fff; margin-bottom:20px; text-shadow:0 2px 20px rgba(0,0,0,0.4); letter-spacing:-0.02em; }
        .header-title em { font-style:normal; background:linear-gradient(90deg,#6ee8a2,#a8f0c0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .header-subtitle { font-size:1.05rem; font-weight:400; line-height:1.7; color:rgba(220,240,228,0.75); max-width:500px; margin:0 auto 36px; letter-spacing:0.01em; }
        .hero-divider { display:flex; align-items:center; justify-content:center; gap:16px; }
        .hero-divider span { height:1px; width:80px; background:rgba(201,168,76,0.5); }
        .hero-divider .dot { width:6px; height:6px; border-radius:50%; background:var(--gold); }

        .hero-scroll-btn { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); z-index:3; display:flex; flex-direction:column; align-items:center; gap:10px; background:none; border:none; cursor:pointer; padding:0; }
        .scroll-btn-label { font-size:0.72rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.55); transition:color 0.3s ease; }
        .hero-scroll-btn:hover .scroll-btn-label { color:rgba(255,255,255,0.9); }
        .scroll-btn-icon { width:44px; height:44px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.7); font-size:0.9rem; transition:all 0.3s ease; animation:scrollBounce 2.2s ease-in-out infinite; background:rgba(255,255,255,0.05); }
        .hero-scroll-btn:hover .scroll-btn-icon { border-color:var(--green-mid); background:rgba(39,174,96,0.2); color:#fff; animation-play-state:paused; }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0);opacity:0.7;} 50%{transform:translateY(7px);opacity:1;} }

        /* ── SECTION ────────────────────────────────── */
        .section-padding { padding: 48px 0 72px; position: relative; z-index: 1; }
        .section-head { margin-bottom: 32px; }
        .section-label { font-size:0.75rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--green-mid); margin-bottom:8px; }
        .section-title { font-size:2rem; font-weight:800; color:var(--text-dark); letter-spacing:-0.02em; border-left:3px solid var(--green-mid); padding-left:18px; margin:0; }

        /* ── KARTLAR ARASI ─────────────────────────────────── */
        .partners-list { display:flex; flex-direction:column; gap: 28px; padding: 0; }

        .partner-row {
          display:flex; align-items:stretch; gap:0;
          background:var(--card-bg); backdrop-filter:blur(14px);
          border-radius:20px; box-shadow:var(--shadow-card);
          transition:transform 0.4s ease, box-shadow 0.4s ease;
          position:relative; z-index:2;
          border:1px solid var(--border); overflow:hidden;
        }
        .partner-row:hover { transform:translateY(-4px); box-shadow:var(--shadow-hover); border-color:rgba(39,174,96,0.3); }
        .partner-row.row-reverse { flex-direction:row-reverse; }

        .card-shine { position:absolute; top:0; left:-120%; width:60%; height:100%; background:linear-gradient(to right,rgba(255,255,255,0) 0%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0) 100%); transform:skewX(-20deg); transition:left 0.7s ease; pointer-events:none; z-index:1; }
        .partner-row:hover .card-shine { left:180%; }

        /* KİMLİK TARAF */
        .partner-identity-side {
          flex: 0 0 280px;
          display:flex; flex-direction:column; align-items:center; text-align:center;
          padding: 32px 28px;
          border-right:1px solid rgba(39,174,96,0.1);
          position:relative; z-index:2;
          background: rgba(248,252,249,0.6);
        }
        .partner-row.row-reverse .partner-identity-side { border-right:none; border-left:1px solid rgba(39,174,96,0.1); }

        .logo-box {
          width:100%; height:180px;
          background:#fff; display:flex; align-items:center; justify-content:center;
          padding:16px; margin-bottom:20px; border-radius:14px;
          box-shadow:0 3px 10px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.04);
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .logo-box img { max-width:90%; max-height:90%; object-fit:contain; }
        .partner-row:hover .logo-box { transform:scale(1.04) rotate(-2deg); }

        .identity-info { width:100%; }
        .partner-name { font-size:1.2rem; font-weight:800; color:var(--text-dark); margin-bottom:12px; line-height:1.3; }
        .tags-wrapper { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .status-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 13px; border-radius:50px; background:var(--green-pale); color:var(--green-deep); font-size:0.78rem; font-weight:600; border:1px solid rgba(39,174,96,0.2); }
        .status-dot { width:6px; height:6px; border-radius:50%; background:var(--green-mid); }
        .coordinator-tag { background:rgba(201,168,76,0.1); color:#8a712c; border-color:rgba(201,168,76,0.3); }
        .coordinator-dot { background:var(--gold); animation:statusPulse 2s ease-in-out infinite; }
        @keyframes statusPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .country-tag { display:flex; align-items:center; justify-content:center; gap:8px; color:var(--text-soft); font-size:0.9rem; font-weight:600; background:#fff; padding:5px 14px; border-radius:20px; border:1px solid #e2e8f0; }
        .country-tag img { width:20px; height:20px; border-radius:50%; object-fit:cover; }

        /* İÇERİK TARAF */
        .partner-content-side { flex:1; display:flex; flex-direction:column; position:relative; z-index:2; padding: 32px 36px; }
        .content-inner { display: flex; flex-direction: column; height: 100%; }
        /* ⬇️ BURAYI DÜZELTTİK: Başlık sola yaslı */
        .about-title { font-size:0.78rem; text-transform:uppercase; letter-spacing:2px; color:var(--green-mid); font-weight:800; margin-bottom:12px; text-align: left; }
        /* ⬇️ BURAYI DÜZELTTİK: Metin sola yaslı */
        .partner-desc { color:var(--text-soft); font-size:1rem; line-height:1.75; margin-bottom:24px; white-space:pre-wrap; text-align: left; }
        .empty-desc { font-style:italic; color:#999; }

        /* BUTON GRUBU VE BUTONLAR */
        .action-btn { display:inline-flex; align-items:center; gap:0; border-radius:10px; overflow:hidden; text-decoration:none; font-size:0.88rem; font-weight:600; color:white; border:none; cursor:pointer; width:fit-content; }
        .action-btn span:first-child { padding:9px 16px; background:var(--green-deep); transition:background 0.25s; }
        .btn-icon { padding:9px 13px; background:var(--green-mid); transition:background 0.25s,transform 0.3s; display:flex; align-items:center; }
        .btn-icon i { transition:transform 0.3s; }
        .action-btn:hover span:first-child { background:#0f3320; }
        .action-btn:hover .btn-icon { background:var(--green-deep); }
        .action-btn:hover .btn-icon i { transform:translateX(4px); }

        .empty-state { text-align:center; padding:60px 40px; color:var(--text-soft); }
        .empty-state i { font-size:3rem; opacity:0.4; margin-bottom:16px; display:block; }

        .container { width:100%; padding:0 24px; margin:0 auto; }

        @media (max-width: 900px) {
          .partner-row, .partner-row.row-reverse { flex-direction:column !important; }
          .partner-identity-side, .partner-row.row-reverse .partner-identity-side {
            width:100%; flex:none; border-right:none; border-left:none;
            border-bottom:1px solid rgba(39,174,96,0.1);
            padding: 24px 24px 24px 24px;
          }
          .logo-box { height:160px; }
          .partner-content-side { padding: 24px; }
          .reveal-left, .reveal-right { transform:translateY(30px); }
        }
        @media (max-width: 640px) {
          .page-header { min-height:100svh; }
          .section-padding { padding: 36px 0 56px; }
          .partners-list { gap: 20px; }
          .hero-scroll-btn { bottom:28px; }
        }
      `}</style>
    </div>
  );
}