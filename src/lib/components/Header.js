'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
        <div className="container header-container">
            <Link href="/" className="logo-area">
                <span className="logo-text">DIGI-GREEN <span className="highlight-green">FUTURE</span></span>
            </Link>
            <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}>
                <ul className="nav-list">
                    <li><Link href="/">Ana Sayfa</Link></li>
                    <li><Link href="/about">Hakkında</Link></li>
                    <li><Link href="/partners">Ortaklar</Link></li>
                    <li><Link href="/results">Çıktılar</Link></li>
                    <li><Link href="/news">Haberler</Link></li>
                    <li><Link href="/contact" className="btn-nav">İletişim</Link></li>
                </ul>
            </nav>
            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className="fas fa-bars"></i>
            </div>
        </div>
    </header>
  );
}