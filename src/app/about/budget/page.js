'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function BudgetPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    supabase.from('settings').select('*').eq('key', 'about_budget_images').single()
    .then(({ data }) => {
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setImages(parsed);
          }
        } catch (e) { 
          console.error('JSON parse hatası:', e); 
        }
      }
      setLoading(false);
    });
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container section-padding">
        
        {/* SAYFA BAŞLIĞI */}
        <div className="section-title text-center" style={{marginBottom:'40px'}}>
            <h1 style={{color:'#003399', marginBottom:'15px', fontSize:'2.2rem'}}>Bütçe Planı</h1>
            <p style={{fontSize:'1.2rem', color:'#666', fontWeight:'300'}}>DIGI-GREEN FUTURE / 2025 – 2027</p>
            <div style={{width:'80px', height:'4px', background:'#27ae60', margin:'20px auto', borderRadius:'2px'}}></div>
        </div>

        {/* SLIDER ALANI */}
        <div style={{
            maxWidth:'1200px', 
            margin:'0 auto', 
            background:'white', 
            padding:'10px', 
            borderRadius:'15px', 
            boxShadow:'0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            
            {loading ? (
                <div style={{textAlign:'center', padding:'100px 0', color:'#003399'}}>
                    <i className="fas fa-spinner fa-spin" style={{fontSize:'2rem'}}></i>
                    <p style={{marginTop:'10px'}}>Yükleniyor...</p>
                </div>
            ) : images.length > 0 ? (
                <>
                    {/* --- Viewport (Görüntüleme Penceresi) --- */}
                    <div style={{
                        width:'100%', 
                        height: '75vh', 
                        minHeight: '500px',
                        overflow:'hidden', // Dışarı taşan her şeyi gizle
                        borderRadius:'8px',
                        background: '#fcfcfc',
                        border: '1px solid #f0f0f0',
                        position: 'relative' // Track için referans
                    }}>
                        
                        {/* --- Track (Kayan Şerit) --- */}
                        <div style={{
                            display: 'flex',
                            height: '100%', 
                            width: '100%', 
                            // transform ile kaydırma işlemi
                            transform: `translateX(-${currentIndex * 100}%)`, 
                            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                            willChange: 'transform' // Performans optimizasyonu
                        }}>
                            {images.map((img, idx) => (
                                // --- Slide Wrapper (Her bir resim kutusu) ---
                                <div key={idx} style={{
                                    flex: '0 0 100%',   // BURASI ÖNEMLİ: Genişliği %100'e sabitle (büyüme/küçülme yok)
                                    width: '100%',      // Genişlik %100
                                    height: '100%', 
                                    overflow: 'hidden', // Resim büyükse taşanı gizle
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img 
                                        src={img} 
                                        alt={`Bütçe Sayfası ${idx + 1}`} 
                                        style={{
                                            maxWidth: '100%', 
                                            maxHeight: '100%', 
                                            width: 'auto',
                                            height: 'auto',
                                            display: 'block',
                                            objectFit: 'contain', // Resmi kutuya sığdır
                                            userSelect: 'none'    // Resmin seçilmesini engelle
                                        }} 
                                    />
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Kontrol Butonları */}
                    {images.length > 1 && (
                        <>
                            <button onClick={prevSlide} className="slider-btn prev">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button onClick={nextSlide} className="slider-btn next">
                                <i className="fas fa-chevron-right"></i>
                            </button>

                            {/* Noktalar */}
                            <div className="slider-dots">
                                {images.map((_, idx) => (
                                    <span 
                                        key={idx} 
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`dot ${idx === currentIndex ? 'active' : ''}`}
                                    ></span>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Sayfa Numarası */}
                    <div style={{textAlign:'center', marginTop:'15px', color:'#888', fontWeight:'500'}}>
                        Sayfa {currentIndex + 1} / {images.length}
                    </div>
                </>
            ) : (
                <div style={{padding:'80px', textAlign:'center', color:'#999'}}>
                    <i className="fas fa-images" style={{fontSize:'4rem', marginBottom:'20px', opacity:0.3}}></i>
                    <p style={{fontSize:'1.2rem'}}>Henüz bütçe görseli yüklenmemiş.</p>
                    <small>Admin panelinden görselleri ekleyebilirsiniz.</small>
                </div>
            )}
        </div>

        {/* İndirme Butonu */}
        {images.length > 0 && (
            <div className="text-center" style={{marginTop:'30px'}}>
                <a href={images[currentIndex]} target="_blank" className="btn" style={{background:'#003399', color:'white', padding:'14px 35px', borderRadius:'30px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'10px', boxShadow:'0 5px 15px rgba(0,51,153,0.3)', transition:'transform 0.2s', fontSize:'1.1rem'}}>
                    <i className="fas fa-search-plus"></i> Resmi Tam Boyut Aç / İndir
                </a>
            </div>
        )}
    <ScrollToTop />
        <style jsx>{`
            .slider-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.9);
                color: #003399;
                border: 1px solid #eee;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                z-index: 10;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                font-size: 1.2rem;
            }
            .slider-btn:hover {
                background: #003399;
                color: white;
                transform: translateY(-50%) scale(1.1);
            }
            .slider-btn.prev { left: -25px; }
            .slider-btn.next { right: -25px; }

            .slider-dots {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            }
            .dot {
                width: 12px;
                height: 12px;
                background: #e0e0e0;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s;
            }
            .dot.active {
                background: #27ae60;
                transform: scale(1.3);
                width: 30px;
                border-radius: 10px;
            }

            @media (max-width: 768px) {
                .slider-btn.prev { left: 10px; }
                .slider-btn.next { right: 10px; }
            }
        `}</style>

    </div>
  );
}