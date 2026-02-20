'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import ScrollToTop from '../../components/ScrollToTop';

// ─── SAYFA GENELİ ARKA PLAN (OPTİMİZE EDİLDİ) ─────────────────────────────────
const NetworkBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let isVisible = true; // ✨ OPTİMİZASYON: Görünürlük kontrolü

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    // ✨ OPTİMİZASYON: Ekranda değilken animasyonu durdur (Batarya tasarrufu)
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
      if (isVisible) { // Sadece ekrandayken çiz
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

// ─── YAPRAK ANİMASYONU (500ms GECİKME + YÜKSEK PERFORMANS) ────────────────────
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
    let isVisible = true; // ✨ OPTİMİZASYON

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

    // ✨ OPTİMİZASYON: Yaprak şekilleri her karede yeniden çizilmek yerine 1 kez hafızaya alınır.
    const leafPaths = [new Path2D(), new Path2D(), new Path2D()];
    
    // Varyasyon 0
    leafPaths[0].moveTo(0, -2.0); leafPaths[0].bezierCurveTo(1.6, -1.0, 1.6, 1.0, 0, 2.0); leafPaths[0].bezierCurveTo(-1.6, 1.0, -1.6, -1.0, 0, -2.0);
    // Varyasyon 1
    leafPaths[1].moveTo(0, -2.4); leafPaths[1].bezierCurveTo(0.9, -0.8, 0.9, 0.8, 0, 2.4); leafPaths[1].bezierCurveTo(-0.9, 0.8, -0.9, -0.8, 0, -2.4);
    // Varyasyon 2
    leafPaths[2].moveTo(0, -1.5); leafPaths[2].bezierCurveTo(1.8, -0.6, 1.8, 0.6, 0, 1.5); leafPaths[2].bezierCurveTo(-1.8, 0.6, -1.8, -0.6, 0, -1.5);

    class Leaf {
      reset() {
        // ✨ Ekran DIŞINDAN doğma ayarı
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
      constructor() {
        this.reset();
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
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.size, this.size); // Optimize edilmiş scale
        
        ctx.globalAlpha = this.opacity;
        
        // ✨ OPTİMİZASYON: shadowBlur yerine donanım dostu "Fake Shadow"
        ctx.save();
        ctx.translate(0.3, 0.6);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fill(leafPaths[this.variant]);
        ctx.restore();

        // Yaprak Gövdesi
        ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
        ctx.fill(leafPaths[this.variant]);

        // Yaprak Damarları
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

    // ✨ 500ms GECİKMELİ BAŞLANGIÇ ✨
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

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [info, setInfo] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setInfo(map);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <NetworkBackground />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="page-header">
        <HeroAnimation />
        <div className="hero-noise"></div>
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>

        <div className="container hero-content">
          <div className="eyebrow reveal active">
            <span className="eyebrow-dot"></span>İletişim<span className="eyebrow-dot"></span>
          </div>
          <h1 className="header-title reveal active">
            Bize Ulaşın &amp;<br /><em>Yazışalım</em>
          </h1>
          <p className="header-subtitle reveal active" style={{ transitionDelay: '0.25s' }}>
            Sorularınız, önerileriniz veya işbirliği talepleriniz için buradayız.
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
          <span className="scroll-btn-label">İletişime Geç</span>
          <span className="scroll-btn-icon"><i className="fas fa-chevron-down"></i></span>
        </button>
      </section>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <section id="icerik" className="section-padding">
        <div className="container" style={{ maxWidth: '1100px' }}>

          <div className="section-head">
            <p className="section-label">Bize Yazın</p>
            <h2 className="section-title">İletişim Bilgileri & Form</h2>
          </div>

          <div className="contact-grid">

            {/* ─ SOL: İletişim Bilgileri ─────────────────────────────────── */}
            <div className="info-card">
              <h3 className="card-heading">İletişim Bilgileri</h3>

              <ul className="info-list">
                <li className="info-item">
                  <div className="info-icon"><i className="fas fa-map-marker-alt"></i></div>
                  <div>
                    <span className="info-label">Adres</span>
                    <span className="info-value">{info.contact_address || '—'}</span>
                  </div>
                </li>
                <li className="info-item">
                  <div className="info-icon"><i className="fas fa-envelope"></i></div>
                  <div>
                    <span className="info-label">E-posta</span>
                    <a href={`mailto:${info.contact_email}`} className="info-value info-link">
                      {info.contact_email || '—'}
                    </a>
                  </div>
                </li>
                <li className="info-item">
                  <div className="info-icon"><i className="fas fa-phone"></i></div>
                  <div>
                    <span className="info-label">Telefon</span>
                    <span className="info-value">{info.contact_phone || '—'}</span>
                  </div>
                </li>
              </ul>

              {/* Sosyal Medya */}
              <div className="social-section">
                <p className="social-heading">Bizi Takip Edin</p>
                <div className="social-row">
                  {info.social_facebook && (
                    <a href={info.social_facebook} target="_blank" rel="noopener noreferrer" className="social-btn" title="Facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                  {info.social_twitter && (
                    <a href={info.social_twitter} target="_blank" rel="noopener noreferrer" className="social-btn" title="Twitter / X">
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  {info.social_instagram && (
                    <a href={info.social_instagram} target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram">
                      <i className="fab fa-instagram"></i>
                    </a>
                  )}
                  {!info.social_facebook && !info.social_twitter && !info.social_instagram && (
                    <span className="social-empty">Henüz eklenmemiş.</span>
                  )}
                </div>
              </div>
            </div>

            {/* ─ SAĞ: Form ──────────────────────────────────────────────── */}
            <div className="form-card">
              <h3 className="card-heading">Mesaj Gönderin</h3>

              {status === 'success' && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Adınız Soyadınız</label>
                    <input type="text" name="name" required placeholder="Adınız"
                      value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>E-posta Adresiniz</label>
                    <input type="email" name="email" required placeholder="ornek@email.com"
                      value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Konu</label>
                  <input type="text" name="subject" required placeholder="Mesajınızın konusu"
                    value={formData.subject} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Mesajınız</label>
                  <textarea name="message" rows={5} required placeholder="Mesajınızı buraya yazın..."
                    value={formData.message} onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? (
                    <><i className="fas fa-circle-notch fa-spin"></i> Gönderiliyor…</>
                  ) : (
                    <><span>Mesajı Gönder</span><span className="btn-icon"><i className="fas fa-paper-plane"></i></span></>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
      <ScrollToTop />
      <style jsx>{`
        .contact-page {
          font-family: 'Inter', sans-serif; overflow-x: hidden;
          --green-deep: #1e9448; --green-mid: #2DB55D; --green-light: #52d47a;
          --green-pale: #e6f7ed; --cream: #f4f6f8; --primary: #003399;
          --gold: #c9a84c; --text-dark: #1a1a1a; --text-mid: #3d5448; --text-soft: #6b8277;
          --card-bg: rgba(255,255,255,0.9); --border: rgba(45,181,93,0.15);
          --shadow-card: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --shadow-hover: 0 20px 60px rgba(30,148,72,0.14), 0 4px 16px rgba(0,0,0,0.05);
          --radius: 20px;
        }

        
        /* HERO */
        .page-header {
          position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; text-align:center; overflow:hidden;
          /* Eski asil ve derin orman yeşili gradyanı */
          background: linear-gradient(160deg, #071a0f 0%, #0f3320 35%, #1a5c38 65%, #0d2b1f 100%);
        }
        .hero-noise { position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.6;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:256px; }
        .hero-orb { position:absolute; border-radius:50%; pointer-events:none; z-index:0; filter:blur(80px); opacity:0.35; }
        .orb-1 { width:500px; height:500px; top:-120px; left:-80px; background:radial-gradient(circle,rgba(45,181,93,0.5) 0%,transparent 70%); animation:orbFloat 14s ease-in-out infinite; }
        .orb-2 { width:400px; height:400px; bottom:-100px; right:-60px; background:radial-gradient(circle,rgba(201,168,76,0.4) 0%,transparent 70%); animation:orbFloat 18s ease-in-out infinite reverse; }
        .orb-3 { width:300px; height:300px; top:50%; left:55%; background:radial-gradient(circle,rgba(100,220,150,0.3) 0%,transparent 70%); animation:orbFloat 10s ease-in-out infinite 3s; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.06);} }

        .hero-content { position:relative; z-index:3; }
        .eyebrow { display:inline-flex; align-items:center; gap:12px; font-size:0.75rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); margin-bottom:22px; }
        .eyebrow-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--gold); }
        .header-title { font-size:clamp(2.2rem,5vw,3.8rem); font-weight:800; line-height:1.1; color:#fff; margin-bottom:20px; text-shadow:0 2px 20px rgba(0,0,0,0.4); letter-spacing:-0.02em; }
        .header-title em { font-style:normal; background:linear-gradient(90deg,#6ee8a2,#a8f0c0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .header-subtitle { font-size:1.05rem; font-weight:400; line-height:1.7; color:rgba(220,240,228,0.75); max-width:500px; margin:0 auto 36px; letter-spacing:0.01em; }
        .hero-divider { display:flex; align-items:center; justify-content:center; gap:16px; }
        .hero-divider span { height:1px; width:80px; background:rgba(201,168,76,0.5); }
        .hero-divider .dot { width:6px; height:6px; border-radius:50%; background:var(--gold); }

        .hero-scroll-btn { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); z-index:3; display:flex; flex-direction:column; align-items:center; gap:10px; background:none; border:none; cursor:pointer; padding:0; }
        .scroll-btn-label { font-size:0.72rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.55); transition:color 0.3s ease; }
        .hero-scroll-btn:hover .scroll-btn-label { color:rgba(255,255,255,0.9); }
        .scroll-btn-icon { width:44px; height:44px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.7); font-size:0.9rem; transition:all 0.3s ease; animation:scrollBounce 2.2s ease-in-out infinite; background:rgba(255,255,255,0.05); }
        .hero-scroll-btn:hover .scroll-btn-icon { border-color:var(--green-mid); background:rgba(45,181,93,0.2); color:#fff; animation-play-state:paused; }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0);opacity:0.7;} 50%{transform:translateY(7px);opacity:1;} }

        /* SECTION */
        .section-padding { padding:48px 0 80px; position:relative; z-index:1; }
        .section-head { margin-bottom:36px; }
        .section-label { font-size:0.75rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--green-mid); margin-bottom:8px; }
        .section-title { font-size:2rem; font-weight:800; color:var(--text-dark); letter-spacing:-0.02em; border-left:3px solid var(--green-mid); padding-left:18px; margin:0; }
        .container { width:100%; padding:0 24px; margin:0 auto; }

        /* GRID */
        .contact-grid { display:grid; grid-template-columns:1fr 1.5fr; gap:28px; }

        /* KARTLAR */
        .info-card, .form-card {
          background:var(--card-bg); backdrop-filter:blur(14px);
          border-radius:var(--radius); box-shadow:var(--shadow-card);
          border:1px solid var(--border); padding:36px;
          transition:box-shadow 0.3s ease;
        }
        .info-card:hover, .form-card:hover { box-shadow:var(--shadow-hover); }

        .card-heading { font-size:1.15rem; font-weight:800; color:var(--text-dark); margin:0 0 28px; padding-bottom:16px; border-bottom:1px solid rgba(45,181,93,0.12); }

        /* İletişim listesi */
        .info-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:22px; }
        .info-item { display:flex; align-items:flex-start; gap:16px; }
        .info-icon {
          width:42px; height:42px; border-radius:12px; flex-shrink:0;
          background:var(--green-pale); color:var(--green-deep);
          display:flex; align-items:center; justify-content:center; font-size:1rem;
          border:1px solid rgba(45,181,93,0.2);
        }
        .info-label { display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-soft); margin-bottom:3px; }
        .info-value { display:block; font-size:0.95rem; color:var(--text-dark); font-weight:500; line-height:1.5; }
        .info-link { color:var(--green-deep); text-decoration:none; }
        .info-link:hover { text-decoration:underline; }

        /* Sosyal */
        .social-section { margin-top:28px; padding-top:22px; border-top:1px solid rgba(45,181,93,0.12); }
        .social-heading { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-soft); margin:0 0 14px; }
        .social-row { display:flex; gap:10px; flex-wrap:wrap; }
        .social-btn {
          width:42px; height:42px; border-radius:12px;
          background:var(--green-deep); color:#fff;
          display:flex; align-items:center; justify-content:center;
          font-size:1rem; text-decoration:none;
          transition:transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
          box-shadow:0 3px 8px rgba(30,148,72,0.2);
        }
        .social-btn:hover { transform:translateY(-3px); background:var(--green-mid); box-shadow:0 6px 16px rgba(45,181,93,0.3); }
        .social-empty { font-size:0.85rem; color:#aaa; font-style:italic; }

        /* FORM */
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { margin-bottom:18px; }
        .form-group label { display:block; margin-bottom:7px; font-size:0.82rem; font-weight:600; color:var(--text-mid); letter-spacing:0.02em; }
        .form-group input, .form-group textarea {
          width:100%; padding:11px 14px; box-sizing:border-box;
          border:1.5px solid rgba(45,181,93,0.2); border-radius:10px;
          font-family:'Inter',sans-serif; font-size:0.95rem; color:var(--text-dark);
          background:rgba(248,252,249,0.8);
          transition:border-color 0.25s, box-shadow 0.25s;
          outline:none; resize:vertical;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color:var(--green-mid);
          box-shadow:0 0 0 3px rgba(45,181,93,0.12);
          background:#fff;
        }
        .form-group input::placeholder, .form-group textarea::placeholder { color:#b0bfb8; }

        /* Gönder butonu */
        /* Gönder butonu (Tek Renk Bütünleşik Yapı) */
        .submit-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          border-radius:10px; overflow:hidden; border:none; cursor:pointer;
          font-family:'Inter',sans-serif; font-size:0.95rem; font-weight:700;
          color:#fff; width:100%; margin-top:4px;
          padding:14px 20px; /* Padding artık tüm butona uygulanıyor */
          background:var(--green-deep); /* Tek renk */
          transition:background 0.3s, transform 0.2s;
        }
        .submit-btn:disabled { opacity:0.7; cursor:not-allowed; }
        
        /* İçerideki span'ler için eski arka planları ve ekstra boşlukları kaldırıyoruz */
        .submit-btn span:first-child { flex: none; padding: 0; background: transparent; text-align: center; }
        .submit-btn .btn-icon { padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; }
        
        /* Hover (Üzerine gelince) Efekti */
        .submit-btn:not(:disabled):hover { background:#166336; transform: translateY(-2px); }
        .submit-btn:not(:disabled):hover .btn-icon i { transform: translateX(4px); transition: transform 0.3s; }
        .submit-btn:disabled span:first-child, .submit-btn:disabled .btn-icon { background:var(--green-deep); }

        /* Uyarılar */
        .alert { display:flex; align-items:flex-start; gap:10px; padding:14px 16px; border-radius:10px; font-size:0.9rem; font-weight:500; margin-bottom:20px; line-height:1.5; }
        .alert i { margin-top:2px; flex-shrink:0; }
        .alert-success { background:rgba(45,181,93,0.1); color:var(--green-deep); border:1px solid rgba(45,181,93,0.25); }
        .alert-error { background:rgba(231,76,60,0.08); color:#c0392b; border:1px solid rgba(231,76,60,0.2); }

        /* REVEAL */
        .reveal { opacity:0; transform:translateY(40px); transition:opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1); }
        .reveal.active { opacity:1; transform:translateY(0); }

        @media (max-width: 900px) {
          .contact-grid { grid-template-columns:1fr; }
          .form-row { grid-template-columns:1fr; }
        }
        @media (max-width: 640px) {
          .page-header { min-height:100svh; }
          .header-title { font-size:2rem; }
          .info-card, .form-card { padding:24px; }
          .hero-scroll-btn { bottom:28px; }
        }
      `}</style>
    </div>
  );
}