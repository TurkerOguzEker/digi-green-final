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
              <div className="footer-col">
                  <h3>
                      {content.header_logo_text || 'DIGI-GREEN'} <span className="highlight-green">{content.header_logo_highlight || 'FUTURE'}</span>
                  </h3>
                  <p>{content.footer_desc || 'Kapaklı Belediyesi liderliğinde yürütülen sürdürülebilir kalkınma projesi.'}</p>
                  
                  {/* SOSYAL MEDYA İKONLARI */}
                  <div className="social-icons" style={{marginTop:'20px', display:'flex', gap:'15px'}}>
                      {content.social_facebook && (
                          <a href={content.social_facebook} target="_blank" style={{color:'white', fontSize:'1.2rem'}}><i className="fab fa-facebook"></i></a>
                      )}
                      {content.social_twitter && (
                          <a href={content.social_twitter} target="_blank" style={{color:'white', fontSize:'1.2rem'}}><i className="fab fa-twitter"></i></a>
                      )}
                      {content.social_instagram && (
                          <a href={content.social_instagram} target="_blank" style={{color:'white', fontSize:'1.2rem'}}><i className="fab fa-instagram"></i></a>
                      )}
                  </div>
              </div>
              
              <div className="footer-col">
                  <h4>{content.footer_column2_title || 'Hızlı Menü'}</h4>
                  <ul>
                      <li><Link href="/about">Proje Hakkında</Link></li>
                      <li><Link href="/partners">Ortaklar</Link></li>
                      <li><Link href="/results">Eğitim Materyalleri</Link></li>
                  </ul>
              </div>
              
              <div className="footer-col">
                  <h4>{content.footer_column3_title || 'İletişim'}</h4>
                  <ul>
                      <li><i className="fas fa-envelope"></i> {content.contact_email || 'info@digigreen.eu'}</li>
                      <li><i className="fas fa-phone"></i> {content.contact_phone || '...'}</li>
                  </ul>
              </div>
          </div>
          
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <img src="/assets/images/eu-flag.png" alt="EU Flag" width="40" style={{marginRight:'15px'}} onError={(e)=>e.target.style.display='none'} />
                  <p>{content.footer_disclaimer || 'Co-funded by the European Union.'}</p>
              </div>
          </div>
      </footer>
    );
}