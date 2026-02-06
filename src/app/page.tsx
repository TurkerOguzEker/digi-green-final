'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// Supabase'den gelecek veri tipi için (Opsiyonel ama iyi olur)
type SettingsData = {
  [key: string]: string;
};

export default function Home() {
  const [content, setContent] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Ayarları veritabanından çek
      const { data, error } = await supabase.from('settings').select('*');
      
      if (data) {
        // Gelen veriyi { anahtar: deger } formatına çevir
        const contentMap: SettingsData = {};
        data.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      {/* --- HERO SECTION (Ana Manşet) --- */}
      <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="container hero-content">
              <div className="hero-text">
                  <div className="eu-badge">
                      <img src="/assets/images/eu-flag.png" alt="EU Flag" width="25" onError={(e) => e.currentTarget.style.display='none'} />
                      <span>Co-funded by the European Union</span>
                  </div>
                  
                  {/* DİNAMİK BAŞLIK */}
                  <h1>
                    {loading ? 'Yükleniyor...' : (content.hero_title || 'Vatandaş Odaklı Yerel Yeşil Gelecek')}
                  </h1>
                  
                  {/* DİNAMİK AÇIKLAMA */}
                  <p className="hero-description">
                    {loading ? '...' : (content.hero_desc || 'Kapaklı Belediyesi liderliğinde yürütülen dijital dönüşüm projesi.')}
                  </p>
                  
                  <div className="hero-buttons">
                      <Link href="/about" className="btn btn-primary">Projeyi İncele</Link>
                      <Link href="/partners" className="btn btn-outline">Ortaklarımız</Link>
                  </div>
              </div>
          </div>
      </section>

      {/* --- PROJE ÖZETİ --- */}
      <section className="section-padding bg-white">
          <div className="container">
              <div className="section-title text-center">
                  <span className="sub-title">Erasmus+ KA220-ADU</span>
                  <h2>Proje Hakkında</h2>
                  <div className="title-line"></div>
              </div>

              <div className="overview-grid">
                  <div className="overview-text">
                      <p className="lead">
                          <strong>DIGI-GREEN FUTURE</strong>, yerel yönetimlerin dijital dönüşümünü 
                          çevresel sürdürülebilirlik hedefleriyle birleştiren yenilikçi bir Erasmus+ projesidir.
                      </p>
                      <ul className="project-details-list">
                          <li><i className="fas fa-calendar-alt"></i> <strong>Süre:</strong> 24 Ay (2025-2027)</li>
                          <li><i className="fas fa-euro-sign"></i> <strong>Bütçe:</strong> 250.000,00 €</li>
                          <li><i className="fas fa-building"></i> <strong>Koordinatör:</strong> Kapaklı Belediyesi</li>
                      </ul>
                  </div>
                  
                  <div className="overview-cards" style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                      <div className="partner-card" style={{textAlign:'left'}}>
                          <h3><i className="fas fa-leaf" style={{color:'#27ae60'}}></i> Yeşil Dönüşüm</h3>
                          <p>İklim değişikliğine karşı yerel ve etkili çözümler üretiyoruz.</p>
                      </div>
                      <div className="partner-card" style={{textAlign:'left'}}>
                          <h3><i className="fas fa-mobile-alt" style={{color:'#003399'}}></i> Dijital Araçlar</h3>
                          <p>Yapay zeka destekli mobil öğrenme platformları geliştiriyoruz.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}