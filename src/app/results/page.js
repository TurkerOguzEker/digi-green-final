'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ResultsPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.from('results').select('*').order('id');
      if (data) setResults(data);
    }
    fetchResults();
  }, []);

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'60px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Proje Çıktıları & Dosyalar</h1>
              <p>Raporlar, Sunumlar ve Eğitim Materyalleri</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  
                  {results.length === 0 ? <p>Henüz dosya yüklenmemiş.</p> : results.map(item => (
                      <div key={item.id} style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #27ae60', display:'flex', gap:'20px', alignItems:'flex-start'}}>
                          <div style={{fontSize:'2.5rem', color:'#27ae60'}}>
                              <i className={`fas ${item.icon === 'video' ? 'fa-video' : item.icon === 'app' ? 'fa-mobile-alt' : 'fa-file-alt'}`}></i>
                          </div>
                          <div>
                              <h3 style={{fontSize:'1.2rem', marginBottom:'10px'}}>{item.title}</h3>
                              <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'15px'}}>{item.description}</p>
                              
                              <span style={{display:'inline-block', padding:'3px 10px', fontSize:'0.75rem', borderRadius:'4px', background:'#eee', color:'#555', marginBottom:'10px'}}>
                                  {item.status}
                              </span>
                              
                              {item.link && (
                                  <div style={{marginTop:'10px'}}>
                                      <a href={item.link} target="_blank" style={{color:'#003399', fontWeight:'600', textDecoration:'none'}}>
                                          <i className="fas fa-download"></i> Dosyayı İndir / Görüntüle
                                      </a>
                                  </div>
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