'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

type SettingsData = { [key: string]: string };

export default function Home() {
  const [content, setContent] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const contentMap: SettingsData = {};
        data.forEach((item: any) => { contentMap[item.key] = item.value; });
        setContent(contentMap);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="container hero-content">
              <div className="hero-text">
                  <div className="eu-badge">
                      <img src="/assets/images/eu-flag.png" alt="EU Flag" width="25" onError={(e) => e.currentTarget.style.display='none'} />
                      <span>Co-funded by the European Union</span>
                  </div>
                  <h1>{loading ? '...' : (content.hero_title || 'Vatandaş Odaklı Yerel Yeşil Gelecek')}</h1>
                  <p className="hero-description">{loading ? '...' : (content.hero_desc || 'Kapaklı Belediyesi liderliğinde yürütülen dijital dönüşüm projesi.')}</p>
                  <div className="hero-buttons">
                      <Link href="/about" className="btn btn-primary">Projeyi İncele</Link>
                      <Link href="/partners" className="btn btn-outline">Ortaklarımız</Link>
                  </div>
              </div>
          </div>
      </section>

      {/* --- PROJE ÖZETİ & RAKAMLAR --- */}
      <section className="section-padding bg-white">
          <div className="container">
              <div className="overview-grid">
                  <div className="overview-text">
                      <h2 style={{color:'#003399', marginBottom:'20px'}}>Sürdürülebilir Bir Gelecek İçin</h2>
                      <p className="lead" style={{color:'#555', marginBottom:'20px'}}>
                          <strong>DIGI-GREEN FUTURE</strong>, yerel yönetimlerin dijital dönüşümünü çevresel sürdürülebilirlik hedefleriyle birleştiren yenilikçi bir Erasmus+ projesidir.
                      </p>
                      <p style={{color:'#666', lineHeight:'1.6'}}>
                          İklim değişikliği ile mücadelede yapay zeka ve mobil teknolojileri kullanarak, vatandaşların karar alma süreçlerine katılımını artırmayı hedefliyoruz.
                      </p>
                  </div>
                  
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                      <div className="partner-card" style={{padding:'20px'}}>
                          <div style={{fontSize:'2.5rem', color:'#27ae60', fontWeight:'bold'}}>24</div>
                          <p>Ay Süre</p>
                      </div>
                      <div className="partner-card" style={{padding:'20px'}}>
                          <div style={{fontSize:'2.5rem', color:'#003399', fontWeight:'bold'}}>€250K</div>
                          <p>AB Hibesi</p>
                      </div>
                      <div className="partner-card" style={{padding:'20px'}}>
                          <div style={{fontSize:'2.5rem', color:'#f1c40f', fontWeight:'bold'}}>3</div>
                          <p>Temel Hedef</p>
                      </div>
                      <div className="partner-card" style={{padding:'20px'}}>
                          <div style={{fontSize:'2.5rem', color:'#e74c3c', fontWeight:'bold'}}>4+</div>
                          <p>Ülke</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- HEDEFLER (SUNUMDAN) --- */}
      <section className="section-padding" style={{background:'#f0f4f8'}}>
          <div className="container">
              <div className="section-title">
                  <span className="sub-title">Vizyonumuz</span>
                  <h2>{content.home_goals_title || 'Temel Hedeflerimiz'}</h2>
                  <p style={{maxWidth:'700px', margin:'0 auto', color:'#666'}}>{content.home_goals_desc}</p>
                  <div className="title-line"></div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  <div style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', borderTop:'5px solid #27ae60'}}>
                      <div style={{fontSize:'2.5rem', color:'#27ae60', marginBottom:'20px'}}><i className="fas fa-leaf"></i></div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Yeşil Dönüşüm</h3>
                      <p style={{color:'#666'}}>İklim değişikliğine karşı yerel düzeyde etkili ve uygulanabilir çözümler geliştirmek.</p>
                  </div>
                  <div style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', borderTop:'5px solid #003399'}}>
                      <div style={{fontSize:'2.5rem', color:'#003399', marginBottom:'20px'}}><i className="fas fa-laptop-code"></i></div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Dijital Okuryazarlık</h3>
                      <p style={{color:'#666'}}>Yetişkinlerin dijital araçları kullanarak çevresel sorunlara çözüm üretme kapasitesini artırmak.</p>
                  </div>
                  <div style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', borderTop:'5px solid #f1c40f'}}>
                      <div style={{fontSize:'2.5rem', color:'#f1c40f', marginBottom:'20px'}}><i className="fas fa-users"></i></div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Katılımcı Yönetişim</h3>
                      <p style={{color:'#666'}}>Vatandaşların belediye karar alma süreçlerine dijital kanallar üzerinden aktif katılımını sağlamak.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- BEKLENEN ETKİLER (SUNUMDAN) --- */}
      <section className="section-padding bg-white">
          <div className="container">
              <div className="overview-grid">
                  <div style={{order:2}}>
                      <div className="section-title" style={{textAlign:'left', marginBottom:'30px'}}>
                          <span className="sub-title">Sonuçlar</span>
                          <h2>{content.home_impact_title || 'Beklenen Etkiler'}</h2>
                          <div className="title-line" style={{margin:0}}></div>
                      </div>
                      <p style={{marginBottom:'20px', color:'#555'}}>{content.home_impact_desc}</p>
                      
                      <ul className="project-details-list" style={{background:'white', padding:0, border:0}}>
                          <li><i className="fas fa-check-circle" style={{color:'#27ae60'}}></i> Toplumsal iklim bilincinin artırılması.</li>
                          <li><i className="fas fa-check-circle" style={{color:'#27ae60'}}></i> Mobil uygulamalar ile karbon ayak izinin takibi.</li>
                          <li><i className="fas fa-check-circle" style={{color:'#27ae60'}}></i> Yerel yönetimlerde dijital araç kullanımının yaygınlaşması.</li>
                          <li><i className="fas fa-check-circle" style={{color:'#27ae60'}}></i> Avrupa düzeyinde iyi uygulama örneklerinin paylaşılması.</li>
                      </ul>
                  </div>
                  <div style={{order:1}}>
                      <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" alt="Etki" style={{borderRadius:'10px', boxShadow:'0 15px 30px rgba(0,0,0,0.1)'}} />
                  </div>
              </div>
          </div>
      </section>

      {/* --- CTA (ÇAĞRI) --- */}
      <section style={{background:'linear-gradient(to right, #003399, #001a4d)', padding:'80px 0', color:'white', textAlign:'center'}}>
          <div className="container">
              <h2 style={{fontSize:'2.5rem', marginBottom:'20px', color:'white'}}>Yeşil Bir Gelecek İçin Bize Katılın</h2>
              <p style={{fontSize:'1.2rem', marginBottom:'30px', opacity:0.9, maxWidth:'700px', margin:'0 auto 30px'}}>
                  Kapaklı Belediyesi'nin öncülük ettiği bu dijital dönüşüm hareketinin bir parçası olun.
              </p>
              <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                  <Link href="/contact" className="btn" style={{background:'#27ae60', color:'white', border:'none', fontSize:'1.1rem', padding:'15px 40px'}}>İletişime Geçin</Link>
                  <Link href="/news" className="btn btn-outline">Haberleri Takip Edin</Link>
              </div>
          </div>
      </section>
    </>
  );
}