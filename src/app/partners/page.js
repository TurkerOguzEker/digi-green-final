'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    async function fetchPartners() {
      const { data } = await supabase.from('partners').select('*').order('id');
      if (data) setPartners(data);
    }
    fetchPartners();
  }, []);

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'60px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Proje Ortakları</h1>
              <p>Avrupa Çapında Güçlü İşbirliği</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'30px'}}>
                  {partners.map(partner => (
                    <div key={partner.id} className="partner-card" style={partner.role === 'Koordinatör' ? {borderLeft: '5px solid #003399'} : {}}>
                        
                        {/* KURUM LOGOSU */}
                        <div className="partner-logo">
                            {partner.image_url ? 
                                <img src={partner.image_url} alt={partner.name} /> : 
                                <i className="fas fa-landmark fa-3x" style={{color:'#aaa'}}></i>
                            }
                        </div>

                        <div className="partner-info">
                            <span className={`role-badge ${partner.role === 'Koordinatör' ? 'coordinator' : 'partner'}`}>
                                {partner.role || 'Ortak'}
                            </span>
                            
                            <h3>{partner.name}</h3>
                            
                            {/* ÜLKE VE BAYRAK ALANI (ORTALANDI) */}
                            <div className="country" style={{
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent: 'center', // Yatay ortalama eklendi
                                gap:'10px', 
                                color:'#666', 
                                marginTop:'10px'
                            }}>
                                {partner.flag_url ? (
                                    <img 
                                        src={partner.flag_url} 
                                        alt={partner.country} 
                                        style={{width:'24px', height:'auto', borderRadius:'3px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}} 
                                    />
                                ) : (
                                    <i className="fas fa-globe" style={{color:'#27ae60', fontSize:'1.2rem'}}></i>
                                )}
                                <span style={{fontWeight:'500'}}>{partner.country}</span>
                            </div>

                            {partner.website && (
                                <a href={partner.website} target="_blank" className="btn-outline" style={{display:'inline-block', color:'#003399', border:'1px solid #003399', borderRadius:'5px', fontSize:'0.85rem', padding:'6px 15px', marginTop:'15px', textDecoration:'none', transition:'0.3s'}}>
                                    Web Sitesi
                                </a>
                            )}
                        </div>
                    </div>
                  ))}
              </div>
          </div>

          <style jsx>{`
            .partner-card {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.05);
                border: 1px solid #eee;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center; /* Kart içindeki her şeyi ortalar */
                text-align: center;  /* Metinleri ortalar */
            }
            .partner-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .partner-logo {
                height: 80px;
                width: 100%;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .partner-logo img {
                max-height: 100%;
                max-width: 100%;
                object-fit: contain;
            }
            .role-badge {
                font-size: 0.75rem;
                padding: 4px 10px;
                border-radius: 20px;
                text-transform: uppercase;
                font-weight: bold;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                display: inline-block;
            }
            .role-badge.coordinator {
                background: #e3f2fd;
                color: #003399;
            }
            .role-badge.partner {
                background: #e8f5e9;
                color: #27ae60;
            }
            .partner-info {
                width: 100%;
            }
            .partner-info h3 {
                font-size: 1.1rem;
                margin-bottom: 5px;
                color: #333;
                line-height: 1.4;
            }
            .btn-outline:hover {
                background: #003399;
                color: white !important;
            }
          `}</style>
      </section>
    </>
  );
}