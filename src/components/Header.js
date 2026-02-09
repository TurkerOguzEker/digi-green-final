'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Header() {
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

  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hakkında', path: '/about' },
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
          
<nav className="main-nav">
    <ul className="nav-list">
        {navItems.map((item) => (
            <li key={item.path}>
                <Link href={item.path} className={pathname === item.path ? 'active-nav-link' : ''} 
                      style={{padding:'8px 15px', borderRadius:'5px', transition:'0.3s'}}>
                    {item.name}
                </Link>
            </li>
        ))}
        {/* İletişim butonu artık diğerleriyle aynı yapıda */}
        <li>
            <Link href="/contact" className={pathname === '/contact' ? 'active-nav-link' : ''}
                  style={{padding:'8px 15px', borderRadius:'5px', transition:'0.3s'}}>
                İletişim
            </Link>
        </li>
    </ul>
</nav>

        </div>
    </header>
  );
}