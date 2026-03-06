'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  partners_page_title: "Ortaklar & Kurumlar",
  partners_page_title_en: "Partners & Institutions",
  partners_page_desc: "Projemize guc katan uluslararasi ortaklarimiz.",
  partners_page_desc_en: "Our international partners who add strength to our project."
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

export default function AdminPartnersPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [partners, setPartners] = useState([]);
  
  // Badge Counts
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  // Form State
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [formKey, setFormKey] = useState(0);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  const fetchPageData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      const p = await supabase.from('partners').select('*').order('id');
      
      const { count: msgCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { count: nCount } = await supabase.from('news').select('*', { count: 'exact', head: true });
      const { count: aCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
      const { count: rCount } = await supabase.from('results').select('*', { count: 'exact', head: true });
        
      setSettings(s.data || []);
      setPartners(p.data || []);
      
      if (msgCount) setUnreadMsgCount(msgCount);
      if (nCount) setNewsCount(nCount);
      if (aCount) setActivitiesCount(aCount);
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

      if (isMounted) {
        setCurrentUser(session.user);
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
    if (userRole === 'Editor') {
        showToast('Bu ayarı değiştirme yetkiniz bulunmuyor.', 'error');
        return;
    }

    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Ortaklar sayfa ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'partners',
      ip_address: userIp
    }]);
  }

  async function deleteItem(item) {
    showConfirm('Bu ortagi kalici olarak silmek istediginize emin misiniz?', async () => {
      let filesToDelete = [];

      if (item.image_url) {
        const mainFile = decodeURIComponent(item.image_url.split('/').pop().split('?')[0]);
        if (mainFile) filesToDelete.push(mainFile);
      }
      if (item.flag_url) {
        const flagFile = decodeURIComponent(item.flag_url.split('/').pop().split('?')[0]);
        if (flagFile) filesToDelete.push(flagFile);
      }

      if (filesToDelete.length > 0) {
        try { await supabase.storage.from('images').remove(filesToDelete); } 
        catch (err) { console.error("Storage silme hatasi:", err); }
      }

      await supabase.from('partners').delete().eq('id', item.id);
      await logAction(`Ortaklar tablosundan bir kayit silindi. (ID: ${item.id})`);
      fetchPageData(); 
      showToast('Basariyla silindi.', 'success');
    });
  }

  const resetForm = () => {
    setIsEditing(false);
    setPartnerForm({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
    setFormKey(prev => prev + 1);
  };

  async function saveItem(e) {
    e.preventDefault();
    
    const { id, ...dataToSave } = partnerForm;

    let result;
    if (id) {
        result = await supabase.from('partners').update(dataToSave).eq('id', id);
    } else {
        result = await supabase.from('partners').insert([dataToSave]);
    }

    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    
    await logAction(`Ortaklar tablosunda islem yapildi. (Ekleme/Guncelleme)`);
    fetchPageData(); 
    showToast('Basariyla kaydedildi.', 'success');
    resetForm(); 
  }

  function startEdit(item) {
    setIsEditing(true);
    setPartnerForm({ ...item });
    setFormKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
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
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: 0, group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners', roles: ['Super Admin', 'Admin'] },
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
        .adm-nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: var(--transition); text-align: left; position: relative; margin-bottom: 2px; }
        .adm-nav-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .adm-nav-btn.active { background: var(--accent-dim); color: var(--accent); }
        .adm-nav-badge { margin-left: auto; background: var(--accent); color: #000; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center; }

        .adm-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .adm-topbar { height: 76px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 50; }
        .adm-topbar-title { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--text-primary); flex: 1; }
        
        .adm-content { padding: 32px; flex: 1; }
        
        /* ✨ CSS: Başlık ve Butonun Yan Yana Gelmesi İçin Güncellendi ✨ */
        .adm-page-header { margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end;}
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; display: flex; align-items: center; gap: 10px; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        
        .adm-section { margin-bottom: 36px; background: var(--surface-2); padding: 20px; border-radius: 14px; border: 1px dashed var(--border); }
        .adm-btn-save { background: var(--accent); color: #000; }
        .adm-btn-save:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
        
        .adm-badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .adm-badge-green { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(34,197,94,0.25); }
        .adm-badge-yellow { background: rgba(245,158,11,0.12); color: var(--yellow); border: 1px solid rgba(245,158,11,0.25); }
        
        .adm-external-link { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-secondary); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all var(--transition); }
        .adm-external-link:hover { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 12px var(--accent-glow); }
        
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0); } }
        .adm-fade-in { animation: fadeUp 0.25s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/admin" className="adm-brand-card">
              <div className="adm-brand-icon"><i className="fas fa-leaf" /></div>
              <div className="adm-brand-text">
                <div className="adm-brand-logo"><span>DIGI-<span>GREEN</span></span></div>
                <div className="adm-brand-sub">Yonetim Paneli</div>
              </div>
            </Link>
          </div>
          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
               <div className="adm-nav-label" style={{fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px', marginBottom: '6px'}}>{group}</div>
                {items.map(item => (
                  <Link href={item.link || '#'} key={item.id} className={`adm-nav-btn ${item.active ? 'active' : ''}`} style={{textDecoration:'none', color:'inherit'}}>
                    <span style={{width:'18px', textAlign:'center'}}><i className={item.icon} /></span>{item.label}
                    {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-handshake" style={{ color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <span style={{ fontWeight: 600 }}>Ortaklar ve Kurumlar</span>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px 6px 6px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '999px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem' }}>
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.email?.split('@')[0] || 'Admin'}
                </span>
                <i className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.5 }} />
              </button>
              
              {profileOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '240px', background: '#111318', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset', zIndex: 100, animation: 'topbarDropdown 0.2s ease' }}>
                  <div style={{ padding: '12px 14px', marginBottom: '6px', background: 'var(--surface-3, rgba(255,255,255,0.04))', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1, paddingBottom: '2px' }}>
                      {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Oturum acik</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{currentUser?.email}</div>
                    </div>
                  </div>
                  <button onClick={async () => { 
                    if (currentUser?.email) {
                      await supabase.from('login_logs').insert([{ user_email: currentUser.email, location: 'Çıkış Yapıldı', status: 'logout' }]);
                    }
                    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    await supabase.auth.signOut(); 
                    router.push('/login'); 
                  }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '10px', cursor: 'pointer', color: '#f87171', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s ease', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.9rem', width: '16px' }} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="adm-content">
            <div className="adm-fade-in">
              
              {/* ✨ BAŞLIK VE YENİ SEKMEYE GİT BUTONU DÜZELTİLDİ ✨ */}
              <div className="adm-page-header">
                <div className="adm-page-title">
                  <span>Ortaklar & <em>Kurumlar</em></span>
                  <a href="/partners" target="_blank" rel="noopener noreferrer" className="adm-external-link" title="Sitede Goruntule">
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>

              {(userRole === 'Super Admin' || userRole === 'Admin') && (
                <div className="adm-section">
                  <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Ust Bilgileri (Hero)" />
                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="partners_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="partners_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="partners_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="partners_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="partners_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="partners_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="partners_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="partners_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="partners_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="partners_hero_scroll_en" {...commonProps} />
                  </div>
                </div>
              )}

              <div className="adm-form-card" style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'24px'}}>
                <div className="adm-form-card-title" style={{fontWeight:700, marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} style={{color:'var(--accent)'}} />
                  {isEditing ? ' Ortak Duzenle' : ' Yeni Ortak Ekle'}
                </div>
                
                {/* ✨ formKey EKLENDİ, FORM TAMAMEN SIFIRLANIR ✨ */}
                <form key={formKey} onSubmit={saveItem} style={{display:'grid', gap:'14px'}}>
                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Kurum Adi (TR) *</label>
                      <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Kurum adi..." value={partnerForm.name} onChange={e => setPartnerForm(prev => ({...prev, name: e.target.value}))} required />
                    </div>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Kurum Adi (EN)</label>
                      <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Institution name..." value={partnerForm.name_en} onChange={e => setPartnerForm(prev => ({...prev, name_en: e.target.value}))} />
                    </div>
                  </div>

                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Ulke (TR) *</label>
                      <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Turkiye..." value={partnerForm.country} onChange={e => setPartnerForm(prev => ({...prev, country: e.target.value}))} required />
                    </div>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Ulke (EN)</label>
                      <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Turkey..." value={partnerForm.country_en} onChange={e => setPartnerForm(prev => ({...prev, country_en: e.target.value}))} />
                    </div>
                  </div>

                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Rol (TR)</label>
                      <select className="adm-select-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} value={partnerForm.role} onChange={e => setPartnerForm(prev => ({...prev, role: e.target.value}))}>
                        <option value="Ortak">Ortak</option>
                        <option value="Koordinator">Koordinator</option>
                      </select>
                    </div>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Rol (EN)</label>
                      <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Partner / Coordinator" value={partnerForm.role_en} onChange={e => setPartnerForm(prev => ({...prev, role_en: e.target.value}))} />
                    </div>
                  </div>

                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Aciklama (TR)</label>
                      <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Kurum hakkinda..." value={partnerForm.description} onChange={e => setPartnerForm(prev => ({...prev, description: e.target.value}))} rows={3} />
                    </div>
                    <div className="adm-form-item">
                      <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Aciklama (EN)</label>
                      <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="About institution..." value={partnerForm.description_en} onChange={e => setPartnerForm(prev => ({...prev, description_en: e.target.value}))} rows={3} />
                    </div>
                  </div>

                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Web Sitesi</label>
                    <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="https://..." value={partnerForm.website} onChange={e => setPartnerForm(prev => ({...prev, website: e.target.value}))} />
                  </div>

                  <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                      <div className="adm-form-item">
                        <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Kurum Logosu</label>
                        <FileInput value={partnerForm.image_url} onChange={url => setPartnerForm(prev => ({...prev, image_url: url}))} placeholder="Logo URL..." uploadFile={uploadFile} showToast={showToast} />
                      </div>
                      <div className="adm-form-item">
                        <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Ulke Bayragi</label>
                        <FileInput value={partnerForm.flag_url} onChange={url => setPartnerForm(prev => ({...prev, flag_url: url}))} placeholder="Bayrak URL..." uploadFile={uploadFile} showToast={showToast} />
                      </div>
                  </div>

                  {/* ✨ VAZGEÇ VE KAYDET BUTONLARI ✨ */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {isEditing && (
                      <button type="button" className="adm-btn adm-btn-ghost" onClick={resetForm} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>
                        Vazgec
                      </button>
                    )}
                    <button type="submit" className="adm-btn adm-btn-save" style={{ flex: isEditing ? 1 : 'unset', width: isEditing ? 'auto' : '100%', padding: '10px', borderRadius: '8px' }}>
                      {isEditing ? 'Ortak Bilgilerini Guncelle' : '+ Ortak Ekle'}
                    </button>
                  </div>
                </form>
              </div>

              <div style={{marginTop:'24px'}}>
                <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Ortaklar ({partners.length})</div>
                {partners.length === 0 ? (
                  <div className="adm-empty" style={{textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '14px', border: '1px dashed var(--border)', color: 'var(--text-secondary)'}}>Ortak bulunamadi.</div>
                ) : partners.map(item => (
                  <div key={item.id} className="adm-item-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '8px'}}>
                    <div className="adm-item-info" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      {item.image_url && <img src={item.image_url} style={{width:'40px', height:'28px', objectFit:'contain', borderRadius:'4px', background:'white'}} alt="" />}
                      <div>
                        <strong style={{display: 'block', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600}}>{item.name}</strong>
                        <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}><span className={`adm-badge ${item.role === 'Koordinator' ? 'adm-badge-yellow' : 'adm-badge-green'}`}>{item.role}</span> &bull; {item.country}</span>
                      </div>
                    </div>
                    <div className="adm-item-actions" style={{display: 'flex', gap: '8px'}}>
                      <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item)} style={{height:'32px', fontSize:'0.78rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', padding: '0 12px'}}><i className="fas fa-pen" style={{marginRight: '6px'}} /> Duzenle</button>
                      <button className="adm-btn adm-btn-danger" onClick={() => deleteItem(item)} style={{height:'32px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', cursor: 'pointer', padding: '0 12px'}}><i className="fas fa-trash" /></button>
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