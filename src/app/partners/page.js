'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

// ✨ HAREKETLİ AĞ EFEKTİ
const NetworkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2; 
        this.radius = Math.random() * 2 + 1; 
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
     draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ✨ Noktaları temanızın yeşili yaptık (0.5 şeffaflık ile)
        ctx.fillStyle = 'rgba(39, 174, 96, 0.5)'; 
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            const opacity = 0.2 * (1 - dist / 150); 
            // ✨ Çizgileri temanızın yeşili yaptık
            ctx.strokeStyle = `rgba(39, 174, 96, ${opacity})`; 
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            zIndex: -1, 
            pointerEvents: 'none', 
            background: '#f8fafc' 
        }} 
    />
  );
};


export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [headerBg, setHeaderBg] = useState(''); 
  const [loading, setLoading] = useState(true);

  // Verileri Çekme ve Resmi Önceden Yükleme
  useEffect(() => {
    async function fetchData() {
      const { data: partnersData } = await supabase.from('partners').select('*').order('id');
      if (partnersData) setPartners(partnersData);

      const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'hero_bg_image').maybeSingle();
      
      if (settingsData && settingsData.value) {
          setHeaderBg(settingsData.value);
          const img = new Image();
          img.src = settingsData.value;
          img.onload = () => { setLoading(false); };
          img.onerror = () => { setLoading(false); };
      } else {
          setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Scroll Animasyonları
  useEffect(() => {
    if (loading) return; 

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 }); 

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, partners]);

  return (
    <div className="partners-page" style={{ position: 'relative' }}>
      
      <NetworkBackground />

      {loading ? (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#003399' }}>
              <i className="fas fa-circle-notch fa-spin fa-3x" style={{ marginBottom: '20px' }}></i>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>Sayfa Hazırlanıyor...</span>
          </div>
      ) : (
          <>
              {/* KAHRAMAN (HERO) ALANI - RESİM BOZULMASI GİDERİLDİ */}
              <section 
                className="page-header"
                style={{
                    backgroundImage: headerBg ? `url(${headerBg})` : 'none',
                    backgroundColor: '#001f5c',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                    // fixed özelliği kaldırıldı, resim artık bozuk/zoomlu durmayacak!
                }}
              >
                  {/* ✨ YENİ: KARARTMA VE BLUR EFEKTİ KATMANI ✨ */}
                  <div className="header-overlay"></div>

                  <div className="header-bg-shapes">
                      <div className="shape shape-1"></div>
                      <div className="shape shape-2"></div>
                  </div>
                  <div className="container" style={{ position: 'relative', zIndex: 3 }}>
                      <h1 className="header-title">Konsorsiyum Ortakları</h1>
                      <p className="header-subtitle">Projeyi hayata geçiren güçlü ve uluslararası ekibimiz.</p>
                  </div>
              </section>

              {/* ORTAKLAR LİSTESİ */}
              <section className="section-padding" style={{ background: 'transparent', minHeight: '50vh', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
                  <div className="container" style={{ maxWidth: '1100px' }}>
                      <div className="partners-list">
                          {partners.map((partner, index) => {
                              const isReverse = index % 2 !== 0;
                              const animationClass = isReverse ? 'reveal-right' : 'reveal-left';

                              return (
                                  <div 
                                      key={partner.id} 
                                      className={`partner-row reveal ${animationClass} ${isReverse ? 'row-reverse' : ''}`}
                                  >
                                      
                                      <div className="partner-identity-side">
                                          <div className="logo-box">
                                              {partner.image_url ? 
                                                  <img src={partner.image_url} alt={partner.name} /> : 
                                                  <i className="fas fa-building fa-4x" style={{color:'#ccc'}}></i>
                                              }
                                          </div>
                                          
                                          <div className="identity-info">
                                              <h2 className="partner-name">{partner.name}</h2>
                                              
                                              <div className="tags-wrapper">
                                                  <span className={`role-tag ${partner.role === 'Koordinatör' ? 'coordinator' : 'partner'}`}>
                                                      {partner.role === 'Koordinatör' && <i className="fas fa-star" style={{marginRight: '6px'}}></i>}
                                                      {partner.role || 'Ortak'}
                                                  </span>
                                                  <div className="country-tag">
                                                      {partner.flag_url && <img src={partner.flag_url} alt={partner.country} />}
                                                      <span>{partner.country}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="partner-content-side">
                                          <div className="content-inner">
                                              <h4 className="about-title">Kurum Hakkında</h4>
                                              
                                              {partner.description ? (
                                                  <p className="partner-desc">
                                                      {partner.description}
                                                  </p>
                                              ) : (
                                                  <p className="partner-desc empty-desc">
                                                      Bu kurum için henüz bir açıklama eklenmemiştir.
                                                  </p>
                                              )}

                                              {partner.website && (
                                                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="partner-link">
                                                      Web Sitesini Ziyaret Et <i className="fas fa-arrow-right"></i>
                                                  </a>
                                              )}
                                          </div>
                                      </div>

                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </section>
          </>
      )}

      <style jsx>{`
        .partners-page { overflow-x: hidden; }

        .reveal { opacity: 0; transition: all 1s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .reveal.active { opacity: 1; transform: translate(0, 0); }
        .reveal-left { transform: translateX(-120px); }
        .reveal-right { transform: translateX(120px); }

        /* HERO ALANI CSS */
        .page-header {
            position: relative;
            color: white; 
            padding: 140px 0 100px;
            text-align: center;
            overflow: hidden;
            z-index: 2;
        }

        /* ✨ KARARTMA VE BUZLU CAM (BLUR) KATMANI ✨ */
        .header-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 15, 45, 0.55); /* Resmi %55 koyulaştırır */
            backdrop-filter: blur(6px); /* Resmi buzlu cam gibi hafif bulanıklaştırır */
            z-index: 1;
        }

        .header-title { 
            color: #ededed !important; /* ✨ YAZIYI KESİN OLARAK BEYAZ YAPAR ✨ */
            font-size: 3.5rem; 
            font-weight: 800; 
            margin-bottom: 20px; 
            animation: fadeInDown 0.8s ease forwards; 
            text-shadow: 0 2px 10px rgba(0,0,0,0.5); 
        }
        .header-subtitle { 
            color: #ededed !important; /* ✨ ALT YAZIYI DA BEYAZ YAPAR ✨ */
            font-size: 1.3rem; 
            opacity: 0; 
            font-weight: 300; 
            animation: fadeInDown 0.8s ease 0.2s forwards; 
            text-shadow: 0 2px 5px rgba(0,0,0,0.5); 
            max-width: 700px;
            margin: 0 auto;
        }
        
        .header-bg-shapes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 2; opacity: 0.6; }
        .shape { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
        .shape-1 { width: 300px; height: 300px; top: -100px; left: -100px; animation: float 6s ease-in-out infinite; }
        .shape-2 { width: 400px; height: 400px; bottom: -150px; right: -100px; background: rgba(39, 174, 96, 0.3); animation: float 8s ease-in-out infinite reverse; }

        /* LİSTE / SATIR YAPISI */
        .partners-list { display: flex; flex-direction: column; gap: 50px; padding: 40px 0; }

        .partner-row {
            display: flex; align-items: stretch; gap: 40px;
            background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
            padding: 40px; border-radius: 24px; box-shadow: 0 15px 40px rgba(0,0,0,0.06);
            transition: transform 0.4s ease, box-shadow 0.4s ease; position: relative; z-index: 2;
        }
        .partner-row:hover { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.1); }
        .partner-row.row-reverse { flex-direction: row-reverse; }

        /* LOGO VE KİMLİK KISMI */
        .partner-identity-side { flex: 0 0 320px; display: flex; flex-direction: column; align-items: center; text-align: center; border-right: 1px solid #f0f0f0; padding-right: 40px; }
        .partner-row.row-reverse .partner-identity-side { border-right: none; border-left: 1px solid #f0f0f0; padding-right: 0; padding-left: 40px; }

        .logo-box { width: 100%; height: 220px; background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 20px; margin-bottom: 25px; border-radius: 12px; border: 1px solid #f5f5f5; }
        .logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s ease; }
        .partner-row:hover .logo-box img { transform: scale(1.05); }

        .identity-info { width: 100%; }
        .partner-name { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; margin-bottom: 15px; line-height: 1.3; }
        .tags-wrapper { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .role-tag { font-size: 0.8rem; font-weight: 700; padding: 6px 15px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .role-tag.coordinator { background: rgba(39, 174, 96, 0.1); color: #27ae60; }
        .role-tag.partner { background: rgba(0, 51, 153, 0.08); color: #003399; }
        .country-tag { display: flex; align-items: center; justify-content: center; gap: 8px; color: #666; font-size: 0.95rem; font-weight: 600; background: #f8fafc; padding: 5px 15px; border-radius: 20px; border: 1px solid #eee; }
        .country-tag img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }

        /* AÇIKLAMA (İÇERİK) KISMI */
        .partner-content-side { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .content-inner { padding: 10px 0; }
        .about-title { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; color: #27ae60; font-weight: 800; margin-bottom: 15px; }
        .partner-desc { color: #555; font-size: 1.05rem; line-height: 1.8; margin-bottom: 30px; white-space: pre-wrap; }
        .empty-desc { font-style: italic; color: #999; }

        .partner-link { display: inline-flex; align-items: center; gap: 10px; background: #003399; color: white; font-weight: 600; font-size: 0.95rem; text-decoration: none; padding: 12px 25px; border-radius: 8px; transition: all 0.3s ease; }
        .partner-link:hover { background: #27ae60; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(39, 174, 96, 0.2); }

        /* MOBİL UYUM */
        @media (max-width: 900px) {
            .partner-row, .partner-row.row-reverse { flex-direction: column !important; gap: 30px; padding: 30px 20px; }
            .partner-identity-side, .partner-row.row-reverse .partner-identity-side { width: 100%; flex: none; border-right: none; border-left: none; border-bottom: 1px solid #f0f0f0; padding-right: 0; padding-left: 0; padding-bottom: 30px; }
            .logo-box { height: 150px; }
            .partner-content-side { align-items: center; text-align: center; }
            .reveal-left, .reveal-right { transform: translateY(40px); }
        }

        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
      `}</style>
    </div>
  );
}