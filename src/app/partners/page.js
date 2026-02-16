'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      const { data } = await supabase.from('partners').select('*').order('id');
      if (data) setPartners(data);
      setLoading(false);
    }
    fetchPartners();
  }, []);

  return (
    <div className="partners-page">
      {/* KAHRAMAN (HERO) ALANI */}
      <section className="page-header">
          <div className="header-bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <h1 className="header-title">Konsorsiyum Ortakları</h1>
              <p className="header-subtitle">Projeyi hayata geçiren güçlü ve uluslararası ekibimiz.</p>
          </div>
      </section>

      {/* ORTAKLAR LİSTESİ */}
      <section className="section-padding" style={{ background: '#f8fafc', minHeight: '50vh' }}>
          <div className="container" style={{ maxWidth: '1100px' }}>
              {loading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#003399', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <i className="fas fa-circle-notch fa-spin" style={{ marginRight: '10px' }}></i> Yükleniyor...
                  </div>
              ) : (
                  <div className="partners-list">
                      {partners.map((partner, index) => {
                          const isReverse = index % 2 !== 0;

                          return (
                              <div 
                                  key={partner.id} 
                                  className={`partner-row reveal reveal-up ${isReverse ? 'row-reverse' : ''}`}
                                  style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                  
                                  {/* SOL KISIM: LOGO VE KİMLİK BİLGİLERİ */}
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

                                  {/* SAĞ KISIM: AÇIKLAMA VE İÇERİK */}
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

                                          {/* Website Butonu */}
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
              )}
          </div>
      </section>

      <style jsx>{`
        .partners-page { overflow-x: hidden; }

        /* HERO ALANI */
        .page-header {
            position: relative;
            background: linear-gradient(135deg, #003399 0%, #001f5c 100%);
            color: white;
            padding: 100px 0 80px;
            text-align: center;
            overflow: hidden;
        }
        .header-title { font-size: 3rem; font-weight: 800; margin-bottom: 15px; }
        .header-subtitle { font-size: 1.2rem; opacity: 0.9; font-weight: 300; }
        .header-bg-shapes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; }
        .shape { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.05); }
        .shape-1 { width: 300px; height: 300px; top: -100px; left: -100px; animation: float 6s ease-in-out infinite; }
        .shape-2 { width: 400px; height: 400px; bottom: -150px; right: -100px; background: rgba(39, 174, 96, 0.1); animation: float 8s ease-in-out infinite reverse; }

        /* LİSTE / SATIR YAPISI */
        .partners-list {
            display: flex;
            flex-direction: column;
            gap: 50px; 
        }

        .partner-row {
            display: flex;
            align-items: stretch; /* İçerik boyuna göre esner */
            gap: 40px;
            background: #ffffff;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.04);
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            opacity: 0;
            animation: fadeUp 0.6s ease forwards;
        }
        
        .partner-row:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.08);
        }

        .partner-row.row-reverse {
            flex-direction: row-reverse;
        }

        /* LOGO VE KİMLİK KISMI */
        .partner-identity-side {
            flex: 0 0 320px; 
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-right: 1px solid #f0f0f0;
            padding-right: 40px;
        }
        
        .partner-row.row-reverse .partner-identity-side {
            border-right: none;
            border-left: 1px solid #f0f0f0;
            padding-right: 0;
            padding-left: 40px;
        }

        .logo-box {
            width: 100%;
            height: 220px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin-bottom: 25px;
        }
        .logo-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
        }
        .partner-row:hover .logo-box img {
            transform: scale(1.05);
        }

        .identity-info {
            width: 100%;
        }

        .partner-name {
            font-size: 1.4rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 15px;
            line-height: 1.3;
        }

        .tags-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        .role-tag {
            font-size: 0.8rem;
            font-weight: 700;
            padding: 6px 15px;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
        }
        .role-tag.coordinator { background: rgba(39, 174, 96, 0.1); color: #27ae60; }
        .role-tag.partner { background: rgba(0, 51, 153, 0.08); color: #003399; }

        .country-tag {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #666;
            font-size: 0.95rem;
            font-weight: 600;
            background: #f8fafc;
            padding: 5px 15px;
            border-radius: 20px;
            border: 1px solid #eee;
        }
        .country-tag img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }

        /* AÇIKLAMA (İÇERİK) KISMI */
        .partner-content-side {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .content-inner {
            padding: 10px 0;
        }

        .about-title {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #27ae60;
            font-weight: 800;
            margin-bottom: 15px;
        }

        .partner-desc {
            color: #555;
            font-size: 1.05rem;
            line-height: 1.8;
            margin-bottom: 30px;
            white-space: pre-wrap; /* Metin içindeki enter boşluklarını tanır */
        }
        
        .empty-desc {
            font-style: italic;
            color: #999;
        }

        .partner-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #003399;
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .partner-link:hover {
            background: #27ae60;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(39, 174, 96, 0.2);
        }

        /* MOBİL UYUM */
        @media (max-width: 900px) {
            .partner-row, .partner-row.row-reverse {
                flex-direction: column !important;
                gap: 30px;
                padding: 30px 20px;
            }
            .partner-identity-side, .partner-row.row-reverse .partner-identity-side {
                width: 100%;
                flex: none;
                border-right: none;
                border-left: none;
                border-bottom: 1px solid #f0f0f0;
                padding-right: 0;
                padding-left: 0;
                padding-bottom: 30px;
            }
            .logo-box {
                height: 150px;
            }
            .partner-content-side {
                align-items: center;
                text-align: center;
            }
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}