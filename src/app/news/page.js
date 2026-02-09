'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [bg, setBg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: nData } = await supabase.from('news').select('*').order('date', {ascending:false});
      const { data: sData } = await supabase.from('settings').select('*').eq('key', 'news_header_bg').single();
      setNews(nData || []);
      setBg(sData?.value || '');
    }
    load();
  }, []);

  return (
    <>
      <section className="page-header" style={{
          position:'relative', height:'300px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', textAlign:'center',
          backgroundImage: `url(${bg})`, backgroundSize:'cover', backgroundPosition:'center'
      }}>
        <div style={{position:'absolute', width:'100%', height:'100%', background:'rgba(0,51,153,0.7)', top:0, left:0}}></div>
        <h1 style={{position:'relative', zIndex:2, fontSize:'3rem'}}>Haberler & Etkinlikler</h1>
      </section>

      <section className="container section-padding">
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'30px'}}>
          {news.map(item => (
            <div key={item.id} className="news-card" style={{background:'white', borderRadius:'15px', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.05)'}}>
              <div style={{height:'200px', overflow:'hidden'}}>
                <img src={item.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
              <div style={{padding:'20px'}}>
                <small style={{color:'#27ae60'}}>{item.date}</small>
                <h3 style={{margin:'10px 0'}}>{item.title}</h3>
                <p style={{fontSize:'0.9rem', color:'#666'}}>{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}