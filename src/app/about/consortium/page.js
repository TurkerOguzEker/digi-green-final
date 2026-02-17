'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import ScrollToTop from '../../components/ScrollToTop';
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
        <div className="section-title text-center" style={{marginBottom:'50px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>
                {content.consortium_title || 'II. Konsorsiyum Ortaklıkları'}
            </h1>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
            <p style={{fontSize:'1.2rem', color:'#555', maxWidth:'800px', margin:'0 auto', lineHeight:'1.6'}}>
                {content.consortium_intro || "Projemiz, Kapaklı Belediyesi'nin koordinatörlüğünde, tamamlayıcı becerilere sahip uluslararası ve ulusal ortakları bir araya getiren güçlü bir konsorsiyum yapısına sahiptir."}
            </p>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            
            <div style={{marginBottom:'50px', background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderLeft:'6px solid #003399'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                    <span style={{background:'#003399', color:'white', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.9rem'}}>KOORDİNATÖR</span>
                    <h2 style={{color:'#003399', margin:0, fontSize:'1.5rem'}}>
                        {content.consortium_section_a_title || 'A. Başvuru Sahibi: Kapaklı Belediyesi (Türkiye)'}
                    </h2>
                </div>
                <p style={{lineHeight:'1.8', color:'#444', fontSize:'1.05rem', textAlign:'justify'}}>
                    {content.consortium_text_a || "Yaklaşık 150.000 kişilik genç nüfusa hizmet veren Kapaklı Belediyesi, yüksek göç ve sanayileşmeden kaynaklanan hava kirliliği ve düşük geri dönüşüm oranları gibi ciddi çevresel sorunlarla mücadele etmektedir. Belediye, ulusal düzeydeki başarılı proje tecrübesiyle projenin yerel uygulayıcısı ve ana öğrenen ortağıdır."}
                </p>
            </div>

            <div style={{marginBottom:'50px'}}>
                <h2 style={{color:'#27ae60', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <i className="fas fa-globe-europe"></i> 
                    {content.consortium_section_b_title || 'B. Avrupalı Ortaklar: Avrupa Uzmanlığından Dersler'}
                </h2>
                <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                    {content.consortium_text_b || "İki Avrupalı ortağımız (Liepāja ve Cascais), projemize kanıtlanmış iklim eylemi ve dijitalleşme modelleri katmaktadır. AB'nin 100 İklim Nötr Şehir Misyonu tecrübesi ve doğa tabanlı çözümler konusundaki uzmanlıklarıyla rehberlik edeceklerdir."}
                </p>
            </div>

            <div style={{marginBottom:'50px'}}>
                <h2 style={{color:'#d35400', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <i className="fas fa-handshake"></i> 
                    {content.consortium_section_c_title || 'C. Türk Ortaklar: Yerel Uzmanlık ve Bilimsel Titizlik'}
                </h2>
                <p style={{lineHeight:'1.6', color:'#555', fontSize:'0.95rem'}}>
                    {content.consortium_text_c || "Tekirdağ Namık Kemal Üniversitesi, projenin akademik ve teknik omurgasını oluştururken; Kampüs Sivil Toplum Derneği, güçlü yerel ağı sayesinde gençlere ve dezavantajlı gruplara ulaşarak aktif vatandaş katılımını sağlayacaktır."}
                </p>
            </div>

            <div style={{background:'#eafaf1', padding:'40px', borderRadius:'15px', border:'1px solid #27ae60', textAlign:'center'}}>
                <h2 style={{color:'#27ae60', marginBottom:'20px', fontSize:'1.6rem'}}>
                    {content.consortium_section_d_title || 'D. İşbirliği Sinerjisi: Çeşitli Bir Ortaklığın Katma Değeri'}
                </h2>
                <p style={{maxWidth:'800px', margin:'0 auto', lineHeight:'1.8', color:'#2c3e50', fontSize:'1.05rem'}}>
                    {content.consortium_text_d || "Projenin gücü, ortakların sadece coğrafi çeşitliliğinden değil, aynı zamanda farklı çevresel zorlukları (Kapaklı: Sanayi kirliliği; Liepāja: Kıyı kirliliği; Cascais: Yangın, Kuraklık) deneyimlemesinden gelmektedir. Bu sinerji, bilginin tek yönlü akışını engelleyerek, karşılıklı öğrenmeye olanak tanımaktadır."}
                </p>
            </div>

        </div>
    </div>
  );
}