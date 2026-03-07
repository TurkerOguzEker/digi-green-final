'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import ScrollToTop from '../../../components/ScrollToTop';
// ✨ YENİ: Dil Context hook'umuzu dahil ettik
import { useLanguage } from '../../../context/LanguageContext';
// ✨ Ortak animasyonları tek satırda dışarıdan çağırıyoruz ✨
import { NetworkBackground, HeroAnimation } from '../../../components/BackgroundAnimations';

// ─── SVG İKONLAR ──────────────────────────────────────────────────────────────
const Icon = ({ name, color='currentColor', size=20 }) => {
  const icons = {
    arrowLeftRight:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>),
    smartphone:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>),
    graduationCap:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>),
    megaphone:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>),
    globe:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
    map:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>),
    fileText:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>),
    users:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    recycle:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>),
    cpu:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>),
    wifi:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>),
    bookOpen:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>),
    video:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>),
    share2:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>),
    hash:(<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>),
  };
  return icons[name] || null;
};

// ─── ANA SAYFA BİLEŞENİ ────────────────────────────────────────────────────────
export default function PlanPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  const { language, t } = useLanguage();

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {}; data?.forEach(d => (map[d.key] = d.value));
      setContent(map); setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal, .reveal-up').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, content]);

  // ✨ BOŞ BIRAKILANLARI YÖNETEN AKILLI FONKSİYON
  const getDynamicContent = (trKey, defaultTranslationKey) => {
    if (language === 'en') {
      const enKey = `${trKey}_en`;
      // Veritabanında (boş string olarak bile) kayıtlıysa onu döndür
      if (content[enKey] !== undefined) return content[enKey];
      
      const translation = t(defaultTranslationKey);
      if (translation !== defaultTranslationKey) return translation;
      
      if (content[trKey] !== undefined) return content[trKey];
    }
    
    // Türkçe ise veritabanında var mı bak
    if (content[trKey] !== undefined) return content[trKey];
    
    // Eğer hiçbir yerde yoksa, kod adını yazmak yerine BOŞ döndür
    const translationFallback = t(defaultTranslationKey);
    return translationFallback === defaultTranslationKey ? '' : translationFallback;
  };

  const steps = [
    {
      num: '01', code: 'İP2', accent: '#2563eb', icon: 'arrowLeftRight',
      title: getDynamicContent('plan_step_1_title', 'plan.timeline.step1.titleDefault'),
      desc:  getDynamicContent('plan_step_1_desc', 'plan.timeline.step1.descDefault'),
      pills: [
        { icon:'map',      label: getDynamicContent('plan_step_1_pill_1', 'plan.timeline.step1.pills.0'), bg:'blue-bg' },
        { icon:'fileText', label: getDynamicContent('plan_step_1_pill_2', 'plan.timeline.step1.pills.1'), bg:'blue-bg' },
        { icon:'users',    label: getDynamicContent('plan_step_1_pill_3', 'plan.timeline.step1.pills.2'), bg:'blue-bg' },
        { icon:'globe',    label: getDynamicContent('plan_step_1_pill_4', 'plan.timeline.step1.pills.3'), bg:'blue-bg' },
      ],
      pillClass: 'blue-pill', iconColor: '#2563eb',
    },
    {
      num: '02', code: 'İP3', accent: '#16a34a', icon: 'smartphone',
      title: getDynamicContent('plan_step_2_title', 'plan.timeline.step2.titleDefault'),
      desc:  getDynamicContent('plan_step_2_desc', 'plan.timeline.step2.descDefault'),
      pills: [
        { icon:'smartphone', label: getDynamicContent('plan_step_2_pill_1', 'plan.timeline.step2.pills.0'), bg:'green-bg' },
        { icon:'wifi',       label: getDynamicContent('plan_step_2_pill_2', 'plan.timeline.step2.pills.1'), bg:'green-bg' },
        { icon:'cpu',        label: getDynamicContent('plan_step_2_pill_3', 'plan.timeline.step2.pills.2'), bg:'green-bg' },
        { icon:'recycle',    label: getDynamicContent('plan_step_2_pill_4', 'plan.timeline.step2.pills.3'), bg:'green-bg' },
      ],
      pillClass: 'green-pill', iconColor: '#16a34a',
    },
    {
      num: '03', code: 'İP4', accent: '#ea580c', icon: 'graduationCap',
      title: getDynamicContent('plan_step_3_title', 'plan.timeline.step3.titleDefault'),
      desc:  getDynamicContent('plan_step_3_desc', 'plan.timeline.step3.descDefault'),
      pills: [
        { icon:'users',         label: getDynamicContent('plan_step_3_pill_1', 'plan.timeline.step3.pills.0'), bg:'orange-bg' },
        { icon:'graduationCap', label: getDynamicContent('plan_step_3_pill_2', 'plan.timeline.step3.pills.1'), bg:'orange-bg' },
        { icon:'bookOpen',      label: getDynamicContent('plan_step_3_pill_3', 'plan.timeline.step3.pills.2'), bg:'orange-bg' },
        { icon:'fileText',      label: getDynamicContent('plan_step_3_pill_4', 'plan.timeline.step3.pills.3'), bg:'orange-bg' },
      ],
      pillClass: 'orange-pill', iconColor: '#ea580c',
    },
    {
      num: '04', code: 'İP5', accent: '#7c3aed', icon: 'megaphone',
      title: getDynamicContent('plan_step_4_title', 'plan.timeline.step4.titleDefault'),
      desc:  getDynamicContent('plan_step_4_desc', 'plan.timeline.step4.descDefault'),
      pills: [
        { icon:'video',  label: getDynamicContent('plan_step_4_pill_1', 'plan.timeline.step4.pills.0'), bg:'purple-bg' },
        { icon:'globe',  label: getDynamicContent('plan_step_4_pill_2', 'plan.timeline.step4.pills.1'), bg:'purple-bg' },
        { icon:'hash',   label: getDynamicContent('plan_step_4_pill_3', 'plan.timeline.step4.pills.2'), bg:'purple-bg' },
        { icon:'share2', label: getDynamicContent('plan_step_4_pill_4', 'plan.timeline.step4.pills.3'), bg:'purple-bg' },
      ],
      pillClass: 'purple-pill', iconColor: '#7c3aed',
    },
  ];

  return (
    <div className="pp">
      {/* ✨ Ortak Arka Plan Ağı Çağrısı ✨ */}
      <NetworkBackground/>

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring"><div/><div/><div/><div/></div>
          <span className="loader-text">{t('plan.loading')}</span>
        </div>
      ) : (
        <>
          {/* ── HERO ── */}
          <section className="hero">
            {/* ✨ Ortak Yaprak Animasyonu Çağrısı ✨ */}
            <HeroAnimation/>
            <div className="hero-noise"/>
            <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
            
            <div className="container hero-content">
              <div className="eyebrow reveal active"><span className="edot"/> {getDynamicContent('plan_hero_eyebrow', 'plan.hero.eyebrow')} <span className="edot"/></div>
              <h1 className="hero-title reveal active">{getDynamicContent('plan_hero_title1', 'plan.hero.title1')}<br/><em>{getDynamicContent('plan_hero_title2', 'plan.hero.title2')}</em></h1>
              <p className="hero-sub reveal active" style={{transitionDelay:'.25s'}}>
                {getDynamicContent('plan_page_desc', 'plan.hero.descDefault')}
              </p>
              <div className="hero-div reveal active" style={{transitionDelay:'.4s'}}><span/><span className="hdot"/><span/></div>
            </div>
            <button className="scroll-btn" onClick={() => document.getElementById('icerik')?.scrollIntoView({behavior:'smooth'})} aria-label="Aşağı kaydır">
              <span className="scroll-label">{getDynamicContent('plan_hero_scroll', 'plan.hero.scrollBtn')}</span>
              <span className="scroll-icon"><i className="fas fa-chevron-down"/></span>
            </button>
          </section>

          {/* ── İÇERİK ── */}
          <section id="icerik" className="content-section">
            <div className="container" style={{maxWidth:'940px'}}>

              <div className="sec-head reveal-up">
                <p className="sec-label">{getDynamicContent('plan_sec_label', 'plan.section.part')}</p>
                <h2 className="sec-title">{getDynamicContent('plan_sec_title', 'plan.section.title')}</h2>
              </div>

              {/* İstatistikler */}
              <div className="stats reveal-up" style={{transitionDelay:'.1s'}}>
                {[
                  {val: getDynamicContent('plan_stat_1_val', 'plan.stats.s1_val') || '4',    unit: getDynamicContent('plan_stat_1_unit', 'plan.stats.s1_unit'),    label: getDynamicContent('plan_stat_1_label', 'plan.stats.packages') || 'İş Paketi'},
                  {val: getDynamicContent('plan_stat_2_val', 'plan.stats.s2_val') || '24',   unit: getDynamicContent('plan_stat_2_unit', 'plan.stats.s2_unit'),  label: getDynamicContent('plan_stat_2_label', 'plan.stats.duration') || 'Uygulama Süresi'},
                  {val: getDynamicContent('plan_stat_3_val', 'plan.stats.s3_val') || '3',    unit: getDynamicContent('plan_stat_3_unit', 'plan.stats.s3_unit'),    label: getDynamicContent('plan_stat_3_label', 'plan.stats.countries') || 'Ülkede Faaliyet'},
                  {val: getDynamicContent('plan_stat_4_val', 'plan.stats.s4_val') || 'İP2',  unit: getDynamicContent('plan_stat_4_unit', 'plan.stats.s4_unit'), label: getDynamicContent('plan_stat_4_label', 'plan.stats.range') || 'Paket Aralığı'},
                ].map((s,i) => (
                  <div className="stat" key={i}>
                    <div className="stat-v">{s.val}<span className="stat-u">{s.unit}</span></div>
                    <div className="stat-l">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ── TİMELİNE ── */}
              <div className="timeline">
                <div className="tl-line"/>

                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`tl-item reveal ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
                    style={{ transitionDelay: `${index * 0.08}s` }}
                  >
                    <div className="tl-node" style={{'--accent': step.accent}}>
                      <div className="tl-node-icon">
                        <Icon name={step.icon} color={step.accent} size={18}/>
                      </div>
                      <div className="tl-node-code">{step.code}</div>
                    </div>

                    <div className="tl-card" style={{'--accent': step.accent}}>
                      <div className="tl-card-shine"/>

                      <div className="tl-card-head">
                        <div className="tl-step-num">{step.num}</div>
                        <div className="tl-head-right">
                          <span className="tl-code-badge">{step.code}</span>
                          <h3 className="tl-title">{step.title}</h3>
                        </div>
                      </div>

                      <p className="tl-desc">{step.desc}</p>

                      <div className="tl-pills-label">
                        <div className="tl-pills-dot" style={{background: step.accent}}/>
                        {getDynamicContent('plan_timeline_pills_label', 'plan.timeline.pillsLabel') || 'Temel Faaliyetler'}
                      </div>
                      <div className="pill-grid">
                        {step.pills.map((p, pi) => (
                          <div className={`pill ${step.pillClass}`} key={pi}>
                            <span className={`pill-icon-wrap ${p.bg}`}>
                              <Icon name={p.icon} color={step.iconColor} size={15}/>
                            </span>
                            <span className="pill-text">{p.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </>
      )}

      <ScrollToTop/>

      <style jsx>{`
        .pp {
          font-family:'Inter',sans-serif; overflow-x:hidden;
          --gd:#1a5c38; --gm:#27ae60; --gp:#e8f5ee;
          --td:#1a1a1a; --ts:#6b8277;
          --card:rgba(255,255,255,0.92);
          --border:rgba(39,174,96,0.14);
          --sh:0 4px 24px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.04);
          --shh:0 16px 52px rgba(26,92,56,0.16),0 4px 14px rgba(0,0,0,0.05);
        }

        /* LOADER */
        .loading-screen{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;}
        .loader-ring{display:inline-block;position:relative;width:60px;height:60px;}
        .loader-ring div{box-sizing:border-box;display:block;position:absolute;width:46px;height:46px;margin:7px;border:3px solid transparent;border-top-color:#27ae60;border-radius:50%;animation:lspin 1.2s cubic-bezier(.5,0,.5,1) infinite;}
        .loader-ring div:nth-child(1){animation-delay:-.45s;}
        .loader-ring div:nth-child(2){animation-delay:-.3s;border-top-color:#c9a84c;}
        .loader-ring div:nth-child(3){animation-delay:-.15s;}
        .loader-text{font-size:.9rem;font-weight:600;color:var(--ts);letter-spacing:.1em;text-transform:uppercase;}
        @keyframes lspin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}

        /* REVEAL */
        .reveal{opacity:0;transition:opacity .9s cubic-bezier(.165,.84,.44,1),transform .9s cubic-bezier(.165,.84,.44,1);}
        .reveal.active{opacity:1;transform:translate(0,0)!important;}
        .reveal-left{transform:translateX(-60px);}
        .reveal-right{transform:translateX(60px);}
        .reveal-up{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease;}
        .reveal-up.active{opacity:1;transform:translateY(0);}

        /* HERO */
        .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;background:transparent;}
        .hero-noise{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.3;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:256px;}
        .orb{position:absolute;border-radius:50%;pointer-events:none;z-index:0;filter:blur(80px);opacity:.4;}
        .orb-1{width:500px;height:500px;top:-120px;left:-80px;background:radial-gradient(circle,rgba(39,174,96,.15) 0%,transparent 70%);animation:orbF 14s ease-in-out infinite;}
        .orb-2{width:400px;height:400px;bottom:-100px;right:-60px;background:radial-gradient(circle,rgba(201,168,76,.1) 0%,transparent 70%);animation:orbF 18s ease-in-out infinite reverse;}
        .orb-3{width:300px;height:300px;top:50%;left:55%;background:radial-gradient(circle,rgba(100,220,150,.1) 0%,transparent 70%);animation:orbF 10s ease-in-out infinite 3s;}
        @keyframes orbF{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-28px) scale(1.05);}}

        .hero-content{position:relative;z-index:3;}
        .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:.74rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#ea580c;margin-bottom:20px;}
        .edot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#ea580c;}
        .hero-title{font-size:clamp(2.2rem,5vw,3.8rem);font-weight:800;line-height:1.1;color:var(--td);margin-bottom:18px;letter-spacing:-.02em;}
        .hero-title em{font-style:normal;background:linear-gradient(90deg,#16a34a,#047857);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .hero-sub{font-size:1.02rem;font-weight:400;line-height:1.7;color:var(--ts);max-width:500px;margin:0 auto 32px;}
        .hero-div{display:flex;align-items:center;justify-content:center;gap:14px;}
        .hero-div span{height:1px;width:72px;background:rgba(0,0,0,.1);}
        .hdot{width:6px;height:6px;border-radius:50%;background:var(--gm);}

        .scroll-btn{position:absolute;bottom:38px;left:50%;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:9px;background:none;border:none;cursor:pointer;padding:0;}
        .scroll-label{font-size:.7rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--ts);transition:color .3s;}
        .scroll-btn:hover .scroll-label{color:var(--td);}
        .scroll-icon{width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;color:var(--ts);font-size:.88rem;transition:all .3s;animation:sbounce 2.2s ease-in-out infinite;background:rgba(255,255,255,.5);}
        .scroll-btn:hover .scroll-icon{border-color:#27ae60;background:rgba(39,174,96,.1);color:#27ae60;}
        @keyframes sbounce{0%,100%{transform:translateY(0);opacity:.7;}50%{transform:translateY(7px);opacity:1;}}

        /* CONTENT */
        .content-section{padding:56px 0 88px;position:relative;z-index:1;}
        .sec-head{margin-bottom:28px;}
        .sec-label{font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gm);margin-bottom:6px;}
        .sec-title{font-size:1.9rem;font-weight:800;color:var(--td);letter-spacing:-.02em;border-left:3px solid var(--gm);padding-left:16px;margin:0;}

        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:40px;}
        .stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 18px;text-align:center;backdrop-filter:blur(12px);box-shadow:var(--sh);transition:transform .3s,box-shadow .3s;}
        .stat:hover{transform:translateY(-4px);box-shadow:var(--shh);}
        .stat-v{font-size:1.75rem;font-weight:800;color:var(--gd);line-height:1;}
        .stat-u{font-size:.88rem;font-weight:600;color:var(--gm);margin-left:3px;}
        .stat-l{font-size:.75rem;color:var(--ts);margin-top:7px;font-weight:500;}

        /* ── TİMELİNE ── */
        .timeline{position:relative;display:flex;flex-direction:column;gap:32px;}

        /* Dikey çizgi */
        .tl-line{
          position:absolute;
          left:31px; top:24px; bottom:24px;
          width:2px;
          background:linear-gradient(to bottom,rgba(39,174,96,0.1),rgba(39,174,96,0.4),rgba(39,174,96,0.1));
          border-radius:2px;
          z-index:0;
        }

        /* Timeline öğesi */
        .tl-item{display:flex;align-items:flex-start;gap:24px;position:relative;z-index:1;}

        /* Düğüm (node) */
        .tl-node{
          flex-shrink:0;
          display:flex;flex-direction:column;align-items:center;gap:5px;
          padding-top:18px;
        }
        .tl-node-icon{
          width:50px;height:50px;
          border-radius:14px;
          background:#fff;
          border:2px solid var(--accent);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px color-mix(in srgb,var(--accent) 22%,transparent);
          transition:transform .3s,box-shadow .3s;
        }
        .tl-item:hover .tl-node-icon{
          transform:scale(1.08);
          box-shadow:0 6px 20px color-mix(in srgb,var(--accent) 32%,transparent);
        }
        .tl-node-code{
          font-size:.65rem;font-weight:800;
          letter-spacing:.08em;text-transform:uppercase;
          color:var(--accent);
          background:color-mix(in srgb,var(--accent) 10%,transparent);
          padding:2px 8px;border-radius:100px;
          border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);
        }

        /* Kart */
        .tl-card{
          flex:1;
          background:var(--card);
          backdrop-filter:blur(14px);
          border-radius:20px;
          border:1px solid var(--border);
          border-left:4px solid var(--accent);
          box-shadow:var(--sh);
          padding:28px 32px;
          position:relative;
          overflow:hidden;
          transition:transform .4s ease,box-shadow .4s ease;
        }
        .tl-card:hover{transform:translateY(-3px);box-shadow:var(--shh);}
        .tl-card-shine{position:absolute;top:0;left:-120%;width:55%;height:100%;background:linear-gradient(to right,rgba(255,255,255,0),rgba(255,255,255,.30),rgba(255,255,255,0));transform:skewX(-20deg);transition:left .65s ease;pointer-events:none;z-index:1;}
        .tl-card:hover .tl-card-shine{left:180%;}

        /* Kart başlık */
        .tl-card-head{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(0,0,0,.07);position:relative;z-index:2;}
        .tl-step-num{font-size:2.8rem;font-weight:900;color:color-mix(in srgb,var(--accent) 14%,transparent);line-height:1;flex-shrink:0;letter-spacing:-.04em;margin-top:-4px;}
        .tl-head-right{display:flex;flex-direction:column;gap:5px;}
        .tl-code-badge{display:inline-flex;align-items:center;width:fit-content;padding:2px 10px;border-radius:100px;font-size:.67rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);}
        .tl-title{font-size:1.12rem;font-weight:800;color:var(--accent);line-height:1.3;margin:0;}

        /* Açıklama */
        .tl-desc{font-size:.96rem;color:var(--ts);line-height:1.8;margin-bottom:18px;position:relative;z-index:2;}

        /* Faaliyetler etiketi */
        .tl-pills-label{display:flex;align-items:center;gap:8px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--ts);margin-bottom:12px;position:relative;z-index:2;}
        .tl-pills-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

        /* PILLS */
        .pill-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;position:relative;z-index:2;}
        .pill{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:11px;border:1px solid;transition:background .22s,transform .22s,box-shadow .22s;}
        .pill:hover{transform:translateY(-2px);box-shadow:0 5px 14px rgba(0,0,0,.06);}
        .blue-pill  {border-color:rgba(37,99,235,.2);background:rgba(37,99,235,.06);}
        .blue-pill:hover{background:rgba(37,99,235,.11);}
        .green-pill {border-color:rgba(22,163,74,.2);background:rgba(22,163,74,.06);}
        .green-pill:hover{background:rgba(22,163,74,.11);}
        .orange-pill{border-color:rgba(234,88,12,.2);background:rgba(234,88,12,.06);}
        .orange-pill:hover{background:rgba(234,88,12,.11);}
        .purple-pill{border-color:rgba(124,58,237,.2);background:rgba(124,58,237,.06);}
        .purple-pill:hover{background:rgba(124,58,237,.11);}

        .pill-icon-wrap{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .blue-bg  {background:rgba(37,99,235,.12);}
        .green-bg {background:rgba(22,163,74,.12);}
        .orange-bg{background:rgba(234,88,12,.12);}
        .purple-bg{background:rgba(124,58,237,.12);}
        .pill-text{font-size:.81rem;font-weight:600;color:var(--td);line-height:1.3;}

        .container{width:100%;padding:0 24px;margin:0 auto;}

        @media(max-width:900px){
          .stats{grid-template-columns:repeat(2,1fr);}
          .tl-card{padding:22px 24px;}
          .reveal-left,.reveal-right{transform:translateY(28px)!important;}
        }
        @media(max-width:640px){
          .hero{min-height:100svh;}
          .content-section{padding:36px 0 60px;}
          .stats{grid-template-columns:1fr 1fr;gap:10px;}
          .tl-line{display:none;}
          .tl-node{display:none;}
          .tl-item{flex-direction:column;gap:0;}
          .tl-card{border-left:4px solid var(--accent);border-radius:16px;padding:20px 18px;}
          .pill-grid{grid-template-columns:1fr;}
          .scroll-btn{bottom:26px;}
        }
      `}</style>
    </div>
  );
}