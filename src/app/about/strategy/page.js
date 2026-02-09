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
        {/* ANA BAŞLIK */}
        <div className="section-title text-center" style={{marginBottom:'60px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>I. Stratejik Genel Bakış</h1>
            <p style={{fontSize:'1.3rem', color:'#666', fontWeight:'300'}}>Vizyon, Gerekçe ve Avrupa Uyum</p>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        <div style={{maxWidth:'900px', margin:'0 auto'}}>
            
            {/* A. BÖLÜM: PROJE KİMLİĞİ */}
            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#003399', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#003399', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>A</span>
                    Proje Kimliği ve Temel Bilgiler
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'20px', textAlign:'justify'}}>
                    Bu rapor, Kapaklı Belediyesi tarafından sunulan ve Erasmus+ programı kapsamında desteklenen <strong>"Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm" (DIGI-GREEN FUTURE)</strong> başlıklı projenin kapsamlı bir sunumunu sağlamak amacıyla hazırlanmıştır. 
                </p>
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'30px', textAlign:'justify'}}>
                    Toplam 24 ay sürecek olan proje, <strong>1 Kasım 2025</strong> tarihinde başlayıp <strong>31 Ekim 2027</strong> tarihinde sona erecektir. Projenin yürütülmesi için <strong>250.000,00 €'luk</strong> sabit bir hibe tahsis edilmiştir.
                </p>

                {/* --- PROJE ORTAKLARI (KUTU TASARIMI) --- */}
                <div style={{marginTop:'40px'}}>
                    <h3 style={{fontSize:'1.1rem', color:'#003399', marginBottom:'20px', borderLeft:'4px solid #27ae60', paddingLeft:'10px'}}>Proje Konsorsiyumu ve Ortaklar</h3>
                    <p style={{marginBottom:'25px', color:'#555'}}>Proje, çok uluslu bir yapıya sahip olup aşağıdaki stratejik ortaklardan oluşmaktadır:</p>
                    
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'25px'}}>
                        
                        {/* Letonya Kutusu */}
                        <div style={{border:'2px solid #eef2f7', borderRadius:'12px', padding:'25px', background:'#fff', transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'15px'}}>
                            <div style={{fontSize:'3rem', filter:'drop-shadow(0 3px 5px rgba(0,0,0,0.1))'}}>🇱🇻</div>
                            <div>
                                <span style={{display:'inline-block', padding:'4px 12px', borderRadius:'20px', background:'#f0f4f8', color:'#666', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'10px'}}>LETONYA</span>
                                <h4 style={{color:'#003399', margin:0, fontSize:'1rem', lineHeight:'1.5'}}>Liepājas Centrālā administrācija</h4>
                            </div>
                        </div>

                        {/* Portekiz Kutusu */}
                        <div style={{border:'2px solid #eef2f7', borderRadius:'12px', padding:'25px', background:'#fff', transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'15px'}}>
                            <div style={{fontSize:'3rem', filter:'drop-shadow(0 3px 5px rgba(0,0,0,0.1))'}}>🇵🇹</div>
                            <div>
                                <span style={{display:'inline-block', padding:'4px 12px', borderRadius:'20px', background:'#f0f4f8', color:'#666', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'10px'}}>PORTEKİZ</span>
                                <h4 style={{color:'#003399', margin:0, fontSize:'1rem', lineHeight:'1.5'}}>Emac Empresa Munıcıpal De Ambıentede Cascaıs Em Sa</h4>
                            </div>
                        </div>

                        {/* Türkiye Kutusu 1 */}
                        <div style={{border:'2px solid #eef2f7', borderRadius:'12px', padding:'25px', background:'#fff', transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'15px'}}>
                            <div style={{fontSize:'3rem', filter:'drop-shadow(0 3px 5px rgba(0,0,0,0.1))'}}>🇹🇷</div>
                            <div>
                                <span style={{display:'inline-block', padding:'4px 12px', borderRadius:'20px', background:'#f0f4f8', color:'#666', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'10px'}}>TÜRKİYE</span>
                                <h4 style={{color:'#003399', margin:0, fontSize:'1rem', lineHeight:'1.5'}}>Tekirdağ Namık Kemal Üniversitesi</h4>
                            </div>
                        </div>

                        {/* Türkiye Kutusu 2 */}
                        <div style={{border:'2px solid #eef2f7', borderRadius:'12px', padding:'25px', background:'#fff', transition:'all 0.3s', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'15px'}}>
                            <div style={{fontSize:'3rem', filter:'drop-shadow(0 3px 5px rgba(0,0,0,0.1))'}}>🇹🇷</div>
                            <div>
                                <span style={{display:'inline-block', padding:'4px 12px', borderRadius:'20px', background:'#f0f4f8', color:'#666', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'10px'}}>TÜRKİYE</span>
                                <h4 style={{color:'#003399', margin:0, fontSize:'1rem', lineHeight:'1.5'}}>Kampüs Sivil Toplum, Kültür, Sanat ve Eğitim Derneği</h4>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* B. BÖLÜM: PROJENİN RUHU */}
            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#27ae60', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#27ae60', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>B</span>
                    Projenin Ruhu: Gerekçe ve Motivasyon
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'20px', textAlign:'justify'}}>
                    Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur. Kapaklı gibi sanayileşme bölgelerinin hava/su kirliliği ve yetersiz atık yönetimi gibi acil çevresel sorunlarına odaklanmaktadır.
                </p>

                <blockquote style={{background:'#eafaf1', padding:'20px 25px', borderLeft:'5px solid #27ae60', fontStyle:'italic', color:'#2c3e50', borderRadius:'0 10px 10px 0', margin:'25px 0', fontSize:'1.05rem'}}>
                    "Temel felsefemiz; dijitalleşmeyi amaç değil, çevresel sürdürülebilirlik hedeflerine ulaşmak için güçlü bir araç olarak kullanmaktır."
                </blockquote>

                <p style={{lineHeight:'1.8', color:'#333', textAlign:'justify'}}>
                    Projemiz, mobil uygulamalar aracılığıyla belediye hizmetlerine erişimi kolaylaştırarak vatandaşların karbon ayak izini azaltmayı hedeflemektedir. En önemli çevresel çıktımız, dijitalleşme odaklı çözümlerle atık geri dönüşüm oranını mevcut <strong>%24'ten %29'a</strong> çıkarmaktır. Ayrıca, dezavantajlı grupların dijital okuryazarlığını ve toplumsal katılımını artırarak sosyal eşitliği güçlendiriyoruz.
                </p>
            </div>

            {/* C. BÖLÜM: AVRUPA POLİTİKALARI */}
            <div style={{marginBottom:'60px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', border:'1px solid #eee'}}>
                <h2 style={{color:'#d35400', borderBottom:'2px solid #f0f0f0', paddingBottom:'15px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{background:'#d35400', color:'white', width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0}}>C</span>
                    Avrupa Politikalarıyla Stratejik Uyum
                </h2>
                
                <p style={{lineHeight:'1.8', color:'#333', marginBottom:'25px'}}>
                    DIGI-GREEN FUTURE, Erasmus+ programının üç temel yatay önceliğiyle doğrudan uyumludur:
                </p>
                
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <div style={{background:'#fff', border:'1px solid #eee', padding:'15px 20px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'15px'}}>
                        <i className="fas fa-check-circle" style={{color:'#27ae60', fontSize:'1.2rem'}}></i>
                        <span style={{color:'#333', fontSize:'1rem'}}><strong>Çevre ve İklim Değişikliğiyle Mücadele</strong> (SECAP ve atık yönetimi odağı)</span>
                    </div>
                    <div style={{background:'#fff', border:'1px solid #eee', padding:'15px 20px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'15px'}}>
                        <i className="fas fa-check-circle" style={{color:'#003399', fontSize:'1.2rem'}}></i>
                        <span style={{color:'#333', fontSize:'1rem'}}><strong>Dijital Dönüşüm</strong></span>
                    </div>
                    <div style={{background:'#fff', border:'1px solid #eee', padding:'15px 20px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'15px'}}>
                        <i className="fas fa-check-circle" style={{color:'#f1c40f', fontSize:'1.2rem'}}></i>
                        <span style={{color:'#333', fontSize:'1rem'}}><strong>Tüm Nesiller Arasında Öğrenme Fırsatlarının Teşviki</strong></span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}   