'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import ScrollToTop from '../../components/ScrollToTop';
// ─── SAYFA GENELİ ARKA PLAN AĞI ───────────────────────────────────────────────
const NetworkBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

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
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
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

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 80);

    const turb = (x, y, t) =>
      Math.sin(x * 0.007 + t * 0.35) * 0.5 +
      Math.sin(y * 0.009 - t * 0.25) * 0.35 +
      Math.sin((x + y) * 0.004 + t * 0.45) * 0.3;

    const drawLeaf = (s, v) => {
      ctx.beginPath();
      if (v === 0) {
        ctx.moveTo(0, -s * 2.0);
        ctx.bezierCurveTo( s*1.6, -s*1.0,  s*1.6,  s*1.0, 0,  s*2.0);
        ctx.bezierCurveTo(-s*1.6,  s*1.0, -s*1.6, -s*1.0, 0, -s*2.0);
      } else if (v === 1) {
        ctx.moveTo(0, -s * 2.4);
        ctx.bezierCurveTo( s*0.9, -s*0.8,  s*0.9,  s*0.8, 0,  s*2.4);
        ctx.bezierCurveTo(-s*0.9,  s*0.8, -s*0.9, -s*0.8, 0, -s*2.4);
      } else {
        ctx.moveTo(0, -s * 1.5);
        ctx.bezierCurveTo( s*1.8, -s*0.6,  s*1.8,  s*0.6, 0,  s*1.5);
        ctx.bezierCurveTo(-s*1.8,  s*0.6, -s*1.8, -s*0.6, 0, -s*1.5);
      }
      ctx.closePath();
    };

    class Leaf {
      reset() {
        if (Math.random() < 0.75) {
          this.x = canvas.width + 30 + Math.random() * 120;
          this.y = Math.random() * canvas.height;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = -30;
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
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
      }
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
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur  = 7;
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.fillStyle   = `rgb(${this.r},${this.g},${this.b})`;
        drawLeaf(s, this.variant);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.8); ctx.lineTo(0, s * 1.8);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 0.6; ctx.stroke();
        const d = s * 0.9;
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo( s * 1.0, -d - s * 0.35);
        ctx.moveTo(0,  0); ctx.lineTo( s * 1.1,  0  - s * 0.3);
        ctx.moveTo(0, -d); ctx.lineTo(-s * 1.0, -d - s * 0.35);
        ctx.moveTo(0,  0); ctx.lineTo(-s * 1.1,  0  - s * 0.3);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.4; ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    for (let i = 0; i < 20; i++) leaves.push(new Leaf());

    const animate = () => {
      windTime += 0.007;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      leaves.forEach(l => { l.update(windTime); l.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
    />
  );
};

// ─── NEWS PAGE ─────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Sadece haberleri çekiyoruz, arkaplan resmine artık gerek yok.
      const { data: newsData } = await supabase.from('news').select('*').order('date', {ascending: false});
      if (newsData) setNews(newsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, news]);

  return (
    <div className="news-page">
      <NetworkBackground />

      {loading ? (
        <div className="loading-screen">
          <div className="loader-ring">
            <div></div><div></div><div></div><div></div>
          </div>
          <span className="loader-text">Hazırlanıyor…</span>
        </div>
      ) : (
        <>
          {/* ── HERO ALANI ────────────────────────────────────────────────────── */}
          <section className="page-header">
            <HeroAnimation />
            <div className="hero-noise"></div>

            <div className="hero-orb orb-1"></div>
            <div className="hero-orb orb-2"></div>
            <div className="hero-orb orb-3"></div>

            <div className="container hero-content">
              <div className="eyebrow reveal active">
                <span className="eyebrow-dot"></span>
                Gelişmeler
                <span className="eyebrow-dot"></span>
              </div>
              <h1 className="header-title reveal active">
                Haberler &amp;<br />
                <em>Etkinlikler</em>
              </h1>
              <p className="header-subtitle reveal active" style={{ transitionDelay: '0.25s' }}>
                Projemizle ilgili en güncel gelişmeleri, duyuruları ve etkinlikleri buradan takip edebilirsiniz.
              </p>

              <div className="hero-divider reveal active" style={{ transitionDelay: '0.4s' }}>
                <span></span><span className="dot"></span><span></span>
              </div>
            </div>

            <button
              className="hero-scroll-btn"
              onClick={() => document.getElementById('icerik')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="İçeriğe git"
            >
              <span className="scroll-btn-label">Haberleri Keşfet</span>
              <span className="scroll-btn-icon">
                <i className="fas fa-chevron-down"></i>
              </span>
            </button>
          </section>

          {/* ── CONTENT (HABER KARTLARI) ─────────────────────────────────────────────────── */}
          <section id="icerik" className="section-padding">
            <div className="container" style={{ maxWidth: '1160px' }}>

              {/* Bölüm başlığı */}
              <div className="section-head reveal">
                <p className="section-label">Medya ve Duyurular</p>
                <h2 className="section-title">Güncel Gelişmeler</h2>
              </div>

              <div className="news-grid">
                {news.length === 0 ? (
                  <div className="empty-state reveal">
                    <i className="far fa-newspaper"></i>
                    <p>Henüz bir haber veya etkinlik eklenmemiş.</p>
                  </div>
                ) : (
                  news.map((item, index) => {
                    const delay = `${(index % 3) * 0.12 + 0.1}s`;
                    
                    // Tarih formatını daha şık göstermek için parçalayalım (örn: 24 Mayıs 2024 -> 24 Mayıs)
                    const dateParts = item.date ? item.date.split(' ') : [];
                    const displayDate = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : item.date;

                    return (
                      <article key={item.id} className="news-card reveal" style={{ transitionDelay: delay }}>
                        {/* Parlaklık efekti */}
                        <div className="card-shine"></div>

                        {/* Kart İçinden Boşluklu (Inset) Resim Alanı */}
                        <div className="news-image-container">
                            <div className="news-image">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} />
                                ) : (
                                    <div className="placeholder-img"><i className="far fa-image"></i></div>
                                )}
                                
                                {/* Resmin üzerindeki şık tarih etiketi */}
                                <div className="news-date-badge">
                                    <i className="far fa-calendar-alt"></i>
                                    {displayDate}
                                </div>
                            </div>
                        </div>

                        <div className="news-content">
                          <h3 className="news-title">{item.title}</h3>
                          <p className="news-desc">{item.summary}</p>
                          
                          {/* İleride bir haber detayı linki olursa diye ok işareti alanı (opsiyonel görsel bütünlük) */}
                          <div className="news-footer">
                              <span className="read-more">Devamını Oku <i className="fas fa-arrow-right"></i></span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </>
      )}
      <ScrollToTop />
      <style jsx>{`
        /* ── RESET / BASE ───────────────────────────────────────────────────── */
        .news-page {
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          --green-deep:   #1a5c38;
          --green-mid:    #27ae60;
          --green-light:  #4cd680;
          --green-pale:   #e8f5ee;
          --cream:        #f4f6f8;
          --primary:      #003399;
          --navy:         #0d2b1f;
          --gold:         #c9a84c;
          --text-dark:    #1a1a1a;
          --text-mid:     #3d5448;
          --text-soft:    #6b8277;
          --card-bg:      rgba(255,255,255,0.88);
          --border:       rgba(39,174,96,0.15);
          --shadow-card:  0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --shadow-hover: 0 20px 60px rgba(26,92,56,0.18), 0 4px 16px rgba(0,0,0,0.06);
          --radius:       24px;
        }

        /* ── LOADER ─────────────────────────────────────────────────────────── */
        .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .loader-ring { display: inline-block; position: relative; width: 60px; height: 60px; }
        .loader-ring div { box-sizing: border-box; display: block; position: absolute; width: 46px; height: 46px; margin: 7px; border: 3px solid transparent; border-top-color: var(--green-mid); border-radius: 50%; animation: loader-spin 1.2s cubic-bezier(0.5,0,0.5,1) infinite; }
        .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
        .loader-ring div:nth-child(2) { animation-delay: -0.3s; border-top-color: var(--gold); }
        .loader-ring div:nth-child(3) { animation-delay: -0.15s; }
        .loader-text { font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600; color: var(--text-soft); letter-spacing: 0.1em; text-transform: uppercase; }
        @keyframes loader-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* ── REVEAL ────────────────────────────────────────────────────────── */
        .reveal:not(.news-card) {
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.active:not(.news-card) { opacity: 1; transform: translateY(0); }

        /* ── HERO ───────────────────────────────────────────────────────────── */
        .page-header {
          position: relative; min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; overflow: hidden;
          background: linear-gradient(160deg, #071a0f 0%, #0f3320 35%, #1a5c38 65%, #0d2b1f 100%);
        }

        .hero-noise {
          position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.6;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 256px;
        }

        .hero-orb { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(80px); opacity: 0.35; }
        .orb-1 { width: 500px; height: 500px; top: -120px; left: -80px; background: radial-gradient(circle, rgba(39,174,96,0.5) 0%, transparent 70%); animation: orbFloat 14s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; bottom: -100px; right: -60px; background: radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%); animation: orbFloat 18s ease-in-out infinite reverse; }
        .orb-3 { width: 300px; height: 300px; top: 50%; left: 55%; background: radial-gradient(circle, rgba(100,220,150,0.3) 0%, transparent 70%); animation: orbFloat 10s ease-in-out infinite 3s; }
        @keyframes orbFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.06); } }

        .hero-content { position: relative; z-index: 3; }

        .eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 22px; }
        .eyebrow-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }

        .header-title { font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.1; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 20px rgba(0,0,0,0.4); letter-spacing: -0.02em; }
        .header-title em { font-style: normal; background: linear-gradient(90deg, #6ee8a2, #a8f0c0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .header-subtitle { font-size: 1.05rem; font-weight: 400; line-height: 1.7; color: rgba(220,240,228,0.75); max-width: 500px; margin: 0 auto 36px; letter-spacing: 0.01em; }

        .hero-divider { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .hero-divider span { height: 1px; width: 80px; background: rgba(201,168,76,0.5); }
        .hero-divider .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }

        .hero-scroll-btn { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; padding: 0; }
        .scroll-btn-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); transition: color 0.3s ease; }
        .hero-scroll-btn:hover .scroll-btn-label { color: rgba(255,255,255,0.9); }
        .scroll-btn-icon { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); font-size: 0.9rem; transition: all 0.3s ease; animation: scrollBounce 2.2s ease-in-out infinite; background: rgba(255,255,255,0.05); }
        .hero-scroll-btn:hover .scroll-btn-icon { border-color: var(--green-mid); background: rgba(39,174,96,0.2); color: #ffffff; animation-play-state: paused; }
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 0.7; } 50% { transform: translateY(7px); opacity: 1; } }

        /* ── SECTION ────────────────────────────────────────────────────────── */
        .section-padding { padding: 50px 0 100px; }
        .section-head { margin-bottom: 40px; }
        .section-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green-mid); margin-bottom: 10px; }
        .section-title { font-size: 2rem; font-weight: 800; color: var(--text-dark); letter-spacing: -0.02em; border-left: 3px solid var(--green-mid); padding-left: 18px; margin: 0; }

        /* ── GRID ───────────────────────────────────────────────────────────── */
        .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 30px; }

        /* ── NEWS CARD (ÖZEL TASARIM) ───────────────────────────────────────── */
        .news-card {
          background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow-card);
          border: 1px solid var(--border); backdrop-filter: blur(14px); position: relative; overflow: hidden;
          transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2), box-shadow 0.45s ease, border-color 0.3s ease;
          display: flex; flex-direction: column; will-change: transform;
        }

        .news-card.reveal { opacity: 0; transform: translateY(40px) scale(0.98); }
        .news-card.reveal.active { opacity: 1; transform: translateY(0) scale(1); }
        .news-card.reveal.active:hover { transform: translateY(-10px) scale(1.01); box-shadow: var(--shadow-hover); border-color: rgba(39,174,96,0.3); transition-delay: 0s; }

        .card-shine { position: absolute; top: 0; left: -120%; width: 60%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); transition: left 0.65s ease; pointer-events: none; z-index: 5; }
        .news-card.reveal.active:hover .card-shine { left: 180%; }

        /* Haber Resim Alanı (İçten Boşluklu - Inset) */
        .news-image-container {
            padding: 16px 16px 0 16px;
            position: relative;
            z-index: 2;
        }
        .news-image {
            width: 100%;
            height: 220px;
            border-radius: 14px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            background: #f0f4f2;
        }
        .news-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .placeholder-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #cbd5e1; }
        
        .news-card.reveal.active:hover .news-image img { transform: scale(1.08); }

        /* Tarih Rozeti (Badge) */
        .news-date-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(4px);
            color: var(--green-deep);
            padding: 6px 12px;
            border-radius: 30px;
            font-size: 0.75rem;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 3;
        }

        /* Haber Metin İçeriği */
        .news-content { padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; position: relative; z-index: 3; }
        
        .news-title { font-size: 1.25rem; font-weight: 800; line-height: 1.35; color: var(--text-dark); margin: 0; transition: color 0.3s ease; }
        .news-card.reveal.active:hover .news-title { color: var(--green-deep); }
        
        .news-desc { font-size: 0.95rem; color: var(--text-soft); line-height: 1.65; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

        /* Devamını Oku Kısmı */
        .news-footer { display: flex; align-items: center; margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(39,174,96,0.1); }
        .read-more { font-size: 0.85rem; font-weight: 700; color: var(--green-mid); display: flex; align-items: center; gap: 6px; transition: gap 0.3s ease; cursor: pointer; }
        .news-card.reveal.active:hover .read-more { gap: 10px; color: var(--green-deep); }

        /* ── EMPTY STATE ────────────────────────────────────────────────────── */
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 40px; color: var(--text-soft); }
        .empty-state i { font-size: 3rem; opacity: 0.4; margin-bottom: 20px; display: block; }
        .empty-state p { font-size: 1rem; }

        /* ── CONTAINER & RESPONSIVE ─────────────────────────────────────────── */
        .container { width: 100%; padding: 0 24px; margin: 0 auto; }
        @media (max-width: 640px) {
          .page-header { min-height: 100svh; padding: 0; }
          .header-title { font-size: 2rem; }
          .news-grid { grid-template-columns: 1fr; }
          .news-content { padding: 20px 16px; }
          .hero-scroll-btn { bottom: 28px; }
        }
      `}</style>
    </div>
  );
}