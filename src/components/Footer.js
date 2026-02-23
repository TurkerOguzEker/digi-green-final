'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [content, setContent] = useState({});

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setContent(map);
      }
    }
    fetchData();
  }, []);

  return (
      <footer className="site-footer">
          {/* Fontu Footer'da da garantiye almak için ekliyoruz */}
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet" />

          <div className="container footer-grid">
              
              <div className="footer-col">
                  {/* ✨ GÜNCELLENDİ: Header ile aynı mantıkta Flex, nowrap ve clamp kullanıldı */}
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
                      {content.footer_desc || 'Kapaklı Belediyesi liderliğinde yürütülen sürdürülebilir kalkınma projesi.'}
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
                  <h4>{content.footer_column2_title || 'Hızlı Menü'}</h4>
                  <ul className="footer-links">
                      <li><Link href="/about">Hakkında</Link></li>
                      <li><Link href="/partners">Ortaklar</Link></li>
                      <li><Link href="/results">Dosyalar</Link></li>
                      <li><Link href="/contact">İletişim</Link></li>
                  </ul>
              </div>
              
              <div className="footer-col">
                  <h4>{content.footer_column3_title || 'İletişim'}</h4>
                  <ul className="contact-list">
                      <li><i className="fas fa-envelope"></i> {content.contact_email || 'info@digigreen.eu'}</li>
                      <li><i className="fas fa-phone"></i> {content.contact_phone || '+90 282 717 10 10'}</li>
                  </ul>
              </div>
          </div>
          
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <img 
                      src={content.footer_eu_logo || "/assets/css/images/eu-flag.png.png"} 
                      alt="EU Flag" 
                      className="eu-flag-img"
                      onError={(e)=>e.target.style.display='none'} 
                  />
                  <p className="eu-text">
                      {content.footer_disclaimer || 'Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union.'}
                  </p>
              </div>
          </div>

          <style jsx>{`
              .site-footer {
                  background-color: #1a5c38;
                  color: #e8f5ee;
                  padding-top: 60px;
                  font-size: 0.95rem;
              }
              .footer-grid {
                  display: grid;
                  grid-template-columns: 1.5fr 1fr 1fr;
                  gap: 40px;
                  padding-bottom: 50px;
              }

              /* ✨ YENİ LOGO ALANI STİLLERİ ✨ */
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
                  font-size: clamp(1.4rem, 2.5vw, 1.8rem); /* Dinamik boyut */
                  font-weight: 700;
                  color: white; 
                  white-space: nowrap; /* Yazının alt satıra inmesini engeller */
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  letter-spacing: 1px;
              }
              .highlight-green { color: #a8f0c0; }

              .footer-desc { line-height: 1.6; margin-bottom: 20px; max-width: 90%; opacity: 0.85; }
              .footer-col h4 { color: white; margin-bottom: 20px; font-size: 1.2rem; border-left: 3px solid #6ee8a2; padding-left: 15px; }
              .footer-links { list-style: none; padding: 0; }
              .footer-links li { margin-bottom: 10px; }
              .footer-links li a { color: #d4f0de; text-decoration: none; transition: 0.3s; }
              .footer-links li a:hover { color: #a8f0c0; padding-left: 5px; }
              .contact-list { list-style: none; padding: 0; }
              .contact-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
              .contact-list i { color: #6ee8a2; width: 20px; text-align: center; }
              .social-icons { display: flex; gap: 12px; margin-top: 20px; }
              .social-link {
                  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                  color: white; font-size: 1.1rem; transition: all 0.3s; background: rgba(255,255,255,0.15); 
                  text-decoration: none; border: 1px solid rgba(255,255,255,0.25);
              }
              .social-link:hover { transform: translateY(-3px); background: #27ae60; border-color: #27ae60; box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4); }
              
              /* AB BİLGİLENDİRME ÇUBUĞU */
              .eu-disclaimer-bar { 
                  background: #0f3320; 
                  padding: 20px 0; 
                  border-top: 1px solid rgba(255,255,255,0.1); 
              }
              .disclaimer-content { 
                  display: flex; 
                  align-items: center; 
                  justify-content: flex-start; /* Sola dayalı */
                  gap: 20px;
              }
              .eu-flag-img {
                  height: 45px;
                  width: auto;
                  object-fit: contain;
                  flex-shrink: 0;
              }
              .eu-text {
                  margin: 0;
                  font-size: 0.85rem; 
                  color: #9dcfae;
                  line-height: 1.5;
                  text-align: left;
              }

              @media (max-width: 768px) {
                  .footer-grid { grid-template-columns: 1fr; gap: 30px; }
                  .disclaimer-content { flex-direction: column; text-align: center; justify-content: center; }
                  .eu-text { text-align: center; }
              }
          `}</style>
      </footer>
  );
}