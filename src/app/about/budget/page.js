'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function RoadmapPage() {
  const [content, setContent] = useState({});

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {};
      data?.forEach(item => map[item.key] = item.value);
      setContent(map);
    });
  }, []);

  return (
    <div className="container section-padding">
        
        {/* SAYFA BAŞLIĞI */}
        <div className="section-title text-center" style={{marginBottom:'50px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>III. Proje Yol Haritası</h1>
            <p style={{fontSize:'1.2rem', color:'#666', fontWeight:'300'}}>Faaliyet Zaman Çizelgesi (24 Ay)</p>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        {/* GÖRSEL ALANI */}
        <div style={{
            maxWidth:'1200px', 
            margin:'0 auto', 
            background:'white', 
            padding:'20px', 
            borderRadius:'15px', 
            boxShadow:'0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
        }}>
            {/* ÖNEMLİ: Resmi 'public/images/roadmap.png' konumuna koyduğunuzdan emin olun.
                Eğer birden fazla resim varsa alt alta img etiketlerini çoğaltabilirsiniz.
            */}
            <img 
                src="/images/1.png" 
                alt="Bütçe" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            />
             <img 
                src="/images/2.png" 
                alt="Bütçe" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            /> <img 
                src="/images/3.png" 
                alt="Bütçe" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            /> <img 
                src="/images/4.png" 
                alt="Bütçe" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            /><img 
                src="/images/5.png" 
                alt="Bütçe" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            />
        </div>
        
        {/* İndirme Butonu (Opsiyonel - Resmi büyütmek veya indirmek için) */}
        <div className="text-center" style={{marginTop:'30px'}}>
            <a href="/images/roadmap.png" target="_blank" className="btn" style={{background:'#003399', color:'white', padding:'10px 25px', borderRadius:'30px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'10px'}}>
                <i className="fas fa-search-plus"></i> Resmi Büyüt / İndir
            </a>
        </div>

    </div>
  );
}