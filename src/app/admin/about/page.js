'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  about_general_title: "Hakkimizda", about_general_title_en: "About Us",
  about_consortium_title: "Konsorsiyum", about_consortium_title_en: "Consortium",
  about_impact_title: "Proje Etkisi", about_impact_title_en: "Project Impact",
  about_plan_title: "Proje Plani", about_plan_title_en: "Project Plan",
  about_roadmap_title: "Yol Haritasi", about_roadmap_title_en: "Roadmap",
  about_strategy_title: "Strateji", about_strategy_title_en: "Strategy",

  about_strategy_desc: "Bu rapor, Kapakli Belediyesi tarafindan sunulan ve Erasmus+ programi kapsaminda desteklenen projenin kapsamli bir sunumudur.",
  about_strategy_desc_en: "This report provides a comprehensive presentation of the project supported by the Erasmus+ program.",
  strategy_section_a_title: "A. Proje Kimligi ve Temel Bilgiler",
  strategy_section_a_title_en: "A. Project Identity and Basic Info",
  strategy_text_a_1: "Bu rapor, Kapakli Belediyesi tarafindan sunulan ve Erasmus+ programi kapsaminda desteklenen 'Vatandas Odakli Yerel Yesil Gelecek Icin Dijital Donusum' (DIGI-GREEN FUTURE) baslikli projenin kapsamli bir sunumunu saglamak amaciyla hazirlanmistir.",
  strategy_text_a_1_en: "This report is prepared to provide a comprehensive presentation...",
  strategy_text_a_2: "Toplam 24 ay surecek olan proje, 1 Kasim 2025 tarihinde baslayip 31 Ekim 2027 tarihinde sona erecektir. Projenin yurutulmesi icin 250.000,00 €'luk sabit bir hibe tahsis edilmistir.",
  strategy_text_a_2_en: "The project, which will last a total of 24 months...",
  
  strategy_section_b_title: "B. Projenin Ruhu: Gerekce ve Motivasyon",
  strategy_section_b_title_en: "B. Spirit of the Project: Rationale and Motivation",
  strategy_text_b: "Projemiz, iklim kriziyle mucadelede yerel yonetimler ve vatandaslarin aktif rol almasi gerekliliginden dogmustur. Kapakli gibi sanayilesme bolgelerinin hava/su kirliligi ve yetersiz atik yonetimi gibi acil cevresel sorunlarina odaklanmaktadir.",
  strategy_text_b_en: "Our project was born from the need for local governments and citizens to take an active role...",
  strategy_quote: "Temel felsefemiz; dijitallesmeyi amac degil, cevresel surdurulebilirlik hedeflerine ulasmak icin guclu bir arac olarak kullanmaktir.",
  strategy_quote_en: "Our basic philosophy is to use digitalization not as a goal, but as a powerful tool...",
  
  strategy_section_c_title: "C. Avrupa Politikalariyla Stratejik Uyum",
  strategy_section_c_title_en: "C. Strategic Alignment with European Policies",
  strategy_text_c: "DIGI-GREEN FUTURE, Erasmus+ programinin uc temel yatay onceligiyle dogrudan uyumludur.",
  strategy_text_c_en: "DIGI-GREEN FUTURE is directly aligned with the three main horizontal priorities of the Erasmus+ program."
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
const SectionHeader = ({ num, iconClass, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num"><i className={iconClass || 'fas fa-hashtag'} /></div>
    <div className="adm-section-title">{title}</div>
  </div>
);

export default function AdminAboutPage() {
  const router = useRouter();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(true); // Sol menudeki Hakkinda alt sekmelerini acar
  const [subTab, setSubTab] = useState('general'); // Aktif alt sekme
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); // Rol State'i
  const [userIp, setUserIp] = useState('Bilinmiyor');
  const [settings, setSettings] = useState([]);
  const [toast, setToast] = useState(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  // URL'den tab parametresini oku (orn: /admin/about?tab=strateji)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setSubTab(tabParam);
        setIsAboutMenuOpen(true);
      }
    }
  }, []);

  const fetchSettingsData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      setSettings(s.data || []);

      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (count) setUnreadMsgCount(count);
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

      // Eğer Editör girmeye çalışıyorsa, sayfayı hiç yüklemeden anında fırlat!
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

  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { 
      showToast('Yukleme Hatasi: ' + error.message, 'error'); 
      return null; 
    }
    
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
    if (userRole === 'Editor') return; // Güvenlik Koruması

    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Hakkinda sayfasi ayari guncellendi: ${key}`);
      fetchSettingsData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: `about_${subTab}`,
      ip_address: userIp
    }]);
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin', active: currentPath === '/admin' },
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: typeof unreadMsgCount !== 'undefined' ? unreadMsgCount : 0, group: 'Genel', link: '/admin/messages', active: currentPath === '/admin/messages' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'Icerik', link: '/admin/homepage', active: currentPath === '/admin/homepage' },
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
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: typeof newsCount !== 'undefined' ? newsCount : 0, group: 'Icerik', link: '/admin/news', active: currentPath === '/admin/news' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: typeof activitiesCount !== 'undefined' ? activitiesCount : 0, group: 'Icerik', link: '/admin/activities', active: currentPath === '/admin/activities' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: typeof partnersCount !== 'undefined' ? partnersCount : 0, group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: typeof resultsCount !== 'undefined' ? resultsCount : 0, group: 'Icerik', link: '/admin/results', active: currentPath === '/admin/results' },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik', link: '/admin/contact', active: currentPath === '/admin/contact' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik', link: '/admin/site', active: currentPath === '/admin/site' },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin/users', active: currentPath === '/admin/users' },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs', active: currentPath === '/admin/logs' },
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin/security', active: currentPath === '/admin/security' },
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
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; text-transform: capitalize; display: flex; align-items: center; gap: 10px; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 4px; }
        .adm-section { margin-bottom: 36px; }

        .adm-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .adm-section-num { width: 26px; height: 26px; background: var(--accent-dim); border: 1px solid rgba(34,197,94,0.3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--accent); flex-shrink: 0; font-family: var(--font-display); }
        .adm-section-title { font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; text-transform: uppercase; }

        .adm-card-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adm-card-inner { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
        .adm-card-inner-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--blue); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .adm-card-inner-label::before { content: ''; width: 3px; height: 14px; background: var(--blue); border-radius: 2px; display: block; }

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
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

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
                  
                  // Alt menulu (Dropdown) Eleman Icin Render
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
                                className={`adm-nav-subitem ${subTab === sub.tab ? 'active' : ''}`}
                                onClick={() => {
                                  setSubTab(sub.tab);
                                  router.push(`/admin/about?tab=${sub.tab}`, { scroll: false });
                                }}
                              >
                                <span style={{width:'4px', height:'4px', borderRadius:'50%', background:'currentColor', marginRight:'8px', display:'inline-block', opacity: subTab === sub.tab ? 1 : 0.4}}></span>
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Normal Linkli Eleman Icin Render
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
                  <i className="fas fa-circle-info" style={{ color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <span style={{ fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
                  Hakkinda ({subTab})
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
                  background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                  lineHeight: 1, paddingBottom: '1px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
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
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '240px', background: '#111318', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset', zIndex: 100, animation: 'topbarDropdown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ padding: '12px 14px', marginBottom: '6px', background: 'var(--surface-3, rgba(255,255,255,0.04))', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1, paddingBottom: '2px' }}>
                        {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Oturum acik</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
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
            <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
              
              {subTab === 'general' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Genel)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Genel Hakkinda (Hero) Bolumu" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="about_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="about_hero_eyebrow_en" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Baslik Alani ("Geleceginize Yesil Bir Iz Birakin")</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Satir 1 (TR)" settingKey="about_hero_title1" placeholder="Geleceginize" {...commonProps} />
                      <SettingInput label="Satir 1 (EN)" settingKey="about_hero_title1_en" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Satir 2 (TR)" settingKey="about_hero_title2" placeholder="Yesil Bir..." {...commonProps} />
                      <SettingInput label="Satir 2 (EN)" settingKey="about_hero_title2_en" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Vurgulu Kisim (TR)" settingKey="about_hero_title3" placeholder="Iz Birakin" {...commonProps} />
                      <SettingInput label="Vurgulu Kisim (EN)" settingKey="about_hero_title3_en" {...commonProps} />
                    </div>
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                    <SettingInput label="Hero Aciklama (TR)" settingKey="about_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Hero Aciklama (EN)" settingKey="about_page_desc_en" type="textarea" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-eye" title="Vizyon & Misyon ve Gorsel" />
                  <SettingInput label="Sag Taraf Gorseli" settingKey="about_vision_image" type="image" {...commonProps} />
                  
                  <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="about_vision_label" placeholder="Vizyonumuz" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="about_vision_label_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Vizyon Baslik (TR)" settingKey="about_vision_title" {...commonProps} />
                    <SettingInput label="Vizyon Baslik (EN)" settingKey="about_vision_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Vizyon Metni (TR)" settingKey="about_vision_text" type="textarea" {...commonProps} />
                    <SettingInput label="Vizyon Metni (EN)" settingKey="about_vision_text_en" type="textarea" {...commonProps} />
                  </div>
                  
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Vizyon Maddeleri (Liste)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Madde 1 (TR)" settingKey="about_vision_list1" {...commonProps} />
                      <SettingInput label="Madde 1 (EN)" settingKey="about_vision_list1_en" {...commonProps} />
                      <SettingInput label="Madde 2 (TR)" settingKey="about_vision_list2" {...commonProps} />
                      <SettingInput label="Madde 2 (EN)" settingKey="about_vision_list2_en" {...commonProps} />
                      <SettingInput label="Madde 3 (TR)" settingKey="about_vision_list3" {...commonProps} />
                      <SettingInput label="Madde 3 (EN)" settingKey="about_vision_list3_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-chart-line" title="Rakamlarla Biz (Istatistikler)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="about_stats_label" placeholder="Rakamlarla Biz" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="about_stats_label_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Basligi (TR)" settingKey="about_stats_title" placeholder="Projenin Etkisi" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="about_stats_title_en" {...commonProps} />
                  </div>
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                       {[1, 2, 3, 4].map(n => (
                         <div key={n} className="adm-card-inner">
                           <div className="adm-card-inner-label">Sayac {n}</div>
                           <SettingInput label="Deger (Sayi)" settingKey={`about_stat_${n}_val`} {...commonProps} />
                           <SettingInput label="Isaret (+, %)" settingKey={`about_stat_${n}_suffix`} {...commonProps} />
                           <div style={{marginTop:'10px'}}>
                              <SettingInput label="Etiket (TR)" settingKey={`about_stat_${n}_label`} {...commonProps} />
                              <SettingInput label="Etiket (EN)" settingKey={`about_stat_${n}_label_en`} {...commonProps} />
                           </div>
                         </div>
                       ))}
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-users" title="Hedef Kitle Kartlari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="about_target_label" placeholder="Kimin Icin?" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="about_target_label_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Basligi (TR)" settingKey="about_target_title" placeholder="Hedef Kitlemiz" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="about_target_title_en" {...commonProps} />
                  </div>
                  <div style={{marginTop:'15px'}}>
                    {[1, 2, 3].map(n => (
                      <div key={n} className="adm-card-inner" style={{marginBottom:'15px'}}>
                        <div className="adm-card-inner-label">Hedef Karti {n}</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Baslik (TR)" settingKey={`about_target_${n}_title`} {...commonProps} />
                          <SettingInput label="Baslik (EN)" settingKey={`about_target_${n}_title_en`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Aciklama (TR)" settingKey={`about_target_${n}_desc`} type="textarea" {...commonProps} />
                          <SettingInput label="Aciklama (EN)" settingKey={`about_target_${n}_desc_en`} type="textarea" {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-table" title="Proje Kunyesi (Tablo)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Tablo Ust Etiketi (TR)" settingKey="about_spec_label" placeholder="Ozet Bilgi" {...commonProps} />
                    <SettingInput label="Tablo Ust Etiketi (EN)" settingKey="about_spec_label_en" placeholder="Summary Info" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Tablo Ana Basligi (TR)" settingKey="about_spec_title" placeholder="Proje Kunyesi" {...commonProps} />
                    <SettingInput label="Tablo Ana Basligi (EN)" settingKey="about_spec_title_en" placeholder="Project Details" {...commonProps} />
                  </div>
                  
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>1. Satir (Orn: Proje Adi)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="1. Satir BASLIK (TR)" settingKey="about_project_name_label" placeholder="Proje Adi" {...commonProps} />
                      <SettingInput label="1. Satir BASLIK (EN)" settingKey="about_project_name_label_en" placeholder="Project Name" {...commonProps} />
                      <SettingInput label="1. Satir DEGER (TR)" settingKey="about_project_name" placeholder="DIGI-GREEN FUTURE" {...commonProps} />
                      <SettingInput label="1. Satir DEGER (EN)" settingKey="about_project_name_en" placeholder="DIGI-GREEN FUTURE" {...commonProps} />
                    </div>

                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>2. Satir (Orn: Proje Kodu)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="2. Satir BASLIK (TR)" settingKey="about_project_code_label" placeholder="Proje Kodu" {...commonProps} />
                      <SettingInput label="2. Satir BASLIK (EN)" settingKey="about_project_code_label_en" placeholder="Project Code" {...commonProps} />
                      <SettingInput label="2. Satir DEGER (TR)" settingKey="about_project_code" placeholder="2023-1-TR01-KA220-ADU-00015421" {...commonProps} />
                      <SettingInput label="2. Satir DEGER (EN)" settingKey="about_project_code_en" placeholder="2023-1-TR01-KA220-ADU-00015421" {...commonProps} />
                    </div>

                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>3. Satir (Orn: Program)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="3. Satir BASLIK (TR)" settingKey="about_project_program_label" placeholder="Program" {...commonProps} />
                      <SettingInput label="3. Satir BASLIK (EN)" settingKey="about_project_program_label_en" placeholder="Program" {...commonProps} />
                      <SettingInput label="3. Satir DEGER (TR)" settingKey="about_project_program" placeholder="Erasmus+ Yetiskin Egitimi" {...commonProps} />
                      <SettingInput label="3. Satir DEGER (EN)" settingKey="about_project_program_en" placeholder="Erasmus+ Adult Education" {...commonProps} />
                    </div>

                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>4. Satir (Orn: Sure)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="4. Satir BASLIK (TR)" settingKey="about_project_duration_label" placeholder="Sure" {...commonProps} />
                      <SettingInput label="4. Satir BASLIK (EN)" settingKey="about_project_duration_label_en" placeholder="Duration" {...commonProps} />
                      <SettingInput label="4. Satir DEGER (TR)" settingKey="about_project_duration" placeholder="24 Ay" {...commonProps} />
                      <SettingInput label="4. Satir DEGER (EN)" settingKey="about_project_duration_en" placeholder="24 Months" {...commonProps} />
                    </div>

                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>5. Satir (Orn: Butce)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="5. Satir BASLIK (TR)" settingKey="about_project_budget_label" placeholder="Butce" {...commonProps} />
                      <SettingInput label="5. Satir BASLIK (EN)" settingKey="about_project_budget_label_en" placeholder="Budget" {...commonProps} />
                      <SettingInput label="5. Satir DEGER (TR)" settingKey="about_project_budget" placeholder="250.000 €" {...commonProps} />
                      <SettingInput label="5. Satir DEGER (EN)" settingKey="about_project_budget_en" placeholder="250.000 €" {...commonProps} />
                    </div>
                  </div>

                  <SectionHeader iconClass="fas fa-flag-checkered" title="Alt Kapanis (CTA)" />
                  <div className="adm-card-inner">
                    <div className="adm-form-grid2">
                      <SettingInput label="Rozet Metni (TR)" settingKey="about_cta_badge" {...commonProps} />
                      <SettingInput label="Rozet Metni (EN)" settingKey="about_cta_badge_en" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik Satir 1 (TR)" settingKey="about_cta_title1" {...commonProps} />
                      <SettingInput label="Baslik Satir 1 (EN)" settingKey="about_cta_title1_en" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik Satir 2 (TR)" settingKey="about_cta_title2" {...commonProps} />
                      <SettingInput label="Baslik Satir 2 (EN)" settingKey="about_cta_title2_en" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Aciklama (TR)" settingKey="about_cta_desc" type="textarea" {...commonProps} />
                      <SettingInput label="Aciklama (EN)" settingKey="about_cta_desc_en" type="textarea" {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Buton Yazisi (TR)" settingKey="about_cta_button" {...commonProps} />
                      <SettingInput label="Buton Yazisi (EN)" settingKey="about_cta_button_en" {...commonProps} />
                    </div>
                  </div>

                </div>
              )}

              {subTab === 'consortium' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Konsorsiyum)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about/consortium" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Girisi (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="consortium_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="consortium_hero_eyebrow_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="consortium_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="consortium_hero_title1_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 2 (TR)" settingKey="consortium_hero_title2" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 2 (EN)" settingKey="consortium_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="consortium_intro" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="consortium_intro_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="consortium_scroll_btn" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="consortium_scroll_btn_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-chart-bar" title="Istatistikler" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="consortium_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="consortium_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="consortium_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="consortium_sec_title_en" {...commonProps} />
                  </div>
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                    {[1,2,3,4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Sayac {n}</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Deger (TR) Orn: 150K" settingKey={`consortium_stat_${n}_val`} {...commonProps} />
                          <SettingInput label="Deger (EN)" settingKey={`consortium_stat_${n}_val_en`} {...commonProps} />
                          <SettingInput label="Birim/Isaret (TR) Orn: +" settingKey={`consortium_stat_${n}_unit`} {...commonProps} />
                          <SettingInput label="Birim/Isaret (EN)" settingKey={`consortium_stat_${n}_unit_en`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Etiket (TR)" settingKey={`consortium_stat_${n}_label`} {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`consortium_stat_${n}_label_en`} {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-id-card" title="Kart A (Koordinator)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="consortium_badge_a" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="consortium_badge_a_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="consortium_section_a_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="consortium_section_a_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Aciklama (TR)" settingKey="consortium_text_a" type="textarea" {...commonProps} />
                    <SettingInput label="Aciklama (EN)" settingKey="consortium_text_a_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart A Alt Ozellikleri</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_a_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_a_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_a_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_a_pill2_en" {...commonProps} />
                      <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_a_pill3" {...commonProps} />
                      <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_a_pill3_en" {...commonProps} />
                      <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_a_pill4" {...commonProps} />
                      <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_a_pill4_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-globe-europe" title="Kart B (Avrupali Ortaklar)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="consortium_badge_b" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="consortium_badge_b_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="consortium_section_b_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="consortium_section_b_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Aciklama (TR)" settingKey="consortium_text_b" type="textarea" {...commonProps} />
                    <SettingInput label="Aciklama (EN)" settingKey="consortium_text_b_en" type="textarea" {...commonProps} />
                  </div>
                  
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label" style={{color:'#16a34a'}}>Ortak 1 (Avrupa)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Kurum Adi (TR)" settingKey="consortium_b_p1_name" {...commonProps} />
                      <SettingInput label="Kurum Adi (EN)" settingKey="consortium_b_p1_name_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_b_p1_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_b_p1_country_en" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_b_p1_desc" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_b_p1_desc_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label" style={{color:'#16a34a'}}>Ortak 2 (Avrupa)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Kurum Adi (TR)" settingKey="consortium_b_p2_name" {...commonProps} />
                      <SettingInput label="Kurum Adi (EN)" settingKey="consortium_b_p2_name_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_b_p2_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_b_p2_country_en" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_b_p2_desc" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_b_p2_desc_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart B Alt Ozellikleri</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_b_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_b_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_b_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_b_pill2_en" {...commonProps} />
                      <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_b_pill3" {...commonProps} />
                      <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_b_pill3_en" {...commonProps} />
                      <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_b_pill4" {...commonProps} />
                      <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_b_pill4_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-handshake" title="Kart C (Turk Ortaklar)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="consortium_badge_c" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="consortium_badge_c_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="consortium_section_c_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="consortium_section_c_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Aciklama (TR)" settingKey="consortium_text_c" type="textarea" {...commonProps} />
                    <SettingInput label="Aciklama (EN)" settingKey="consortium_text_c_en" type="textarea" {...commonProps} />
                  </div>
                  
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label" style={{color:'#ea580c'}}>Ortak 1 (Turk)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Kurum Adi (TR)" settingKey="consortium_c_p1_name" {...commonProps} />
                      <SettingInput label="Kurum Adi (EN)" settingKey="consortium_c_p1_name_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_c_p1_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_c_p1_country_en" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_c_p1_desc" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_c_p1_desc_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label" style={{color:'#ea580c'}}>Ortak 2 (Turk)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Kurum Adi (TR)" settingKey="consortium_c_p2_name" {...commonProps} />
                      <SettingInput label="Kurum Adi (EN)" settingKey="consortium_c_p2_name_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_c_p2_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_c_p2_country_en" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_c_p2_desc" {...commonProps} />
                      <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_c_p2_desc_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart C Alt Ozellikleri</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_c_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_c_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_c_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_c_pill2_en" {...commonProps} />
                      <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_c_pill3" {...commonProps} />
                      <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_c_pill3_en" {...commonProps} />
                      <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_c_pill4" {...commonProps} />
                      <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_c_pill4_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-network-wired" title="Kart D (Sinerji & Etki)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="consortium_badge_d" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="consortium_badge_d_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="consortium_section_d_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="consortium_section_d_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Icerik Metni (TR)" settingKey="consortium_text_d" type="textarea" {...commonProps} />
                    <SettingInput label="Icerik Metni (EN)" settingKey="consortium_text_d_en" type="textarea" {...commonProps} />
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Sehir 1 (Orn: Kapakli)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c1_city" {...commonProps} />
                      <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c1_city_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_d_c1_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_d_c1_country_en" {...commonProps} />
                      <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c1_challenge" {...commonProps} />
                      <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c1_challenge_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Sehir 2 (Orn: Liepāja)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c2_city" {...commonProps} />
                      <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c2_city_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_d_c2_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_d_c2_country_en" {...commonProps} />
                      <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c2_challenge" {...commonProps} />
                      <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c2_challenge_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Sehir 3 (Orn: Cascais)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c3_city" {...commonProps} />
                      <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c3_city_en" {...commonProps} />
                      <SettingInput label="Ulke (TR)" settingKey="consortium_d_c3_country" {...commonProps} />
                      <SettingInput label="Ulke (EN)" settingKey="consortium_d_c3_country_en" {...commonProps} />
                      <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c3_challenge" {...commonProps} />
                      <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c3_challenge_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                    <SettingInput label="Alt Sinerji Notu (TR)" settingKey="consortium_synergy_note" type="textarea" {...commonProps} />
                    <SettingInput label="Alt Sinerji Notu (EN)" settingKey="consortium_synergy_note_en" type="textarea" {...commonProps} />
                  </div>
                </div>
              )}

              {subTab === 'impact' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Proje Etkisi)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about/impact" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="impact_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="impact_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="impact_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="impact_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="impact_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="impact_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="impact_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="impact_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="impact_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="impact_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-chart-pie" title="Etki Istatistikleri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="impact_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="impact_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="impact_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="impact_sec_title_en" {...commonProps} />
                  </div>
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                    {[1,2,3,4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Metrik {n}</div>
                        <SettingInput label="Deger (Sayi / %)" settingKey={`impact_stat_${n}_val`} {...commonProps} />
                        <div style={{marginTop:'10px'}}>
                          <SettingInput label="Etiket (TR)" settingKey={`impact_stat_${n}_label`} {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`impact_stat_${n}_label_en`} {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-bolt" title="Stratejik Etki Karti (Kart A)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="impact_badge_a" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="impact_badge_a_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="impact_section_1_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="impact_section_1_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Metin (TR)" settingKey="impact_section_1_text" type="textarea" {...commonProps} />
                    <SettingInput label="Metin (EN)" settingKey="impact_section_1_text_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                    <div className="adm-card-inner-label">Etki Vurgulari (Madde Isaretleri)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Vurgu 1 (TR)" settingKey="impact_h1" {...commonProps} />
                      <SettingInput label="Vurgu 1 (EN)" settingKey="impact_h1_en" {...commonProps} />
                      <SettingInput label="Vurgu 2 (TR)" settingKey="impact_h2" {...commonProps} />
                      <SettingInput label="Vurgu 2 (EN)" settingKey="impact_h2_en" {...commonProps} />
                      <SettingInput label="Vurgu 3 (TR)" settingKey="impact_h3" {...commonProps} />
                      <SettingInput label="Vurgu 3 (EN)" settingKey="impact_h3_en" {...commonProps} />
                      <SettingInput label="Vurgu 4 (TR)" settingKey="impact_h4" {...commonProps} />
                      <SettingInput label="Vurgu 4 (EN)" settingKey="impact_h4_en" {...commonProps} />
                    </div>
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Alt Vurgu Notu (TR)" settingKey="impact_highlight_text" type="textarea" {...commonProps} />
                    <SettingInput label="Alt Vurgu Notu (EN)" settingKey="impact_highlight_text_en" type="textarea" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-eye" title="Vizyon Karti (Kart B)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Rozet (TR)" settingKey="impact_badge_b" {...commonProps} />
                    <SettingInput label="Rozet (EN)" settingKey="impact_badge_b_en" {...commonProps} />
                    <SettingInput label="Baslik (TR)" settingKey="impact_section_2_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="impact_section_2_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Metin (TR)" settingKey="impact_section_2_text" type="textarea" {...commonProps} />
                    <SettingInput label="Metin (EN)" settingKey="impact_section_2_text_en" type="textarea" {...commonProps} />
                  </div>
                  
                  <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                    <div className="adm-card-inner-label">6'li Vizyon Sutunlari</div>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                        <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'5px'}}>Sutun {n}</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Baslik (TR)" settingKey={`impact_vp${n}_title`} {...commonProps} />
                          <SettingInput label="Baslik (EN)" settingKey={`impact_vp${n}_title_en`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'5px'}}>
                          <SettingInput label="Aciklama (TR)" settingKey={`impact_vp${n}_desc`} type="textarea" {...commonProps} />
                          <SettingInput label="Aciklama (EN)" settingKey={`impact_vp${n}_desc_en`} type="textarea" {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-form-grid2">
                    <SettingInput label="Kapanis Slogani (TR)" settingKey="impact_closing_msg" type="textarea" {...commonProps} />
                    <SettingInput label="Kapanis Slogani (EN)" settingKey="impact_closing_msg_en" type="textarea" {...commonProps} />
                  </div>
                </div>
              )}

              {subTab === 'plan' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Proje Plani)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about/plan" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="plan_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="plan_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="plan_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="plan_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="plan_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="plan_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="plan_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="plan_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="plan_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="plan_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-chart-bar" title="Plan Istatistikleri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="plan_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="plan_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="plan_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="plan_sec_title_en" {...commonProps} />
                  </div>
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label" style={{color: 'var(--accent)'}}>Sayac {n}</div>
                        
                        <div className="adm-form-grid2">
                          <SettingInput label="Deger (TR)" settingKey={`plan_stat_${n}_val`} placeholder="Orn: 4" {...commonProps} />
                          <SettingInput label="Deger (EN)" settingKey={`plan_stat_${n}_val_en`} placeholder="Orn: 4" {...commonProps} />
                        </div>

                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Birim (TR)" settingKey={`plan_stat_${n}_unit`} placeholder="Orn: Ay, IP" {...commonProps} />
                          <SettingInput label="Birim (EN)" settingKey={`plan_stat_${n}_unit_en`} placeholder="Orn: Months, WP" {...commonProps} />
                        </div>

                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Etiket (TR)" settingKey={`plan_stat_${n}_label`} placeholder="Alt Yazi" {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`plan_stat_${n}_label_en`} placeholder="Subtitle" {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="adm-divider" />
                  
                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-stream" title="Proje Asamalari (Timeline)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Kart Ici Alt Baslik (Orn: Neler Yapilacak?)" settingKey="plan_timeline_pills_label" {...commonProps} />
                    <SettingInput label="Kart Ici Alt Baslik (EN)" settingKey="plan_timeline_pills_label_en" {...commonProps} />
                  </div>
                  
                  <div style={{marginTop: '20px'}}>
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} className="adm-card-inner" style={{marginBottom:'20px'}}>
                        <div className="adm-card-inner-label" style={{fontSize:'1rem', color:'var(--accent)'}}>Asama {step} (IP{step+1})</div>
                        <div className="adm-form-grid2">
                          <SettingInput label={`Asama ${step} Baslik (TR)`} settingKey={`plan_step_${step}_title`} {...commonProps} />
                          <SettingInput label={`Asama ${step} Baslik (EN)`} settingKey={`plan_step_${step}_title_en`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label={`Asama ${step} Metni (TR)`} settingKey={`plan_step_${step}_desc`} type="textarea" {...commonProps} />
                          <SettingInput label={`Asama ${step} Metni (EN)`} settingKey={`plan_step_${step}_desc_en`} type="textarea" {...commonProps} />
                        </div>
                        
                        <div style={{marginTop:'15px', padding:'10px', background:'var(--surface-1)', borderRadius:'8px', border:'1px solid var(--border)'}}>
                          <div style={{fontSize:'0.75rem', fontWeight:'bold', marginBottom:'10px'}}>Asama Ici Etiketler (Pills)</div>
                          <div className="adm-form-grid2">
                            <SettingInput label="Etiket 1 (TR)" settingKey={`plan_step_${step}_pill_1`} {...commonProps} />
                            <SettingInput label="Etiket 1 (EN)" settingKey={`plan_step_${step}_pill_1_en`} {...commonProps} />
                            <SettingInput label="Etiket 2 (TR)" settingKey={`plan_step_${step}_pill_2`} {...commonProps} />
                            <SettingInput label="Etiket 2 (EN)" settingKey={`plan_step_${step}_pill_2_en`} {...commonProps} />
                            <SettingInput label="Etiket 3 (TR)" settingKey={`plan_step_${step}_pill_3`} {...commonProps} />
                            <SettingInput label="Etiket 3 (EN)" settingKey={`plan_step_${step}_pill_3_en`} {...commonProps} />
                            <SettingInput label="Etiket 4 (TR)" settingKey={`plan_step_${step}_pill_4`} {...commonProps} />
                            <SettingInput label="Etiket 4 (EN)" settingKey={`plan_step_${step}_pill_4_en`} {...commonProps} />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {subTab === 'roadmap' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Yol Haritasi)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about/roadmap" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="roadmap_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="roadmap_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="roadmap_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="roadmap_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="roadmap_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="roadmap_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="roadmap_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="roadmap_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="roadmap_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="roadmap_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-table" title="Tablo Ust Bilgileri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="roadmap_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="roadmap_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="roadmap_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="roadmap_sec_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Tablo Basligi (Orn: Is Paketleri)" settingKey="roadmap_table_header" {...commonProps} />
                    <SettingInput label="Tablo Basligi (EN)" settingKey="roadmap_table_header_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-list-check" title="Gantt Semasi Gorevleri (1-21)" />
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                    Asagidaki 21 adet gorevin ismini TR ve EN olarak duzenleyebilirsiniz. Bos biraktiginiz kutularda yedek (eski) ceviriler gorunmeye devam edecektir.
                  </div>
                  
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                    {[...Array(21)].map((_, i) => (
                      <div key={i+1} className="adm-card-inner">
                        <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>Gorev {i+1}</div>
                        <SettingInput label={`Gorev ${i+1} Adi (TR)`} settingKey={`roadmap_task_${i+1}`} {...commonProps} />
                        <SettingInput label={`Gorev ${i+1} Adi (EN)`} settingKey={`roadmap_task_${i+1}_en`} {...commonProps} />
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {subTab === 'strategy' && (
                <div className="adm-fade-in">
                  <div className="adm-page-header">
                    <div className="adm-page-title">
                      Hakkinda <em>(Strateji)</em>
                      {/* ✨ SİTEYE GİT BUTONU EKLENDİ ✨ */}
                      <a href="/about/strategy" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                  <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="strategy_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="strategy_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="strategy_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="strategy_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="strategy_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="strategy_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="strategy_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="strategy_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="strategy_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="strategy_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" />

                  <SectionHeader iconClass="fas fa-chart-line" title="Strateji Istatistikleri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="strategy_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="strategy_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="strategy_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="strategy_sec_title_en" {...commonProps} />
                  </div>
                  <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label" style={{color: 'var(--accent)'}}>Sayac {n}</div>
                        
                        <div className="adm-form-grid2">
                          <SettingInput label="Deger (TR)" settingKey={`strategy_stat_${n}_val`} placeholder="Orn: 24" {...commonProps} />
                          <SettingInput label="Deger (EN)" settingKey={`strategy_stat_${n}_val_en`} placeholder="Orn: 24" {...commonProps} />
                        </div>

                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Birim/Isaret (TR)" settingKey={`strategy_stat_${n}_unit`} placeholder="Orn: Ay, €, vb." {...commonProps} />
                          <SettingInput label="Birim/Isaret (EN)" settingKey={`strategy_stat_${n}_unit_en`} placeholder="Orn: Months" {...commonProps} />
                        </div>

                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Etiket (TR)" settingKey={`strategy_stat_${n}_label`} placeholder="Alt Yazi" {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`strategy_stat_${n}_label_en`} placeholder="Subtitle" {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-divider" />
                  <SectionHeader iconClass="fas fa-calendar-alt" title="Kart A (Zaman Cizelgesi & Hazirlik)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Baslik (TR)" settingKey="strategy_section_a_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="strategy_section_a_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Paragraf 1 (TR)" settingKey="strategy_text_a_1" type="textarea" {...commonProps} />
                    <SettingInput label="Paragraf 1 (EN)" settingKey="strategy_text_a_1_en" type="textarea" {...commonProps} />
                    <SettingInput label="Paragraf 2 (TR)" settingKey="strategy_text_a_2" type="textarea" {...commonProps} />
                    <SettingInput label="Paragraf 2 (EN)" settingKey="strategy_text_a_2_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart A Alt Ozellikleri (Pills)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_a_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_a_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_a_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_a_pill2_en" {...commonProps} />
                      <SettingInput label="Ozellik 3 (TR)" settingKey="strategy_a_pill3" {...commonProps} />
                      <SettingInput label="Ozellik 3 (EN)" settingKey="strategy_a_pill3_en" {...commonProps} />
                      <SettingInput label="Ozellik 4 (TR)" settingKey="strategy_a_pill4" {...commonProps} />
                      <SettingInput label="Ozellik 4 (EN)" settingKey="strategy_a_pill4_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-bullseye" title="Kart B (Odak Noktasi & Felsefe)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Baslik (TR)" settingKey="strategy_section_b_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="strategy_section_b_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Aciklama (TR)" settingKey="strategy_text_b" type="textarea" {...commonProps} />
                    <SettingInput label="Aciklama (EN)" settingKey="strategy_text_b_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Alinti Soz (TR)" settingKey="strategy_quote" type="textarea" {...commonProps} />
                    <SettingInput label="Alinti Soz (EN)" settingKey="strategy_quote_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart B Alt Ozellikleri (Pills)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_b_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_b_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_b_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_b_pill2_en" {...commonProps} />
                      <SettingInput label="Ozellik 3 (TR)" settingKey="strategy_b_pill3" {...commonProps} />
                      <SettingInput label="Ozellik 3 (EN)" settingKey="strategy_b_pill3_en" {...commonProps} />
                      <SettingInput label="Ozellik 4 (TR)" settingKey="strategy_b_pill4" {...commonProps} />
                      <SettingInput label="Ozellik 4 (EN)" settingKey="strategy_b_pill4_en" {...commonProps} />
                    </div>
                  </div>

                  <div className="adm-divider" />
                  
                  <SectionHeader iconClass="fas fa-globe-europe" title="Kart C (Avrupa Politikalari Uyum)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Baslik (TR)" settingKey="strategy_section_c_title" {...commonProps} />
                    <SettingInput label="Baslik (EN)" settingKey="strategy_section_c_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Aciklama (TR)" settingKey="strategy_text_c" type="textarea" {...commonProps} />
                    <SettingInput label="Aciklama (EN)" settingKey="strategy_text_c_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">3 Temel Oncelik (Priorities)</div>
                    {[1, 2, 3].map(n => (
                      <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                        <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)'}}>Oncelik {n}</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Baslik (TR)" settingKey={`strategy_c_prio${n}_title`} {...commonProps} />
                          <SettingInput label="Baslik (EN)" settingKey={`strategy_c_prio${n}_title_en`} {...commonProps} />
                          <SettingInput label="Aciklama (TR)" settingKey={`strategy_c_prio${n}_desc`} type="textarea" {...commonProps} />
                          <SettingInput label="Aciklama (EN)" settingKey={`strategy_c_prio${n}_desc_en`} type="textarea" {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                    <div className="adm-card-inner-label">Kart C Alt Ozellikleri (Pills)</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_c_pill1" {...commonProps} />
                      <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_c_pill1_en" {...commonProps} />
                      <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_c_pill2" {...commonProps} />
                      <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_c_pill2_en" {...commonProps} />
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}