'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface ContentState { [key: string]: string; }
interface CounterProps { end: number; duration?: number; }
interface EcoItem { title: string; title_en?: string; desc: string; desc_en?: string; icon: string; }

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
  const [ecoList, setEcoList] = useState<EcoItem[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const { language, t } = useLanguage();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startAnim, setStartAnim] = useState(false);

  // ✨ AKILLI ÇEVİRİ VE YEDEKLEME SİSTEMİ (Hatalı kodların görünmesini engeller)
  const getDynamicContent = (trKey: string, defaultTranslationKey: string) => {
    if (language === 'en') {
      const enKey = `${trKey}_en`;
      if (content[enKey] && content[enKey].trim() !== '') return content[enKey];
      
      const translation = t(defaultTranslationKey);
      if (translation !== defaultTranslationKey) return translation;
      
      if (content[trKey] && content[trKey].trim() !== '') return content[trKey];
    }
    
    if (content[trKey] && content[trKey].trim() !== '') return content[trKey];
    return t(defaultTranslationKey);
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await supabase.from('settings').select('*');
        if (data) {
          const map: ContentState = {};
          data.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
          setContent(map);
          
          if (map.home_eco_list) {
            try { 
              setEcoList(JSON.parse(map.home_eco_list)); 
            } catch(e) { console.error("Eco list parse error:", e); }
          }
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
    if (!isLoading && ecoList.length === 0) {
      setEcoList([
          { title: getDynamicContent('home_eco_1_title', 'home.ecosystem.item1.title'), title_en: getDynamicContent('home_eco_1_title_en', 'home.ecosystem.item1.title'), desc: getDynamicContent('home_eco_1_desc', 'home.ecosystem.item1.desc'), desc_en: getDynamicContent('home_eco_1_desc_en', 'home.ecosystem.item1.desc'), icon: 'fa-mobile-screen' },
          { title: getDynamicContent('home_eco_2_title', 'home.ecosystem.item2.title'), title_en: getDynamicContent('home_eco_2_title_en', 'home.ecosystem.item2.title'), desc: getDynamicContent('home_eco_2_desc', 'home.ecosystem.item2.desc'), desc_en: getDynamicContent('home_eco_2_desc_en', 'home.ecosystem.item2.desc'), icon: 'fa-recycle' },
          { title: getDynamicContent('home_eco_3_title', 'home.ecosystem.item3.title'), title_en: getDynamicContent('home_eco_3_title_en', 'home.ecosystem.item3.title'), desc: getDynamicContent('home_eco_3_desc', 'home.ecosystem.item3.desc'), desc_en: getDynamicContent('home_eco_3_desc_en', 'home.ecosystem.item3.desc'), icon: 'fa-graduation-cap' },
          { title: getDynamicContent('home_eco_4_title', 'home.ecosystem.item4.title'), title_en: getDynamicContent('home_eco_4_title_en', 'home.ecosystem.item4.title'), desc: getDynamicContent('home_eco_4_desc', 'home.ecosystem.item4.desc'), desc_en: getDynamicContent('home_eco_4_desc_en', 'home.ecosystem.item4.desc'), icon: 'fa-leaf' }
      ]);
    }
  }, [isLoading, content, language]); 

  useEffect(() => {
      if (!isLoading) {
          const timer = setTimeout(() => {
              setStartAnim(true);
          }, 50);
          return () => clearTimeout(timer);
      }
  }, [isLoading]);

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

  let heroImages: string[] = [];
  if (content.hero_slider_images) {
      try { heroImages = JSON.parse(content.hero_slider_images); } catch(e) { console.error(e); }
  } else if (content.hero_bg_image) {
      heroImages = [content.hero_bg_image];
  }

  useEffect(() => {
      if (heroImages.length <= 1) return;
      const interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 15000); 
      return () => clearInterval(interval);
  }, [heroImages.length]);

  if (isLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff'}}>
          <div style={{color: '#27ae60', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'sans-serif'}}>{t('home.loading')}</div>
      </div>
    );
  }

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

  return (
    <main>
      {/* 1. HERO ALANI (SLIDER) */}
      <section style={{position:'relative', height:'100vh', minHeight:'600px', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', color:'white', overflow:'hidden'}}>
          {heroImages.length > 0 ? (
              heroImages.map((img, index) => {
                  const isActive = currentSlide === index;
                  const transitionStyle = isActive
                    ? 'opacity 3s ease-in-out 0s, transform 30s linear 0s'
                    : 'opacity 3s ease-in-out 0s, transform 0.1s linear 3.2s';

                  return (
                    <div 
                        key={index} 
                        style={{
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            backgroundImage: `url(${img})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center', 
                            zIndex: isActive ? -1 : -2,
                            opacity: isActive ? 1 : 0,
                            transform: (isActive && startAnim) ? 'scale(1.15)' : 'scale(1)',
                            transition: transitionStyle,
                            willChange: 'opacity, transform',
                        }}
                    ></div>
                  );
              })
          ) : (
              <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', backgroundImage: 'linear-gradient(135deg, #1B5E20 0%, #004d40 100%)', zIndex: -2}}></div>
          )}

          <div className="hero-overlay" style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:-1, background: 'rgba(0,0,0,0.4)'}}></div>
          
          <div className="container" style={{zIndex:10}}>
              <span className="reveal reveal-up" style={{background:'rgba(255,255,255,0.15)', backdropFilter:'blur(5px)', padding:'10px 25px', borderRadius:'50px', border:'1px solid rgba(255,255,255,0.3)', fontWeight:'bold', letterSpacing:'2px', textTransform:'uppercase', fontSize:'0.9rem'}}>
                  {getDynamicContent('home_hero_eyebrow', 'home.hero.eyebrow')}
              </span>
              <h1 className="reveal reveal-up delay-100" style={{fontSize:'clamp(2.5rem, 5vw, 4.5rem)', fontWeight:'800', margin:'25px 0', color: 'white', textShadow:'0 10px 30px rgba(0,0,0,0.3)', lineHeight:1.1}}>
                  {getDynamicContent('hero_title', 'home.hero.title')}
              </h1>
              <p className="reveal reveal-up delay-200" style={{fontSize:'1.25rem', maxWidth:'700px', margin:'0 auto 40px', opacity:0.95, lineHeight:1.6}}>
                  {getDynamicContent('hero_desc', 'home.hero.desc')}
              </p>
              <div className="reveal reveal-up delay-300" style={{display:'flex', justifyContent:'center', gap:'20px', flexWrap:'wrap'}}>
                  <a 
                      href="#solutions" 
                      className="btn-hero"
                      onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                  >
                      <i className="fas fa-mobile-alt" style={{marginRight:'8px'}}></i>{getDynamicContent('home_hero_btn1', 'home.hero.btnMobile')}
                  </a>
                  
                  <a href="/about" className="btn-hero" style={{background:'white', color:'#27ae60', border:'2px solid white'}}><i className="fas fa-leaf" style={{marginRight:'8px'}}></i>{getDynamicContent('home_hero_btn2', 'home.hero.btnExplore')}</a>
              </div>
          </div>
      </section>

      {/* 2. HIZLI ÖZET KARTLARI */}
      <section className="section-padding" style={{background:'transparent', marginTop:'-100px', position:'relative', zIndex:50, paddingBottom:'0'}}>
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'25px'}}>
                  {[
                      { icon: 'fa-clock', val: getDynamicContent('home_summary_1_val', 'home.summary.durationVal'), label: getDynamicContent('home_summary_1_label', 'home.summary.duration') },
                      { icon: 'fa-euro-sign', val: getDynamicContent('home_summary_2_val', 'home.summary.budgetVal'), label: getDynamicContent('home_summary_2_label', 'home.summary.budget') },
                      { icon: 'fa-handshake', val: getDynamicContent('home_summary_3_val', 'home.summary.programVal'), label: getDynamicContent('home_summary_3_label', 'home.summary.program') },
                      { icon: 'fa-globe', val: getDynamicContent('home_summary_4_val', 'home.summary.scopeVal'), label: getDynamicContent('home_summary_4_label', 'home.summary.scope') }
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

      {/* 3. PROJE HAKKINDA */}
      <section className="section-padding" style={{background:'white', overflow:'hidden'}}>
          <div className="container" style={{display:'flex', flexWrap:'wrap', alignItems:'center', gap:'60px'}}>
              <div className="reveal reveal-left" style={{flex:'1 1 500px'}}>
                  <div style={{position:'relative', padding:'20px'}}>
                      <div style={{borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', border:'10px solid white'}}>
                          <img src={content.home_about_image || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000"} alt="About" style={{width:'100%', display:'block'}} />
                      </div>
                      <div style={{
                          position:'absolute', 
                          bottom:'-10px', 
                          right:'-10px', 
                          background:'#27ae60', 
                          color:'white', 
                          padding:'15px 20px', 
                          borderRadius:'15px', 
                          boxShadow:'0 8px 25px rgba(39, 174, 96, 0.4)', 
                          maxWidth:'180px',
                          zIndex: 10
                      }}>
                          <h4 style={{fontSize:'0.9rem', fontWeight:'600', margin:0, lineHeight:1.3}}>
                              <span style={{fontWeight: 900, display:'block', fontSize:'1.4rem', marginBottom:'3px'}}>{getDynamicContent('home_summary_1_val', 'home.summary.durationVal')}</span> 
                              {getDynamicContent('home_about_badge', 'home.about.badge')}
                          </h4>
                      </div>
                  </div>
              </div>
              <div className="reveal reveal-right" style={{flex:'1 1 500px', zIndex: 1}}>
                  <h4 style={{color:'#27ae60', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'10px'}}>
                      {getDynamicContent('home_about_eyebrow', 'home.about.eyebrow')}
                  </h4>
                  <h2 style={{fontSize:'2.5rem', fontWeight:'800', color:'#1a1a1a', marginBottom:'25px', lineHeight:1.2}}>
                      {getDynamicContent('home_about_title', 'home.about.title')}
                  </h2>
                  <p style={{color:'#555', fontSize:'1.1rem', lineHeight:1.7, marginBottom:'30px'}}>
                      {getDynamicContent('home_about_text', 'home.about.text')}
                  </p>
                  <ul style={{display:'grid', gap:'15px'}}>
                      {[1, 2, 3].map((num) => (
                          <li key={num} style={{display:'flex', alignItems:'center', gap:'15px', background:'#f8f9fa', padding:'15px', borderRadius:'10px'}}>
                              <div style={{width:'30px', height:'30px', background:'#27ae60', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.9rem'}}><i className="fas fa-check"></i></div>
                              <span style={{fontWeight:'600', color:'#333'}}>{getDynamicContent(`home_about_bullet_${num}`, `home.about.bullets.${num-1}`)}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </section>

      {/* 4. HEDEF KİTLE */}
      <section className="section-padding" style={{background:'#f0f4f8'}}>
          <div className="container">
              <div className="reveal reveal-up" style={{textAlign:'center', marginBottom:'50px'}}>
                  <h2 style={{fontSize:'2.5rem', fontWeight:'800', color:'#333'}}>{getDynamicContent('home_target_main_title', 'home.target.title')}</h2>
                  <p style={{color:'#666'}}>{getDynamicContent('home_target_main_subtitle', 'home.target.subtitle')}</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  {[
                      {title: getDynamicContent('home_target_1_title', 'home.target.item1.title'), desc: getDynamicContent('home_target_1_desc', 'home.target.item1.desc'), icon: 'fa-user'},
                      {title: getDynamicContent('home_target_2_title', 'home.target.item2.title'), desc: getDynamicContent('home_target_2_desc', 'home.target.item2.desc'), icon: 'fa-building'},
                      {title: getDynamicContent('home_target_3_title', 'home.target.item3.title'), desc: getDynamicContent('home_target_3_desc', 'home.target.item3.desc'), icon: 'fa-tree'}
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

      {/* 5. DİJİTAL EKOSİSTEM (AĞAÇ YAPISI - DİNAMİK JSON) */}
      <section id="solutions" className="section-padding bg-grid-green" style={{backgroundColor:'#fff'}}>
          <div className="container">
              <div className="reveal reveal-up" style={{textAlign:'center', marginBottom:'40px'}}>
                  <h2 style={{fontSize:'2.5rem', fontWeight:'800', color:'#1a1a1a', marginBottom:'15px'}}>
                      {getDynamicContent('home_eco_main_title1', 'home.ecosystem.title1')} <span style={{color:'#27ae60'}}>{getDynamicContent('home_eco_main_title2', 'home.ecosystem.title2')}</span>
                  </h2>
                  <p style={{color:'#666', maxWidth:'600px', margin:'0 auto'}}>
                      {getDynamicContent('home_eco_main_subtitle', 'home.ecosystem.subtitle')} <br/>
                  </p>
              </div>
          </div> 

          <div className="tree-wrapper">
              <div className="tree-line"></div>
              
              <button className="slider-btn prev" onClick={() => scrollSlider('left')} aria-label="Sola Kaydır" style={{left: '30px', zIndex: 50}}>
                  <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="tree-scroll" ref={sliderRef}>
                  {ecoList.map((item, index) => {
                      const colors = ['#003399', '#27ae60', '#f39c12', '#00acc1', '#8e44ad', '#e74c3c'];
                      const color = colors[index % colors.length];
                      
                      const itemTitle = language === 'en' && item.title_en ? item.title_en : item.title;
                      const itemDesc = language === 'en' && item.desc_en ? item.desc_en : item.desc;
                      
                      return (
                          <div key={index} className={`tree-item reveal reveal-up delay-${((index % 3) + 1) * 100}`}>
                              <div className="tree-dot" style={{borderColor: color}}></div>
                              <div className="tree-card" style={{borderBottom: `4px solid ${color}`}}>
                                  <div style={{color: color, fontSize:'2rem', marginBottom:'15px'}}>
                                      <i className={`fas ${item.icon || 'fa-leaf'}`}></i>
                                  </div>
                                  <h3 style={{fontSize:'1.2rem', fontWeight:'bold', marginBottom:'10px'}}>
                                      {itemTitle}
                                  </h3>
                                  <p style={{color:'#666', fontSize:'0.9rem', lineHeight:1.5}}>
                                      {itemDesc}
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

      {/* 6. SAYAÇLAR */}
      <section className="section-padding" style={{background:'#27ae60', color:'white'}}>
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'40px', textAlign:'center'}}>
                  {[
                      { icon: 'fa-euro-sign', val: parseInt(content.home_counter_1_val) || 250000, label: getDynamicContent('home_counter_1_label', 'home.counters.grant') },
                      { icon: 'fa-globe-europe', val: parseInt(content.home_counter_2_val) || 3, label: getDynamicContent('home_counter_2_label', 'home.counters.countries') },
                      { icon: 'fa-handshake', val: parseInt(content.home_counter_3_val) || 5, label: getDynamicContent('home_counter_3_label', 'home.counters.partners') },
                      { icon: 'fa-clock', val: parseInt(content.home_counter_4_val) || 24, label: getDynamicContent('home_counter_4_label', 'home.counters.months') }
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

      {/* 7. CTA */}
      <section className="bg-grid-green" style={{backgroundColor:'#f4f7f2', padding:'100px 0', textAlign:'center', position:'relative', overflow:'hidden'}}>
          <div className="reveal reveal-left" style={{position:'absolute', top:'-50px', left:'-50px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(39, 174, 96, 0.05)'}}></div>
          <div className="reveal reveal-right" style={{position:'absolute', bottom:'-50px', right:'-50px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(39, 174, 96, 0.08)'}}></div>
          <div className="container reveal reveal-up" style={{position:'relative', zIndex:5}}>
              <h2 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'20px', color: '#1a1a1a'}}>
                  {getDynamicContent('home_cta_title', 'home.cta.title')}
              </h2>
              <p style={{fontSize:'1.2rem', color:'#666', maxWidth:'800px', margin:'0 auto 40px', whiteSpace: 'pre-wrap', lineHeight: 1.6}}>
                  {getDynamicContent('home_cta_text', 'home.cta.desc')}
              </p>
              
              <style dangerouslySetInnerHTML={{__html: `
                .btn-contact-hover {
                  background: #27ae60;
                  color: white;
                  padding: 15px 45px;
                  border-radius: 50px;
                  font-size: 1.1rem;
                  box-shadow: 0 10px 20px rgba(39, 174, 96, 0.3);
                  font-weight: bold;
                  display: inline-block;
                  text-decoration: none;
                  transition: all 0.3s ease;
                }
                .btn-contact-hover:hover {
                  background: #1e8449; 
                  box-shadow: 0 15px 25px rgba(39, 174, 96, 0.5); 
                  transform: translateY(-3px); 
                }
              `}} />
              
              <a href="/contact" className="btn-contact-hover">
                  {getDynamicContent('home_cta_btn', 'home.cta.button')} <i className="fas fa-arrow-right" style={{marginLeft:'8px'}}></i>
              </a>
          </div>
      </section>
    </main>
  );
}