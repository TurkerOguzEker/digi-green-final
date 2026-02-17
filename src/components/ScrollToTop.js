'use client';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Kullanıcı 300px aşağı kaydırdığında butonu göster
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Tıklandığında en yukarı yumuşakça kaydır
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-to-top" aria-label="Yukarı Çık">
          <i className="fas fa-chevron-up"></i>
        </button>
      )}

      <style jsx>{`
        .scroll-to-top {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #27ae60; /* Projenizin ana yeşili */
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
          z-index: 9999;
          transition: all 0.3s ease;
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .scroll-to-top:hover {
          background: #1a5c38; /* Koyu yeşil hover efekti */
          transform: translateY(-5px); /* Üzerine gelince hafif yukarı kalkar */
          box-shadow: 0 10px 25px rgba(26, 92, 56, 0.5);
        }

        /* Ekrana çıkış animasyonu */
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Mobilde daha küçük ve köşeye yakın olsun */
        @media (max-width: 768px) {
          .scroll-to-top {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}