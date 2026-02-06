'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      // Tarihe göre en yeniden eskiye sırala
      const { data } = await supabase.from('news').select('*').order('date', { ascending: false });
      if (data) setNews(data);
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'60px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Haberler & Etkinlikler</h1>
              <p>Projemizden En Son Gelişmeler</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container">
              {loading ? <p>Yükleniyor...</p> : (
                  <div className="news-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                      {news.length === 0 ? <p>Henüz haber eklenmemiş.</p> : news.map((item) => (
                        <article key={item.id} style={{background:'white', borderRadius:'10px', overflow:'hidden', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                            <div style={{height:'200px', background:'#eee'}}>
                                <img src={item.image_url || '/assets/images/placeholder.jpg'} alt={item.title} style={{width:'100%', height:'100%', objectFit:'cover'}} 
                                     onError={(e) => e.target.src='https://via.placeholder.com/400x250?text=Haber'} />
                            </div>
                            <div style={{padding:'20px'}}>
                                <div style={{fontSize:'0.85rem', color:'#888', marginBottom:'10px'}}><i className="far fa-calendar"></i> {item.date}</div>
                                <h3 style={{fontSize:'1.2rem', marginBottom:'10px', lineHeight:'1.4'}}>{item.title}</h3>
                                <p style={{fontSize:'0.95rem', color:'#555'}}>{item.summary}</p>
                            </div>
                        </article>
                      ))}
                  </div>
              )}
          </div>
      </section>
    </>
  );
}