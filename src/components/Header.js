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

                            {/* DROPDOWN MENU */}
                            {item.subItems && (
                                <ul className="dropdown-menu">
                                    {item.subItems.map((subItem, index) => (
                                        <li key={index}>
                                            <Link href={subItem.path} onClick={() => setMobileMenuOpen(false)}>
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
            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{display:'none'}}>
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
                gap: 25px; /* Menü öğeleri arasındaki boşluk */
                list-style: none;
                margin: 0;
                padding: 0;
                height: 100%; 
                align-items: center;
            }

            /* MENÜ ÖĞESİ (LI) */
            /* height: 100% sayesinde header boyunca uzanır, böylece hover kopmaz */
            .nav-item, .nav-item-with-dropdown {
                height: 100%; 
                display: flex;
                align-items: center;
                position: relative;
            }

            /* MENÜ LİNKİ (A) */
            .nav-link {
                color: #444;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.95rem;
                padding: 0 5px; /* Sadece yatayda hafif iç boşluk */
                height: 100%; /* Link tüm yüksekliği kaplasın */
                display: flex;
                align-items: center;
                transition: color 0.3s;
                position: relative;
            }

            /* Hover Durumu - Alt Çizgi Efekti */
            .nav-link:hover, .active-nav-link {
                color: #003399 !important;
            }
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

            /* --- DROPDOWN AYARLARI --- */
            .dropdown-menu {
                position: absolute;
                top: 100%; /* Tam header'ın bittiği yer */
                left: -20px; /* Biraz sola kaydırarak ortala */
                background: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border-radius: 0 0 8px 8px;
                min-width: 240px;
                display: none;
                flex-direction: column;
                list-style: none;
                padding: 10px 0;
                margin: 0;
                z-index: 1001;
                border-top: 3px solid #27ae60;
            }

            /* Hover olunca göster */
            .nav-item-with-dropdown:hover .dropdown-menu {
                display: flex;
                animation: slideUp 0.2s ease-out forwards;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .dropdown-menu li { width: 100%; }

            .dropdown-menu li a {
                padding: 12px 25px;
                display: block;
                font-size: 0.9rem;
                color: #555;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.2s;
                border-left: 3px solid transparent;
            }

            .dropdown-menu li a:hover {
                background: #f9f9f9;
                color: #003399;
                border-left: 3px solid #27ae60;
                padding-left: 30px; /* Kayma efekti */
            }

            /* --- MOBİL RESPONSIVE --- */
            @media (max-width: 992px) {
                .mobile-menu-toggle { display: block !important; cursor: pointer; font-size: 1.5rem; color: #333; }
                
                .main-nav { 
                    display: none; 
                    width: 100%; 
                    position: absolute; 
                    top: 80px; 
                    left: 0; 
                    background: white; 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
                    z-index: 999; 
                    border-top: 1px solid #eee;
                }
                .main-nav.active { display: block; }
                
                .nav-list { 
                    flex-direction: column; 
                    padding: 0; 
                    align-items: flex-start; 
                    gap: 0; 
                    height: auto; 
                }
                
                /* Mobilde yükseklikleri sıfırla */
                .nav-item, .nav-item-with-dropdown {
                    width: 100%;
                    height: auto;
                    display: block;
                    border-bottom: 1px solid #f5f5f5;
                }
                .nav-link {
                    width: 100%;
                    height: 55px;
                    padding: 0 20px;
                    justify-content: space-between;
                }
                /* Mobilde alt çizgi yerine arka plan rengi */
                .active-nav-link::after, .nav-link:hover::after { display: none; }
                .active-nav-link { background: #f0f4f8; color: #003399; }

                .dropdown-menu { 
                    position: static; 
                    box-shadow: none; 
                    padding: 0; 
                    background: #fcfcfc; 
                    display: block; /* Mobilde hep açık kalsın */
                    width: 100%; 
                    animation: none;
                    border-top: none;
                }
                .dropdown-menu li a {
                    padding-left: 40px;
                    font-size: 0.85rem;
                    border-left: none;
                }
            }
        `}</style>
    </header>
  );
}