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
        { name: 'Faaliyetler', path: '/activities' }, 
        { name: 'Dosyalar', path: '/results' },
        { name: 'Haberler', path: '/news' },
        { name: 'İletişim', path: '/contact' },
    ];

    return (
        <header className="site-header">
            {/* ✨ EL YAZISI FONTU DEĞİŞTİRİLDİ (Google Fonts: Caveat) ✨ */}
            <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet" />

            <div className="container header-container">
                {/* LOGO ALANI */}
                <Link href="/" className="logo-area">
                    {content.header_logo_image && (
                        <img src={content.header_logo_image} alt="Site Logo" className="logo-image" />
                    )}
                    
                    {/* Metni her zaman logonun yanına (veya tek başına) koy */}
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
                                    {item.subItems && <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', marginLeft: '6px', opacity: 0.6, marginTop: '2px' }}></i>}
                                </Link>

                                {/* MODERN DROPDOWN YAPI */}
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
            
            /* LOGO GÖRSEL STİLLERİ */
            .logo-area {
                display: flex;
                align-items: center;
                gap: 12px; 
                text-decoration: none;
                height: 100%;
            }
            .logo-image {
                max-height: 45px; 
                width: auto;
                object-fit: contain;
                transition: transform 0.3s ease;
            }
            .logo-image:hover {
                transform: scale(1.05);
            }
            
            /* ✨ CAVEAT METİN LOGO STİLLERİ ✨ */
            .logo-text {
                font-family: 'Caveat', cursive; /* Caveat fontu atandı */
                font-size: 1.4rem; /* Caveat fontu yapı olarak biraz daha küçük göründüğü için boyutu büyütüldü */
                font-weight: 700;
                color: #106b21;
                text-decoration: none;
                letter-spacing: 1px;
                display: flex;
                align-items: center; 
                gap: 8px;
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

            /* MODERN DROPDOWN TASARIMI */
            .modern-dropdown-menu {
                position: absolute !important;
                top: 100% !important;
                left: -15px !important;
                background: #ffffff !important;
                box-shadow: 0 15px 40px rgba(0, 51, 153, 0.1) !important;
                border-radius: 12px !important;
                min-width: 270px !important;
                display: none !important;
                flex-direction: column !important;
                padding: 12px !important;
                margin: 0 !important;
                z-index: 1001 !important;
                border: 1px solid rgba(0, 51, 153, 0.05) !important;
            }

            .nav-item-with-dropdown:hover .modern-dropdown-menu {
                display: flex !important;
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

            .modern-dropdown-link::after {
                content: '\\f105';
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                font-size: 0.9rem;
                color: #27ae60;
                opacity: 0;
                transform: translateX(-10px);
                transition: all 0.3s ease;
            }

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

                /* Mobilde logo ve metin sığsın diye biraz küçültüyoruz */
                .logo-text { font-size: 1.8rem; } /* Mobilde de biraz büyük kalsın */
                .logo-image { max-height: 35px; }
            }
        `}</style>
        </header>
    );
}