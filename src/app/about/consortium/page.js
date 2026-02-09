'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ConsortiumPage() {
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
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>II. Konsorsiyum Ortaklıkları</h1>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
            <p style={{fontSize:'1.2rem', color:'#555', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6'}}>
                Projemiz, Kapaklı Belediyesi'nin koordinatörlüğünde, tamamlayıcı becerilere sahip uluslararası ve ulusal ortakları bir araya getiren güçlü bir konsorsiyum yapısına sahiptir.
            </p>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            
            {/* A. BÖLÜM: BAŞVURU SAHİBİ */}
            <div style={{marginBottom:'50px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderLeft:'6px solid #003399'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                    <span style={{background:'#003399', color:'white', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.9rem'}}>KOORDİNATÖR</span>
                    <h2 style={{color:'#003399', margin:0, fontSize:'1.5rem'}}>A. Başvuru Sahibi: Kapaklı Belediyesi (Türkiye)</h2>
                </div>
                <p style={{lineHeight:'1.8', color:'#444', fontSize:'1.05rem', textAlign:'justify'}}>
                    Yaklaşık 150.000 kişilik genç nüfusa hizmet veren Kapaklı Belediyesi, yüksek göç ve sanayileşmeden kaynaklanan hava kirliliği ve düşük geri dönüşüm oranları gibi ciddi çevresel sorunlarla mücadele etmektedir. 
                    Belediye, ulusal düzeydeki başarılı proje tecrübesiyle (Emek Sepeti, Mantar Üretimi) projenin yerel uygulayıcısı ve ana öğrenen ortağıdır. Proje, kurum için bu zorluklara karşı stratejik bir kurumsal gelişim fırsatı sunmaktadır.
                </p>
            </div>

            {/* B. BÖLÜM: AVRUPALI ORTAKLAR */}
            <div style={{marginBottom:'50px'}}>
                <h2 style={{color:'#27ae60', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <i className="fas fa-globe-europe"></i> B. Avrupalı Ortaklar: Avrupa Uzmanlığından Dersler
                </h2>
                <p style={{marginBottom:'25px', color:'#555'}}>İki Avrupalı ortağımız, projemize kanıtlanmış iklim eylemi ve dijitalleşme modelleri katmaktadır:</p>
                
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                    
                    {/* Liepaja */}
                    <div style={{background:'#fdfdfd', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'25px', boxShadow:'0 3px 10px rgba(0,0,0,0.02)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                            <span style={{fontSize:'2rem'}}>🇱🇻</span>
                            <h3 style={{fontSize:'1.2rem', color:'#333', margin:0}}>Liepāja (Letonya)</h3>
                        </div>
                        <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                            <strong>AB'nin 100 İklim Nötr Şehir Misyonu</strong> üyesidir. Atık kutusu sensörleri ve e-öğrenme gibi akıllı şehir uygulamalarındaki tecrübesiyle, Kapaklı için dijitalleşme ve iklim eylemi stratejilerinde rehber olacaktır.
                        </p>
                    </div>

                    {/* Cascais */}
                    <div style={{background:'#fdfdfd', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'25px', boxShadow:'0 3px 10px rgba(0,0,0,0.02)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                            <span style={{fontSize:'2rem'}}>🇵🇹</span>
                            <h3 style={{fontSize:'1.2rem', color:'#333', margin:0}}>Cascais (Portekiz)</h3>
                        </div>
                        <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                            2009'dan beri iklim değişikliğiyle proaktif mücadele eden ve uzun vadeli hedefleri olan bir kurumdur. Doğa tabanlı çözümler ve toplum temelli çevre eğitimi alanlarındaki uzmanlığıyla, vatandaş katılımı ve uzun vadeli iklim planlaması yönlerinde rehberlik edecektir.
                        </p>
                    </div>
                </div>
            </div>

            {/* C. BÖLÜM: TÜRK ORTAKLAR */}
            <div style={{marginBottom:'50px'}}>
                <h2 style={{color:'#d35400', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <i className="fas fa-handshake"></i> C. Türk Ortaklar: Yerel Uzmanlık ve Bilimsel Titizlik
                </h2>
                
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                    
                    {/* TNKÜ */}
                    <div style={{background:'#fff', borderTop:'4px solid #d35400', borderRadius:'12px', padding:'25px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                            <i className="fas fa-university" style={{color:'#d35400', fontSize:'1.5rem'}}></i>
                            <h3 style={{fontSize:'1.1rem', color:'#333', margin:0}}>Tekirdağ Namık Kemal Üniversitesi (TNKÜ)</h3>
                        </div>
                        <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                            Projenin akademik ve teknik omurgasını oluşturmaktadır. Çevre yönetimi ve dijital teknolojilerdeki uzman akademik kadrosuyla, veri analizi, mobil uygulamanın teknik geliştirilmesi ve Kapaklı için <strong>SECAP (Sürdürülebilir Enerji ve İklim Eylem Planı)</strong> hazırlanmasına liderlik edecektir.
                        </p>
                    </div>

                    {/* Kampüs Derneği */}
                    <div style={{background:'#fff', borderTop:'4px solid #d35400', borderRadius:'12px', padding:'25px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                            <i className="fas fa-users" style={{color:'#d35400', fontSize:'1.5rem'}}></i>
                            <h3 style={{fontSize:'1.1rem', color:'#333', margin:0}}>Kampüs Sivil Toplum Derneği</h3>
                        </div>
                        <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                            Çevre ve eğitim odaklı bu STK, güçlü yerel ağı sayesinde gençlere ve dezavantajlı gruplara ulaşarak aktif vatandaş katılımını ve projenin saha çalışmalarını güvence altına alacaktır.
                        </p>
                    </div>
                </div>
            </div>

            {/* D. BÖLÜM: İŞBİRLİĞİ SİNERJİSİ */}
            <div style={{background:'#eafaf1', padding:'40px', borderRadius:'15px', border:'1px solid #27ae60', textAlign:'center'}}>
                <h2 style={{color:'#27ae60', marginBottom:'20px', fontSize:'1.6rem'}}>D. İşbirliği Sinerjisi: Çeşitli Bir Ortaklığın Katma Değeri</h2>
                <p style={{maxWidth:'800px', margin:'0 auto', lineHeight:'1.8', color:'#2c3e50', fontSize:'1.05rem'}}>
                    Projenin gücü, ortakların sadece coğrafi çeşitliliğinden değil, aynı zamanda farklı çevresel zorlukları (Kapaklı: Sanayi kirliliği; Liepāja: Kıyı kirliliği ve erozyonu; Cascais: Yangın, Kuraklık) deneyimlemesinden gelmektedir. 
                    <br/><br/>
                    <strong>Bu sinerji, bilginin tek yönlü akışını engelleyerek, karşılıklı öğrenmeye ve projenin çıktılarının farklı koşullara uyarlanabilir olmasına olanak tanımaktadır.</strong>
                </p>
            </div>

        </div>
    </div>
  );
}