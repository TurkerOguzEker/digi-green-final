'use client';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Header ve Footer'ın GİZLENECEĞİ yolların (sayfaların) listesi
  const hiddenPaths = ['/login', '/admin', '/update-password'];

  // Eğer mevcut adres bu yollardan biriyle başlıyorsa, içeriği (Header/Footer) render etme!
  const shouldHide = hiddenPaths.some((path) => pathname?.startsWith(path));

  if (shouldHide) {
    return null; // Gizle
  }

  return <>{children}</>; // İzin verilen sayfalarda göster
}