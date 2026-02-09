'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.from('results').select('*').order('id');
      if (data) setResults(data);
      setLoading(false);
    }
    fetchResults();
  }, []);

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'80px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Proje Çıktıları & Dosyalar</h1>
              <p>Raporlar, Sunumlar ve Eğitim Materyalleri</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container">
              {loading ? (
                  <p style={{textAlign:'center'}}>Yükleniyor...</p>
              ) : (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                      
                      {results.length === 0 ? (
                          <p>Henüz dosya yüklenmemiş.</p>
                      ) : (
                          results.map(item => (
                              <div key={item.id} style={{
                                  background:'white', 
                                  padding:'30px', 
                                  borderRadius:'15px', 
                                  boxShadow:'0 10px 20px rgba(0,0,0,0.05)', 
                                  borderLeft:'6px solid #27ae60', 
                                  display:'flex', 
                                  gap:'20px', 
                                  alignItems:'flex-start',
                                  transition: 'transform 0.3s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                  <div style={{fontSize:'2.5rem', color:'#27ae60'}}>
                                      <i className={`fas ${item.icon === 'video' ? 'fa-video' : item.icon === 'app' ? 'fa-mobile-alt' : 'fa-file-pdf'}`}></i>
                                  </div>
                                  <div style={{flex: 1}}>
                                      <h3 style={{fontSize:'1.2rem', marginBottom:'10px', color: '#333'}}>{item.title}</h3>
                                      <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'15px', lineHeight:'1.5'}}>{item.description}</p>
                                      
                                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto'}}>
                                          <span style={{display:'inline-block', padding:'4px 12px', fontSize:'0.75rem', borderRadius:'20px', background:'#f0f4f8', color:'#555', fontWeight:'600'}}>
                                              {item.status}
                                          </span>
                                          
                                          {item.link && (
                                              <a 
  href={`${item.link}${item.link.includes('?') ? '&' : '?'}download=`} 
  download 
  target="_blank" 
  rel="noopener noreferrer"
  style={{color:'#003399', fontWeight:'700', textDecoration:'none', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'5px'}}
>
    <i className="fas fa-download"></i> DOSYAYI İNDİR
</a>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}

                  </div>
              )}
          </div>
      </section>
    </>
  );
}