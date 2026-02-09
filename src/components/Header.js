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

  // YENİ MENÜ YAPISI (AYRI SAYFALAR)
  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { 
      name: 'Hakkında', 
      path: '/about', // Ana başlık tıklandığında yine genel hakkında sayfasına gidebilir
      subItems: [
        { name: 'Stratejik Genel Bakış', path: '/about/strategy' },
       { name: 'Konsorsiyum Ortaklıkları', path: '/about/consortium' }, // Ortaklar sayfasına gider
        { name: 'Proje Planı', path: '/about/plan' },
        { name: 'Etki ve Sürdürülebilirlik', path: '/about/impact' },
        { name: 'Proje Yol Haritası', path: '/about/roadmap' },
        { name: 'Bütçe', path: '/about/budget' }
      ]
    },
    { name: 'Ortaklar', path: '/partners' },
    { name: 'Çıktılar', path: '/results' },
    { name: 'Haberler', path: '/news' },
  ];

  return (
    <header className="site-header">
        <div className="container header-container">
            <Link href="/" className="logo-area">
                <span className="logo-text">
                    {content.header_logo_text || 'DIGI-GREEN'} <span className="highlight-green">{content.header_logo_highlight || 'FUTURE'}</span>
                </span>
            </Link>
            
            <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}>
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.path} className={item.subItems ? "nav-item-with-dropdown" : ""}>
                            <Link 
                                href={item.path} 
                                className={pathname === item.path ? 'active-nav-link' : ''} 
                                style={{padding:'8px 15px', borderRadius:'5px', transition:'0.3s', display:'flex', alignItems:'center', gap:'5px'}}
                            >
                                {item.name}
                                {item.subItems && <i className="fas fa-chevron-down" style={{fontSize:'0.7rem', opacity:0.7}}></i>}
                            </Link>

                            {/* AÇILIR MENÜ */}
                            {item.subItems && (
                                <ul className="dropdown-menu">
                                    {item.subItems.map((subItem, index) => (
                                        <li key={index}>
                                            <Link href={subItem.path}>
                                                {subItem.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                    
                    <li>
                        <Link href="/contact" className={pathname === '/contact' ? 'active-nav-link' : ''}
                              style={{padding:'8px 15px', borderRadius:'5px', transition:'0.3s'}}>
                            İletişim
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{display:'none'}}>
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </div>
        </div>

        <style jsx>{`
            @media (max-width: 768px) {
                .mobile-menu-toggle { display: block !important; cursor: pointer; font-size: 1.5rem; }
                .main-nav { display: none; width: 100%; position: absolute; top: 80px; left: 0; background: white; box-shadow: 0 10px 10px rgba(0,0,0,0.1); z-index: 999; }
                .main-nav.active { display: block; }
                .nav-list { flex-direction: column; padding: 20px; align-items: flex-start; }
                .dropdown-menu { position: static; box-shadow: none; border-top: none; padding-left: 20px; background: #f9f9f9; display: block; width: 100%; }
                .nav-item-with-dropdown { flex-direction: column; align-items: flex-start; width: 100%; }
            }
        `}</style>
    </header>
  );
}