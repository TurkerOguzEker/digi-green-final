'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PlanPage() {
  const [content, setContent] = useState({});

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {};
      data?.forEach(item => map[item.key] = item.value);
      setContent(map);
    });
  }, []);

  const steps = [
    {
      id: '01',
      code: 'İP2',
      color: '#003399',
      icon: 'fa-exchange-alt',
      title: content.plan_step_1_title || 'Sınır Ötesi Bilgi Paylaşımı & Eğitim',
      desc: content.plan_step_1_desc || "Letonya ve Portekiz'deki iyi uygulama örneklerini yerinde inceleyerek karşılıklı öğrenme yoluyla belediye personelinin dijital ve çevresel uygulamalar konusundaki bilgi ve deneyimini artırmaktır. Faaliyetler: Teknik Ziyaretler, SECAP Hazırlığı, Odak Grubu Çalışmaları.",
    },
    {
      id: '02',
      code: 'İP3',
      color: '#27ae60',
      icon: 'fa-mobile-alt',
      title: content.plan_step_2_title || 'Mobil Çözümler & Dijital Atık Yönetimi',
      desc: content.plan_step_2_desc || "Dijital dönüşümü hızlandırmak ve vatandaş-belediye etkileşimini güçlendirmek için mobil uygulamalar geliştirmek ve atık yönetimini dijitalleştirmektir. Faaliyetler: Mobil Uygulama, Hava Kalitesi Sensörleri, Yapay Zeka Destekli Atık Kutuları.",
    },
    {
      id: '03',
      code: 'İP4',
      color: '#d35400',
      icon: 'fa-chalkboard-teacher',
      title: content.plan_step_3_title || 'Eğitim Seferberliği & E-Öğrenme',
      desc: content.plan_step_3_desc || "Üç belediyede vatandaşlara, saha personeline ve kamu yöneticilerine yönelik kapsamlı iklim ve dijital farkındalık eğitimleri düzenlemektir. Faaliyetler: Vatandaş Eğitimleri, Personel Seminerleri, E-Öğrenme Modülleri.",
    },
    {
      id: '04',
      code: 'İP5',
      color: '#8e44ad',
      icon: 'fa-bullhorn',
      title: content.plan_step_4_title || 'Farkındalık & Görünürlük',
      desc: content.plan_step_4_desc || "Proje çıktılarının tanıtımını yaparak aktif kullanımını teşvik etmek ve toplumsal iklim bilincini artırmaktır. Faaliyetler: Video İçerikleri, Festival Katılımları, Sosyal Medya Kampanyaları.",
    }
  ];

  return (
    <div className="container section-padding">
        <div className="section-title text-center" style={{marginBottom:'80px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.5rem'}}>
                {content.plan_page_title || 'III. Proje Yol Haritası'}
            </h1>
            <p style={{fontSize:'1.2rem', color:'#666', fontWeight:'300'}}>
                {content.plan_page_desc || 'Amaçlar, Faaliyetler ve Beklenen Sonuçlar'}
            </p>
            <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto', position:'relative'}}>
            <div style={{position:'absolute', left:'29px', top:'0', bottom:'0', width:'2px', background:'#e0e0e0', zIndex:0}}></div>
            <div style={{display:'flex', flexDirection:'column', gap:'60px'}}>
                {steps.map((step, index) => (
                    <div key={index} style={{display:'flex', gap:'30px', position:'relative', zIndex:1}}>
                        <div style={{flexShrink:0}}>
                            <div style={{width:'60px', height:'60px', background:'white', border:`3px solid ${step.color}`, borderRadius:'50%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', color: step.color, fontWeight:'bold'}}>
                                <span style={{fontSize:'1.2rem', lineHeight:1}}>{step.id}</span>
                                <span style={{fontSize:'0.6rem', textTransform:'uppercase'}}>{step.code}</span>
                            </div>
                        </div>
                        <div style={{flex:1, background:'white', borderRadius:'15px', border:'1px solid #eee', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', overflow:'hidden'}}>
                            <div style={{background: step.color, padding:'20px 25px', display:'flex', alignItems:'center', gap:'15px'}}>
                                <i className={`fas ${step.icon}`} style={{color:'white', fontSize:'1.4rem', opacity:0.9}}></i>
                                <h3 style={{color:'white', margin:0, fontSize:'1.2rem', fontWeight:'600'}}>{step.title}</h3>
                            </div>
                            <div style={{padding:'25px'}}>
                                <p style={{color:'#555', lineHeight:'1.7', marginBottom:'0'}}>{step.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}