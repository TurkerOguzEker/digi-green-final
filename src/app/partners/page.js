'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
                        <div className="partner-logo">
                            {partner.image_url ? 
                                <img src={partner.image_url} alt={partner.name} /> : 
                                <i className="fas fa-landmark fa-3x" style={{color:'#aaa'}}></i>
                            }
                        </div>
                        <div className="partner-info">
                            <span className={`role-badge ${partner.role === 'Koordinatör' ? 'coordinator' : 'partner'}`}>
                                {partner.role}
                            </span>
                            <h3>{partner.name}</h3>
                            <p className="country"><i className="fas fa-globe"></i> {partner.country}</p>
                            {partner.website && (
                                <a href={partner.website} target="_blank" className="btn-outline" style={{color:'#003399', border:'1px solid #003399', fontSize:'0.8rem', padding:'5px 15px', marginTop:'10px'}}>
                                    Web Sitesi
                                </a>
                            )}
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      </section>
    </>
  );
}