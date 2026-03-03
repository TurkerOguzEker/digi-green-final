// src/components/CookieBanner.js
'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde kullanıcının daha önce onay verip vermediğini kontrol et
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setIsVisible(false);
    
    // Eğer Google Analytics yüklüyse, onayı 'verildi' olarak güncelle
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const handleReject = () => {
    // Kullanıcı reddederse kaydet ama analitiği kapalı tut
    localStorage.setItem('cookie_consent', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#161b22',
      color: '#e6edf3',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      border: '1px solid rgba(34,197,94,0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 999999,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#22c55e', fontWeight: 700 }}>
          Çerez Politikası & Gizlilik
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#7d8590', lineHeight: '1.6' }}>
          Size daha iyi bir web deneyimi sunabilmek ve site trafiğimizi analiz edebilmek için çerezleri kullanıyoruz. 
          Avrupa Birliği (GDPR) ve KVKK standartlarına uygun olarak, verilerinizi nasıl işlediğimizi anlamak için 
          ayarlarınızı seçebilirsiniz. "Kabul Et" butonuna tıklayarak analitik çerezlerine onay vermiş olursunuz.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleReject} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #484f58', background: 'transparent', color: '#c9d1d9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Sadece Zorunlular
        </button>
        <button 
          onClick={handleAccept} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#000', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Tümünü Kabul Et
        </button>
      </div>
    </div>
  );
}