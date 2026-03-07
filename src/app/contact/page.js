'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase'; 
import ScrollToTop from '../../components/ScrollToTop'; 
import { useLanguage } from '../../context/LanguageContext'; 
import ReCAPTCHA from 'react-google-recaptcha';
// ✨ Ortak animasyonları tek satırda dışarıdan çağırıyoruz ✨
import { NetworkBackground, HeroAnimation } from '../../components/BackgroundAnimations';
import '../globals.css';

export default function ContactPage() {
  const [content, setContent] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  
  // YÜKLENME STATE'İ
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Uyarı mesajlarını yönetmek için State
  const [alertInfo, setAlertInfo] = useState({ show: false, type: null }); 
  
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  const { language, t } = useLanguage();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setContent(map);
      }
      setLoading(false); // Veriler çekildikten sonra loading ekranını kapat
    }
    fetchSettings();
  }, []);

  // 5 Saniye Sonra Mesajı Yumuşakça Kapatan Fonksiyon
  const triggerAlert = (type) => {
    setAlertInfo({ show: true, type: type });
    setTimeout(() => {
      setAlertInfo(prev => ({ ...prev, show: false })); 
    }, 5000);
  };

  // Reveal Animasyonu Gözlemcisi
  useEffect(() => {
    if (loading) return; 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { 
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal:not(.active)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, content]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    if(value && alertInfo.type === 'captcha_error') {
       setAlertInfo({ show: false, type: null }); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!captchaValue) {
      triggerAlert('captcha_error');
      return; 
    }

    setSending(true);
    setAlertInfo({ show: false, type: null });

    try {
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;
      
      triggerAlert('success'); 
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaValue(null);

    } catch {
      triggerAlert('error'); 
    } finally {
      setSending(false);
    }
  };

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

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  return (
    <div className="contact-page">
      {/* ✨ Ortak Arka Plan Ağı Bileşeni ✨ */}
      <NetworkBackground />

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring"><div></div><div></div><div></div><div></div></div>
          <span className="loader-text">{t('contact.loading') || 'Yükleniyor...'}</span>
        </div>
      ) : (
        <>
          <section className="page-header">
            {/* ✨ Ortak Yaprak Animasyonu Bileşeni ✨ */}
            <HeroAnimation />
            <div className="hero-noise"></div>
            <div className="hero-orb orb-1"></div>
            <div className="hero-orb orb-2"></div>
            <div className="hero-orb orb-3"></div>

            <div className="container hero-content">
              <div className="eyebrow reveal active">
                <span className="eyebrow-dot"></span>{getDynamicContent('contact_hero_eyebrow', 'contact.hero.eyebrow')}<span className="eyebrow-dot"></span>
              </div>
              <h1 className="header-title reveal active">
                {getDynamicContent('contact_hero_title1', 'contact.hero.title1')}<br />
                <em>{getDynamicContent('contact_hero_title2', 'contact.hero.title2')}</em>
              </h1>
              <p className="header-subtitle reveal active" style={{ transitionDelay: '0.25s' }}>
                {getDynamicContent('contact_page_desc', 'contact.hero.desc')}
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
              <span className="scroll-btn-label">{getDynamicContent('contact_hero_scroll', 'contact.hero.scrollBtn')}</span>
              <span className="scroll-btn-icon"><i className="fas fa-chevron-down"></i></span>
            </button>
          </section>

          <section id="icerik" className="section-padding">
            <div className="container" style={{ maxWidth: '1100px' }}>

              <div className="section-head reveal">
                <p className="section-label">{getDynamicContent('contact_sec_label', 'contact.section.label')}</p>
                <h2 className="section-title">{getDynamicContent('contact_sec_title', 'contact.section.title')}</h2>
              </div>

              <div className="contact-grid">

                <div className="info-card reveal">
                  <h3 className="card-heading">{getDynamicContent('contact_info_title', 'contact.info.title')}</h3>

                  <ul className="info-list">
                    <li className="info-item">
                      <div className="info-icon"><i className="fas fa-map-marker-alt"></i></div>
                      <div>
                        <span className="info-label">{t('contact.info.address')}</span>
                        <span className="info-value">
                          {(language === 'en' && content.contact_address_en) ? content.contact_address_en : (content.contact_address || '—')}
                        </span>
                      </div>
                    </li>
                    <li className="info-item">
                      <div className="info-icon"><i className="fas fa-envelope"></i></div>
                      <div>
                        <span className="info-label">{t('contact.info.email')}</span>
                        <a href={`mailto:${content.contact_email}`} className="info-value info-link">
                          {content.contact_email || '—'}
                        </a>
                      </div>
                    </li>
                    <li className="info-item">
                      <div className="info-icon"><i className="fas fa-phone"></i></div>
                      <div>
                        <span className="info-label">{t('contact.info.phone')}</span>
                        <span className="info-value">{content.contact_phone || '—'}</span>
                      </div>
                    </li>
                  </ul>

                  <div className="social-section">
                    <p className="social-heading">{getDynamicContent('contact_social_title', 'contact.social.title')}</p>
                    <div className="social-row">
                      {content.social_facebook && (
                        <a href={content.social_facebook} target="_blank" rel="noopener noreferrer" className="social-btn" title="Facebook">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                      )}
                      {content.social_twitter && (
                        <a href={content.social_twitter} target="_blank" rel="noopener noreferrer" className="social-btn" title="Twitter / X">
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                      {content.social_instagram && (
                        <a href={content.social_instagram} target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram">
                          <i className="fab fa-instagram"></i>
                        </a>
                      )}
                      {!content.social_facebook && !content.social_twitter && !content.social_instagram && (
                        <span className="social-empty">{t('contact.social.empty')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-card reveal">
                  <h3 className="card-heading">{getDynamicContent('contact_form_title', 'contact.form.title')}</h3>

                  <div className={`alert-wrapper ${alertInfo.show ? 'show' : ''}`}>
                    {alertInfo.type === 'success' && (
                      <div className="alert alert-success">
                        <i className="fas fa-check-circle"></i>
                        {getDynamicContent('contact_form_success', 'contact.form.success')}
                      </div>
                    )}
                    {alertInfo.type === 'error' && (
                      <div className="alert alert-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {getDynamicContent('contact_form_error', 'contact.form.error')}
                      </div>
                    )}
                    {alertInfo.type === 'captcha_error' && (
                      <div className="alert alert-error">
                        <i className="fas fa-robot"></i>
                        Lütfen mesajı göndermeden önce robot olmadığınızı doğrulayın!
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('contact.form.nameLabel')}</label>
                        <input type="text" name="name" required placeholder={t('contact.form.namePlaceholder')}
                          value={formData.name} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>{t('contact.form.emailLabel')}</label>
                        <input type="email" name="email" required placeholder={t('contact.form.emailPlaceholder')}
                          value={formData.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>{t('contact.form.subjectLabel')}</label>
                      <input type="text" name="subject" required placeholder={t('contact.form.subjectPlaceholder')}
                        value={formData.subject} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>{t('contact.form.messageLabel')}</label>
                      <textarea name="message" rows={5} required placeholder={t('contact.form.messagePlaceholder')}
                        value={formData.message} onChange={handleChange}></textarea>
                    </div>

                    <div className="captcha-container" style={{ marginBottom: '20px' }}>
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={recaptchaSiteKey}
                        onChange={handleCaptchaChange}
                        hl={language === 'en' ? 'en' : 'tr'}
                      />
                    </div>

                    <button type="submit" className="submit-btn" disabled={sending}>
                      {sending ? (
                        <><i className="fas fa-circle-notch fa-spin"></i> {t('contact.form.sending')}</>
                      ) : (
                        <><span>{getDynamicContent('contact_form_btn', 'contact.form.sendBtn')}</span><span className="btn-icon"><i className="fas fa-paper-plane"></i></span></>
                      )}
                    </button>
                    
                  </form>
                </div>

              </div>
            </div>
          </section>
        </>
      )}

      <ScrollToTop />
      <style jsx>{`
        .contact-page {
          font-family: 'Inter', sans-serif; overflow-x: hidden;
          --green-deep: #1e9448; --green-mid: #2DB55D; --green-light: #52d47a;
          --green-pale: #e6f7ed; --cream: #f4f6f8; --primary: #003399;
          --gold: #c9a84c; --text-dark: #1a1a1a; --text-mid: #3d5448; --text-soft: #6b8277;
          --card-bg: rgba(255,255,255,0.9); --border: rgba(45,181,93,0.15);
          --shadow-card: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --shadow-hover: 0 20px 60px rgba(30,148,72,0.14), 0 4px 16px rgba(0,0,0,0.05);
          --radius: 20px;
        }
        
        /* ✨ LOADER CSS ✨ */
        .loading-screen { 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          gap: 24px;
          background: transparent; 
          position: relative;
          z-index: 10;
        }
        .loader-ring { display: inline-block; position: relative; width: 60px; height: 60px; }
        .loader-ring div { box-sizing: border-box; display: block; position: absolute; width: 46px; height: 46px; margin: 7px; border: 3px solid transparent; border-top-color: var(--green-mid); border-radius: 50%; animation: loader-spin 1.2s cubic-bezier(0.5,0,0.5,1) infinite; }
        .loader-ring div:nth-child(1){ animation-delay: -0.45s; } 
        .loader-ring div:nth-child(2){ animation-delay: -0.3s; border-top-color: var(--gold); } 
        .loader-ring div:nth-child(3){ animation-delay: -0.15s; }
        .loader-text { font-size: 0.9rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.1em; text-transform: uppercase; }
        @keyframes loader-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* HERO */
        .page-header {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; text-align:center; overflow:hidden;
          background: linear-gradient(160deg, #071a0f 0%, #0f3320 35%, #1a5c38 65%, #0d2b1f 100%);
        }
        .hero-noise { position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.6; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:256px; }
        .hero-orb { position:absolute; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); opacity:0.35; }
        .orb-1 { width:500px; height:500px; top:-120px; left:-80px; background:radial-gradient(circle,rgba(45,181,93,0.5) 0%,transparent 70%); animation:orbFloat 14s ease-in-out infinite; }
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
        .hero-scroll-btn:hover .scroll-btn-icon { border-color:var(--green-mid); background:rgba(45,181,93,0.2); color:#fff; animation-play-state:paused; }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0);opacity:0.7;} 50%{transform:translateY(7px);opacity:1;} }

        /* SECTION */
        .section-padding { padding:48px 0 80px; position:relative; z-index:1; }
        .section-head { margin-bottom:36px; }
        .section-label { font-size:0.75rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--green-mid); margin-bottom:8px; }
        .section-title { font-size:2rem; font-weight:800; color:var(--text-dark); letter-spacing:-0.02em; border-left:3px solid var(--green-mid); padding-left:18px; margin:0; }
        .container { width:100%; padding:0 24px; margin:0 auto; }

        /* GRID */
        .contact-grid { display:grid; grid-template-columns:1fr 1.5fr; gap:28px; }

        /* KARTLAR */
        .info-card, .form-card {
          background:var(--card-bg); backdrop-filter:blur(14px);
          border-radius:var(--radius); box-shadow:var(--shadow-card);
          border:1px solid var(--border); padding:36px;
          transition:box-shadow 0.3s ease;
        }
        .info-card:hover, .form-card:hover { box-shadow:var(--shadow-hover); }
        .card-heading { font-size:1.15rem; font-weight:800; color:var(--text-dark); margin:0 0 28px; padding-bottom:16px; border-bottom:1px solid rgba(45,181,93,0.12); }

        /* İletişim listesi */
        .info-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:22px; }
        .info-item { display:flex; align-items:flex-start; gap:16px; }
        .info-icon { width:42px; height:42px; border-radius:12px; flex-shrink:0; background:var(--green-pale); color:var(--green-deep); display:flex; align-items:center; justify-content:center; font-size:1rem; border:1px solid rgba(45,181,93,0.2); }
        .info-label { display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-soft); margin-bottom:3px; }
        .info-value { display:block; font-size:0.95rem; color:var(--text-dark); font-weight:500; line-height:1.5; }
        .info-link { color:var(--green-deep); text-decoration:none; }
        .info-link:hover { text-decoration:underline; }

        /* Sosyal */
        .social-section { margin-top:28px; padding-top:22px; border-top:1px solid rgba(45,181,93,0.12); }
        .social-heading { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-soft); margin:0 0 14px; }
        .social-row { display:flex; gap:10px; flex-wrap:wrap; }
        .social-btn { width:42px; height:42px; border-radius:12px; background:var(--green-deep); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1rem; text-decoration:none; transition:transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease; box-shadow:0 3px 8px rgba(30,148,72,0.2); }
        .social-btn:hover { transform:translateY(-3px); background:var(--green-mid); box-shadow:0 6px 16px rgba(45,181,93,0.3); }
        .social-empty { font-size:0.85rem; color:#aaa; font-style:italic; }

        /* FORM */
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { margin-bottom:18px; }
        .form-group label { display:block; margin-bottom:7px; font-size:0.82rem; font-weight:600; color:var(--text-mid); letter-spacing:0.02em; }
        .form-group input, .form-group textarea { width:100%; padding:11px 14px; box-sizing:border-box; border:1.5px solid rgba(45,181,93,0.2); border-radius:10px; font-family:'Inter',sans-serif; font-size:0.95rem; color:var(--text-dark); background:rgba(248,252,249,0.8); transition:border-color 0.25s, box-shadow 0.25s; outline:none; resize:vertical; }
        .form-group input:focus, .form-group textarea:focus { border-color:var(--green-mid); box-shadow:0 0 0 3px rgba(45,181,93,0.12); background:#fff; }
        .form-group input::placeholder, .form-group textarea::placeholder { color:#b0bfb8; }

        .submit-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; border-radius:10px; overflow:hidden; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.95rem; font-weight:700; color:#fff; width:100%; margin-top:4px; padding:14px 20px; background:var(--green-deep); transition:background 0.3s, transform 0.2s; }
        .submit-btn:disabled { opacity:0.7; cursor:not-allowed; transform: none; box-shadow: none; }
        .submit-btn span:first-child { flex: none; padding: 0; background: transparent; text-align: center; }
        .submit-btn .btn-icon { padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; }
        .submit-btn:not(:disabled):hover { background:#166336; transform: translateY(-2px); }
        .submit-btn:not(:disabled):hover .btn-icon i { transform: translateX(4px); transition: transform 0.3s; }
        
        .alert-wrapper { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.4s ease-out, opacity 0.4s ease-out, margin 0.4s ease-out; margin-bottom: 0; }
        .alert-wrapper.show { max-height: 100px; opacity: 1; margin-bottom: 20px; }
        .alert { display:flex; align-items:flex-start; gap:10px; padding:14px 16px; border-radius:10px; font-size:0.9rem; font-weight:500; line-height:1.5; }
        .alert i { margin-top:2px; flex-shrink:0; }
        .alert-success { background:rgba(45,181,93,0.1); color:var(--green-deep); border:1px solid rgba(45,181,93,0.25); }
        .alert-error { background:rgba(231,76,60,0.08); color:#c0392b; border:1px solid rgba(231,76,60,0.2); }

        .reveal { opacity:0; transform:translateY(40px); transition:opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1); }
        .reveal.active { opacity:1; transform:translateY(0); }

        @media (max-width: 900px) {
          .contact-grid { grid-template-columns:1fr; }
          .form-row { grid-template-columns:1fr; }
        }
        @media (max-width: 640px) {
          .page-header { min-height:100svh; }
          .header-title { font-size:2rem; }
          .info-card, .form-card { padding:24px; }
          .hero-scroll-btn { bottom:28px; }
          .captcha-container { transform: scale(0.9); transform-origin: 0 0; }
        }
      `}</style>
    </div>
  );
}