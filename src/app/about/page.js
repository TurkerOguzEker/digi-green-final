'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

// ─── SAYFA GENELİ ARKA PLAN AĞI (YÜKSEK PERFORMANS) ───────────────────────────
const NetworkBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let isVisible = true;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 120, 80, 0.35)'; ctx.fill();
      }
    }

    for (let i = 0; i < 55; i++) particles.push(new Particle());

    const animate = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(52, 120, 80, ${0.25 * (1 - dist / 140)})`;
              ctx.lineWidth = 0.8; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => { 
      window.removeEventListener('resize', resize); 
      cancelAnimationFrame(animationFrameId); 
      observer.disconnect();
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: '#f4f7f2' }} />;
};

// ─── YAPRAK ANİMASYONU ────────────────────────────────────────────────────────
const HeroAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let leaves = [];
    let windTime = 0;
    let spawnTimeouts = [];
    let mainTimeout;
    let isVisible = true;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width  = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const turb = (x, y, t) =>
      Math.sin(x * 0.007 + t * 0.35) * 0.5 +
      Math.sin(y * 0.009 - t * 0.25) * 0.35 +
      Math.sin((x + y) * 0.004 + t * 0.45) * 0.3;

    const leafPaths = [new Path2D(), new Path2D(), new Path2D()];
    leafPaths[0].moveTo(0, -2.0); leafPaths[0].bezierCurveTo(1.6, -1.0, 1.6, 1.0, 0, 2.0); leafPaths[0].bezierCurveTo(-1.6, 1.0, -1.6, -1.0, 0, -2.0);
    leafPaths[1].moveTo(0, -2.4); leafPaths[1].bezierCurveTo(0.9, -0.8, 0.9, 0.8, 0, 2.4); leafPaths[1].bezierCurveTo(-0.9, 0.8, -0.9, -0.8, 0, -2.4);
    leafPaths[2].moveTo(0, -1.5); leafPaths[2].bezierCurveTo(1.8, -0.6, 1.8, 0.6, 0, 1.5); leafPaths[2].bezierCurveTo(-1.8, 0.6, -1.8, -0.6, 0, -1.5);

    class Leaf {
      reset() {
        if (Math.random() < 0.75) {
          this.x = canvas.width + 50 + Math.random() * 150; 
          this.y = Math.random() * canvas.height;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = -50 - Math.random() * 100; 
        }
        
        this.size      = Math.random() * 5 + 4;
        this.windX     = -(0.25 + Math.random() * 0.45);
        this.gravY     = 0.06 + Math.random() * 0.08;
        this.vx        = this.windX;
        this.vy        = this.gravY;
        this.drag      = 0.988 + Math.random() * 0.008;
        this.angle     = Math.random() * Math.PI * 2;
        this.angVel    = (Math.random() - 0.5) * 0.010;
        this.angDamp   = 0.97;
        this.turbScale = 0.4 + Math.random() * 0.4;
        this.phaseX    = Math.random() * 80;
        this.phaseY    = Math.random() * 80;
        this.opacity   = 0.40 + Math.random() * 0.45;
        this.variant   = Math.floor(Math.random() * 3);
        const pal = [[28,118,58],[42,158,80],[18,82,44],[55,145,70],[22,100,52],[100,172,48]];
        const c = pal[Math.floor(Math.random() * pal.length)];
        this.r = c[0]; this.g = c[1]; this.b = c[2];
      }
      constructor() { this.reset(); }
      update(t) {
        const tx = turb(this.x + this.phaseX, this.y, t) * this.turbScale;
        const ty = turb(this.y + this.phaseY, this.x, t + 40) * this.turbScale * 0.35;
        this.vx += this.windX * 0.015 + tx * 0.025;
        this.vy += this.gravY * 0.012 + ty * 0.018;
        this.vx = Math.max(-1.5, Math.min(0.4, this.vx));
        this.vy = Math.max(-0.3, Math.min(0.9, this.vy));
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.x += this.vx;
        this.y += this.vy;
        const target = Math.atan2(this.vy, -this.vx) + Math.PI * 0.08;
        let diff = target - this.angle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angVel += diff * 0.006;
        this.angVel *= this.angDamp;
        this.angle  += this.angVel;
        if (this.x < -60 || this.y > canvas.height + 60 || this.y < -100) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.size, this.size); 
        ctx.globalAlpha = this.opacity;
        
        ctx.save();
        ctx.translate(0.3, 0.6);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fill(leafPaths[this.variant]);
        ctx.restore();

        ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
        ctx.fill(leafPaths[this.variant]);

        ctx.beginPath();
        ctx.moveTo(0, -1.8); ctx.lineTo(0, 1.8);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 0.6 / this.size; 
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -0.9); ctx.lineTo( 1.0, -1.25); ctx.moveTo(0,  0); ctx.lineTo( 1.1, -0.3);
        ctx.moveTo(0, -0.9); ctx.lineTo(-1.0, -1.25); ctx.moveTo(0,  0); ctx.lineTo(-1.1, -0.3);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.4 / this.size; 
        ctx.stroke();
        
        ctx.restore();
      }
    }

    mainTimeout = setTimeout(() => {
      for (let i = 0; i < 20; i++) {
        let t = setTimeout(() => {
          leaves.push(new Leaf());
        }, Math.random() * 3000); 
        spawnTimeouts.push(t);
      }
    }, 500);

    const animate = () => {
      if (isVisible) {
        windTime += 0.007;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        leaves.forEach(l => { l.update(windTime); l.draw(); });
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      clearTimeout(mainTimeout);
      spawnTimeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
    />
  );
};

// ─── SAYAC BİLEŞENİ ───
const Counter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);
  
  return <span ref={counterRef}>{count}{suffix}</span>;
};

// ─── İLETİŞİME GEÇ BUTONU ───
const ContactButton = ({ href, text }) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: hovered ? '18px' : '14px',
    padding: '18px 38px',
    borderRadius: '99px',
    fontWeight: '700',
    fontSize: '1.05rem',
    textDecoration: 'none',
    color: hovered ? '#ffffff' : '#1a5c38',
    backgroundColor: hovered ? '#27ae60' : '#ffffff',
    border: '2px solid',
    borderColor: hovered ? 'rgba(255,255,255,0.25)' : 'transparent',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: pressed ? 'translateY(-1px)' : hovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: pressed
      ? '0 6px 16px rgba(39,174,96,0.4)'
      : hovered
      ? '0 12px 32px rgba(39,174,96,0.55), 0 4px 12px rgba(0,0,0,0.1)'
      : 'none',
    transition: 'all 0.3s ease',
  };

  const arrowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: hovered ? 'rgba(255,255,255,0.22)' : 'rgba(26,92,56,0.1)',
    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  };

  return (
    <Link
      href={href}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <span>{text}</span>
      <span style={arrowStyle}>
        <i className="fas fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
      </span>
    </Link>
  );
};

// ─── ANA SAYFA BİLEŞENİ ───
export default function AboutPage() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  const { language, t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        setContent(map);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); }); },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const getDynamicContent = (trKey, defaultTranslationKey) => {
    if (language === 'en') {
      const enKey = `${trKey}_en`;
      if (typeof content[enKey] === 'string' && content[enKey].trim() !== '') return content[enKey];
      
      const translation = t(defaultTranslationKey);
      if (translation !== defaultTranslationKey && translation.trim() !== '') return translation;
      
      if (typeof content[trKey] === 'string' && content[trKey].trim() !== '') return content[trKey];
    }
    
    if (typeof content[trKey] === 'string' && content[trKey].trim() !== '') return content[trKey];
    return t(defaultTranslationKey) !== defaultTranslationKey ? t(defaultTranslationKey) : '';
  };

  const getSuffix = (key, fallback) => {
    if (language === 'en' && typeof content[`${key}_en`] === 'string') return content[`${key}_en`];
    if (typeof content[key] === 'string') return content[key];
    return fallback;
  };

  // KÜNYE (SPEC) Değerlerini Doğrudan Çeker
  const getSpecValue = (key, fallback) => {
    if (language === 'en' && typeof content[`${key}_en`] === 'string' && content[`${key}_en`].trim() !== '') return content[`${key}_en`];
    if (typeof content[key] === 'string' && content[key].trim() !== '') return content[key];
    return fallback;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>{t('about.loading') !== 'about.loading' ? t('about.loading') : 'Yükleniyor...'}</span>
      </div>
    );
  }

  const stats = [
    { 
      value: parseInt(content.about_stat_1_val) || 500, 
      suffix: getSuffix('about_stat_1_suffix', '+'), 
      label: getDynamicContent('about_stat_1_label', 'about.stats.s1') || 'Katılımcı'
    },
    { 
      value: parseInt(content.about_stat_2_val) || 29, 
      suffix: getSuffix('about_stat_2_suffix', '%'), 
      label: getDynamicContent('about_stat_2_label', 'about.stats.s2') || 'Eğitim Oranı'
    },
    { 
      value: parseInt(content.about_stat_3_val) || 24, 
      suffix: getSuffix('about_stat_3_suffix', ''), 
      label: getDynamicContent('about_stat_3_label', 'about.stats.s3') || 'Aylık Süre'
    },
    { 
      value: parseInt(content.about_stat_4_val) || 3, 
      suffix: getSuffix('about_stat_4_suffix', '+'), 
      label: getDynamicContent('about_stat_4_label', 'about.stats.s4') || 'Ortak Ülke'
    },
  ];

  const targets = [
    { num: '01', title: getDynamicContent('about_target_1_title', 'about.target.t1Title'), desc: getDynamicContent('about_target_1_desc', 'about.target.t1Desc') },
    { num: '02', title: getDynamicContent('about_target_2_title', 'about.target.t2Title'), desc: getDynamicContent('about_target_2_desc', 'about.target.t2Desc') },
    { num: '03', title: getDynamicContent('about_target_3_title', 'about.target.t3Title'), desc: getDynamicContent('about_target_3_desc', 'about.target.t3Desc') },
  ];

  // ✨ KÜNYE: HEM SOL TARAF (LABEL) HEM SAĞ TARAF (VALUE) DİNAMİK YAPILDI ✨
  const tableRows = [
    { 
      label: getSpecValue('about_project_name_label', 'Proje Adı'), 
      value: getSpecValue('about_project_name', 'DIGI-GREEN FUTURE') 
    },
    { 
      label: getSpecValue('about_project_code_label', 'Proje Kodu'), 
      value: getSpecValue('about_project_code', '2023-1-TR01-KA220-ADU-00015421') 
    },
    { 
      label: getSpecValue('about_project_program_label', 'Program'), 
      value: getSpecValue('about_project_program', 'Erasmus+ Yetişkin Eğitimi') 
    },
    { 
      label: getSpecValue('about_project_duration_label', 'Süre'), 
      value: getSpecValue('about_project_duration', '24 Ay (Aralık 2023 - Kasım 2025)') 
    },
    { 
      label: getSpecValue('about_project_budget_label', 'Bütçe'), 
      value: getSpecValue('about_project_budget', '250.000 €') 
    },
  ];

  return (
    <div className="about-page">
      
      <NetworkBackground />

      {/* 1️⃣ HERO */}
      <section className="hero">
        <HeroAnimation />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow reveal active">{getDynamicContent('about_hero_eyebrow', 'about.hero.eyebrow')}</span>
          <h1 className="hero-title reveal active">
            {getDynamicContent('about_hero_title1', 'about.hero.title1')} <br /> 
            {getDynamicContent('about_hero_title2', 'about.hero.title2')} <span>{getDynamicContent('about_hero_title3', 'about.hero.title3')}</span>
          </h1>
          <p className="hero-desc reveal active">
            {getDynamicContent('about_page_desc', 'about.hero.descDefault')}
          </p>
        </div>
      </section>

      {/* 2️⃣ VİZYON */}
      <section className="section">
        <div className="container grid-2 align-center">
          <div className="reveal">
            <span className="section-label">{getDynamicContent('about_vision_label', 'about.vision.label')}</span>
            <h2 className="section-title">{getDynamicContent('about_vision_title', 'about.vision.titleDefault')}</h2>
            <p className="section-text">
              {getDynamicContent('about_vision_text', 'about.vision.textDefault')}
            </p>
            <ul className="vision-list">
              <li>{getDynamicContent('about_vision_list1', 'about.vision.list1')}</li>
              <li>{getDynamicContent('about_vision_list2', 'about.vision.list2')}</li>
              <li>{getDynamicContent('about_vision_list3', 'about.vision.list3')}</li>
            </ul>
          </div>
          <div className="reveal image-wrapper">
            <img src={content.about_vision_image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"} alt="Yeşil Şehir" />
          </div>
        </div>
      </section>

      {/* 3️⃣ İSTATİSTİKLER */}
      <section className="section bg-light">
        <div className="container">
          <div className="reveal text-center mb-5">
            <span className="section-label">{getDynamicContent('about_stats_label', 'about.stats.label')}</span>
            <h2 className="section-title">{getDynamicContent('about_stats_title', 'about.stats.title')}</h2>
          </div>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <h3 className="stat-number"><Counter end={stat.value} suffix={stat.suffix} /></h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ HEDEF KİTLE */}
      <section className="section">
        <div className="container">
          <div className="reveal text-center mb-5">
            <span className="section-label">{getDynamicContent('about_target_label', 'about.target.label')}</span>
            <h2 className="section-title">{getDynamicContent('about_target_title', 'about.target.title')}</h2>
          </div>
          <div className="targets-grid">
            {targets.map((kitle, i) => (
              <div key={i} className="target-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <span className="target-num">{kitle.num}</span>
                <h4 className="target-title">{kitle.title}</h4>
                <p className="target-desc">{kitle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ PROJE KÜNYESİ (Güncellenen Kısım) */}
      <section className="section">
        <div className="container narrow">
          <div className="reveal mb-5">
            <span className="section-label">{getDynamicContent('about_spec_label', 'about.spec.label') || 'ÖZET BİLGİ'}</span>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{getDynamicContent('about_spec_title', 'about.spec.title') || 'Proje Künyesi'}</h2>
          </div>
          <div className="spec-sheet reveal">
            {tableRows.map((row, i) => (
              <div key={i} className="spec-row">
                {/* SOL TARAF VE SAĞ TARAF İÇİN YENİ YAPI */}
                <div className="spec-label">{row.label}</div>
                <div className="spec-value">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ CTA */}
      <section className="cta-section reveal">
        <div className="cta-container">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <span className="cta-badge">{getDynamicContent('about_cta_badge', 'about.cta.badge')}</span>
            <h2 className="cta-title">
              {getDynamicContent('about_cta_title1', 'about.cta.title1')} <br /> {getDynamicContent('about_cta_title2', 'about.cta.title2')}
            </h2>
            <p className="cta-desc" style={{whiteSpace: 'pre-wrap'}}>
              {getDynamicContent('about_cta_desc', 'about.cta.desc')}
            </p>
            <div className="cta-actions">
              <ContactButton href="/contact" text={getDynamicContent('about_cta_button', 'about.cta.button') || 'İletişime Geç'} />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          font-family: 'Inter', system-ui, sans-serif;
          color: #111827;
          line-height: 1.6;
          --primary: #003399;
          --green-mid: #27ae60;
          --green-deep: #1a5c38;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
        .container.narrow { max-width: 900px; }
        .section { padding: 120px 0; position: relative; z-index: 2; }
        
        .bg-light { 
          background-color: rgba(249, 250, 251, 0.6); 
          backdrop-filter: blur(8px);
        }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 32px; }
        .mb-5 { margin-bottom: 64px; }

        .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .reveal.active { opacity: 1; transform: translateY(0); }

        .section-label { display: block; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981; margin-bottom: 12px; }
        .section-title { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 24px; color: #111827; }
        .section-text { font-size: 1.125rem; color: #4b5563; margin-bottom: 32px; }

        .hero { 
          position: relative; 
          padding: 160px 0 100px; 
          text-align: center; 
          background: linear-gradient(to bottom, rgba(249, 250, 251, 0.4), rgba(255, 255, 255, 0.9)); 
          overflow: hidden; 
        }
        .eyebrow { display: inline-block; font-size: 0.875rem; font-weight: 600; padding: 6px 16px; border-radius: 99px; background: rgba(236, 253, 245, 0.8); color: #059669; margin-bottom: 32px; backdrop-filter: blur(5px); }
        .hero-title { font-size: clamp(3rem, 8vw, 5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero-title span { color: #10b981; }
        .hero-desc { font-size: 1.25rem; color: #6b7280; max-width: 600px; margin: 0 auto; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
        .align-center { align-items: center; }

        .vision-list { list-style: none; padding: 0; display: grid; gap: 16px; }
        .vision-list li { font-size: 1.05rem; color: #374151; display: flex; align-items: center; gap: 12px; }
        .vision-list li::before { content: '—'; color: #10b981; font-weight: bold; }
        .image-wrapper img { width: 100%; border-radius: 24px; object-fit: cover; aspect-ratio: 4/3; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; text-align: center; }
        .stat-number { font-size: 4rem; font-weight: 800; color: #111827; line-height: 1; margin-bottom: 8px; letter-spacing: -0.02em; }
        .stat-label { font-size: 1rem; font-weight: 500; color: #6b7280; }

        .targets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .target-card { padding: 40px; background: rgba(249, 250, 251, 0.85); backdrop-filter: blur(10px); border-radius: 24px; transition: background 0.3s ease; }
        .target-card:hover { background: rgba(243, 244, 246, 0.95); }
        .target-num { display: block; font-size: 1rem; font-weight: 700; color: #10b981; margin-bottom: 16px; }
        .target-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
        .target-desc { color: #4b5563; }

        .spec-sheet { border-top: 1px solid rgba(229, 231, 235, 0.6); }
        .spec-row { display: grid; grid-template-columns: 240px 1fr; padding: 32px 24px; border-bottom: 1px solid rgba(229, 231, 235, 0.6); transition: all 0.3s ease; border-left: 4px solid transparent; }
        .spec-row:hover { background-color: rgba(249, 250, 251, 0.7); backdrop-filter: blur(5px); border-left-color: #10b981; }
        .spec-label { font-size: 0.875rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; align-self: center; }
        .spec-value { font-size: 1.125rem; font-weight: 500; color: #111827; line-height: 1.6; }

        .cta-section { padding: 40px 24px 80px; position: relative; z-index: 2; }
        .cta-container {
          position: relative; max-width: 1000px; margin: 0 auto;
          background: linear-gradient(145deg, #1a5c38 0%, #2a953c 100%);
          border-radius: 40px; padding: 80px 40px; text-align: center;
          overflow: hidden; box-shadow: 0 24px 50px rgba(26,92,56,0.2);
        }
        .cta-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 100%;
          background: radial-gradient(circle at top, rgba(76,214,128,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-content { position: relative; z-index: 2; }
        .cta-badge {
          display: inline-block; background: rgba(255,255,255,0.1); color: #4cd680;
          padding: 8px 20px; border-radius: 99px; font-size: 0.875rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
        }
        .cta-title { font-size: clamp(2rem,5vw,3.5rem); font-weight: 800; color: #fff; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 20px; }
        .cta-desc { font-size: 1.125rem; color: rgba(255,255,255,0.8); max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }

        @media (max-width: 768px) {
          .section { padding: 80px 0; }
          .hero { padding: 120px 0 60px; }
          .grid-2 { grid-template-columns: 1fr; gap: 40px; }
          .section-title { font-size: 2rem; }
          .stat-number { font-size: 3rem; }
          .spec-row { grid-template-columns: 1fr; gap: 8px; padding: 24px 16px; }
          .spec-value { font-size: 1.05rem; }
          .cta-section { padding: 20px 16px 60px; }
          .cta-container { padding: 60px 20px; border-radius: 28px; }
          .cta-actions { flex-direction: column; width: 100%; }
        }
      `}</style>
    </div>
  );
}