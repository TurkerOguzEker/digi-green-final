'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function StrategyPage() {
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
        <div className="section-title text-center" style={{marginBottom:'60px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>
                {content.about_strategy_title || 'I. Stratejik Genel Bakış'}
            </h1>
            <p style={{fontSize:'1.3rem', color:'#666', fontWeight:'300'}}>
                {content.about_strategy_desc || 'Vizyon, Gerekçe ve Avrupa Uyum'}
            </p>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        <div style={{maxWidth:'900px', margin:'0 auto'}}>
            
            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#003399', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#003399', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>A</span>
                    {content.strategy_section_a_title || 'Proje Kimliği ve Temel Bilgiler'}
                </h2>
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'20px', textAlign:'justify'}}>
                    {content.strategy_text_a_1 || "Bu rapor, Kapaklı Belediyesi tarafından sunulan ve Erasmus+ programı kapsamında desteklenen \"Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm\" (DIGI-GREEN FUTURE) başlıklı projenin kapsamlı bir sunumunu sağlamak amacıyla hazırlanmıştır."}
                </p>
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'30px', textAlign:'justify'}}>
                    {content.strategy_text_a_2 || "Toplam 24 ay sürecek olan proje, 1 Kasım 2025 tarihinde başlayıp 31 Ekim 2027 tarihinde sona erecektir. Projenin yürütülmesi için 250.000,00 €'luk sabit bir hibe tahsis edilmiştir."}
                </p>
            </div>

            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#27ae60', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#27ae60', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>B</span>
                    {content.strategy_section_b_title || 'Projenin Ruhu: Gerekçe ve Motivasyon'}
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'20px', textAlign:'justify'}}>
                    {content.strategy_text_b || "Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur. Kapaklı gibi sanayileşme bölgelerinin hava/su kirliliği ve yetersiz atık yönetimi gibi acil çevresel sorunlarına odaklanmaktadır. Proje, mobil uygulamalar aracılığıyla belediye hizmetlerine erişimi kolaylaştırarak vatandaşların karbon ayak izini azaltmayı hedeflemektedir. En önemli çevresel çıktımız, dijitalleşme odaklı çözümlerle atık geri dönüşüm oranını mevcut %24'ten %29'a çıkarmaktır."}
                </p>

                <blockquote style={{background:'#eafaf1', padding:'20px 25px', borderLeft:'5px solid #27ae60', fontStyle:'italic', color:'#2c3e50', borderRadius:'0 10px 10px 0', margin:'25px 0', fontSize:'1.05rem'}}>
                    "{content.strategy_quote || "Temel felsefemiz; dijitalleşmeyi amaç değil, çevresel sürdürülebilirlik hedeflerine ulaşmak için güçlü bir araç olarak kullanmaktır."}"
                </blockquote>
            </div>

            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#d35400', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#d35400', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>C</span>
                    {content.strategy_section_c_title || 'Avrupa Politikalarıyla Stratejik Uyum'}
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'25px'}}>
                    {content.strategy_text_c || "DIGI-GREEN FUTURE, Erasmus+ programının üç temel yatay önceliğiyle doğrudan uyumludur: Çevre ve İklim Değişikliğiyle Mücadele (SECAP ve atık yönetimi odağı), Dijital Dönüşüm ve Tüm Nesiller Arasında Öğrenme Fırsatlarının Teşviki."}
                </p>
            </div>

        </div>
    </div>
  );
}