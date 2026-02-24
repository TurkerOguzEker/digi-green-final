'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('tr');

    // Sayfa yenilendiğinde seçili dili localStorage'dan al
    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'tr' ? 'en' : 'tr';
        setLanguage(newLang);
        localStorage.setItem('language', newLang); // Tercihi kaydet
    };

    // Çeviri getirme fonksiyonu (örn: t('nav.home'))
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (let k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Çeviri bulunamazsa key'in kendisini döndür
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);