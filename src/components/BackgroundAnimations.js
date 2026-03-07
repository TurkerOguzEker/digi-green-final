'use client';
import { useEffect, useState, useRef } from 'react';

// ─── SAYFA GENELİ ARKA PLAN AĞI (NETWORK) ──────────────────────────────────
export const NetworkBackground = () => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // İlk açılışta kontrol et
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Mobildeyse animasyonu hiç başlatma (Performans tasarrufu)
    if (isMobile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let isVisible = true;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); 
    resize();

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
  }, [isMobile]);

  // Mobilde DOM'a boşuna canvas elementi eklemiyoruz
  if (isMobile) return <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#f4f7f2' }} />;

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: '#f4f7f2' }} />;
};

// ─── YAPRAK ANİMASYONU (HERO) ──────────────────────────────────────────────
export const HeroAnimation = () => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // İlk açılışta kontrol et
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Mobildeyse animasyonu hiç başlatma
    if (isMobile || !canvasRef.current) return;

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
        let diff = Math.atan2(this.vy, -this.vx) + Math.PI * 0.08 - this.angle;
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
  }, [isMobile]);

  if (isMobile) return null; // Mobilde canvas'i DOM'a basma

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
    />
  );
};