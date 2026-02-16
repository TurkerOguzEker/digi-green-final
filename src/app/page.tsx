'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ContentState { [key: string]: string; }
interface CounterProps { end: number; duration?: number; }

const Counter = ({ end, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16); 
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);

  return <span ref={counterRef}>{count}</span>;
};

export default function Home() {
  const [content, setContent] = useState<ContentState>({});
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await supabase.from('settings').select('*');
        if (data) {
          const map: ContentState = {};
          data.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
          setContent(map);
        }
      } catch (error) {
        console.error("Veri hatası:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) { reveals[i].classList.add('active'); }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
        const { current } = sliderRef;
        const scrollAmount = 360; 
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  if (isLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff'}}>
          <div style={{color: '#003399', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'sans-serif'}}>Yükleniyor...</div>
      </div>
    );
  }

  // ✨ YENİ: Veritabanından gelen dinamik listeyi hazırla
  let ecoList: Array<{title: string, desc: string, icon: string}> = [];
  if (content.home_eco_list) {
      try { ecoList = JSON.parse(content.home_eco_list); } catch(e) { console.error(e); }
  }
  
  // Eğer henüz Admin'den yeni formatta kaydedilmediyse, sitenizin bozulmaması için eskisini kullan
  if (ecoList.length === 0) {
      ecoList = [
          { title: content.home_eco_1_title || 'Mobil Entegrasyon', desc: content.home_eco_1_desc || 'Vatandaşların belediye hizmetlerine tek tıkla ulaşmasını sağlayan entegre mobil çözüm.', icon: 'fa-mobile-screen' },
          { title: content.home_eco_2_title || 'Yapay Zeka & Atık', desc: content.home_eco_2_desc || 'Yapay zeka destekli sensörler ile atık yönetimini optimize ediyor, doluluk oranlarına göre rota planlıyoruz.', icon: 'fa-recycle' },
          { title: content.home_eco_3_title || 'E-Öğrenme', desc: content.home_eco_3_desc || 'İklim değişikliği ve dijital okuryazarlık üzerine modüler çevrimiçi eğitimler.', icon: 'fa-graduation-cap' },
          { title: content.home_eco_4_title || 'Sürdürülebilir Etki', desc: content.home_eco_4_desc || 'Karbon ayak izini azaltan ve kopyalanabilir dijital modeller.', icon: 'fa-leaf' }
      ];
  }

  return (
    <main className="overflow-hidden">
      
      {/* 1️⃣ HERO ALANI */}
      <section style={{position:'relative', height:'100vh', minHeight:'600px', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', color:'white', overflow:'hidden'}}>
          <div className="hero-bg-animate" style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', backgroundImage: content.hero_bg_image ? `url(${content.hero_bg_image})` : 'linear-gradient(135deg, #1B5E20 0%, #004d40 100%)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2}}></div>
          <div className="hero-overlay" style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:-1}}></div>
          <div className="container" style={{zIndex:10}}>
              <span className="reveal reveal-up" style={{background:'rgba(255,255,255,0.15)', backdropFilter:'blur(5px)', padding:'10px 25px', borderRadius:'50px', border:'1px solid rgba(255,255,255,0.3)', fontWeight:'bold', letterSpacing:'2px', textTransform:'uppercase', fontSize:'0.9rem'}}>
                  {content.header_logo_text || 'DIGI-GREEN FUTURE'}
              </span>
              <h1 className="reveal reveal-up delay-100" style={{fontSize:'clamp(2.5rem, 5vw, 4.5rem)', fontWeight:'800', margin:'25px 0', textShadow:'0 10px 30px rgba(0,0,0,0.3)', lineHeight:1.1}}>
                  {content.hero_title || 'Yerel Yeşil Gelecek İçin Dijital Dönüşüm'}
              </h1>
              <p className="reveal reveal-up delay-200" style={{fontSize:'1.25rem', maxWidth:'700px', margin:'0 auto 40px', opacity:0.95, lineHeight:1.6}}>
                  {content.hero_desc || 'Erasmus+ KA220-ADU kapsamında 3 ülkede sürdürülebilir ve dijital belediyecilik çözümleri geliştiriyoruz.'}
              </p>
              <div className="reveal reveal-up delay-300" style={{display:'flex', justifyContent:'center', gap:'20px', flexWrap:'wrap'}}>
                  <a href="#solutions" className="btn-hero">📱 Mobil Çözümler</a>
                  <a href="/about" className="btn-hero" style={{background:'white', color:'#003399', border:'2px solid white'}}>🌍 Projeyi İncele</a>
              </div>
          </div>
      </section>

      {/* 2️⃣ HIZLI ÖZET KARTLARI */}
      <section className="section-padding" style={{background:'transparent', marginTop:'-100px', position:'relative', zIndex:50, paddingBottom:'0'}}>
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'25px'}}>
                  {[
                      { icon: 'fa-clock', val: content.home_summary_1_val || '24 Ay', label: content.home_summary_1_label || 'Proje Süresi' },
                      { icon: 'fa-euro-sign', val: content.home_summary_2_val || '250.000€', label: content.home_summary_2_label || 'Toplam Bütçe' },
                      { icon: 'fa-handshake', val: content.home_summary_3_val || 'KA220-ADU', label: content.home_summary_3_label || 'Program' },
                      { icon: 'fa-globe', val: content.home_summary_4_val || '3 Ülke', label: content.home_summary_4_label || 'Kapsam' }
                  ].map((item, i) => (
                      <div key={i} className={`glass-card reveal reveal-up delay-${(i+1)*100}`}>
                          <i className={`fas ${item.icon}`} style={{fontSize:'2.5rem', color:'#27ae60'}}></i>
                          <h3 style={{fontSize:'2rem', fontWeight:'800', color:'#333'}}>{item.val}</h3>
                          <p style={{color:'#666', fontSize:'1rem', fontWeight:'500', textTransform:'uppercase', letterSpacing:'1px'}}>{item.label}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 3️⃣ PROJE HAKKINDA */}
      <section className="section-padding" style={{background:'white', overflow:'hidden'}}>
          <div className="container" style={{display:'flex', flexWrap:'wrap', alignItems:'center', gap:'60px'}}>
              <div className="reveal reveal-left" style={{flex:'1 1 500px'}}>
                  <div style={{position:'relative', padding:'20px'}}>
                      <div style={{borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', border:'10px solid white'}}>
                          <img src={content.home_about_image || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000"} alt="About" style={{width:'100%', display:'block'}} />
                      </div>
                      <div style={{position:'absolute', bottom:'0', right:'0', background:'#003399', color:'white', padding:'30px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,51,153,0.3)', maxWidth:'250px'}}>
                          <h4 style={{fontSize:'1.2rem', fontWeight:'bold', margin:0, lineHeight:1.4}}>
                              {content.home_summary_1_val || '24 Ay'} Sürecek Dijital ve Yeşil Bir Yolculuk
                          </h4>
                      </div>
                  </div>
              </div>
              <div className="reveal reveal-right" style={{flex:'1 1 500px'}}>
                  <h4 style={{color:'#27ae60', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'10px'}}>Proje Hakkında</h4>
                  <h2 style={{fontSize:'2.5rem', fontWeight:'800', color:'#1a1a1a', marginBottom:'25px', lineHeight:1.2}}>
                      {content.home_about_title || 'Teknoloji ve Doğanın Mükemmel Uyumu'}
                  </h2>
                  <p style={{color:'#555', fontSize:'1.1rem', lineHeight:1.7, marginBottom:'30px'}}>
                      {content.home_about_text || 'Kapaklı Belediyesi liderliğinde yürütülen DIGI-GREEN FUTURE, iklim değişikliği ile mücadelede dijital araçları kullanmayı hedefleyen öncü bir Erasmus+ projesidir.'}
                  </p>
                  <ul style={{display:'grid', gap:'15px'}}>
                      {['Mobil Uygulama Entegrasyonu', 'Yapay Zeka Destekli Atık Yönetimi', 'Uluslararası İşbirliği Ağı'].map((item, i) => (
                          <li key={i} style={{display:'flex', alignItems:'center', gap:'15px', background:'#f8f9fa', padding:'15px', borderRadius:'10px'}}>
                              <div style={{width:'30px', height:'30px', background:'#27ae60', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.9rem'}}><i className="fas fa-check"></i></div>
                              <span style={{fontWeight:'600', color:'#333'}}>{item}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </section>

      {/* 4️⃣ HEDEF KİTLE */}
      <section className="section-padding" style={{background:'#f0f4f8'}}>
          <div className="container">
              <div className="reveal reveal-up" style={{textAlign:'center', marginBottom:'50px'}}>
                  <h2 style={{fontSize:'2.2rem', fontWeight:'800', color:'#333'}}>Projemiz Kimler İçin?</h2>
                  <p style={{color:'#666'}}>Toplumun her kesimine dokunan çözümler.</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  {[
                      {title: content.home_target_1_title || 'Vatandaşlar', desc: content.home_target_1_desc || 'Mobil uygulamalar ile geri dönüşüme katılın, puan kazanın ve şehrinizi güzelleştirin.', icon: 'fa-user'},
                      {title: content.home_target_2_title || 'Yerel Yönetimler', desc: content.home_target_2_desc || 'Veriye dayalı kararlar alarak, kaynakları verimli kullanın ve operasyonel maliyetleri düşürün.', icon: 'fa-building'},
                      {title: content.home_target_3_title || 'STK ve Akademik', desc: content.home_target_3_desc || 'Araştırma, eğitim ve toplumsal farkındalık çalışmalarında aktif rol alın.', icon: 'fa-tree'}
                  ].map((kitle, i) => (
                      <div key={i} className="reveal reveal-up" style={{background:'white', padding:'30px', borderRadius:'15px', textAlign:'center', borderBottom:'4px solid #27ae60', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
                          <div style={{width:'60px', height:'60px', background:'#e8f5e9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#27ae60', fontSize:'1.5rem'}}>
                              <i className={`fas ${kitle.icon}`}></i>
                          </div>
                          <h4 style={{fontSize:'1.3rem', fontWeight:'bold', marginBottom:'10px'}}>{kitle.title}</h4>
                          <p style={{color:'#666', lineHeight:1.6}}>{kitle.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 5️⃣ DİJİTAL EKOSİSTEM (ZİG-ZAG & SLIDER) */}
      <section id="solutions" className="section-padding bg-grid-green" style={{backgroundColor:'#fff'}}>
          <div className="container">
              <div className="reveal reveal-up" style={{textAlign:'center', marginBottom:'40px'}}>
                  <h2 style={{fontSize:'2.5rem', fontWeight:'800', color:'#1a1a1a', marginBottom:'15px'}}>
                      Dijital <span style={{color:'#27ae60'}}>Ekosistemimiz</span>
                  </h2>
                  <p style={{color:'#666', maxWidth:'600px', margin:'0 auto'}}>
                      Teknolojiyi doğanın hizmetine sunan entegre çözüm ağımız. <br/>
                  </p>
              </div>
          </div> 

          {/* Slider Kapsayıcı */}
          <div className="tree-wrapper">
              
              <div className="tree-line"></div>
              
              <button className="slider-btn prev" onClick={() => scrollSlider('left')} aria-label="Sola Kaydır" style={{left: '30px', zIndex: 50}}>
                  <i className="fas fa-chevron-left"></i>
              </button>
              
              {/* ✨ YENİ: DİNAMİK LİSTE (Admin panelinde kaç kutu varsa otomatik çeker ve renkleri döngüyle atar) */}
              <div className="tree-scroll" ref={sliderRef}>
                  {ecoList.map((item, index) => {
                      // Kutu renklerini otomatik sırayla atamak için dizi:
                      const colors = ['#003399', '#27ae60', '#f39c12', '#00acc1', '#8e44ad', '#e74c3c'];
                      const color = colors[index % colors.length];
                      
                      return (
                          <div key={index} className={`tree-item reveal reveal-up delay-${((index % 3) + 1) * 100}`}>
                              <div className="tree-dot"></div>
                              <div className="tree-card">
                                  <div style={{color: color, fontSize:'2rem', marginBottom:'15px'}}>
                                      <i className={`fas ${item.icon}`}></i>
                                  </div>
                                  <h3 style={{fontSize:'1.2rem', fontWeight:'bold', marginBottom:'10px'}}>
                                      {item.title}
                                  </h3>
                                  <p style={{color:'#666', fontSize:'0.9rem', lineHeight:1.5}}>
                                      {item.desc}
                                  </p>
                              </div>
                          </div>
                      );
                  })}
              </div>

              <button className="slider-btn next" onClick={() => scrollSlider('right')} aria-label="Sağa Kaydır" style={{right: '30px', zIndex: 50}}>
                  <i className="fas fa-chevron-right"></i>
              </button>

          </div>
      </section>

      {/* 6️⃣ SAYAÇLAR */}
      <section className="section-padding" style={{background:'#1B5E20', color:'white'}}>
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'40px', textAlign:'center'}}>
                  {[
                      { icon: 'fa-euro-sign', val: parseInt(content.home_counter_1_val) || 250000, label: content.home_counter_1_label || 'Toplam Hibe (€)' },
                      { icon: 'fa-globe-europe', val: parseInt(content.home_counter_2_val) || 3, label: content.home_counter_2_label || 'Ortak Ülke' },
                      { icon: 'fa-handshake', val: parseInt(content.home_counter_3_val) || 5, label: content.home_counter_3_label || 'Proje Ortağı' },
                      { icon: 'fa-clock', val: parseInt(content.home_counter_4_val) || 24, label: content.home_counter_4_label || 'Ay Süre' }
                  ].map((stat, i) => (
                      <div key={i} className="reveal reveal-up" style={{transitionDelay: `${i * 0.1}s`}}>
                          <i className={`fas ${stat.icon}`} style={{fontSize:'3rem', color:'#69F0AE', marginBottom:'20px'}}></i>
                          <div style={{fontSize:'3.5rem', fontWeight:'800', marginBottom:'10px', lineHeight:1}}>
                              <Counter end={stat.val} />
                          </div>
                          <p style={{color:'#C8E6C9', fontSize:'1.1rem', fontWeight:'500', textTransform:'uppercase'}}>{stat.label}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 7️⃣ CTA */}
      <section style={{background:'#003399', padding:'100px 0', textAlign:'center', color:'white', position:'relative', overflow:'hidden'}}>
          <div className="reveal reveal-left" style={{position:'absolute', top:'-50px', left:'-50px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.1)'}}></div>
          <div className="reveal reveal-right" style={{position:'absolute', bottom:'-50px', right:'-50px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.05)'}}></div>
          <div className="container reveal reveal-up" style={{position:'relative', zIndex:5}}>
              <h2 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'20px'}}>
                  {content.home_cta_title || 'Geleceği Birlikte Tasarlayalım'}
              </h2>
              <p style={{fontSize:'1.2rem', opacity:0.9, maxWidth:'700px', margin:'0 auto 40px'}}>
                  {content.home_cta_text || 'DIGI-GREEN FUTURE projesi hakkında daha fazla bilgi almak, eğitimlere katılmak veya işbirliği yapmak için bize ulaşın.'}
              </p>
              <a href="/contact" className="btn" style={{background:'white', color:'#003399', padding:'15px 45px', borderRadius:'50px', fontSize:'1.1rem', boxShadow:'0 10px 20px rgba(0,0,0,0.2)', fontWeight:'bold'}}>
                  İletişime Geç <i className="fas fa-arrow-right"></i>
              </a>
          </div>
      </section>

    </main>
  );
}