'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import ScrollToTop from '../../../components/ScrollToTop';

// ─── ARKA PLAN AĞI ─────────────────────────────────────────────────────────────
const NetworkBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, particles = [], visible = true;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();
    const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    obs.observe(canvas);
    for (let i = 0; i < 55; i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-.5)*.12, vy: (Math.random()-.5)*.12, r: Math.random()*1.5+.5 });
    const animate = () => {
      if (visible) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>canvas.width)p.vx=-p.vx; if(p.y<0||p.y>canvas.height)p.vy=-p.vy; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(52,120,80,0.35)'; ctx.fill(); });
        for (let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<140){ctx.beginPath();ctx.strokeStyle=`rgba(52,120,80,${.25*(1-d/140)})`;ctx.lineWidth=.8;ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}}
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); obs.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:-1,pointerEvents:'none',background:'#f4f7f2' }} />;
};

// ─── YAPRAK ANİMASYONU ─────────────────────────────────────────────────────────
const HeroAnimation = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    let raf, leaves=[], wt=0, timeouts=[], mt, visible=true;
    const resize = () => { const p=canvas.parentElement; canvas.width=p?p.offsetWidth:window.innerWidth; canvas.height=p?p.offsetHeight:window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const obs=new IntersectionObserver(([e])=>{visible=e.isIntersecting;},{threshold:0}); obs.observe(canvas);
    const turb=(x,y,t)=>Math.sin(x*.007+t*.35)*.5+Math.sin(y*.009-t*.25)*.35+Math.sin((x+y)*.004+t*.45)*.3;
    const lp=[new Path2D(),new Path2D(),new Path2D()];
    lp[0].moveTo(0,-2);lp[0].bezierCurveTo(1.6,-1,1.6,1,0,2);lp[0].bezierCurveTo(-1.6,1,-1.6,-1,0,-2);
    lp[1].moveTo(0,-2.4);lp[1].bezierCurveTo(.9,-.8,.9,.8,0,2.4);lp[1].bezierCurveTo(-.9,.8,-.9,-.8,0,-2.4);
    lp[2].moveTo(0,-1.5);lp[2].bezierCurveTo(1.8,-.6,1.8,.6,0,1.5);lp[2].bezierCurveTo(-1.8,.6,-1.8,-.6,0,-1.5);
    class Leaf {
      reset(){this.x=Math.random()<.75?canvas.width+50+Math.random()*150:Math.random()*canvas.width;this.y=Math.random()<.75?Math.random()*canvas.height:-50-Math.random()*100;this.size=Math.random()*5+4;this.windX=-(0.25+Math.random()*.45);this.gravY=.06+Math.random()*.08;this.vx=this.windX;this.vy=this.gravY;this.drag=.988+Math.random()*.008;this.angle=Math.random()*Math.PI*2;this.angVel=(Math.random()-.5)*.01;this.angDamp=.97;this.turbScale=.4+Math.random()*.4;this.phaseX=Math.random()*80;this.phaseY=Math.random()*80;this.opacity=.4+Math.random()*.45;this.variant=Math.floor(Math.random()*3);const pal=[[28,118,58],[42,158,80],[18,82,44],[55,145,70],[22,100,52],[100,172,48]];const c=pal[Math.floor(Math.random()*pal.length)];this.r=c[0];this.g=c[1];this.b=c[2];}
      constructor(){this.reset();}
      update(t){const tx=turb(this.x+this.phaseX,this.y,t)*this.turbScale,ty=turb(this.y+this.phaseY,this.x,t+40)*this.turbScale*.35;this.vx+=this.windX*.015+tx*.025;this.vy+=this.gravY*.012+ty*.018;this.vx=Math.max(-1.5,Math.min(.4,this.vx));this.vy=Math.max(-.3,Math.min(.9,this.vy));this.vx*=this.drag;this.vy*=this.drag;this.x+=this.vx;this.y+=this.vy;let diff=Math.atan2(this.vy,-this.vx)+Math.PI*.08-this.angle;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;this.angVel+=diff*.006;this.angVel*=this.angDamp;this.angle+=this.angVel;if(this.x<-60||this.y>canvas.height+60||this.y<-100)this.reset();}
      draw(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.scale(this.size,this.size);ctx.globalAlpha=this.opacity;ctx.save();ctx.translate(.3,.6);ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fill(lp[this.variant]);ctx.restore();ctx.fillStyle=`rgb(${this.r},${this.g},${this.b})`;ctx.fill(lp[this.variant]);ctx.beginPath();ctx.moveTo(0,-1.8);ctx.lineTo(0,1.8);ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=.6/this.size;ctx.stroke();ctx.restore();}
    }
    mt=setTimeout(()=>{for(let i=0;i<20;i++){const t=setTimeout(()=>leaves.push(new Leaf()),Math.random()*3000);timeouts.push(t);}},500);
    const animate=()=>{if(visible){wt+=.007;ctx.clearRect(0,0,canvas.width,canvas.height);leaves.forEach(l=>{l.update(wt);l.draw();});}raf=requestAnimationFrame(animate);};
    animate();
    return()=>{window.removeEventListener('resize',resize);cancelAnimationFrame(raf);obs.disconnect();clearTimeout(mt);timeouts.forEach(clearTimeout);};
  },[]);
  return <canvas ref={canvasRef} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:1,pointerEvents:'none' }} />;
};

// ─── SVG İKONLAR ──────────────────────────────────────────────────────────────
const Icon = ({ name, color='currentColor', size=20 }) => {
  const icons = {
    droplets:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
      </svg>
    ),
    checkCircle:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    trendingUp:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    leaf:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    recycle:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
      </svg>
    ),
    smartphone:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    globe:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    users:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    shield:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    zap:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    star:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    link:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    barChart:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    flag:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
    award:(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ─── SECTION CARD ──────────────────────────────────────────────────────────────
const SectionCard = ({ accent, letter, badge, title, children, reverse=false }) => (
  <div className={`sc reveal ${reverse ? 'reveal-right' : 'reveal-left'}`} style={{'--accent': accent}}>
    <div className="sc-shine"/>
    <div className="sc-inner">
      <div className="sc-head">
        <span className="sc-badge">{letter}</span>
        <div className="sc-head-text">
          {badge && <span className="sc-role-badge">{badge}</span>}
          <h2 className="sc-title">{title}</h2>
        </div>
      </div>
      <div className="sc-body">{children}</div>
    </div>
  </div>
);

// ─── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function ImpactPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

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

  const impactMetrics = [
    { icon:'recycle',    val:'%29', label:'Geri Dönüşüm Hedefi',      color:'#16a34a', bg:'green-bg'  },
    { icon:'users',      val:'150K+', label:'Etkilenen Vatandaş',     color:'#2563eb', bg:'blue-bg'   },
    { icon:'globe',      val:'3',   label:'Ülkede Uygulama',           color:'#7c3aed', bg:'purple-bg' },
    { icon:'trendingUp', val:'24',  label:'Ay Sürdürülebilir Etki',    color:'#ea580c', bg:'orange-bg' },
  ];

  const highlights = [
    { icon:'checkCircle', color:'#16a34a', bg:'green-bg',  text: content.impact_h1 || 'Dijital araçların belediye operasyonlarına kalıcı entegrasyonu' },
    { icon:'checkCircle', color:'#16a34a', bg:'green-bg',  text: content.impact_h2 || 'SECAP hazırlığı ile Avrupa Yeşil Mutabakatı\'na doğrudan katkı' },
    { icon:'checkCircle', color:'#16a34a', bg:'green-bg',  text: content.impact_h3 || 'Karşılıklı bilgi transferi yoluyla çok yönlü kapasite gelişimi' },
    { icon:'checkCircle', color:'#16a34a', bg:'green-bg',  text: content.impact_h4 || 'Türk ortaklar (TNKÜ + Kampüs STK) ile güçlendirilmiş yerel katılım' },
  ];

  const visionPillars = [
    { icon:'leaf',       title:'Yeşil Dönüşüm',     desc:'İklim eylemi ve atık azaltımı',     color:'#16a34a', bg:'green-bg'   },
    { icon:'smartphone', title:'Dijital Araçlar',    desc:'Mobil uygulama ve sensör altyapısı', color:'#2563eb', bg:'blue-bg'    },
    { icon:'users',      title:'Vatandaş Odağı',     desc:'Aktif toplumsal katılım',            color:'#ea580c', bg:'orange-bg'  },
    { icon:'shield',     title:'Sürdürülebilirlik',  desc:'Kalıcı kurumsal entegrasyon',        color:'#7c3aed', bg:'purple-bg'  },
    { icon:'globe',      title:'Avrupa Uyumu',       desc:'AB Yeşil Mutabakatı ile hizalama',  color:'#16a34a', bg:'green-bg'   },
    { icon:'award',      title:'Ölçeklenebilirlik',  desc:'Model belediye vizyonu',             color:'#ea580c', bg:'orange-bg'  },
  ];

  return (
    <div className="ip">
      <NetworkBackground/>

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring"><div/><div/><div/><div/></div>
          <span className="loader-text">Hazırlanıyor…</span>
        </div>
      ) : (
        <>
          {/* ── HERO ── */}
          <section className="hero">
            <HeroAnimation/>
            <div className="hero-noise"/>
            {/* Göz yormayan şeffaf ışık hareleri */}
            <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
            
            <div className="container hero-content">
              <div className="eyebrow reveal active"><span className="edot"/> Erasmus+ · DIGI-GREEN FUTURE <span className="edot"/></div>
              <h1 className="hero-title reveal active">Etki ve<br/><em>Sürdürülebilirlik</em></h1>
              <p className="hero-sub reveal active" style={{transitionDelay:'.25s'}}>
                {content.impact_page_desc || 'Kalıcı Değer, Yeşil Dönüşüm ve Toplumsal Yaygınlaştırma'}
              </p>
              <div className="hero-div reveal active" style={{transitionDelay:'.4s'}}><span/><span className="hdot"/><span/></div>
            </div>
            <button className="scroll-btn" onClick={() => document.getElementById('icerik')?.scrollIntoView({behavior:'smooth'})} aria-label="Aşağı kaydır">
              <span className="scroll-label">Etkiyi Keşfet</span>
              <span className="scroll-icon"><i className="fas fa-chevron-down"/></span>
            </button>
          </section>

          {/* ── İÇERİK ── */}
          <section id="icerik" className="content-section">
            <div className="container" style={{maxWidth:'940px'}}>

              <div className="sec-head reveal-up">
                <p className="sec-label">IV. Bölüm</p>
                <h2 className="sec-title">Etki ve Sürdürülebilirlik</h2>
              </div>

              {/* Metrik kartlar */}
              <div className="stats reveal-up" style={{transitionDelay:'.1s'}}>
                {impactMetrics.map((m,i) => (
                  <div className="stat" key={i}>
                    <div className={`stat-icon-wrap ${m.bg}`}>
                      <Icon name={m.icon} color={m.color} size={20}/>
                    </div>
                    <div className="stat-v" style={{color:m.color}}>{m.val}</div>
                    <div className="stat-l">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* ── KART 1: Stratejik Etki ── */}
              <SectionCard accent="#16a34a" letter="A" badge="STRATEJİK ETKİ"
                title={content.impact_section_1_title || 'Stratejik Etki ve Çözüm Yaklaşımı'}>
                <p className="body-text">
                  {content.impact_section_1_text || "Bu proje, Kapaklı'nın sanayileşme kaynaklı kirlilik ve düşük geri dönüşüm gibi acil sorunlarına, dijitalleşmeyi bir araç olarak kullanarak yanıt vermektedir. Kapaklı Belediyesi koordinatörlüğündeki konsorsiyum, güçlü uluslararası uzmanlığa sahiptir."}
                </p>

                {/* Vurgular listesi */}
                <div className="highlight-list">
                  {highlights.map((h,i) => (
                    <div className="hl-item" key={i}>
                      <div className={`hl-icon ${h.bg}`}>
                        <Icon name={h.icon} color={h.color} size={16}/>
                      </div>
                      <p className="hl-text">{h.text}</p>
                    </div>
                  ))}
                </div>

                {/* Alıntı notu */}
                <div className="impact-note green-note">
                  <div className="note-icon green-bg">
                    <Icon name="droplets" color="#16a34a" size={18}/>
                  </div>
                  <p>{content.impact_highlight_text || "Türk ortaklar TNKÜ ve Kampüs STK ile desteklenen bu işbirliği, karşılıklı bilgi transferi yoluyla Avrupa Yeşil Mutabakatı'na katkı sağlamakta ve geliştirilen dijital araçların belediye operasyonlarına entegrasyonuyla projenin kalıcı sürdürülebilirliğini güvence altına almaktadır."}</p>
                </div>
              </SectionCard>

              {/* ── KART 2: Vizyon ── */}
              <SectionCard accent="#2563eb" letter="B" badge="VİZYON"
                title={content.impact_section_2_title || 'DIGI-GREEN FUTURE Projesi'}
                reverse>
                <p className="body-text">
                  {content.impact_section_2_text || "Kapaklı Belediyesi liderliğinde, iklim değişikliği ve dijital dönüşüm gibi acil sorunlara karşı kapsamlı ve yenilikçi çözümler sunmaktadır. Mobil uygulamalar, eğitim seferberliği ve sürdürülebilir yönetim anlayışıyla somut çıktılar hedeflenmektedir."}
                </p>

                {/* 6'lı vizyon pillars */}
                <div className="vision-grid">
                  {visionPillars.map((v,i) => (
                    <div className="vp-card" key={i}>
                      <div className={`vp-icon ${v.bg}`}>
                        <Icon name={v.icon} color={v.color} size={20}/>
                      </div>
                      <div className="vp-title">{v.title}</div>
                      <div className="vp-desc">{v.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Kapanış mesajı */}
                <div className="closing-banner">
                  <div className="cb-icon">
                    <Icon name="flag" color="#fff" size={20}/>
                  </div>
                  <p>{content.impact_closing_msg || "Tüm paydaşlar, yerel, ulusal ve Avrupa düzeyinde kalıcı bir etki oluşturmak üzere bu kapsamlı planı uygulamaya davet edilmektedir."}</p>
                </div>
              </SectionCard>

            </div>
          </section>
        </>
      )}

      <ScrollToTop/>

      <style jsx>{`
        .ip {
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
        .sec-head{margin-bottom:28px;}
        .sec-label{font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gm);margin-bottom:6px;}
        .sec-title{font-size:1.9rem;font-weight:800;color:var(--td);letter-spacing:-.02em;border-left:3px solid var(--gm);padding-left:16px;margin:0;}

        /* STATS — metrik ikonlu versiyon */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:36px;}
        .stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;text-align:center;backdrop-filter:blur(12px);box-shadow:var(--sh);transition:transform .3s,box-shadow .3s;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .stat:hover{transform:translateY(-4px);box-shadow:var(--shh);}
        .stat-icon-wrap{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
        .stat-v{font-size:1.7rem;font-weight:800;line-height:1;}
        .stat-l{font-size:.74rem;color:var(--ts);font-weight:500;line-height:1.4;}

        /* SECTION CARD */
        .sc{background:var(--card);backdrop-filter:blur(14px);border-radius:20px;box-shadow:var(--sh);border:1px solid var(--border);border-left:4px solid var(--accent);margin-bottom:28px;position:relative;overflow:hidden;transition:transform .4s ease,box-shadow .4s ease;}
        .sc:hover{transform:translateY(-4px);box-shadow:var(--shh);}
        .sc-shine{position:absolute;top:0;left:-120%;width:55%;height:100%;background:linear-gradient(to right,rgba(255,255,255,0),rgba(255,255,255,.32),rgba(255,255,255,0));transform:skewX(-20deg);transition:left .65s ease;pointer-events:none;z-index:1;}
        .sc:hover .sc-shine{left:180%;}
        .sc-inner{padding:36px 42px;position:relative;z-index:2;}
        .sc-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,.07);}
        .sc-badge{width:46px;height:46px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:#fff;background:var(--accent);box-shadow:0 4px 14px color-mix(in srgb,var(--accent) 38%,transparent);margin-top:2px;}
        .sc-head-text{display:flex;flex-direction:column;gap:6px;}
        .sc-role-badge{display:inline-flex;align-items:center;width:fit-content;padding:3px 12px;border-radius:100px;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);border:1px solid color-mix(in srgb,var(--accent) 25%,transparent);}
        .sc-title{font-size:1.2rem;font-weight:800;color:var(--accent);line-height:1.28;margin:0;}
        .body-text{color:var(--ts);font-size:.97rem;line-height:1.82;margin-bottom:20px;}

        /* HIGHLIGHT LIST */
        .highlight-list{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
        .hl-item{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.05);border-radius:12px;transition:background .25s,transform .25s;}
        .hl-item:hover{background:#fff;transform:translateX(4px);}
        .hl-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .hl-text{font-size:.88rem;font-weight:500;color:var(--td);line-height:1.55;margin:0;padding-top:3px;}

        /* IMPACT NOTE */
        .impact-note{display:flex;align-items:flex-start;gap:14px;padding:18px 20px;border-radius:14px;border:1px solid;}
        .green-note{background:rgba(22,163,74,.06);border-color:rgba(22,163,74,.2);}
        .note-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .impact-note p{font-size:.88rem;line-height:1.72;color:var(--ts);margin:0;padding-top:2px;}

        /* VISION GRID */
        .vision-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0 24px;}
        .vp-card{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:18px 16px;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.06);border-radius:14px;transition:background .25s,transform .25s,box-shadow .25s;}
        .vp-card:hover{background:#fff;transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.07);}
        .vp-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .vp-title{font-size:.88rem;font-weight:700;color:var(--td);}
        .vp-desc{font-size:.78rem;color:var(--ts);line-height:1.5;margin-top:-4px;}

        /* CLOSING BANNER */
        .closing-banner{display:flex;align-items:center;gap:16px;padding:22px 24px;background:linear-gradient(135deg,#1a5c38 0%,#27ae60 100%);border-radius:16px;box-shadow:0 8px 24px rgba(26,92,56,0.25);}
        .cb-icon{width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .closing-banner p{font-size:.93rem;font-weight:500;color:#fff;line-height:1.65;margin:0;font-style:italic;}

        /* İKON RENK ARKA PLANLARI */
        .blue-bg  {background:rgba(37,99,235,.12);}
        .green-bg {background:rgba(22,163,74,.12);}
        .orange-bg{background:rgba(234,88,12,.12);}
        .purple-bg{background:rgba(124,58,237,.12);}

        .container{width:100%;padding:0 24px;margin:0 auto;}

        @media(max-width:900px){
          .stats{grid-template-columns:repeat(2,1fr);}
          .vision-grid{grid-template-columns:1fr 1fr;}
          .sc-inner{padding:28px 26px;}
          .reveal-left,.reveal-right{transform:translateY(28px)!important;}
        }
        @media(max-width:640px){
          .hero{min-height:100svh;}
          .content-section{padding:36px 0 60px;}
          .stats{grid-template-columns:1fr 1fr;gap:10px;}
          .vision-grid{grid-template-columns:1fr 1fr;}
          .sc-inner{padding:22px 18px;}
          .closing-banner{flex-direction:column;text-align:center;}
          .scroll-btn{bottom:26px;}
        }
      `}</style>
    </div>
  );
}