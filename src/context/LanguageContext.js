'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../locales/translations';

// ✨ DÜZELTME 1: Sayfa ilk açıldığında çökmemesi için varsayılan Context değerleri atandı.
const LanguageContext = createContext({
  language: 'tr',
  toggleLanguage: () => {},
  t: (key) => ''
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');

  // Tarayıcı hafızasından (localStorage) kayıtlı dili al
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Dili değiştir ve tarayıcı hafızasına kaydet
  const toggleLanguage = () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  // ✨ DÜZELTME 2: Çeviri getirme fonksiyonu. 
  // Artık metin translations.js'de yoksa, hata vermek veya kod ismini basmak yerine BOŞLUK döndürüyor.
  // Bu sayede sistem metni %100 Admin Panel'den çekmeye zorlanıyor!
  const t = (key) => {
    if (!key) return '';
    const keys = key.split('.');
    let value = translations[language];

    for (let k of keys) {
      if (value === undefined) return ''; // Aranan metin yoksa boşluk döndür
      value = value[k];
    }
    
    return value !== undefined ? value : '';
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  // Güvenlik katmanı: Eğer Provider dışındaysa çökmesin
  if (context === undefined) {
    return {
      language: 'tr',
      toggleLanguage: () => {},
      t: () => ''
    };
  }
  return context;
};