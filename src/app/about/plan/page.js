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

  // Proje Adımları Verisi
  const steps = [
    {
      id: '01',
      code: 'İP2',
      color: '#003399',
      icon: 'fa-exchange-alt',
      title: 'Sınır Ötesi Bilgi Paylaşımı & Eğitim',
      desc: "Letonya ve Portekiz'deki iyi uygulama örneklerini yerinde inceleyerek karşılıklı öğrenme yoluyla belediye personelinin dijital ve çevresel uygulamalar konusundaki bilgi ve deneyimini artırmaktır.",
      activities: [
        'Liepāja ve Cascais Teknik Ziyaretleri',
        'SECAP Hazırlığı (NKÜ Liderliğinde)',
        'Odak Grubu Çalışmaları'
      ],
      stats: [
        { val: '2', label: 'Hareketlilik' },
        { val: '50', label: 'Personel Eğitimi' },
        { val: '3', label: 'İyi Uygulama Raporu' }
      ]
    },
    {
      id: '02',
      code: 'İP3',
      color: '#27ae60',
      icon: 'fa-mobile-alt',
      title: 'Mobil Çözümler & Dijital Atık Yönetimi',
      desc: "Dijital dönüşümü hızlandırmak ve vatandaş-belediye etkileşimini güçlendirmek için mobil uygulamalar geliştirmek ve atık yönetimini dijitalleştirmektir.",
      activities: [
        'Mobil Uygulama Geliştirme',
        'Hava Kalitesi Sensör Ağı (100 Adet)',
        'Yapay Zeka Destekli Atık Kutusu (Pilot)',
        'Depozito İadeli Otomatlar'
      ],
      stats: [
        { val: '5K', label: 'İndirme Hedefi' },
        { val: '100', label: 'Sensör Kurulumu' },
        { val: '200', label: 'Pilot Kullanıcı' }
      ]
    },
    {
      id: '03',
      code: 'İP4',
      color: '#d35400',
      icon: 'fa-chalkboard-teacher',
      title: 'Eğitim Seferberliği & E-Öğrenme',
      desc: "Üç belediyede vatandaşlara, saha personeline ve kamu yöneticilerine yönelik kapsamlı iklim ve dijital farkındalık eğitimleri düzenlemektir.",
      activities: [
        'Vatandaş Eğitimleri (Stant & Seminer)',
        'Personel Teknik Eğitimleri',
        'Dijital E-Öğrenme Modülü Hazırlığı'
      ],
      stats: [
        { val: '2000', label: 'Vatandaş Eğitimi' },
        { val: '50', label: 'Saha Personeli' },
        { val: '100', label: 'Yönetici Bilgilendirme' }
      ]
    },
    {
      id: '04',
      code: 'İP5',
      color: '#8e44ad',
      icon: 'fa-bullhorn',
      title: 'Farkındalık & Görünürlük',
      desc: "Proje çıktılarının tanıtımını yaparak aktif kullanımını teşvik etmek ve toplumsal iklim bilincini artırmaktır.",
      activities: [
        'Video ve İçerik Üretimi (Kampüs Derneği)',
        'Festival ve Etkinlik Katılımları',
        'Sosyal Medya Kampanyaları'
      ],
      stats: [
        { val: '4', label: 'Tanıtım Videosu' },
        { val: '3K', label: 'Uygulama Kullanıcısı' },
        { val: '5', label: 'Basın Yansıması' }
      ]
    }
  ];

  return (
    <div className="container section-padding">
        {/* HEADER */}
        <div className="section-title text-center" style={{marginBottom:'80px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.5rem'}}>III. Proje Yol Haritası</h1>
            <p style={{fontSize:'1.2rem', color:'#666', fontWeight:'300'}}>Amaçlar, Faaliyetler ve Beklenen Sonuçlar</p>
            <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto', position:'relative'}}>
            
            {/* Dikey Çizgi (Sol Tarafta) */}
            <div style={{position:'absolute', left:'29px', top:'0', bottom:'0', width:'2px', background:'#e0e0e0', zIndex:0}}></div>

            <div style={{display:'flex', flexDirection:'column', gap:'60px'}}>
                {steps.map((step, index) => (
                    <div key={index} style={{display:'flex', gap:'30px', position:'relative', zIndex:1}}>
                        
                        {/* Sol Numara Yuvarlağı */}
                        <div style={{flexShrink:0}}>
                            <div style={{
                                width:'60px', height:'60px', 
                                background:'white', 
                                border:`3px solid ${step.color}`, 
                                borderRadius:'50%', 
                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                boxShadow:'0 5px 15px rgba(0,0,0,0.1)',
                                color: step.color, fontWeight:'bold'
                            }}>
                                <span style={{fontSize:'1.2rem', lineHeight:1}}>{step.id}</span>
                                <span style={{fontSize:'0.6rem', textTransform:'uppercase'}}>{step.code}</span>
                            </div>
                        </div>

                        {/* Sağ İçerik Kartı */}
                        <div style={{
                            flex:1, 
                            background:'white', 
                            borderRadius:'15px', 
                            border:'1px solid #eee',
                            boxShadow:'0 10px 30px rgba(0,0,0,0.05)',
                            overflow:'hidden',
                            transition:'transform 0.3s'
                        }}>
                            {/* Kart Başlığı */}
                            <div style={{background: step.color, padding:'20px 25px', display:'flex', alignItems:'center', gap:'15px'}}>
                                <i className={`fas ${step.icon}`} style={{color:'white', fontSize:'1.4rem', opacity:0.9}}></i>
                                <h3 style={{color:'white', margin:0, fontSize:'1.2rem', fontWeight:'600'}}>{step.title}</h3>
                            </div>

                            {/* Kart İçeriği */}
                            <div style={{padding:'25px'}}>
                                <p style={{color:'#555', lineHeight:'1.7', marginBottom:'20px'}}>
                                    {step.desc}
                                </p>

                                <div style={{display:'flex', flexWrap:'wrap', gap:'20px', marginBottom:'25px'}}>
                                    <div style={{flex:1, minWidth:'250px'}}>
                                        <h4 style={{fontSize:'0.9rem', color:step.color, textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Ana Faaliyetler</h4>
                                        <ul style={{listStyle:'none', padding:0, margin:0}}>
                                            {step.activities.map((act, i) => (
                                                <li key={i} style={{fontSize:'0.9rem', color:'#444', marginBottom:'6px', display:'flex', alignItems:'center', gap:'8px'}}>
                                                    <i className="fas fa-check" style={{color:step.color, fontSize:'0.7rem'}}></i> {act}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Rakamsal Hedefler (Kutucuklar) */}
                                    <div style={{flex:1, minWidth:'250px', display:'flex', gap:'10px', flexWrap:'wrap', alignContent:'flex-start'}}>
                                        {step.stats.map((stat, i) => (
                                            <div key={i} style={{background:'#f8f9fa', padding:'10px 15px', borderRadius:'8px', textAlign:'center', flex:'1 1 80px', border:`1px solid ${step.color}20`}}>
                                                <div style={{color:step.color, fontWeight:'bold', fontSize:'1.1rem'}}>{stat.val}</div>
                                                <div style={{fontSize:'0.7rem', color:'#777', lineHeight:'1.2'}}>{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bitiş Noktası */}
            <div style={{textAlign:'center', marginTop:'50px', position:'relative', zIndex:1}}>
                <div style={{display:'inline-block', padding:'10px 30px', background:'#27ae60', color:'white', borderRadius:'30px', fontWeight:'bold', boxShadow:'0 5px 15px rgba(39, 174, 96, 0.3)'}}>
                    <i className="fas fa-flag-checkered"></i> Sürdürülebilir Yeşil Gelecek
                </div>
            </div>

        </div>
    </div>
  );
}