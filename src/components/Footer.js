'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; 
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const pathname = usePathname();
  const [content, setContent] = useState(null); // null yaparak verinin yüklenmesini beklediğimizi belirtiyoruz
  const { language, t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setContent(map);
      } else {
        setContent({});
      }
    }
    fetchData();
  }, []);

  const getDynamicContent = (key, defaultTranslationKey) => {
    if (!content) return ''; // Veri yüklenene kadar boş döndür (Gel-git yapmasını engeller)
    const enKey = `${key}_en`;
    if (language === 'en' && content[enKey]) {
      return content[enKey];
    }
    return content[key] || t(defaultTranslationKey);
  };

  // Eğer sayfa admin paneli veya giriş sayfası ise Footer'ı GİZLE
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/login'))) {
      return null;
  }

  // Veri Supabase'den gelene kadar Footer'ı gizli tut (Flicker/göz kırpma engellemesi)
  if (!content) return <footer className="site-footer" style={{ minHeight: '300px', backgroundColor: '#1a5c38' }}></footer>;

  return (
      <footer className="site-footer">
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet" />

          <div className="container footer-grid">
              
              <div className="footer-col">
                  <Link href="/" className="footer-logo">
                      {content.header_logo_image && (
                          <img 
                              src={content.header_logo_image} 
                              alt="Site Logo" 
                              className="footer-logo-image"
                          />
                      )}
                      <span className="footer-logo-text">
                          {content.header_logo_text || 'DIGI-GREEN'} 
                          <span className="highlight-green">
                              {content.header_logo_highlight || 'FUTURE'}
                          </span>
                      </span>
                  </Link>
                  
                  <p className="footer-desc">
                      {getDynamicContent('footer_desc', 'footer.defaultDesc')}
                  </p>
                  
                  <div className="social-icons">
                      {content.social_facebook && (
                          <a href={content.social_facebook} target="_blank" className="social-link" aria-label="Facebook">
                              <i className="fab fa-facebook-f"></i>
                          </a>
                      )}
                      {content.social_twitter && (
                          <a href={content.social_twitter} target="_blank" className="social-link" aria-label="Twitter">
                              <i className="fab fa-twitter"></i>
                          </a>
                      )}
                      {content.social_instagram && (
                          <a href={content.social_instagram} target="_blank" className="social-link" aria-label="Instagram">
                              <i className="fab fa-instagram"></i>
                          </a>
                      )}
                  </div>
              </div>
              
              <div className="footer-col">
                  <h4>{getDynamicContent('footer_column2_title', 'footer.quickMenu')}</h4>
                  <ul className="footer-links">
                      <li><Link href="/about">{getDynamicContent('about_general_title', 'nav.about')}</Link></li>
                      <li><Link href="/partners">{getDynamicContent('partners_page_title', 'nav.partners')}</Link></li>
                      <li><Link href="/results">{getDynamicContent('results_page_title', 'nav.files')}</Link></li>
                      <li><Link href="/contact">{getDynamicContent('contact_page_title', 'nav.contact')}</Link></li>
                  </ul>
              </div>
              
              <div className="footer-col">
                  <h4>{getDynamicContent('footer_column3_title', 'footer.contactTitle')}</h4>
                  <ul className="contact-list">
                      <li><i className="fas fa-envelope"></i> {content.contact_email || 'info@digigreen.eu'}</li>
                      <li><i className="fas fa-phone"></i> {content.contact_phone || '+90 282 717 10 10'}</li>
                  </ul>
              </div>
          </div>
          
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <img 
                      src={content.footer_eu_logo || "/assets/images/eu-flag.png"} 
                      alt="EU Flag" 
                      className="eu-flag-img"
                  />
                  <p className="eu-text">
                      {getDynamicContent('footer_disclaimer', 'footer.defaultDisclaimer')}
                  </p>
              </div>
          </div>

          <style jsx>{`
              .site-footer {
                  background-color: #1a5c38;
                  color: #e8f5ee;
                  padding-top: 60px;
                  font-size: 0.95rem;
                  animation: fadeIn 0.5s ease-in-out;
              }
              
              @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
              }

              .footer-grid {
                  display: grid;
                  grid-template-columns: 1.5fr 1fr 1fr;
                  gap: 40px;
                  padding-bottom: 50px;
              }

              .footer-logo { 
                  display: flex; 
                  align-items: center; 
                  gap: 12px; 
                  text-decoration: none; 
                  margin-bottom: 15px; 
                  flex-shrink: 0;
                  width: fit-content;
              }
              .footer-logo-image {
                  max-height: 45px;
                  width: auto;
                  object-fit: contain;
                  transition: transform 0.3s ease;
              }
              .footer-logo:hover .footer-logo-image {
                  transform: scale(1.05);
              }
              .footer-logo-text {
                  font-family: 'Caveat', cursive;
                  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
                  font-weight: 700;
                  color: white; 
                  white-space: nowrap;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  letter-spacing: 1px;
              }
              .highlight-green { color: #a8f0c0; }

              .footer-desc { line-height: 1.6; margin-bottom: 20px; max-width: 90%; opacity: 0.85; }
              .footer-col h4 { color: white; margin-bottom: 20px; font-size: 1.2rem; border-left: 3px solid #6ee8a2; padding-left: 15px; }
              .footer-links { list-style: none; padding: 0; margin: 0; }
              .footer-links li { margin-bottom: 10px; }
              .footer-links li a { color: #d4f0de; text-decoration: none; transition: 0.3s; }
              .footer-links li a:hover { color: #a8f0c0; padding-left: 5px; }
              .contact-list { list-style: none; padding: 0; margin: 0; }
              .contact-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
              .contact-list i { color: #6ee8a2; width: 20px; text-align: center; }
              .social-icons { display: flex; gap: 12px; margin-top: 20px; }
              .social-link {
                  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                  color: white; font-size: 1.1rem; transition: all 0.3s; background: rgba(255,255,255,0.15); 
                  text-decoration: none; border: 1px solid rgba(255,255,255,0.25);
              }
              .social-link:hover { transform: translateY(-3px); background: #27ae60; border-color: #27ae60; box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4); }
              
              .eu-disclaimer-bar { 
                  background: #0f3320; 
                  padding: 24px 0; 
                  border-top: 1px solid rgba(255,255,255,0.1); 
              }

              /* ── BAYRAK VE YAZI ── */
              .disclaimer-content { 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  gap: 15px;
              }
              .eu-flag-img {
                  height: 32px; /* 45px'den 32px'e düşürüldü */
                  width: auto;
                  object-fit: contain;
                  flex-shrink: 0;
              }
              .eu-text {
                  margin: 0;
                  font-size: 0.85rem;
                  color: #9dcfae;
                  line-height: 1.5;
                  text-align: center;
                  max-width: 800px;
              }

              @media (max-width: 768px) {
                  .footer-grid { grid-template-columns: 1fr; gap: 40px; }
                  .disclaimer-content { flex-direction: column; text-align: center; justify-content: center; gap: 12px; }
                  .eu-text { text-align: center; }
                  .eu-flag-img { height: 36px; } /* Mobilde çok azıcık daha belirgin olabilir */
              }
          `}</style>
      </footer>
  );
}