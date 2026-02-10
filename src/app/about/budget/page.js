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
            <p style={{fontSize:'1.2rem', color:'#666', fontWeight:'300'}}>24 Aylık Faaliyet Zaman Çizelgesi</p>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        {/* RESİM ALANI */}
        <div style={{
            maxWidth:'1200px', 
            margin:'0 auto', 
            background:'white', 
            padding:'10px', 
            borderRadius:'15px', 
            boxShadow:'0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
            textAlign: 'center'
        }}>
            {/* ÖNEMLİ: Resmi 'public/images/roadmap.png' yoluna koyduğunuzdan emin olun.
               Dosya adı büyük/küçük harf duyarlıdır.
            */}
            <img 
                src="/images/1.png" 
                alt="Proje Zaman Çizelgesi" 
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '5px',
                    display: 'block'
                }} 
            />
        </div>

    </div>
  );
}