'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import ScrollToTop from '../../../components/ScrollToTop';
import { useLanguage } from '../../../context/LanguageContext';
// ✨ Ortak animasyonları tek satırda dışarıdan çağırıyoruz ✨
import { NetworkBackground, HeroAnimation } from '../../../components/BackgroundAnimations';

// ─── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  const { language, t } = useLanguage();

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {};
      data?.forEach(item => map[item.key] = item.value);
      setContent(map);
      setLoading(false);
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
      if (content[enKey] !== undefined) return content[enKey];
      const translation = t(defaultTranslationKey);
      if (translation !== defaultTranslationKey) return translation;
      if (content[trKey] !== undefined) return content[trKey];
    }
    if (content[trKey] !== undefined) return content[trKey];
    const translationFallback = t(defaultTranslationKey);
    return translationFallback === defaultTranslationKey ? '' : translationFallback;
  };

  // 🎯 TABLO GÖREVLERİ (Artık Admin Panel'den dinamik çekiliyor)
  const roadmapData = [
    { id: 1, name: getDynamicContent('roadmap_task_1', 'roadmap.tasks.task1'), active: [1] },
    { id: 2, name: getDynamicContent('roadmap_task_2', 'roadmap.tasks.task2'), active: [2] },
    { id: 3, name: getDynamicContent('roadmap_task_3', 'roadmap.tasks.task3'), active: [5, 6] },
    { id: 4, name: getDynamicContent('roadmap_task_4', 'roadmap.tasks.task4'), active: [8, 9] },
    { id: 5, name: getDynamicContent('roadmap_task_5', 'roadmap.tasks.task5'), active: [7, 10] },
    { id: 6, name: getDynamicContent('roadmap_task_6', 'roadmap.tasks.task6'), active: [6, 9, 12, 15, 18, 21] },
    { id: 7, name: getDynamicContent('roadmap_task_7', 'roadmap.tasks.task7'), active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
    { id: 8, name: getDynamicContent('roadmap_task_8', 'roadmap.tasks.task8'), active: [17, 24] },
    { id: 9, name: getDynamicContent('roadmap_task_9', 'roadmap.tasks.task9'), active: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 10, name: getDynamicContent('roadmap_task_10', 'roadmap.tasks.task10'), active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 11, name: getDynamicContent('roadmap_task_11', 'roadmap.tasks.task11'), active: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 12, name: getDynamicContent('roadmap_task_12', 'roadmap.tasks.task12'), active: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 13, name: getDynamicContent('roadmap_task_13', 'roadmap.tasks.task13'), active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 14, name: getDynamicContent('roadmap_task_14', 'roadmap.tasks.task14'), active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 15, name: getDynamicContent('roadmap_task_15', 'roadmap.tasks.task15'), active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 16, name: getDynamicContent('roadmap_task_16', 'roadmap.tasks.task16'), active: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 17, name: getDynamicContent('roadmap_task_17', 'roadmap.tasks.task17'), active: [19, 20, 21, 22, 23, 24] },
    { id: 18, name: getDynamicContent('roadmap_task_18', 'roadmap.tasks.task18'), active: [19, 20, 21, 22, 23, 24] },
    { id: 19, name: getDynamicContent('roadmap_task_19', 'roadmap.tasks.task19'), active: [19, 20, 21, 22, 23, 24] },
    { id: 20, name: getDynamicContent('roadmap_task_20', 'roadmap.tasks.task20'), active: [19, 20, 21, 22, 23, 24] },
    { id: 21, name: getDynamicContent('roadmap_task_21', 'roadmap.tasks.task21'), active: [24] }
  ];

  return (
    <div className="rp">
      {/* ✨ Ortak Arka Plan Ağı Çağrısı ✨ */}
      <NetworkBackground/>

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring"><div/><div/><div/><div/></div>
          <span className="loader-text">{t('roadmap.loading')}</span>
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
              <div className="eyebrow reveal active"><span className="edot"/> {getDynamicContent('roadmap_hero_eyebrow', 'roadmap.hero.eyebrow')} <span className="edot"/></div>
              <h1 className="hero-title reveal active">{getDynamicContent('roadmap_hero_title1', 'roadmap.hero.title1')}<br/><em>{getDynamicContent('roadmap_hero_title2', 'roadmap.hero.title2')}</em></h1>
              <p className="hero-sub reveal active" style={{transitionDelay:'.25s'}}>
                {getDynamicContent('roadmap_page_desc', 'roadmap.hero.descDefault')}
              </p>
              <div className="hero-div reveal active" style={{transitionDelay:'.4s'}}><span/><span className="hdot"/><span/></div>
            </div>
            <button className="scroll-btn" onClick={() => document.getElementById('icerik')?.scrollIntoView({behavior:'smooth'})} aria-label="Aşağı kaydır">
              <span className="scroll-label">{getDynamicContent('roadmap_hero_scroll', 'roadmap.hero.scrollBtn')}</span>
              <span className="scroll-icon"><i className="fas fa-chevron-down"/></span>
            </button>
          </section>

          {/* ── İÇERİK ── */}
          <section id="icerik" className="content-section">
            <div className="container" style={{maxWidth:'1200px'}}>

              <div className="sec-head reveal-up">
                <p className="sec-label">{getDynamicContent('roadmap_sec_label', 'roadmap.section.part')}</p>
                <h2 className="sec-title">{getDynamicContent('roadmap_sec_title', 'roadmap.section.title')}</h2>
              </div>

              {/* TABLO ALANI */}
              <div className="table-wrapper reveal-up" style={{transitionDelay:'.15s'}}>
                <div className="table-responsive">
                    <table className="plan-table">
                        <thead>
                            <tr>
                                <th className="task-header">{getDynamicContent('roadmap_table_header', 'roadmap.table.header')}</th>
                                {/* 1'den 24'e kadar otomatik sütun başlığı oluşturur */}
                                {[...Array(24)].map((_, i) => (
                                    <th key={i + 1}>{i + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Verileri otomatik olarak satırlara döküyoruz */}
                            {roadmapData.map((task) => (
                                <tr key={task.id}>
                                    <td className="task-name">{task.name}</td>
                                    
                                    {/* 24 ayı kontrol edip, aktif ay ise yeşil sınıfı veriyor */}
                                    {[...Array(24)].map((_, i) => {
                                        const month = i + 1;
                                        const isActive = task.active.includes(month);
                                        return (
                                            <td key={month} className={isActive ? "active" : ""}></td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      <ScrollToTop/>

      <style jsx>{`
        .rp {
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
        .reveal-up{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease;}
        .reveal-up.active{opacity:1;transform:translateY(0);}

        /* HERO - Şeffaf ve Temiz Arka Plan */
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
        .sec-head{margin-bottom:32px;}
        .sec-label{font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gm);margin-bottom:6px;}
        .sec-title{font-size:1.9rem;font-weight:800;color:var(--td);letter-spacing:-.02em;border-left:3px solid var(--gm);padding-left:16px;margin:0;}

        .container{width:100%;padding:0 24px;margin:0 auto;}

        /* TABLO SARMALAYICI (Glassmorphism Tema Uyumlu) */
        .table-wrapper {
            background: var(--card);
            backdrop-filter: blur(14px);
            border-radius: 20px;
            border: 1px solid var(--border);
            box-shadow: var(--sh);
            padding: 24px;
            transition: box-shadow .4s ease, transform .4s ease;
        }
        .table-wrapper:hover {
            transform: translateY(-4px);
            box-shadow: var(--shh);
        }

        .table-responsive {
            width: 100%;
            overflow-x: auto;
            border-radius: 12px;
            /* Scrollbar styling */
            scrollbar-width: thin;
            scrollbar-color: var(--gm) rgba(0,0,0,0.05);
        }
        .table-responsive::-webkit-scrollbar {
            height: 8px;
        }
        .table-responsive::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.03);
            border-radius: 4px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
            background-color: var(--gm);
            border-radius: 4px;
        }

        /* TABLO İÇERİĞİ */
        .plan-table {
            width: 100%;
            min-width: 1000px;
            border-collapse: collapse;
            font-size: 0.82rem;
        }

        .plan-table th, .plan-table td {
            border: 1px solid rgba(0,0,0,0.06);
            padding: 8px 6px;
            text-align: center;
            vertical-align: middle;
            transition: background .2s;
        }

        /* Başlık Satırı */
        .plan-table thead th {
            background-color: rgba(39, 174, 96, 0.1);
            color: var(--gd);
            font-weight: 700;
            padding: 14px 6px;
            border-bottom: 2px solid rgba(39, 174, 96, 0.3);
        }

        .plan-table .task-header {
            text-align: left;
            padding-left: 18px;
            width: 32%;
            font-size: 0.85rem;
        }

        /* Faaliyet İsimleri */
        .plan-table .task-name {
            text-align: left;
            padding: 12px 18px;
            font-weight: 600;
            color: var(--td);
            background-color: rgba(255, 255, 255, 0.4);
            width: 32%;
            line-height: 1.4;
            border-right: 1px solid rgba(0,0,0,0.08);
        }

        /* Ay Sütunları */
        .plan-table td:not(.task-name) {
            width: 2.8%;
            height: 38px;
        }

        /* Aktif Kutucuklar */
        .plan-table td.active {
            background-color: rgba(39, 174, 96, 0.85); /* Yeşil tonu */
            position: relative;
        }

        /* Aktif kutucukların içine check işareti (nokta) */
        .plan-table td.active::after {
            content: '';
            display: block;
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            margin: 0 auto;
            opacity: 0.95;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        /* Satır Hover Efekti */
        .plan-table tr:hover .task-name {
            background-color: rgba(39, 174, 96, 0.05);
            color: var(--gm);
        }
        .plan-table tr:hover td:not(.task-name):not(.active) {
            background-color: rgba(0,0,0,0.015);
        }

        @media(max-width:640px){
            .hero{min-height:100svh;}
            .content-section{padding:36px 0 60px;}
            .table-wrapper{padding: 16px;}
            .plan-table .task-name{font-size: 0.78rem; padding: 10px;}
            .scroll-btn{bottom:26px;}
        }
      `}</style>
    </div>
  );
}