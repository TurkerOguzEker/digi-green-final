// src/app/admin/security/page.js
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

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

export default function AdminSecurityPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [userIp, setUserIp] = useState('Bilinmiyor');

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
      const { count: msgCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { count: nCount } = await supabase.from('news').select('*', { count: 'exact', head: true });
      const { count: aCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      const { count: rCount } = await supabase.from('results').select('*', { count: 'exact', head: true });
        
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
        showToast('Sifre en az 6 karakter olmalidir.', 'error');
        return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { showToast('Sifre guncellenemedi: ' + error.message, 'error'); } 
    else { 
      showToast('Sifreniz basariyla guncellendi!', 'success'); 
      setNewPassword(''); 
      await logAction('Yonetici sifresi guncellendi.');
    }
  };

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'security',
      ip_address: userIp
    }]);
  }

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
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: typeof newsCount !== 'undefined' ? newsCount : (typeof news !== 'undefined' ? news.length : 0), group: 'Icerik', link: '/admin/news', active: currentPath === '/admin/news' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: typeof activitiesCount !== 'undefined' ? activitiesCount : (typeof activities !== 'undefined' ? activities.length : 0), group: 'Icerik', link: '/admin/activities', active: currentPath === '/admin/activities' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: typeof partnersCount !== 'undefined' ? partnersCount : (typeof partners !== 'undefined' ? partners.length : 0), group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: typeof resultsCount !== 'undefined' ? resultsCount : (typeof results !== 'undefined' ? results.length : 0), group: 'Icerik', link: '/admin/results', active: currentPath === '/admin/results' },
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
        .adm-layout, .adm-loading, .adm-toast { --bg: #0d1117; --surface: #161b22; --surface-2: #1c2333; --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.15); --accent: #22c55e; --accent-dim: rgba(34,197,94,0.12); --accent-glow: rgba(34,197,94,0.25); --text-primary: #e6edf3; --text-secondary: #7d8590; --text-muted: #484f58; --sidebar-w: 260px; --radius: 10px; --radius-lg: 14px; --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --transition: 0.18s cubic-bezier(0.4,0,0.2,1); }
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
        .adm-page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 4px; }
        
        .adm-form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
        .adm-form-card-title { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; justify-content: space-between; }
        .adm-form-card-title i { color: var(--accent); }
        
        .adm-form-item { display: flex; flex-direction: column; gap: 6px; }
        .adm-form-item label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .adm-input-full { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; width: 100%; }
        .adm-input-full:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        
        .adm-form-submit { width: 100%; height: 44px; background: var(--accent); color: #000; border: none; border-radius: 8px; font-family: var(--font); font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: var(--transition); margin-top: 4px; }
        .adm-form-submit:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 6px 18px var(--accent-glow); }

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
                  <i className="fas fa-lock" style={{ color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Sifre ve Guvenlik
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
              >
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1, paddingBottom: '1px', flexShrink: 0, boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)' }}>
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.email?.split('@')[0] || 'Admin'}
                </span>
                <i className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', opacity: 0.5, transition: 'transform 0.2s ease', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
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
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '10px', cursor: 'pointer', color: '#f87171', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s ease', textAlign: 'left' }}>
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
          </div>
        </main>
      </div>
    </>
  );
}