'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [content, setContent] = useState({});

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
                    <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Ana Sayfa</Link></li>
                    <li><Link href="/about" className={pathname === '/about' ? 'active' : ''}>Hakkında</Link></li>
                    <li><Link href="/partners" className={pathname === '/partners' ? 'active' : ''}>Ortaklar</Link></li>
                    <li><Link href="/results" className={pathname === '/results' ? 'active' : ''}>Çıktılar</Link></li>
                    <li><Link href="/news" className={pathname === '/news' ? 'active' : ''}>Haberler</Link></li>
                    <li><Link href="/contact" className="btn-nav">İletişim</Link></li>
                </ul>
            </nav>
            
            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </div>
        </div>
        
        <style jsx>{`
            @media (max-width: 768px) {
                .main-nav { display: ${mobileMenuOpen ? 'block' : 'none'}; position: absolute; top: 80px; left: 0; width: 100%; background: white; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-top: 1px solid #eee; }
                .nav-list { flex-direction: column; gap: 15px; }
                .btn-nav { display: inline-block; text-align: center; }
            }
        `}</style>
    </header>
  );
}