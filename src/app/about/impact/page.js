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
        {/* SAYFA BAŞLIĞI */}
        <div className="section-title text-center" style={{marginBottom:'60px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>IV. Etki ve Sürdürülebilirlik</h1>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
            <p style={{fontSize:'1.2rem', color:'#555', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6'}}>
                Kalıcı Değer, Yeşil Dönüşüm ve Toplumsal Yaygınlaştırma
            </p>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            
            {/* 1. BÖLÜM: PROJENİN TEMEL YANITI VE KONSORSİYUM GÜCÜ */}
            <div style={{marginBottom:'50px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderLeft:'6px solid #27ae60'}}>
                <h2 style={{color:'#27ae60', marginBottom:'25px', fontSize:'1.6rem', display:'flex', alignItems:'center', gap:'15px'}}>
                    <i className="fas fa-hand-holding-water"></i> Stratejik Etki ve Çözüm Yaklaşımı
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#444', marginBottom:'30px', textAlign:'justify'}}>
                    Bu proje, Kapaklı'nın sanayileşme kaynaklı kirlilik ve düşük geri dönüşüm gibi acil sorunlarına, <strong>dijitalleşmeyi bir araç olarak kullanarak</strong> yanıt vermektedir. Kapaklı Belediyesi koordinatörlüğündeki konsorsiyum, güçlü uluslararası uzmanlığa sahiptir.
                </p>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'25px'}}>
                    {/* Liepaja Kartı */}
                    <div style={{background:'#f9fcf9', padding:'20px', borderRadius:'10px', border:'1px solid #e0e0e0'}}>
                        <div style={{color:'#003399', fontWeight:'bold', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px'}}>
                            <span>🇱🇻</span> Liepāja (Letonya)
                        </div>
                        <p style={{fontSize:'0.9rem', color:'#555', lineHeight:'1.6'}}>
                            <strong>100 İklim Nötr Şehir Misyonu</strong> üyesi olarak akıllı şehir ve atık sensörleri modellerini Kapaklı'ya aktarmaktadır.
                        </p>
                    </div>

                    {/* Cascais Kartı */}
                    <div style={{background:'#f9fcf9', padding:'20px', borderRadius:'10px', border:'1px solid #e0e0e0'}}>
                        <div style={{color:'#003399', fontWeight:'bold', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px'}}>
                            <span>🇵🇹</span> Cascais (Portekiz)
                        </div>
                        <p style={{fontSize:'0.9rem', color:'#555', lineHeight:'1.6'}}>
                            Doğa tabanlı çözümler ve toplum temelli çevre eğitimi ile vatandaş katılımı ve uzun vadeli planlamada rehberlik etmektedir.
                        </p>
                    </div>
                </div>

                <div style={{marginTop:'30px', background:'#eafaf1', padding:'20px', borderRadius:'10px', border:'1px solid #27ae60'}}>
                    <p style={{margin:0, color:'#2c3e50', fontSize:'0.95rem', lineHeight:'1.6'}}>
                        <i className="fas fa-check-circle" style={{color:'#27ae60', marginRight:'10px'}}></i>
                        Türk ortaklar <strong>TNKÜ</strong> (SECAP hazırlığı ve teknik geliştirme) ve <strong>Kampüs STK</strong> (Yerel katılım) ile desteklenen bu işbirliği, karşılıklı bilgi transferi yoluyla <strong>Avrupa Yeşil Mutabakatı'na</strong> katkı sağlamakta ve geliştirilen dijital araçların belediye operasyonlarına entegrasyonuyla projenin kalıcı sürdürülebilirliğini güvence altına almaktadır.
                    </p>
                </div>
            </div>

            {/* 2. BÖLÜM: DIGI-GREEN FUTURE VİZYONU */}
            <div style={{background:'#fff', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderTop:'6px solid #003399'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
                    <span style={{background:'#003399', color:'white', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.8rem'}}>VİZYON</span>
                    <h2 style={{color:'#003399', margin:0, fontSize:'1.6rem'}}>DIGI-GREEN FUTURE Projesi</h2>
                </div>

                <p style={{lineHeight:'1.8', color:'#444', marginBottom:'30px', textAlign:'justify'}}>
                    Kapaklı Belediyesi liderliğinde, iklim değişikliği ve dijital dönüşüm gibi acil sorunlara karşı kapsamlı ve yenilikçi çözümler sunmaktadır.
                </p>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'30px', marginBottom:'30px'}}>
                    <div style={{textAlign:'center'}}>
                        <div style={{width:'60px', height:'60px', background:'#eef2f7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px auto', color:'#003399', fontSize:'1.5rem'}}>
                            <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h4 style={{marginBottom:'10px', color:'#333'}}>Somut Araçlar</h4>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>Mobil uygulamalar ve yapay zeka gibi araçlarla Kapaklı'nın çevresel hedeflerine ulaşmasını destekler.</p>
                    </div>

                    <div style={{textAlign:'center'}}>
                        <div style={{width:'60px', height:'60px', background:'#eef2f7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px auto', color:'#27ae60', fontSize:'1.5rem'}}>
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h4 style={{marginBottom:'10px', color:'#333'}}>Eğitim & Farkındalık</h4>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>Eğitimlerle toplumsal iklim bilincini ve dijital okuryazarlığı artırmayı hedefler.</p>
                    </div>

                    <div style={{textAlign:'center'}}>
                        <div style={{width:'60px', height:'60px', background:'#eef2f7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px auto', color:'#d35400', fontSize:'1.5rem'}}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h4 style={{marginBottom:'10px', color:'#333'}}>Sürdürülebilir Yönetim</h4>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>Detaylı planlama, finansal şeffaflık ve risk yönetimi sayesinde maliyet etkin bir yol haritası sunar.</p>
                    </div>
                </div>

                <div style={{background:'#003399', color:'white', padding:'25px', borderRadius:'10px', textAlign:'center', marginTop:'20px'}}>
                    <p style={{margin:0, fontSize:'1.1rem', fontWeight:'500', lineHeight:'1.6'}}>
                        "Tüm paydaşlar, yerel, ulusal ve Avrupa düzeyinde kalıcı bir etki oluşturmak üzere bu kapsamlı planı uygulamaya davet edilmektedir."
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
}