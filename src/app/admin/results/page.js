'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  results_page_title: "Proje Dosyalari",
  results_page_title_en: "Project Files",
  results_page_desc: "Projemiz sonucunda ortaya cikan fikri ciktilar, raporlar ve materyaller.",
  results_page_desc_en: "Intellectual outputs, reports and materials resulting from our project."
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

/* ─── CONFIRM MODAL ─── */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal">
        <div className="adm-modal-icon"><i className="fas fa-trash" /></div>
        <h3>Emin misiniz?</h3><p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgec</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Sil</button>
        </div>
      </div>
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

export default function AdminResultsPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); // ✨ KULLANICI ROLÜ
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [results, setResults] = useState([]);
  
  // YENI: Arama State'i
  const [searchQuery, setSearchQuery] = useState('');
  
  // Badge Counts
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);

  // Form State
 // Form State - Başlangıç değerlerini boş string yaparak hatayı engelliyoruz
const [resultForm, setResultForm] = useState({ 
  id: null, 
  title: '', 
  title_en: '', 
  description: '', 
  description_en: '', 
  status: 'Planlaniyor', 
  status_en: 'Planned', 
  link: '', 
  icon: 'file' 
});
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  const fetchPageData = useCallback(async () => {
    try {
      const [s, r, msg, n, act, par] = await Promise.all([
        supabase.from('settings').select('*').order('id'),
        supabase.from('results').select('*').order('id'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true })
      ]);
        
      setSettings(s.data || []);
      setResults(r.data || []);
      
      if (msg.count) setUnreadMsgCount(msg.count);
      if (n.count) setNewsCount(n.count);
      if (act.count) setActivitiesCount(act.count);
      if (par.count) setPartnersCount(par.count);
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
      
      if (isMounted) {
        setCurrentUser(session.user);
        // ✨ ROLÜ ÇEK
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
        if (profile) setUserRole(profile.role);
      }

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
    // ✨ GÜVENLİK: Eğer editörse işlem yapmasına izin verme
    if (userRole === 'Editor') {
      showToast('Bu ayarı değiştirme yetkiniz bulunmuyor.', 'error');
      return;
    }
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Dosyalar sayfa ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'results',
      ip_address: userIp
    }]);
  }

  async function deleteItem(id, fileUrls = []) {
    showConfirm('Bu dosyayi kalici olarak silmek istediginize emin misiniz?', async () => {
      
      setResults(prev => prev.filter(r => r.id !== id));
      
      const { error } = await supabase.from('results').delete().eq('id', id);
      
      if (error) {
        showToast('Hata: ' + error.message, 'error');
        fetchPageData(); 
      } else {
        await logAction(`Dosyalar tablosundan bir kayit silindi. (ID: ${id})`);
        showToast('Basariyla silindi.', 'success');
        
        if (fileUrls && fileUrls.length > 0) {
          const fileNamesToDelete = fileUrls.filter(url => url).map(url => {
              const parts = url.split('/images/');
              return parts.length > 1 ? parts[1] : null;
            }).filter(name => name);
  
          if (fileNamesToDelete.length > 0) {
            try { await supabase.storage.from('images').remove(fileNamesToDelete); } 
            catch (err) { console.error("Storage silme hatasi:", err); }
          }
        }
      }
    });
  }

  async function saveItem(e) {
    e.preventDefault();
    const { id, ...data } = resultForm;
    let result = id ? await supabase.from('results').update(data).eq('id', id) : await supabase.from('results').insert([data]);
    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    
    setIsEditing(false); 
    await logAction(`Dosyalar tablosunda islem yapildi. (Ekleme/Guncelleme)`);
    fetchPageData(); 
    showToast('Basariyla kaydedildi.', 'success');
    setResultForm({ 
  id: null, 
  title: '', 
  title_en: '', 
  description: '', 
  description_en: '', 
  status: 'Planlaniyor', 
  status_en: 'Planned', 
  link: '', 
  icon: 'file' 
});
  }

  function startEdit(item) {
    setIsEditing(true);
    setResultForm({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // YENI: Arama Fonksiyonu (Filtreleme)
  const filteredResults = results.filter(item => {
    const searchVal = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchVal) ||
      item.title_en?.toLowerCase().includes(searchVal) ||
      item.description?.toLowerCase().includes(searchVal) ||
      item.description_en?.toLowerCase().includes(searchVal)
    );
  });

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // ✨ MENÜYÜ ROLÜNE GÖRE FİLTRELEME YAPIYORUZ
  const fullNAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin', active: currentPath === '/admin', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: typeof unreadMsgCount !== 'undefined' ? unreadMsgCount : 0, group: 'Genel', link: '/admin/messages', active: currentPath === '/admin/messages', roles: ['Super Admin', 'Admin', 'Editor'] },
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
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: typeof newsCount !== 'undefined' ? newsCount : (typeof news !== 'undefined' ? news.length : 0), group: 'Icerik', link: '/admin/news', active: currentPath === '/admin/news', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: typeof activitiesCount !== 'undefined' ? activitiesCount : (typeof activities !== 'undefined' ? activities.length : 0), group: 'Icerik', link: '/admin/activities', active: currentPath === '/admin/activities', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: typeof partnersCount !== 'undefined' ? partnersCount : (typeof partners !== 'undefined' ? partners.length : 0), group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners', roles: ['Super Admin', 'Admin'] },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: typeof resultsCount !== 'undefined' ? resultsCount : (typeof results !== 'undefined' ? results.length : 0), group: 'Icerik', link: '/admin/results', active: currentPath === '/admin/results', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik', link: '/admin/contact', active: currentPath === '/admin/contact', roles: ['Super Admin', 'Admin'] },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik', link: '/admin/site', active: currentPath === '/admin/site', roles: ['Super Admin', 'Admin'] },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin/users', active: currentPath === '/admin/users', roles: ['Super Admin'] },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs', active: currentPath === '/admin/logs', roles: ['Super Admin', 'Admin', 'Editor'] },
    // ✨ Editörün Şifre & Güvenlik sekmesini görmesini engelledik: roles: ['Super Admin', 'Admin']
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin/security', active: currentPath === '/admin/security', roles: ['Super Admin', 'Admin'] },
  ];

  const allowedNav = fullNAV.filter(nav => nav.roles.includes(userRole));
  const groupedNav = allowedNav.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const currentTab = fullNAV.find(n => n.id === 'results');

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Yukleniyor...</p></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

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
        .adm-btn-danger { background: transparent; border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
        .adm-btn-danger:hover { background: var(--red-dim); border-color: rgba(239,68,68,0.6); }
        .adm-btn-ghost { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-secondary); }
        .adm-btn-ghost:hover { border-color: var(--border-hover); color: var(--text-primary); }

        .adm-img-field { display: flex; gap: 8px; align-items: center; width: 100%; }
        .adm-img-preview-wrap { flex: 1; display: flex; align-items: center; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; gap: 10px; overflow: hidden; }
        .adm-img-thumb { width: 32px; height: 32px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
        .adm-img-url-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: var(--font); font-size: 0.8rem; outline: none; }
        .adm-upload-btn { width: 38px; height: 38px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: var(--transition); flex-shrink: 0; position: relative; overflow: hidden; }
        .adm-upload-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .adm-upload-btn input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .adm-item-row { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 8px; transition: border-color var(--transition); }
        .adm-item-row:hover { border-color: var(--border-hover); }
        .adm-item-info strong { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .adm-item-info span { font-size: 0.75rem; color: var(--text-secondary); }
        .adm-item-actions { display: flex; gap: 8px; align-items: center; }

        .adm-form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
        .adm-form-card-title { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; justify-content: space-between; }
        .adm-form-card-title i { color: var(--accent); }
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
        .adm-form-submit { width: 100%; height: 44px; background: var(--accent); color: #000; border: none; border-radius: 8px; font-family: var(--font); font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: var(--transition); margin-top: 4px; }
        .adm-form-submit:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 6px 18px var(--accent-glow); }

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

        .adm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .adm-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px 32px; width: 400px; max-width: 90vw; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1); }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .adm-modal-icon { width: 48px; height: 48px; background: var(--red-dim); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--red); margin: 0 auto 16px; }
        .adm-modal h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
        .adm-modal p { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
        .adm-modal-btns { display: flex; gap: 10px; justify-content: center; }

        .adm-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; font-family: var(--font); color: var(--text-primary); }
        .adm-loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0); } }
        .adm-badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .adm-badge-blue { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.25); }
        .adm-empty { text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.875rem; border: 1px dashed var(--border); border-radius: var(--radius-lg); }
        .adm-empty i { display: block; font-size: 2rem; margin-bottom: 12px; opacity: 0.4; }

        /* YENI ARAMA KUTUSU CSS */
        .adm-search-wrap { position: relative; margin-bottom: 16px; width: 100%; display: flex; align-items: center; }
        .adm-search-wrap i { position: absolute; left: 14px; color: var(--text-muted); font-size: 0.85rem; }
        .adm-search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px 10px 38px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; transition: all var(--transition); outline: none; }
        .adm-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: var(--surface-2); }
        .adm-search-clear { position: absolute; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: color var(--transition); }
        .adm-search-clear:hover { color: var(--text-primary); }
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
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '240px', background: '#111318', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset', zIndex: 100, animation: 'topbarDropdown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ padding: '12px 14px', marginBottom: '6px', background: 'var(--surface-3, rgba(255,255,255,0.04))', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1, paddingBottom: '2px' }}>
                        {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Oturum acik</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
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
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Proje <em>Dosyalari</em></div>
              </div>

              {/* ✨ EĞER KULLANICI SUPER ADMIN VEYA ADMIN İSE TASARIM AYARLARINI GÖSTER ✨ */}
              {(userRole === 'Super Admin' || userRole === 'Admin') && (
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Ust Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="results_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="results_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="results_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="results_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="results_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="results_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="results_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="results_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="results_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="results_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader iconClass="fas fa-bars" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="results_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="results_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="results_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="results_sec_title_en" {...commonProps} />
                  </div>
                </div>
              )}

              <div className="adm-form-card">
                <div className="adm-form-card-title">
                  <div>
                    <i className="fas fa-plus" /> {isEditing ? ' Dosya Guncelle' : ' Yeni Dosya Ekle'}  
                  </div>
                </div>
               <form onSubmit={saveItem} style={{display:'grid', gap:'14px'}}>
                 
                 <div className="adm-form-grid2">
                     <div className="adm-form-item">
                       <label>Dosya Basligi (TR) *</label>
                       <input className="adm-input-full" placeholder="Dosya basligi..." value={resultForm.title} onChange={e => setResultForm({...resultForm, title: e.target.value})} required />
                     </div>
                     <input 
  className="adm-input-full" 
  placeholder="File title..." 
  value={resultForm.title_en || ''} // ✨ Buraya || '' ekledik
  onChange={e => setResultForm({...resultForm, title_en: e.target.value})} 
/>
                 </div>

                 <div className="adm-form-grid2">
                     <div className="adm-form-item">
                       <label>Aciklama (TR)</label>
                       <textarea className="adm-textarea-full" placeholder="Aciklama..." value={resultForm.description} onChange={e => setResultForm({...resultForm, description: e.target.value})} rows={3} />
                     </div>
                     <div className="adm-form-item">
                       <label>Aciklama (EN)</label>
                       <textarea className="adm-textarea-full" placeholder="Description..." value={resultForm.description_en} onChange={e => setResultForm({...resultForm, description_en: e.target.value})} rows={3} />
                     </div>
                 </div>

                 <div className="adm-form-grid2">
                     <div className="adm-form-item">
                       <label>Durum (TR)</label>
                       <select className="adm-select-full" value={resultForm.status} onChange={e => setResultForm({...resultForm, status: e.target.value})}>
                         <option value="Planlaniyor">Planlaniyor</option>
                         <option value="Devam Ediyor">Devam Ediyor</option>
                         <option value="Tamamlandi">Tamamlandi</option>
                       </select>
                     </div>
                     <div className="adm-form-item">
                       <label>Durum (EN)</label>
                       <select className="adm-select-full" value={resultForm.status_en} onChange={e => setResultForm({...resultForm, status_en: e.target.value})}>
                         <option value="Planned">Planned</option>
                         <option value="In Progress">In Progress</option>
                         <option value="Completed">Completed</option>
                       </select>
                     </div>
                 </div>

                 <div className="adm-form-item">
                   <label>Dosya / Link</label>
                   <FileInput value={resultForm.link} onChange={url => setResultForm({...resultForm, link: url})} placeholder="Dosya yukleyin veya URL girin..." uploadFile={uploadFile} showToast={showToast} />
                 </div>
                 <button type="submit" className="adm-form-submit">
                   {isEditing ? 'Guncelle' : '+ Ekle'}
                 </button>
               </form>
              </div>
              
              <div style={{marginTop:'24px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
                    Mevcut Dosyalar ({filteredResults.length})
                  </div>
                  
                  {/* ✨ ARAMA KUTUSU BURADA ✨ */}
                  <div className="adm-search-wrap" style={{ width: '300px', marginBottom: 0 }}>
                    <i className="fas fa-search" />
                    <input 
                      type="text" 
                      className="adm-search-input" 
                      placeholder="Dosya ara..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="adm-search-clear" onClick={() => setSearchQuery('')}>
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>
                </div>

                {filteredResults.length === 0 ? (
                  <div className="adm-empty" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                    <i className="fas fa-file" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '10px' }} />
                    <div style={{ color: 'var(--text-secondary)' }}>{searchQuery ? 'Arama sonucu bulunamadi.' : 'Dosya bulunamadi.'}</div>
                  </div>
                ) : filteredResults.map(item => (
                  <div key={item.id} className="adm-item-row">
                    <div className="adm-item-info">
                      <strong><i className="fas fa-file-circle-check" style={{color:'var(--accent)', marginRight:'8px'}} />{item.title}</strong>
                      <span>{item.status}</span>
                    </div>
                    <div className="adm-item-actions">
                      <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item)} style={{height:'32px', fontSize:'0.78rem'}}>
                        <i className="fas fa-pen" /> Duzenle
                      </button>
                      <button className="adm-btn adm-btn-danger" onClick={() => deleteItem(item.id, [item.link])}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}