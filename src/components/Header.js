'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Header() {
  const pathname = usePathname();
  const [content, setContent] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setContent(map);
      }
    }
    fetchData();
  }, []);

  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { 
      name: 'Hakkında', 
      path: '/about', 
      subItems: [
        { name: 'Stratejik Genel Bakış', path: '/about/strategy' },
        { name: 'Konsorsiyum Ortaklıkları', path: '/about/consortium' },
        { name: 'Proje Planı', path: '/about/plan' },
        { name: 'Etki ve Sürdürülebilirlik', path: '/about/impact' },
        { name: 'Proje Yol Haritası', path: '/about/roadmap' }
      ]
    },
    { name: 'Ortaklar', path: '/partners' },
    { name: 'Dosyalar', path: '/results' },
    { name: 'Haberler', path: '/news' },
    { name: 'İletişim', path: '/contact' },
  ];

  return (
    <>
      {/* SAYFALARIN ÜSTÜNE BİNMEYİ ÖNLEYEN GİZLİ BOŞLUK (SPACER) */}
      <div style={{ height: '80px', width: '100%', flexShrink: 0, display: 'block' }}></div>

      <header className="site-header">
          <div className="container header-container">
              {/* LOGO */}
              <Link href="/" className="logo-area">
                  <span className="logo-text">
                      {content.header_logo_text || 'DIGI-GREEN'} <span className="highlight-green">{content.header_logo_highlight || 'FUTURE'}</span>
                  </span>
              </Link>
              
              {/* NAVİGASYON */}
              <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}>
                  <ul className="nav-list">
                      {navItems.map((item) => (
                          <li key={item.path} className={item.subItems ? "nav-item-with-dropdown" : "nav-item"}>
                              <Link 
                                  href={item.path} 
                                  className={`nav-link ${pathname === item.path ? 'active-nav-link' : ''}`}
                                  onClick={() => !item.subItems && setMobileMenuOpen(false)}
                              >
                                  {item.name}
                                  {item.subItems && <i className="fas fa-chevron-down nav-arrow"></i>}
                              </Link>

                              {/* ŞIK VE MODERN DROPDOWN KARTI */}
                              {item.subItems && (
                                  <div className="dropdown-wrapper">
                                      <ul className="dropdown-menu">
                                          {item.subItems.map((subItem, index) => (
                                              <li key={index}>
                                                  <Link 
                                                      href={subItem.path} 
                                                      className="dropdown-link" 
                                                      onClick={() => setMobileMenuOpen(false)}
                                                  >
                                                      {subItem.name}
                                                  </Link>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                          </li>
                      ))}
                  </ul>
              </nav>

              {/* MOBİL BUTON */}
              <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                      <span></span><span></span><span></span>
                  </div>
              </div>
          </div>

          <style jsx>{`
              /* =========================================
                 1. HEADER GENEL AYARLARI
                 ========================================= */
              .site-header {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 80px; 
                  background: rgba(255, 255, 255, 0.95);
                  backdrop-filter: blur(12px);
                  box-shadow: 0 4px 20px -10px rgba(0,0,0,0.08);
                  z-index: 1000;
                  display: flex;
                  align-items: center;
                  transition: all 0.3s ease;
              }
              .header-container {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  width: 100%;
                  height: 100%;
              }
              .logo-text {
                  font-size: 1.5rem;
                  font-weight: 800;
                  color: #003399;
                  text-decoration: none;
                  letter-spacing: -0.5px;
              }
              .highlight-green { color: #27ae60; }
              
              /* =========================================
                 2. MENÜ BAĞLANTILARI
                 ========================================= */
              .nav-list {
                  display: flex;
                  gap: 30px; 
                  list-style: none;
                  margin: 0;
                  padding: 0;
                  height: 100%; 
                  align-items: center;
              }
              .nav-item, .nav-item-with-dropdown {
                  height: 100%; 
                  display: flex;
                  align-items: center;
                  position: relative;
              }
              .nav-link {
                  color: #4b5563; /* Tatlı ve modern bir gri */
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 0.95rem;
                  height: 100%; 
                  display: flex;
                  align-items: center;
                  transition: color 0.3s;
                  position: relative;
              }
              .nav-arrow {
                  font-size: 0.65rem;
                  margin-left: 6px;
                  opacity: 0.5;
                  transition: transform 0.3s;
              }
              
              /* Ana Menü Hover ve Aktif */
              .nav-link:hover, .active-nav-link { color: #003399; }
              .nav-item-with-dropdown:hover .nav-arrow { transform: rotate(180deg); }

             /* =====================================
               ✨ DÜZELTİLMİŞ KLASİK DROPDOWN 
               ===================================== */
            .dropdown-menu {
                position: absolute;
                top: 100%; /* Tam header'ın bittiği yer */
                left: -10px; 
                background: #ffffff;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border-radius: 0 0 8px 8px;
                min-width: 250px;
                display: none;
                flex-direction: column;
                list-style: none;
                padding: 10px 0;
                margin: 0;
                z-index: 1001;
                border-top: 3px solid #27ae60;
            }

            .nav-item-with-dropdown:hover .dropdown-menu {
                display: flex;
                animation: slideUp 0.2s ease-out forwards;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .dropdown-menu li { 
                width: 100%; 
                margin: 0;
                padding: 0;
            }

            /* --- DROPDOWN LİNKLERİ (CSS Önceliği Artırıldı) --- */
            .nav-item-with-dropdown .dropdown-menu .dropdown-link {
                padding: 12px 25px;
                display: block;
                font-size: 0.95rem;
                color: #555555 !important;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.2s;
                border-left: 3px solid transparent;
                background: #ffffff;
                width: 100%;
            }

            .nav-item-with-dropdown .dropdown-menu .dropdown-link:hover {
                background: #f9f9f9 !important;
                color: #003399 !important;
                border-left: 3px solid #27ae60;
                padding-left: 30px; 
            }

            /* --- MOBİL RESPONSIVE GÜNCELLEMESİ --- */
            @media (max-width: 992px) {
                .dropdown-menu { 
                    position: static; box-shadow: none; padding: 5px 0; background: #fcfcfc; 
                    display: block; width: 100%; animation: none; border: none; border-radius: 0;
                }
                
                .nav-item-with-dropdown .dropdown-menu .dropdown-link { 
                    padding: 12px 20px 12px 40px; 
                    border-left: none;
                    background: transparent;
                }
                
                .nav-item-with-dropdown .dropdown-menu .dropdown-link:hover { 
                    background: #f1f1f1 !important; 
                    padding-left: 45px; 
                    border-left: none;
                }
            }

              /* =========================================
                 4. MOBİL RESPONSIVE
                 ========================================= */
              .hamburger {
                  display: flex; flex-direction: column; justify-content: space-around;
                  width: 24px; height: 20px; background: transparent; border: none; cursor: pointer;
              }
              .hamburger span {
                  width: 24px; height: 2px; background: #333; border-radius: 10px; transition: all 0.3s linear;
              }
              
              @media (max-width: 992px) {
                  .mobile-menu-toggle { display: block !important; cursor: pointer; }
                  
                  .main-nav { 
                      display: none; 
                      width: 100%; 
                      position: absolute; 
                      top: 80px; 
                      left: 0; 
                      background: white; 
                      box-shadow: 0 20px 30px -10px rgba(0,0,0,0.1); 
                      border-top: 1px solid #f3f4f6;
                      padding-bottom: 20px;
                  }
                  .main-nav.active { display: block; }
                  
                  .nav-list { flex-direction: column; padding: 10px 20px; align-items: flex-start; gap: 0; height: auto; }
                  
                  .nav-item, .nav-item-with-dropdown {
                      width: 100%; height: auto; display: block; border-bottom: 1px solid #f9fafb;
                  }
                  .nav-link { width: 100%; height: 55px; padding: 0 10px; justify-content: space-between; }
                  
                  .dropdown-wrapper {
                      position: static; transform: none; padding-top: 0; opacity: 1; visibility: visible; display: block;
                  }
                  .dropdown-menu { 
                      position: static; box-shadow: none; padding: 5px 0 15px 15px; background: transparent; 
                      border: none; border-radius: 0; min-width: 100%;
                  }
                  
                  .dropdown-link { 
                      padding: 12px 15px; 
                      border-radius: 6px;
                      margin-bottom: 2px;
                  }
                  .dropdown-link:hover { transform: translateX(4px); background: #f8fafc; }
              }
          `}</style>
      </header>
    </>
  );
}