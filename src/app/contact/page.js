'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setInfo(map);
      }
    }
    fetchSettings();
  }, []);

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'60px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Bize Ulaşın</h1>
              <p>Sorularınız ve İşbirliği İçin</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container" style={{maxWidth:'800px'}}>
              <div style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)'}}>
                  <h3 style={{marginBottom:'30px', borderBottom:'1px solid #eee', paddingBottom:'15px'}}>İletişim Bilgileri</h3>
                  
                  <ul style={{fontSize:'1.1rem'}}>
                      <li style={{marginBottom:'20px', display:'flex', gap:'15px'}}>
                          <i className="fas fa-map-marker-alt" style={{color:'#27ae60', marginTop:'5px'}}></i>
                          <div>
                              <strong>Adres:</strong><br/>
                              {info.contact_address || 'Yükleniyor...'}
                          </div>
                      </li>
                      <li style={{marginBottom:'20px', display:'flex', gap:'15px'}}>
                          <i className="fas fa-envelope" style={{color:'#27ae60', marginTop:'5px'}}></i>
                          <div>
                              <strong>E-posta:</strong><br/>
                              <a href={`mailto:${info.contact_email}`}>{info.contact_email || 'Yükleniyor...'}</a>
                          </div>
                      </li>
                      <li style={{marginBottom:'20px', display:'flex', gap:'15px'}}>
                          <i className="fas fa-phone" style={{color:'#27ae60', marginTop:'5px'}}></i>
                          <div>
                              <strong>Telefon:</strong><br/>
                              {info.contact_phone || 'Yükleniyor...'}
                          </div>
                      </li>
                  </ul>
              </div>
          </div>
      </section>
    </>
  );
}