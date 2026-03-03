// src/app/admin/site/page.js
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  footer_desc: "Kapakli Belediyesi liderliginde yurutulen surdurulebilir kalkinma projesi.",
  footer_column2_title: "Hizli Menu",
  footer_column3_title: "Iletisim",
  footer_eu_logo: "/assets/images/eu-flag.png",
  footer_disclaimer: "Avrupa Birligi tarafindan finanse edilmistir. Ancak ifade edilen gorus ve dusunceler yalnizca yazar(lar)a aittir..."
};

/* ─── TOAST ─── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <div className={`adm-toast-icon ${type}`}><i className={type === 'error' ? 'fas fa-xmark' : 'fas fa-check'} /></div>
      <div className="adm-toast-text"><strong>{type === 'error' ? 'Hata olustu' : 'Basarili'}</strong><span>{message}</span></div>
      <button className="adm-toast-close" onClick={onClose}><i className="fas fa-xmark" /></button>
    </div>
  );
};

/* ─── SETTING INPUT ─── */
const SettingInput = ({ label, settingKey, type = 'text', placeholder = '', settings, handleSettingChange, updateSetting, uploadFile }) => {
  const settingItem = settings.find(s => s.key === settingKey);
  const val = settingItem ? settingItem.value : (DEFAULTS[settingKey] || '');

  return (
    <div className="adm-field">
      <div className="adm-field-header">
        <span className="adm-field-label">{label}</span>
        <span className="adm-field-key">{settingKey}</span>
      </div>
      <div className="adm-field-row">
        {type === 'textarea' ? (
          <textarea className="adm-textarea" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} rows={4} />
        ) : type === 'image' ? (
          <div className="adm-img-field">
            <div className="adm-img-preview-wrap">
              {val ? <img src={val} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
              <input type="text" className="adm-img-url-input" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder="URL girin veya dosya yukleyin..." />
            </div>
            <label className="adm-upload-btn" title="Masaustunden Yukle"><i className="fas fa-upload" />
              <input type="file" hidden onChange={async e => {
                const url = await uploadFile(e.target.files[0]);
                if (url) { handleSettingChange(settingKey, url); updateSetting(settingKey, url); }
              }} />
            </label>
          </div>
        ) : (
          <input type="text" className="adm-input" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} />
        )}
        <button className="adm-btn adm-btn-save" onClick={() => updateSetting(settingKey, val)}><i className="fas fa-floppy-disk" /> Kaydet</button>
      </div>
    </div>
  );
};

/* ─── SECTION HEADER ─── */
const SectionHeader = ({ iconClass, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num"><i className={iconClass}></i></div>
    <div className="adm-section-title">{title}</div>
  </div>
);

export default function AdminSiteSettingsPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  
  // Badge Counts
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchPageData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      
      const { count: msgCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { count: nCount } = await supabase.from('news').select('*', { count: 'exact', head: true });
      const { count: aCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      const { count: rCount } = await supabase.from('results').select('*', { count: 'exact', head: true });
        
      setSettings(s.data || []);
      
      if (msgCount) setUnreadMsgCount(msgCount);
      if (nCount) setNewsCount(nCount);
      if (aCount) setActivitiesCount(aCount);
      if (pCount) setPartnersCount(pCount);
      if (rCount) setResultsCount(rCount);
    } catch (error) {
      console.error("Veri hatasi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      if (isMounted) setCurrentUser(session.user);

      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        if (isMounted) setUserIp(data.ip);
      } catch (e) {}

      await fetchPageData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchPageData]);

  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { showToast('Yukleme Hatasi: ' + error.message, 'error'); return null; }
    
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  }

  const handleSettingChange = (key, newValue) => {
    setSettings(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) return prev.map(item => item.key === key ? { ...item, value: newValue } : item);
      return [...prev, { key, value: newValue }];
    });
  };

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Site ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'site',
      ip_address: userIp
    }]);
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  const NAV = [
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: unreadMsgCount, group: 'Genel', link: '/admin/messages' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'Icerik', link: '/admin/homepage' },
    { 
      id: 'about', label: 'Hakkinda', icon: 'fas fa-circle-info', group: 'Icerik',
      subItems: [
        { id: 'general', label: 'Genel Hakkinda', tab: 'general' },
        { id: 'consortium', label: 'Konsorsiyum', tab: 'consortium' },
        { id: 'impact', label: 'Proje Etkisi', tab: 'impact' },
        { id: 'plan', label: 'Proje Plani', tab: 'plan' },
        { id: 'roadmap', label: 'Yol Haritasi', tab: 'roadmap' },
        { id: 'strategy', label: 'Strateji', tab: 'strategy' }
      ]
    },
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: newsCount, group: 'Icerik', link: '/admin/news' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activitiesCount, group: 'Icerik', link: '/admin/activities' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partnersCount, group: 'Icerik', link: '/admin/partners' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: resultsCount, group: 'Icerik', link: '/admin/results' },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik', link: '/admin/contact' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik', link: '/admin/site', active: true },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin' },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs' },
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin' },
  ];

  const groupedNav = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Yukleniyor...</p></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');
        .adm-layout, .adm-loading, .adm-toast, .adm-modal-overlay { --bg: #0d1117; --surface: #161b22; --surface-2: #1c2333; --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.15); --accent: #22c55e; --accent-dim: rgba(34,197,94,0.12); --accent-glow: rgba(34,197,94,0.25); --blue: #3b82f6; --blue-dim: rgba(59,130,246,0.12); --red: #ef4444; --red-dim: rgba(239,68,68,0.12); --yellow: #f59e0b; --text-primary: #e6edf3; --text-secondary: #7d8590; --text-muted: #484f58; --sidebar-w: 260px; --radius: 10px; --radius-lg: 14px; --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --transition: 0.18s cubic-bezier(0.4,0,0.2,1); }
        .adm-layout { font-family: var(--font); background: var(--bg); color: var(--text-primary); line-height: 1.6; display: flex; min-height: 100vh; width: 100%; -webkit-font-smoothing: antialiased; }
        .adm-sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
        .adm-sidebar::-webkit-scrollbar { width: 4px; } .adm-sidebar::-webkit-scrollbar-track { background: transparent; } .adm-sidebar::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }
        
        .adm-brand-wrapper { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .adm-brand-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .adm-brand-card:hover { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.2); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
        .adm-brand-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3); }
        .adm-brand-text { display: flex; flex-direction: column; }
        .adm-brand-logo { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.5px; color: #fff; line-height: 1.1; display: block; white-space: nowrap; }
        .adm-brand-logo span { color: #22c55e; }
        .adm-brand-sub { margin-top: 4px; font-size: 0.65rem; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; display: flex; align-items: center; transition: color 0.3s; }
        .adm-brand-card:hover .adm-brand-sub { color: #22c55e; }

        .adm-nav { padding: 16px 12px; flex: 1; }
        .adm-nav-section { margin-bottom: 24px; }
        .adm-nav-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); padding: 0 8px; margin-bottom: 6px; }
        .adm-nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: var(--transition); text-align: left; position: relative; margin-bottom: 2px; }
        .adm-nav-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .adm-nav-btn.active { background: var(--accent-dim); color: var(--accent); }
        .adm-nav-btn.active .adm-nav-icon { color: var(--accent); }
        .adm-nav-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; transition: var(--transition); }
        .adm-nav-badge { margin-left: auto; background: var(--accent); color: #000; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center; }

        /* Alt Menu (Accordion) CSS */
        .adm-nav-submenu { display: flex; flex-direction: column; gap: 2px; padding-left: 38px; padding-right: 8px; margin-top: 2px; margin-bottom: 8px; animation: fadeDown 0.2s ease;}
        .adm-nav-subitem { display: flex; align-items: center; padding: 8px 12px; font-size: 0.8rem; color: var(--text-secondary); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: var(--transition); text-align: left; }
        .adm-nav-subitem:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
        .adm-nav-subitem.active { color: var(--accent); background: var(--accent-dim); font-weight: 600; }

        .adm-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .adm-topbar { height: 76px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 50; }
        .adm-topbar-title { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--text-primary); flex: 1; }
        
        .adm-content { padding: 32px; flex: 1; }
        .adm-page-header { margin-bottom: 28px; }
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; text-transform: capitalize; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-section { margin-bottom: 36px; background: var(--surface-2); padding: 20px; border-radius: 14px; border: 1px dashed var(--border); }

        .adm-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .adm-section-num { width: 26px; height: 26px; background: var(--accent-dim); border: 1px solid rgba(34,197,94,0.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--accent); flex-shrink: 0; font-family: var(--font-display); }
        .adm-section-title { font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; text-transform: uppercase; }

        .adm-field { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; transition: border-color var(--transition); }
        .adm-field:hover { border-color: var(--border-hover); }
        .adm-field-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .adm-field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.01em; }
        .adm-field-key { font-size: 0.65rem; color: var(--text-muted); font-family: monospace; background: var(--surface-2); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--border); }
        .adm-field-row { display: flex; gap: 8px; align-items: flex-start; }
        .adm-input { flex: 1; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; width: 100%; }
        .adm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .adm-textarea { flex: 1; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; resize: vertical; transition: border-color var(--transition), box-shadow var(--transition); outline: none; width: 100%; line-height: 1.5; }
        .adm-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        
        .adm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: none; border-radius: 8px; font-family: var(--font); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition); white-space: nowrap; line-height: 1; padding: 0 16px; height: 38px; }
        .adm-btn-save { background: var(--accent); color: #000; }
        .adm-btn-save:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
        
        .adm-img-field { display: flex; gap: 8px; align-items: center; width: 100%; }
        .adm-img-preview-wrap { flex: 1; display: flex; align-items: center; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; gap: 10px; overflow: hidden; }
        .adm-img-thumb { width: 32px; height: 32px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
        .adm-img-url-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: var(--font); font-size: 0.8rem; outline: none; }
        .adm-upload-btn { width: 38px; height: 38px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: var(--transition); flex-shrink: 0; position: relative; overflow: hidden; }
        .adm-upload-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .adm-upload-btn input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .adm-form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adm-form-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

        .adm-divider { border: none; border-top: 1px dashed var(--border); margin: 16px 0; }
        .adm-fade-in { animation: fadeUp 0.25s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .adm-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 12px; min-width: 280px; animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1); }
        .adm-toast-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .adm-toast-icon.success { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(34,197,94,0.25); }
        .adm-toast-icon.error { background: var(--red-dim); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }
        .adm-toast-text strong { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
        .adm-toast-text span { font-size: 0.8rem; color: var(--text-secondary); }
        .adm-toast-close { margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 4px; transition: color var(--transition); flex-shrink: 0; }
        .adm-toast-close:hover { color: var(--text-primary); }

        .adm-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; font-family: var(--font); color: var(--text-primary); }
        .adm-loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0); } }
        .adm-badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .adm-badge-green { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(34,197,94,0.25); }
        .adm-badge-yellow { background: rgba(245,158,11,0.12); color: var(--yellow); border: 1px solid rgba(245,158,11,0.25); }
      `}</style>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/" className="adm-brand-card" title="Site Ana Sayfasina Git">
              <div className="adm-brand-icon">
                <i className="fas fa-leaf" />
              </div>
              <div className="adm-brand-text">
                <div className="adm-brand-logo"><span>DIGI-<span>GREEN</span></span></div>
                <div className="adm-brand-sub">
                  Yonetim Paneli 
                  <i className="fas fa-external-link-alt" style={{ marginLeft: '6px', fontSize: '0.6rem' }} />
                </div>
              </div>
            </Link>
          </div>
          
          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
                <div className="adm-nav-label">{group}</div>
                {items.map(item => {
                  
                  if (item.subItems) {
                    return (
                      <div key={item.id}>
                        <button 
                          className={`adm-nav-btn ${item.active ? 'active' : ''}`}
                          onClick={() => setIsAboutMenuOpen(!isAboutMenuOpen)}
                        >
                          <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                          <i className={`fas fa-chevron-${isAboutMenuOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem', transition: 'all 0.2s', opacity: 0.6 }} />
                        </button>
                        
                        {isAboutMenuOpen && (
                          <div className="adm-nav-submenu">
                            {item.subItems.map(sub => (
                              <button
                                key={sub.id}
                                className={`adm-nav-subitem`}
                                onClick={() => router.push(`/admin/about?tab=${sub.tab}`, { scroll: false })}
                              >
                                <span style={{width:'4px', height:'4px', borderRadius:'50%', background:'currentColor', marginRight:'8px', display:'inline-block', opacity: 0.4}}></span>
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (item.link) {
                    return (
                      <Link 
                        href={item.link} 
                        key={item.id} 
                        className={`adm-nav-btn ${item.active ? 'active' : ''}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                        {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                      </Link>
                    );
                  }

                  return (
                    <button 
                      key={item.id} 
                      className={`adm-nav-btn ${activeTab === item.id ? 'active' : ''}`} 
                      onClick={() => { 
                          setActiveTab(item.id); 
                      }}
                    >
                      <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                      {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">
              {currentTab && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim, #6366f180))',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px var(--accent-glow, rgba(99,102,241,0.35))',
                  }}>
                    <i className={currentTab.icon} style={{ color: '#fff', fontSize: '0.85rem' }} />
                  </div>
                  <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {currentTab.label}
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '6px 14px 6px 6px',
                  background: profileOpen ? 'var(--surface-3, rgba(255,255,255,0.08))' : 'var(--surface-2, rgba(255,255,255,0.04))',
                  border: '1px solid',
                  borderColor: profileOpen ? 'var(--accent, #6366f1)' : 'var(--border, rgba(255,255,255,0.08))',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent, #6366f1)';
                  e.currentTarget.style.background = 'var(--surface-3, rgba(255,255,255,0.08))';
                }}
                onMouseLeave={e => {
                  if (!profileOpen) {
                    e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
                    e.currentTarget.style.background = 'var(--surface-2, rgba(255,255,255,0.04))';
                  }
                }}
              >
                <div style={{
                  width: '28px', height: '28px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                  lineHeight: 1, paddingBottom: '1px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                }}>
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                </div>

                <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.email?.split('@')[0] || 'Admin'}
                </span>

                <i
                  className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`}
                  style={{ fontSize: '0.7rem', opacity: 0.5, transition: 'transform 0.2s ease', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {profileOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '240px', background: '#111318', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset', zIndex: 100, animation: 'topbarDropdown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ padding: '12px 14px', marginBottom: '6px', background: 'var(--surface-3, rgba(255,255,255,0.04))', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1, paddingBottom: '2px' }}>
                        {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Oturum acik</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
                      </div>
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '10px', cursor: 'pointer', color: '#f87171', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s ease', textAlign: 'left' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                      <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.9rem', width: '16px' }} />
                      Cikis Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="adm-content">

            {/* SITE AYARLARI (HEADER/FOOTER) */}
            {activeTab === 'site' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Header / <em>Footer</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader iconClass="fas fa-window-maximize" title="Ust Menu & Sekme (Header)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Favicon (Sekme Ikonu)" settingKey="site_favicon" type="image" {...commonProps} />
                    <SettingInput label="Site Ana Logosu" settingKey="header_logo_image" type="image" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Logo Ana Metni" settingKey="header_logo_text" placeholder="DIGI-GREEN" {...commonProps} />
                    <SettingInput label="Logo Vurgu Metni" settingKey="header_logo_highlight" placeholder="FUTURE" {...commonProps} />
                  </div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader iconClass="fas fa-window-minimize" title="Alt Bilgi (Footer)" />
                  <SettingInput label="AB Logosu / Bayrak" settingKey="footer_eu_logo" type="image" {...commonProps} />
                  
                  <div className="adm-form-grid2">
                    <SettingInput label="Orta Sutun Basligi (TR) (Orn: Hizli Menu)" settingKey="footer_column2_title" {...commonProps} />
                    <SettingInput label="Orta Sutun Basligi (EN)" settingKey="footer_column2_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Sag Sutun Basligi (TR) (Orn: Iletisim)" settingKey="footer_column3_title" {...commonProps} />
                    <SettingInput label="Sag Sutun Basligi (EN)" settingKey="footer_column3_title_en" {...commonProps} />
                  </div>

                  <div className="adm-form-grid2">
                    <SettingInput label="Footer Hakkinda Metni (TR)" settingKey="footer_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Footer Hakkinda Metni (EN)" settingKey="footer_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="AB Bilgilendirme Metni (TR)" settingKey="footer_disclaimer" type="textarea" {...commonProps} />
                    <SettingInput label="AB Bilgilendirme Metni (EN)" settingKey="footer_disclaimer_en" type="textarea" {...commonProps} />
                  </div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader iconClass="fas fa-share-nodes" title="Sosyal Medya" />
                  <div className="adm-form-grid3">
                    <SettingInput label="Facebook" settingKey="social_facebook" placeholder="https://facebook.com/..." {...commonProps} />
                    <SettingInput label="Twitter / X" settingKey="social_twitter" placeholder="https://twitter.com/..." {...commonProps} />
                    <SettingInput label="Instagram" settingKey="social_instagram" placeholder="https://instagram.com/..." {...commonProps} />
                  </div>
                </div>
              </div>
            )}
            
            {/* KULLANICILAR */}
            {activeTab === 'users' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Sistem <em>Kullanicilari</em></div>
                  <div className="adm-page-desc">Panele erisim yetkisi olan admin hesaplari.</div>
                </div>
                <div className="adm-card" style={{padding: '0'}}>
                   <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                     <thead>
                       <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                         <th style={{padding: '16px 20px'}}>Kullanici (Email)</th>
                         <th style={{padding: '16px 20px'}}>ID (Benzersiz)</th>
                         <th style={{padding: '16px 20px'}}>Son Giris Tarihi</th>
                         <th style={{padding: '16px 20px'}}>Yetki Rolu</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr style={{borderBottom: '1px solid var(--border)'}}>
                         <td style={{padding: '16px 20px', fontWeight: '600', color: 'var(--text-primary)'}}>
                            <i className="fas fa-user-circle" style={{marginRight:'10px', color:'var(--accent)', fontSize:'1.2rem'}}></i>
                            {currentUser?.email}
                         </td>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', fontFamily:'monospace', color:'var(--text-muted)'}}>{currentUser?.id}</td>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                           {currentUser?.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                         </td>
                         <td style={{padding: '16px 20px'}}>
                           <span className="adm-badge adm-badge-green">Super Admin</span>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* GUVENLIK VE SIFRE */}
            {activeTab === 'security' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Guvenlik & <em>Sifre</em></div>
                  <div className="adm-page-desc">Hesabinizin guvenligini saglayin ve yonetici sifrenizi guncelleyin.</div>
                </div>
                
                <div className="adm-form-card" style={{maxWidth: '500px'}}>
                  <div className="adm-form-card-title">
                    <div><i className="fas fa-key" style={{marginRight:'10px'}}/> Yeni Sifre Olustur</div>
                  </div>
                  <form onSubmit={handlePasswordChange} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    
                    <div className="adm-form-item">
                      <label>Giris Yapili Admin Hesabi</label>
                      <input className="adm-input-full" value={currentUser?.email || ''} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
                    </div>

                    <div className="adm-form-item">
                      <label>Guvenlik Icin Mevcut Sifreniz (Opsiyonel)</label>
                      <input type="password" placeholder="Mevcut sifre..." className="adm-input-full" />
                    </div>

                    <div className="adm-form-item">
                      <label>Yeni Sifre (En az 6 karakter)</label>
                      <input 
                        type="password" 
                        minLength={6} 
                        className="adm-input-full" 
                        placeholder="Yeni sifrenizi girin..." 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <button type="submit" className="adm-form-submit">
                      <i className="fas fa-lock" style={{marginRight:'5px'}}></i> Sifreyi Guncelle
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}