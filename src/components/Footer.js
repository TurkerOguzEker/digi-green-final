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
          <div className="container footer-grid">
              
              {/* 1. KOLON: LOGO & AÇIKLAMA */}
              <div className="footer-col">
                  <Link href="/" className="footer-logo">
                      {content.header_logo_text || 'DIGI-GREEN'} <span className="highlight-green">{content.header_logo_highlight || 'FUTURE'}</span>
                  </Link>
                  <p className="footer-desc">
                      {content.footer_desc || 'Kapaklı Belediyesi liderliğinde yürütülen sürdürülebilir kalkınma projesi.'}
                  </p>
                  
                  {/* SOSYAL MEDYA İKONLARI (Lacivert Uyumlu) */}
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
              
              {/* 2. KOLON: HIZLI MENÜ */}
              <div className="footer-col">
                  <h4>{content.footer_column2_title || 'Hızlı Menü'}</h4>
                  <ul className="footer-links">
                      <li><Link href="/about">Proje Hakkında</Link></li>
                      <li><Link href="/partners">Ortaklar</Link></li>
                      <li><Link href="/results">Eğitim Materyalleri</Link></li>
                      <li><Link href="/contact">İletişim</Link></li>
                  </ul>
              </div>
              
              {/* 3. KOLON: İLETİŞİM */}
              <div className="footer-col">
                  <h4>{content.footer_column3_title || 'İletişim'}</h4>
                  <ul className="contact-list">
                      <li><i className="fas fa-envelope"></i> {content.contact_email || 'info@digigreen.eu'}</li>
                      <li><i className="fas fa-phone"></i> {content.contact_phone || '...'}</li>
                  </ul>
              </div>
          </div>
          
          {/* AB LOGO VE METİN */}
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <img src="/assets/images/eu-flag.png" alt="EU Flag" width="45" style={{marginRight:'15px'}} onError={(e)=>e.target.style.display='none'} />
                  <p>{content.footer_disclaimer || 'Co-funded by the European Union.'}</p>
              </div>
          </div>

          <style jsx>{`
              .site-footer {
                  background-color: #0b1e3b; /* Koyu Lacivert Arka Plan */
                  color: #dbe4ef;
                  padding-top: 60px;
                  font-size: 0.95rem;
              }
              .footer-grid {
                  display: grid;
                  grid-template-columns: 1.5fr 1fr 1fr;
                  gap: 40px;
                  padding-bottom: 50px;
              }
              
              .footer-logo {
                  font-size: 1.8rem;
                  font-weight: 800;
                  color: white;
                  text-decoration: none;
                  display: inline-block;
                  margin-bottom: 15px;
              }
              .highlight-green { color: #2ecc71; } /* Yeşil vurgu */
              
              .footer-desc {
                  line-height: 1.6;
                  margin-bottom: 20px;
                  max-width: 90%;
                  opacity: 0.8;
              }

              .footer-col h4 {
                  color: white;
                  margin-bottom: 20px;
                  font-size: 1.2rem;
                  border-left: 3px solid #2ecc71;
                  padding-left: 15px;
              }

              .footer-links { list-style: none; padding: 0; }
              .footer-links li { margin-bottom: 10px; }
              .footer-links li a { 
                  color: #dbe4ef; 
                  text-decoration: none; 
                  transition: 0.3s; 
              }
              .footer-links li a:hover { color: #2ecc71; padding-left: 5px; }

              .contact-list { list-style: none; padding: 0; }
              .contact-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
              .contact-list i { color: #2ecc71; width: 20px; text-align: center; }

              /* SOSYAL MEDYA BUTONLARI (GÜNCELLENDİ) */
              .social-icons { display: flex; gap: 12px; margin-top: 20px; }
              .social-link {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 1.1rem;
                  transition: all 0.3s;
                  background: rgba(255,255,255,0.1); /* Şeffaf beyaz */
                  text-decoration: none;
                  border: 1px solid rgba(255,255,255,0.2);
              }
              .social-link:hover { 
                  transform: translateY(-3px); 
                  background: #2ecc71; /* Hover'da Yeşil */
                  border-color: #2ecc71;
                  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
              }
              
              .eu-disclaimer-bar {
                  background: #051021; /* Çok koyu lacivert */
                  padding: 20px 0;
                  border-top: 1px solid rgba(255,255,255,0.05);
              }
              .disclaimer-content {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  font-size: 0.85rem;
                  color: #8fa1b8;
              }

              @media (max-width: 768px) {
                  .footer-grid { grid-template-columns: 1fr; gap: 30px; }
                  .disclaimer-content { flex-direction: column; gap: 10px; }
              }
          `}</style>
      </footer>
  );
}