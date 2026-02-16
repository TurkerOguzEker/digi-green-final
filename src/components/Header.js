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
                                {item.subItems && <i className="fas fa-chevron-down" style={{fontSize:'0.7rem', marginLeft:'6px', opacity:0.6, marginTop:'2px'}}></i>}
                            </Link>

                            {/* ✨ YENİ MODERN DROPDOWN YAPI ✨ */}
                            {item.subItems && (
                                <ul className="modern-dropdown-menu">
                                    {item.subItems.map((subItem, index) => (
                                        <li key={index} className="dropdown-list-item">
                                            <Link 
                                                href={subItem.path} 
                                                className="modern-dropdown-link" 
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {subItem.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* MOBİL BUTON */}
            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </div>
        </div>

        <style jsx>{`
            /* HEADER GENEL */
            .site-header {
                position: fixed;
                top: 0;
                width: 100%;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 15px rgba(0,0,0,0.05);
                height: 80px; 
                display: flex;
                align-items: center;
            }
            .header-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 100%;
            }
            .logo-text {
                font-size: 1.6rem;
                font-weight: 800;
                color: #003399;
                text-decoration: none;
                letter-spacing: -0.5px;
            }
            .highlight-green { color: #27ae60; }
            
            /* NAV LİSTESİ */
            .nav-list {
                display: flex;
                gap: 25px; 
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
                color: #444;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.95rem;
                padding: 0 5px; 
                height: 100%; 
                display: flex;
                align-items: center;
                transition: color 0.3s;
                position: relative;
            }

            .nav-link:hover, .active-nav-link { color: #003399 !important; }
            .active-nav-link::after, .nav-link:hover::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: #27ae60;
                border-radius: 3px 3px 0 0;
            }

            /* =====================================
               ✨ GARANTİLİ MODERN DROPDOWN TASARIMI 
               ===================================== */
            .modern-dropdown-menu {
                position: absolute !important;
                top: 100% !important; /* Header hizasından kesinlikle aşağı iner */
                left: -15px !important; /* Buton hizasına alır */
                background: #ffffff !important;
                box-shadow: 0 15px 40px rgba(0, 51, 153, 0.1) !important;
                border-radius: 12px !important;
                min-width: 270px !important;
                display: none !important; /* Normalde gizli */
                flex-direction: column !important; /* Yan yana dizilmeyi REDDEDER, alt alta zorlar */
                padding: 12px !important;
                margin: 0 !important;
                z-index: 1001 !important;
                border: 1px solid rgba(0, 51, 153, 0.05) !important;
            }

            /* Görünmez Köprü: Fare Hakkında'dan menüye giderken menü kapanmasın diye */
            .modern-dropdown-menu::after {
                content: '';
                position: absolute;
                top: -20px;
                left: 0;
                width: 100%;
                height: 20px;
                background: transparent;
            }

            /* HOVER ANİMASYONU */
            .nav-item-with-dropdown:hover .modern-dropdown-menu {
                display: flex !important; /* Üzerine gelince görünür */
                animation: slideUpFade 0.3s ease forwards;
            }

            @keyframes slideUpFade {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .dropdown-list-item { 
                width: 100% !important; 
                margin-bottom: 4px !important; 
                list-style: none !important;
            }
            .dropdown-list-item:last-child {
                margin-bottom: 0 !important;
            }

            /* LİNKLER */
            .modern-dropdown-link {
                padding: 12px 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                font-size: 0.95rem !important;
                color: #555555 !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                transition: all 0.3s ease !important;
                background: #ffffff !important;
                border-radius: 8px !important;
                width: 100% !important;
            }

            /* Zarif Ok İkonu (FontAwesome) */
            .modern-dropdown-link::after {
                content: '\\f105'; /* Çift ters slash Next.js içinde kaçış karakteridir */
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                font-size: 0.9rem;
                color: #27ae60;
                opacity: 0;
                transform: translateX(-10px);
                transition: all 0.3s ease;
            }

            /* Linkin Üzerine Gelindiğinde */
            .modern-dropdown-link:hover {
                background: #f4f7fa !important;
                color: #003399 !important;
                padding-left: 22px !important;
            }

            .modern-dropdown-link:hover::after {
                opacity: 1;
                transform: translateX(0);
            }

            /* --- MOBİL RESPONSIVE --- */
            @media (max-width: 992px) {
                .mobile-menu-toggle { display: block !important; cursor: pointer; font-size: 1.5rem; color: #333; }
                
                .main-nav { 
                    display: none; width: 100%; position: absolute; top: 80px; left: 0; 
                    background: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); z-index: 999; 
                }
                .main-nav.active { display: block; }
                
                .nav-list { flex-direction: column; padding: 0; align-items: flex-start; gap: 0; height: auto; }
                
                .nav-item, .nav-item-with-dropdown {
                    width: 100%; height: auto; display: block; border-bottom: 1px solid #f5f5f5;
                }
                .nav-link { width: 100%; height: 55px; padding: 0 20px; justify-content: space-between; }
                .active-nav-link::after, .nav-link:hover::after { display: none; }
                .active-nav-link { background: #f0f4f8; color: #003399; }

                /* Mobilde Dropdown Normal Liste Gibi Görünür */
                .modern-dropdown-menu { 
                    position: static !important; box-shadow: none !important; padding: 5px 0 !important; 
                    background: #fcfcfc !important; display: none !important; width: 100% !important; 
                    border: none !important; border-radius: 0 !important;
                }
                
                .nav-item-with-dropdown:hover .modern-dropdown-menu {
                    display: block !important;
                }
                
                .modern-dropdown-link { 
                    padding: 12px 20px 12px 40px !important; 
                    background: transparent !important;
                    border-radius: 0 !important;
                }
                .modern-dropdown-link::after { display: none !important; }
                
                .modern-dropdown-link:hover { 
                    background: #f1f1f1 !important; 
                    padding-left: 45px !important; 
                }
            }
        `}</style>
    </header>
  );
}