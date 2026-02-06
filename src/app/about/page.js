'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function AboutPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setContent(map);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;

  return (
    <>
      {/* --- SAYFA BAŞLIĞI --- */}
      <section className="page-header" style={{background: '#003399', color:'white', padding:'80px 0', textAlign:'center'}}>
          <div className="container">
              <h1 style={{fontSize:'2.5rem', fontWeight:'700', marginBottom:'15px'}}>{content.about_page_title || 'Proje Detayları'}</h1>
              <p style={{fontSize:'1.2rem', opacity:'0.9'}}>{content.about_page_desc || 'Vatandaş Odaklı Yerel Yeşil Gelecek İçin Dijital Dönüşüm'}</p>
          </div>
      </section>

      {/* --- VİZYON VE GEREKÇE (DİNAMİK) --- */}
      <section className="section-padding">
          <div className="container">
              <div className="about-content-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'50px', alignItems:'center'}}>
                  
                  <div className="about-text">
                      <span style={{color:'#27ae60', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px', fontSize:'0.9rem'}}>Stratejik Bakış</span>
                      <h2 style={{fontSize:'2rem', margin:'10px 0 20px 0', color:'#003399'}}>{content.about_vision_title || 'Vizyon ve Gerekçe'}</h2>
                      <p style={{marginBottom:'15px', lineHeight:'1.7', color:'#555'}}>
                          {content.about_vision_text || 'Projemiz, iklim değişikliği ile mücadele ve dijital dönüşüm gerekliliklerini tek bir potada eritmeyi hedefler.'}
                      </p>
                      
                      <div style={{marginTop:'30px'}}>
                          <Link href="/contact" className="btn btn-primary">Bize Katılın</Link>
                      </div>
                  </div>

                  <div className="about-image">
                      <img 
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80" 
                        alt="Yeşil Şehir" 
                        style={{width:'100%', borderRadius:'15px', boxShadow:'0 15px 40px rgba(0,0,0,0.15)'}} 
                      />
                  </div>
              </div>
          </div>
      </section>

      {/* --- HEDEF KİTLE (Kısmen Dinamik) --- */}
      <section className="section-padding bg-light">
          <div className="container">
              <div className="section-title text-center" style={{marginBottom:'50px'}}>
                  <span className="sub-title" style={{color:'#27ae60', fontWeight:'bold'}}>Hedef Kitle</span>
                  <h2 style={{fontSize:'2.2rem', color:'#003399'}}>{content.about_target_title || 'Kimler İçin Çalışıyoruz?'}</h2>
                  <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'15px auto', borderRadius:'2px'}}></div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', textAlign:'center'}}>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Yerel Halk & Yetişkinler</h3>
                      <p style={{color:'#666'}}>Dijital okuryazarlık ve çevre bilincini artırmak isteyen tüm vatandaşlar.</p>
                  </div>
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', textAlign:'center'}}>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Belediye Personeli</h3>
                      <p style={{color:'#666'}}>Yeşil dönüşüm süreçlerini yönetecek ve dijital araçları kullanacak çalışanlar.</p>
                  </div>
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', textAlign:'center'}}>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Eğitimciler</h3>
                      <p style={{color:'#666'}}>Çevre ve dijitalleşme alanında farkındalık yaratmayı hedefleyen kurumlar.</p>
                  </div>
              </div>
          </div>
      </section>
      
      {/* --- ETKİLER (DİNAMİK) --- */}
      <section className="section-padding">
           <div className="container">
               <div className="section-title text-center">
                    <h2 style={{color:'#003399'}}>{content.about_impact_title || 'Projeden Beklenen Etkiler'}</h2>
               </div>
               <p style={{textAlign:'center', maxWidth:'800px', margin:'0 auto', color:'#555', lineHeight:'1.8'}}>
                   {content.about_impact_text || 'Dijital Beceriler, Karbon Ayak İzi Takibi ve Katılımcı Yönetişim alanlarında somut çıktılar hedefliyoruz.'}
               </p>
           </div>
      </section>
    </>
  );
}