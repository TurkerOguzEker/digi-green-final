'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ImpactPage() {
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
                {content.impact_page_title || 'IV. Etki ve Sürdürülebilirlik'}
            </h1>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
            <p style={{fontSize:'1.2rem', color:'#555', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6'}}>
                {content.impact_page_desc || 'Kalıcı Değer, Yeşil Dönüşüm ve Toplumsal Yaygınlaştırma'}
            </p>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            
            <div style={{marginBottom:'50px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderLeft:'6px solid #27ae60'}}>
                <h2 style={{color:'#27ae60', marginBottom:'25px', fontSize:'1.6rem', display:'flex', alignItems:'center', gap:'15px'}}>
                    <i className="fas fa-hand-holding-water"></i> 
                    {content.impact_section_1_title || 'Stratejik Etki ve Çözüm Yaklaşımı'}
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#444', marginBottom:'30px', textAlign:'justify'}}>
                    {content.impact_section_1_text || "Bu proje, Kapaklı'nın sanayileşme kaynaklı kirlilik ve düşük geri dönüşüm gibi acil sorunlarına, dijitalleşmeyi bir araç olarak kullanarak yanıt vermektedir. Kapaklı Belediyesi koordinatörlüğündeki konsorsiyum, güçlü uluslararası uzmanlığa sahiptir."}
                </p>

                <div style={{marginTop:'30px', background:'#eafaf1', padding:'20px', borderRadius:'10px', border:'1px solid #27ae60'}}>
                    <p style={{margin:0, color:'#2c3e50', fontSize:'0.95rem', lineHeight:'1.6'}}>
                        <i className="fas fa-check-circle" style={{color:'#27ae60', marginRight:'10px'}}></i>
                        {content.impact_highlight_text || "Türk ortaklar TNKÜ (SECAP hazırlığı ve teknik geliştirme) ve Kampüs STK (Yerel katılım) ile desteklenen bu işbirliği, karşılıklı bilgi transferi yoluyla Avrupa Yeşil Mutabakatı'na katkı sağlamakta ve geliştirilen dijital araçların belediye operasyonlarına entegrasyonuyla projenin kalıcı sürdürülebilirliğini güvence altına almaktadır."}
                    </p>
                </div>
            </div>

            <div style={{background:'#fff', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderTop:'6px solid #003399'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
                    <span style={{background:'#003399', color:'white', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.8rem'}}>VİZYON</span>
                    <h2 style={{color:'#003399', margin:0, fontSize:'1.6rem'}}>
                        {content.impact_section_2_title || 'DIGI-GREEN FUTURE Projesi'}
                    </h2>
                </div>

                <p style={{lineHeight:'1.8', color:'#444', marginBottom:'30px', textAlign:'justify'}}>
                    {content.impact_section_2_text || "Kapaklı Belediyesi liderliğinde, iklim değişikliği ve dijital dönüşüm gibi acil sorunlara karşı kapsamlı ve yenilikçi çözümler sunmaktadır. Mobil uygulamalar, eğitim seferberliği ve sürdürülebilir yönetim anlayışıyla somut çıktılar hedeflenmektedir."}
                </p>

                <div style={{background:'#003399', color:'white', padding:'25px', borderRadius:'10px', textAlign:'center', marginTop:'20px'}}>
                    <p style={{margin:0, fontSize:'1.1rem', fontWeight:'500', lineHeight:'1.6'}}>
                        {content.impact_closing_msg || "\"Tüm paydaşlar, yerel, ulusal ve Avrupa düzeyinde kalıcı bir etki oluşturmak üzere bu kapsamlı planı uygulamaya davet edilmektedir.\""}
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
}