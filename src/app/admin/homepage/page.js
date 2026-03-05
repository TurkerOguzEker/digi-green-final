'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  hero_title: "Yerel Yesil Gelecek Icin Dijital Donusum",
  hero_desc: "Erasmus+ KA220-ADU kapsaminda, iklim degisikligi ile mucadelede dijital araclari kullanmayi hedefleyen oncu proje.",
  home_summary_1_val: "24 Ay", home_summary_1_label: "Proje Suresi",
  home_summary_2_val: "250.000€", home_summary_2_label: "Toplam Hibe",
  home_summary_3_val: "KA220-ADU", home_summary_3_label: "Program",
  home_summary_4_val: "3 Ulke", home_summary_4_label: "Kapsam",
  home_about_title: "Teknoloji ve Doganin Mukemmel Uyumu",
  home_about_text: "Projemiz, iklim kriziyle mucadelede yerel yonetimler ve vatandaslarin aktif rol almasi gerekliliginden dogmustur.",
  home_target_1_title: "Vatandaslar", home_target_1_desc: "Mobil uygulamalar ile geri donusume katilin.",
  home_target_2_title: "Yerel Yonetimler", home_target_2_desc: "Veriye dayali kararlar alarak kaynaklari verimli kullanin.",
  home_target_3_title: "STK ve Akademik", home_target_3_desc: "Arastirma ve egitim calismalarinda aktif rol alin.",
  home_counter_1_val: "250000", home_counter_1_label: "Toplam Hibe (€)",
  home_counter_2_val: "3", home_counter_2_label: "Ortak Ulke",
  home_counter_3_val: "5", home_counter_3_label: "Proje Ortagi",
  home_counter_4_val: "24", home_counter_4_label: "Ay Sure",
  home_cta_title: "Gelecegi Birlikte Tasarlayalim",
  home_cta_text: "Daha fazla bilgi almak icin bize ulasin."
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

/* ─── KULLANILABILIR IKONLAR LISTESI ─── */
const AVAILABLE_ICONS = [
  { value: 'fa-leaf', label: 'Yaprak / Doga' },
  { value: 'fa-mobile-screen', label: 'Mobil Cihaz / Uygulama' },
  { value: 'fa-recycle', label: 'Geri Donusum' },
  { value: 'fa-graduation-cap', label: 'Egitim / Okul' },
  { value: 'fa-globe', label: 'Dunya / Kuresel' },
  { value: 'fa-tree', label: 'Agac / Orman' },
  { value: 'fa-seedling', label: 'Fidan / Buyume' },
  { value: 'fa-solar-panel', label: 'Gunes Paneli / Enerji' },
  { value: 'fa-wind', label: 'Ruzgar / Temiz Hava' },
  { value: 'fa-water', label: 'Su / Deniz' },
  { value: 'fa-lightbulb', label: 'Fikir / Yenilik' },
  { value: 'fa-users', label: 'Insanlar / Toplum' },
  { value: 'fa-handshake', label: 'Isbirligi / Ortaklik' },
  { value: 'fa-chart-line', label: 'Grafik / Gelisim' },
  { value: 'fa-laptop', label: 'Bilgisayar / Dijital' },
  { value: 'fa-city', label: 'Sehir / Yerel Yonetim' },
  { value: 'fa-bolt', label: 'Enerji / Hiz' },
  { value: 'fa-bullhorn', label: 'Duyuru / Kampanya' }
];

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

/* ─── FILE INPUT ─── */
const FileInput = ({ value, onChange, placeholder, uploadFile, showToast }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async e => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const url = await uploadFile(file);
      if (url) { onChange(url); if (showToast) showToast('Dosya basariyla yuklendi.', 'success'); }
    } catch { if (showToast) showToast('Yukleme hatasi olustu.', 'error'); }
    finally { setUploading(false); }
  };
  return (
    <div className="adm-img-field">
      <div className="adm-img-preview-wrap">
        {value ? <img src={value} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
        <input type="text" className="adm-img-url-input" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
      </div>
      <label className="adm-upload-btn" title="Yukle">
        {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-upload" />}
        <input type="file" onChange={handleFile} disabled={uploading} />
      </label>
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

export default function AdminHomePageSettings() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); // Rol State'i
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [ecoItems, setEcoItems] = useState([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  
  // Badge Counts
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchSettingsData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      const existingSettings = s.data || [];
      setSettings(existingSettings);

      const [msg, n, act, par, res] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true })
      ]);

      if (msg.count) setUnreadMsgCount(msg.count);
      if (n.count) setNewsCount(n.count);
      if (act.count) setActivitiesCount(act.count);
      if (par.count) setPartnersCount(par.count);
      if (res.count) setResultsCount(res.count);

      const heroSliderStr = existingSettings.find(x => x.key === 'hero_slider_images')?.value;
      if (heroSliderStr) { try { setHeroImages(JSON.parse(heroSliderStr)); } catch(e){} }
      else {
        const oldHeroBg = existingSettings.find(x => x.key === 'hero_bg_image')?.value;
        if (oldHeroBg) setHeroImages([oldHeroBg]);
      }

      const ecoStr = existingSettings.find(x => x.key === 'home_eco_list')?.value;
      if (ecoStr) { try { setEcoItems(JSON.parse(ecoStr)); } catch(e){} } 
      else {
          setEcoItems([
              { title: 'Mobil Uygulama', desc: 'Vatandaslara yonelik dijital araclar.', icon: 'fa-mobile-screen' },
              { title: 'Geri Donusum', desc: 'Cevre dostu aliskanliklar.', icon: 'fa-recycle' },
              { title: 'Egitim', desc: 'Farkindalik ve kapasite gelistirme.', icon: 'fa-graduation-cap' },
              { title: 'Doga', desc: 'Surdurulebilir yasam pratikleri.', icon: 'fa-leaf' }
          ]);
      }
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

      // ✨ GÜVENLİK BEKÇİSİ (CLIENT-SIDE GUARD) ✨
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'Editor';

      // Eğer Editör girmeye çalışıyorsa, sayfayı hiç yüklemeden anında Dashboard'a fırlat!
      if (role === 'Editor') {
        router.replace('/admin');
        return; 
      }

      if (isMounted) {
        setCurrentUser(session.user);
        setUserRole(role);
      }

      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        if (isMounted) setUserIp(data.ip);
      } catch (e) {}

      await fetchSettingsData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchSettingsData]);

  const handleEcoChange = (index, field, value) => {
    const newItems = [...ecoItems];
    newItems[index][field] = value;
    setEcoItems(newItems);
  };

  const saveEcoItems = async (itemsToSave) => {
    setEcoItems(itemsToSave);
    const { error } = await supabase.from('settings').upsert({ key: 'home_eco_list', value: JSON.stringify(itemsToSave) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Agac kutulari guncellendi.', 'success');
  };

  const saveHeroImages = async (newArr) => {
    setHeroImages(newArr);
    const { error } = await supabase.from('settings').upsert({ key: 'hero_slider_images', value: JSON.stringify(newArr) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error'); else showToast('Slider guncellendi.', 'success');
  };

  const moveHeroImage = (index, direction) => {
    const newArr = [...heroImages];
    if (direction === -1 && index > 0) { [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]; }
    else if (direction === 1 && index < newArr.length - 1) { [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]]; }
    saveHeroImages(newArr);
  };

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
    if (userRole === 'Editor') return; // Ekstra Güvenlik Koruması

    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Ana sayfa ayari guncellendi: ${key}`);
      fetchSettingsData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'homepage',
      ip_address: userIp
    }]);
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // ✨ MENÜ FİLTRELEME İÇİN ROLLER EKLENDİ
  const fullNAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin', active: currentPath === '/admin', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: unreadMsgCount, group: 'Genel', link: '/admin/messages', active: currentPath === '/admin/messages', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'Icerik', link: '/admin/homepage', active: currentPath === '/admin/homepage', roles: ['Super Admin', 'Admin'] },
    { 
      id: 'about', label: 'Hakkinda', icon: 'fas fa-circle-info', group: 'Icerik', roles: ['Super Admin', 'Admin'],
      subItems: [
        { id: 'general', label: 'Genel Hakkinda', tab: 'general' },
        { id: 'consortium', label: 'Konsorsiyum', tab: 'consortium' },
        { id: 'impact', label: 'Proje Etkisi', tab: 'impact' },
        { id: 'plan', label: 'Proje Plani', tab: 'plan' },  
        { id: 'roadmap', label: 'Yol Haritasi', tab: 'roadmap' },
        { id: 'strategy', label: 'Strateji', tab: 'strategy' }
      ]
    },
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: newsCount, group: 'Icerik', link: '/admin/news', active: currentPath === '/admin/news', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activitiesCount, group: 'Icerik', link: '/admin/activities', active: currentPath === '/admin/activities', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partnersCount, group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners', roles: ['Super Admin', 'Admin'] },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: resultsCount, group: 'Icerik', link: '/admin/results', active: currentPath === '/admin/results', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik', link: '/admin/contact', active: currentPath === '/admin/contact', roles: ['Super Admin', 'Admin'] },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik', link: '/admin/site', active: currentPath === '/admin/site', roles: ['Super Admin', 'Admin'] },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin/users', active: currentPath === '/admin/users', roles: ['Super Admin'] },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs', active: currentPath === '/admin/logs', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin/security', active: currentPath === '/admin/security', roles: ['Super Admin', 'Admin'] },
  ];

  const allowedNav = fullNAV.filter(nav => nav.roles.includes(userRole));
  const groupedNav = allowedNav.reduce((acc, item) => {
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
        .adm-page-header { margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; text-transform: capitalize; display: flex; align-items: center; gap: 10px; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 4px; }
        .adm-section { margin-bottom: 36px; background: var(--surface-2); padding: 20px; border-radius: 14px; border: 1px dashed var(--border); }

        .adm-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .adm-section-num { width: 26px; height: 26px; background: var(--accent-dim); border: 1px solid rgba(34,197,94,0.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--accent); flex-shrink: 0; font-family: var(--font-display); }
        .adm-section-title { font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; text-transform: uppercase; }

        .adm-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 12px; }
        .adm-card-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adm-card-inner { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }

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
        .adm-btn-danger { background: transparent; border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
        .adm-btn-danger:hover { background: var(--red-dim); border-color: rgba(239,68,68,0.6); }

        .adm-img-field { display: flex; gap: 8px; align-items: center; width: 100%; }
        .adm-img-preview-wrap { flex: 1; display: flex; align-items: center; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; gap: 10px; overflow: hidden; }
        .adm-img-thumb { width: 32px; height: 32px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
        .adm-img-url-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: var(--font); font-size: 0.8rem; outline: none; }
        .adm-upload-btn { width: 38px; height: 38px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: var(--transition); flex-shrink: 0; position: relative; overflow: hidden; }
        .adm-upload-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .adm-upload-btn input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .adm-slider-item { display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px; margin-bottom: 8px; transition: border-color var(--transition); }
        .adm-slider-item:hover { border-color: var(--border-hover); }
        .adm-slider-idx { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); width: 20px; text-align: center; flex-shrink: 0; }
        .adm-slider-thumb { width: 64px; height: 42px; object-fit: cover; border-radius: 5px; flex-shrink: 0; border: 1px solid var(--border); background: var(--surface); }
        .adm-slider-url { flex: 1; background: transparent; border: none; color: var(--text-secondary); font-family: monospace; font-size: 0.78rem; outline: none; min-width: 0; }
        .adm-slider-url:focus { color: var(--text-primary); }

        .adm-arrow-btn { width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; transition: var(--transition); flex-shrink: 0; }
        .adm-arrow-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .adm-arrow-btn:disabled { opacity: 0.2; cursor: not-allowed; }

        .adm-eco-item { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; position: relative; transition: border-color var(--transition); }
        .adm-eco-item:hover { border-color: var(--border-hover); }
        .adm-eco-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .adm-eco-idx { font-size: 0.75rem; font-weight: 700; color: var(--accent); font-family: var(--font-display); }

        .adm-slider-add { border: 1px dashed var(--border-hover); border-radius: var(--radius); padding: 14px; margin-top: 12px; background: var(--surface-2); }
        .adm-slider-add-label { font-size: 0.75rem; font-weight: 600; color: var(--accent); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }

        .adm-form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adm-form-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .adm-form-item { display: flex; flex-direction: column; gap: 6px; }
        .adm-form-item label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

        .adm-input-full { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; width: 100%; }
        .adm-input-full:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        
        .adm-select-full { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition); outline: none; width: 100%; cursor: pointer; appearance: none; }
        .adm-select-full:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        
        .adm-textarea-full { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; width: 100%; resize: vertical; line-height: 1.5; }
        .adm-textarea-full:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

        .adm-divider { border: none; border-top: 1px dashed var(--border); margin: 16px 0; }
        .adm-fade-in { animation: fadeUp 0.25s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

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

        /* YENI: Link Butonu CSS */
        .adm-external-link { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-secondary); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all var(--transition); }
        .adm-external-link:hover { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 12px var(--accent-glow); }
      `}</style>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/admin" className="adm-brand-card" title="Site Ana Sayfasina Git">
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

                  return null;
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dim, #6366f180))',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px var(--accent-glow, rgba(99,102,241,0.35))',
                }}>
                  <i className="fas fa-house" style={{ color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Ana Sayfa Duzenle
                </span>
              </div>
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Oturum acik</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
                      </div>
                    </div>
                    <button
  onClick={async () => {
    // 1. Çıkış yapıldığını veritabanına bildir
    if (currentUser?.email) {
      await supabase.from('login_logs').insert([{ 
        user_email: currentUser.email, 
        location: 'Çıkış Yapıldı', 
        status: 'logout' 
      }]);
    }
    // 2. Oturumu kapat ve logine at
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut(); 
    router.push('/login'); 
  }}
  style={{
    width: '100%',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 14px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#f87171',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    textAlign: 'left',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.borderColor = 'transparent';
  }}
>
  <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.9rem', width: '16px' }} />
  Çıkış Yap
</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="adm-content">
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">
                  Ana Sayfa <em>Duzenle</em>
                  {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                  <a href="/" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-images" title="Kapak Slider Resimleri" />
                <div className="adm-card">
                  <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'14px'}}>Resimleri surukleyip siralayabilir, ok butonlariyla yukari/asagi tasiyabilirsiniz.</p>
                  {heroImages.map((img, i) => (
                    <div key={i} className="adm-slider-item">
                      <span className="adm-slider-idx">{i + 1}</span>
                      <img src={img} className="adm-slider-thumb" alt="" onError={e => e.target.style.background='var(--surface-2)'} />
                      <input className="adm-slider-url" placeholder="Resim URL" value={img} onChange={e => { const a = [...heroImages]; a[i] = e.target.value; setHeroImages(a); }} />
                      <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, -1)} disabled={i === 0} title="Yukari"><i className="fas fa-chevron-up" /></button>
                      <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, 1)} disabled={i === heroImages.length - 1} title="Asagi"><i className="fas fa-chevron-down" /></button>
                      <button className="adm-btn adm-btn-danger" style={{height:'30px', padding:'0 10px', fontSize:'0.75rem'}} onClick={() => saveHeroImages(heroImages.filter((_, idx) => idx !== i))}><i className="fas fa-xmark" /></button>
                    </div>
                  ))}
                  <div className="adm-slider-add">
                    <div className="adm-slider-add-label"><i className="fas fa-plus" /> Yeni Resim Ekle</div>
                    <FileInput value="" onChange={url => { if (url) saveHeroImages([...heroImages, url]); }} placeholder="URL yapistirin veya dosya yukleyin..." uploadFile={uploadFile} showToast={showToast} />
                  </div>
                  <button className="adm-btn adm-btn-ghost" style={{marginTop:'12px'}} onClick={() => saveHeroImages(heroImages)}><i className="fas fa-floppy-disk" /> URL Degisikliklerini Kaydet</button>
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-heading" title="Kapak Metinleri ve Butonlar" />
                <div className="adm-form-grid2">
                  <SettingInput label="Ust Vurgu / Logo Metni (TR)" settingKey="home_hero_eyebrow" {...commonProps} />
                  <SettingInput label="Ust Vurgu / Logo Metni (EN)" settingKey="home_hero_eyebrow_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ana Baslik (TR)" settingKey="hero_title" {...commonProps} />
                  <SettingInput label="Ana Baslik (EN)" settingKey="hero_title_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Aciklama Metni (TR)" settingKey="hero_desc" type="textarea" {...commonProps} />
                  <SettingInput label="Aciklama Metni (EN)" settingKey="hero_desc_en" type="textarea" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Buton 1 (TR)" settingKey="home_hero_btn1" {...commonProps} />
                  <SettingInput label="Buton 1 (EN)" settingKey="home_hero_btn1_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Buton 2 (TR)" settingKey="home_hero_btn2" {...commonProps} />
                  <SettingInput label="Buton 2 (EN)" settingKey="home_hero_btn2_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-chart-pie" title="Ozet Bilgi Kartlari" />
                <div className="adm-card-grid2">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="adm-card-inner">
                      <div className="adm-card-inner-label">Kart {n}</div>
                      <div className="adm-form-grid2">
                          <SettingInput label="Deger (TR)" settingKey={`home_summary_${n}_val`} {...commonProps} />
                          <SettingInput label="Etiket (TR)" settingKey={`home_summary_${n}_label`} {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                          <SettingInput label="Deger (EN)" settingKey={`home_summary_${n}_val_en`} {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`home_summary_${n}_label_en`} {...commonProps} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-address-card" title="Hakkinda Bolumu (Gorsel & Metinler)" />
                <SettingInput label="Sol Taraf Gorseli" settingKey="home_about_image" type="image" {...commonProps} />
                <div className="adm-form-grid2">
                  <SettingInput label="Ust Baslik (TR)" settingKey="home_about_eyebrow" {...commonProps} />
                  <SettingInput label="Ust Baslik (EN)" settingKey="home_about_eyebrow_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ana Baslik (TR)" settingKey="home_about_title" {...commonProps} />
                  <SettingInput label="Ana Baslik (EN)" settingKey="home_about_title_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Aciklama Metni (TR)" settingKey="home_about_text" type="textarea" {...commonProps} />
                  <SettingInput label="Aciklama Metni (EN)" settingKey="home_about_text_en" type="textarea" {...commonProps} />
                </div>

                <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Gorsel Ustu Rozet (Yesil Kutu)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Buyuk Rakam/Yazi (TR)" settingKey="home_about_badge_val" placeholder="24 Ay" {...commonProps} />
                      <SettingInput label="Buyuk Rakam/Yazi (EN)" settingKey="home_about_badge_val_en" placeholder="24 Months" {...commonProps} />
                      <SettingInput label="Alt Aciklama (TR)" settingKey="home_about_badge" placeholder="Surecek Dijital..." {...commonProps} />
                      <SettingInput label="Alt Aciklama (EN)" settingKey="home_about_badge_en" placeholder="Digital Journey..." {...commonProps} />
                    </div>
                </div>
                
                <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Madde Isaretleri (Tik Listesi)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Madde 1 (TR)" settingKey="home_about_bullet_1" {...commonProps} />
                      <SettingInput label="Madde 1 (EN)" settingKey="home_about_bullet_1_en" {...commonProps} />
                      <SettingInput label="Madde 2 (TR)" settingKey="home_about_bullet_2" {...commonProps} />
                      <SettingInput label="Madde 2 (EN)" settingKey="home_about_bullet_2_en" {...commonProps} />
                      <SettingInput label="Madde 3 (TR)" settingKey="home_about_bullet_3" {...commonProps} />
                      <SettingInput label="Madde 3 (EN)" settingKey="home_about_bullet_3_en" {...commonProps} />
                    </div>
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-users-viewfinder" title="Hedef Kitle Bolumu" />
                <div className="adm-form-grid2">
                  <SettingInput label="Ana Baslik (TR)" settingKey="home_target_main_title" {...commonProps} />
                  <SettingInput label="Ana Baslik (EN)" settingKey="home_target_main_title_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Alt Baslik (TR)" settingKey="home_target_main_subtitle" type="textarea" {...commonProps} />
                  <SettingInput label="Alt Baslik (EN)" settingKey="home_target_main_subtitle_en" type="textarea" {...commonProps} />
                </div>
                <div style={{marginTop: '20px'}}>
                    {[1, 2, 3].map(n => (
                      <div key={n} className="adm-card-inner" style={{marginBottom:'10px'}}>
                        <div className="adm-card-inner-label">Hedef Karti {n}</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Baslik (TR)" settingKey={`home_target_${n}_title`} {...commonProps} />
                          <SettingInput label="Baslik (EN)" settingKey={`home_target_${n}_title_en`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Aciklama (TR)" settingKey={`home_target_${n}_desc`} type="textarea" {...commonProps} />
                          <SettingInput label="Aciklama (EN)" settingKey={`home_target_${n}_desc_en`} type="textarea" {...commonProps} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-network-wired" title="Dijital Ekosistem (Agac Yapisi)" />
                <div className="adm-form-grid2">
                  <SettingInput label="1. Renkli Baslik (TR)" settingKey="home_eco_main_title1" {...commonProps} />
                  <SettingInput label="1. Renkli Baslik (EN)" settingKey="home_eco_main_title1_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="2. Baslik Devami (TR)" settingKey="home_eco_main_title2" {...commonProps} />
                  <SettingInput label="2. Baslik Devami (EN)" settingKey="home_eco_main_title2_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Alt Aciklama (TR)" settingKey="home_eco_main_subtitle" type="textarea" {...commonProps} />
                  <SettingInput label="Alt Aciklama (EN)" settingKey="home_eco_main_subtitle_en" type="textarea" {...commonProps} />
                </div>

                <div className="adm-card" style={{marginTop: '20px', padding: '15px'}}>
                  <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                    Asagidaki kartlar ana sayfadaki agac gorunumunde (slider) listelenir. Istediginiz kadar ekleyebilirsiniz. Ikonlar icin FontAwesome classlarini kullanin.
                  </p>
                  
                  {ecoItems.map((eco, idx) => (
                    <div key={idx} className="adm-eco-item">
                      <div className="adm-eco-header">
                        <div className="adm-eco-idx"><i className={`fas ${eco.icon || 'fa-leaf'}`} style={{marginRight:'8px'}}></i> Kart {idx + 1}</div>
                        <button className="adm-btn adm-btn-danger" style={{height:'26px', fontSize:'0.7rem', padding:'0 10px'}} 
                          onClick={() => {
                            const newArr = [...ecoItems];
                            newArr.splice(idx, 1);
                            saveEcoItems(newArr);
                          }}>
                          <i className="fas fa-trash" /> Sil
                        </button>
                      </div>
                      <div className="adm-form-grid3" style={{marginBottom:'10px'}}>
                        <div className="adm-form-item">
                          <label>Ikon Secimi</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>
                              <i className={`fas ${eco.icon || 'fa-leaf'}`} />
                            </div>
                            <select 
                              className="adm-input-full" 
                              value={eco.icon || 'fa-leaf'} 
                              onChange={e => handleEcoChange(idx, 'icon', e.target.value)}
                              style={{ cursor: 'pointer', margin: 0 }}
                            >
                              {AVAILABLE_ICONS.map(iconOpt => (
                                <option key={iconOpt.value} value={iconOpt.value}>
                                  {iconOpt.label}
                                </option>
                              ))}
                              {!AVAILABLE_ICONS.find(i => i.value === eco.icon) && eco.icon && (
                                <option value={eco.icon}>Ozel: {eco.icon}</option>
                              )}
                            </select>
                          </div>
                        </div>
                        <div className="adm-form-item">
                          <label>Baslik (TR)</label>
                          <input className="adm-input-full" value={eco.title || ''} onChange={e => handleEcoChange(idx, 'title', e.target.value)} />
                        </div>
                        <div className="adm-form-item">
                          <label>Baslik (EN)</label>
                          <input className="adm-input-full" value={eco.title_en || ''} onChange={e => handleEcoChange(idx, 'title_en', e.target.value)} />
                        </div>
                      </div>
                      <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Aciklama (TR)</label>
                          <textarea className="adm-textarea-full" rows={2} value={eco.desc || ''} onChange={e => handleEcoChange(idx, 'desc', e.target.value)} />
                        </div>
                        <div className="adm-form-item">
                          <label>Aciklama (EN)</label>
                          <textarea className="adm-textarea-full" rows={2} value={eco.desc_en || ''} onChange={e => handleEcoChange(idx, 'desc_en', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="adm-btn adm-btn-ghost" style={{width:'100%', borderStyle:'dashed', marginTop:'10px'}} 
                    onClick={() => {
                      const newArr = [...ecoItems, { title: 'Yeni Kart', title_en: 'New Card', desc: 'Aciklama', desc_en: 'Description', icon: 'fa-leaf' }];
                      setEcoItems(newArr);
                    }}>
                    <i className="fas fa-plus" /> Yeni Ekosistem Karti Ekle
                  </button>
                  <button className="adm-btn adm-btn-save" style={{width:'100%', marginTop:'10px'}} onClick={() => saveEcoItems(ecoItems)}>
                    <i className="fas fa-floppy-disk" /> Kartlari Veritabanina Kaydet
                  </button>
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-stopwatch" title="Etki Sayaclari" />
                <div className="adm-card-grid2">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="adm-card-inner">
                      <div className="adm-card-inner-label">Sayac {n}</div>
                      <SettingInput label="Deger (Rakam)" settingKey={`home_counter_${n}_val`} {...commonProps} />
                      <SettingInput label="Etiket (TR)" settingKey={`home_counter_${n}_label`} {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`home_counter_${n}_label_en`} {...commonProps} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-section">
                <SectionHeader iconClass="fas fa-flag-checkered" title="Alt Kapanis (CTA)" />
                <div className="adm-form-grid2">
                  <SettingInput label="Baslik (TR)" settingKey="home_cta_title" {...commonProps} />
                  <SettingInput label="Baslik (EN)" settingKey="home_cta_title_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Metin (TR)" settingKey="home_cta_text" type="textarea" {...commonProps} />
                  <SettingInput label="Metin (EN)" settingKey="home_cta_text_en" type="textarea" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Buton Yazisi (TR)" settingKey="home_cta_btn" {...commonProps} />
                  <SettingInput label="Buton Yazisi (EN)" settingKey="home_cta_btn_en" {...commonProps} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}