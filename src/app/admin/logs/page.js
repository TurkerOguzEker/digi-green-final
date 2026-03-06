'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

export default function LogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  
  // ✨ LOG VE SAYFALAMA (PAGINATION) STATE'LERİ ✨
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef(null);
  const LOGS_PER_PAGE = 30; // Her kaydırmada yüklenecek log sayısı
  
  // ✨ ARAMA KUTUSU STATE'İ ✨
  const [searchQuery, setSearchQuery] = useState('');
  
  // Badge Counts
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  // ✨ LOGLARI SUPABASE'DEN SAYFA SAYFA ÇEKEN FONKSİYON ✨
  const fetchLogs = useCallback(async (pageNumber) => {
    setIsFetchingMore(true);
    const from = pageNumber * LOGS_PER_PAGE;
    const to = from + LOGS_PER_PAGE - 1;

    const { data: logData, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && logData) {
      // Eğer gelen veri limitimizden azsa, demek ki veritabanında daha fazla log kalmadı
      if (logData.length < LOGS_PER_PAGE) {
        setHasMore(false);
      }
      
      setLogs(prevLogs => {
        // Eğer ilk sayfaysa direkt datayı koy, değilse eski listenin sonuna ekle
        if (pageNumber === 0) return logData;
        return [...prevLogs, ...logData];
      });
    } else {
      setHasMore(false);
    }
    setIsFetchingMore(false);
  }, []);

  // ✨ İLK YÜKLEME ✨
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      if (isMounted) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
        if (profile) setUserRole(profile.role);
      }

      // İlk sayfa logları çek
      await fetchLogs(0);

      // Badge bildirim sayilari
      const [msg, n, act, par, res] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true })
      ]);

      if (isMounted) {
        if (msg?.count) setUnreadMsgCount(msg.count);
        if (n?.count) setNewsCount(n.count);
        if (act?.count) setActivitiesCount(act.count);
        if (par?.count) setPartnersCount(par.count);
        if (res?.count) setResultsCount(res.count);
        setLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [router, fetchLogs]);

  // ✨ SCROLL TAKİBİ (SAYFANIN ALTINA GELDİĞİNİ ANLAMA) ✨
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      // Kullanıcı loader div'ini gördüyse, yüklenecek veri varsa, şu an yüklenmiyorsa ve ARAMA YAPILMIYORSA sayfa sayısını artır
      if (target.isIntersecting && hasMore && !isFetchingMore && !loading && !searchQuery) {
        setPage((prevPage) => prevPage + 1);
      }
    }, {
      root: null,
      rootMargin: '20px', // Div'e 20px kala tetikle
      threshold: 1.0
    });

    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, isFetchingMore, loading, searchQuery]);

  // Sayfa sayısı arttıkça yeni logları çek
  useEffect(() => {
    if (page > 0) {
      fetchLogs(page);
    }
  }, [page, fetchLogs]);

  // ✨ LOGLARI FİLTRELEME İŞLEMİ ✨
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user_email?.toLowerCase().includes(q) ||
      log.page_section?.toLowerCase().includes(q) ||
      log.ip_address?.toLowerCase().includes(q)
    );
  });

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

  const currentTab = fullNAV.find(n => n.id === 'logs');

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Loglar yukleniyor...</p></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');
        .adm-layout, .adm-loading { --bg: #0d1117; --surface: #161b22; --surface-2: #1c2333; --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.15); --accent: #22c55e; --accent-dim: rgba(34,197,94,0.12); --accent-glow: rgba(34,197,94,0.25); --blue: #3b82f6; --blue-dim: rgba(59,130,246,0.12); --red: #ef4444; --red-dim: rgba(239,68,68,0.12); --yellow: #f59e0b; --text-primary: #e6edf3; --text-secondary: #7d8590; --text-muted: #484f58; --sidebar-w: 260px; --radius: 10px; --radius-lg: 14px; --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --transition: 0.18s cubic-bezier(0.4,0,0.2,1); }
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

        .adm-nav-submenu { display: flex; flex-direction: column; gap: 2px; padding-left: 38px; padding-right: 8px; margin-top: 2px; margin-bottom: 8px; animation: fadeDown 0.2s ease;}
        .adm-nav-subitem { display: flex; align-items: center; padding: 8px 12px; font-size: 0.8rem; color: var(--text-secondary); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: var(--transition); text-align: left; }
        .adm-nav-subitem:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
        .adm-nav-subitem.active { color: var(--accent); background: var(--accent-dim); font-weight: 600; }

        .adm-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        
        /* ✨ SABİT (FIXED) HEADER CSS GÜNCELLEMESİ ✨ */
        .adm-topbar { height: 76px; background: rgba(22, 27, 34, 0.85); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: fixed; top: 0; left: var(--sidebar-w); width: calc(100% - var(--sidebar-w)); z-index: 50; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .adm-content { padding: 108px 32px 32px 32px; flex: 1; max-width: 1600px; margin: 0 auto; width: 100%; }
        
        .adm-topbar-title { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--text-primary); flex: 1; }
        
        .adm-page-header { margin-bottom: 28px; }
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-page-desc { font-size: 0.875rem; color: var(--text-secondary); margin-top: 4px; }
        
        .adm-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 12px; }
        .adm-badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .adm-badge-blue { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.25); }

        /* YENI ARAMA KUTUSU CSS */
        .adm-search-wrap { position: relative; margin-bottom: 16px; width: 100%; display: flex; align-items: center; }
        .adm-search-wrap i { position: absolute; left: 14px; color: var(--text-muted); font-size: 0.85rem; }
        .adm-search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px 10px 38px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; transition: all var(--transition); outline: none; }
        .adm-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: var(--surface-2); }
        .adm-search-clear { position: absolute; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: color var(--transition); }
        .adm-search-clear:hover { color: var(--text-primary); }

        .adm-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; font-family: var(--font); color: var(--text-primary); }
        .adm-loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .adm-fade-in { animation: fadeUp 0.25s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/admin" className="adm-brand-card" title="Yonetim Paneline Git">
              <div className="adm-brand-icon">
                <i className="fas fa-leaf" />
              </div>
              <div className="adm-brand-text">
                <div className="adm-brand-logo">DIGI-<span>GREEN</span></div>
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
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '240px', background: '#111318', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset', zIndex: 100, animation: 'topbarDropdown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
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
                        if (currentUser?.email) {
                          await supabase.from('login_logs').insert([{ 
                            user_email: currentUser.email, 
                            location: 'Çıkış Yapıldı', 
                            status: 'logout' 
                          }]);
                        }
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
              
              {/* ✨ GÜNCELLENMİŞ BAŞLIK VE ARAMA ALANI ✨ */}
              <div className="adm-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div className="adm-page-title">Sistem <em>Loglari</em></div>
                  <div className="adm-page-desc">Admin paneli uzerinde gerceklestirilen etkinlikler.</div>
                </div>
                
                {/* ARAMA KUTUSU */}
                <div className="adm-search-wrap" style={{ width: '300px', marginBottom: 0 }}>
                  <i className="fas fa-search" />
                  <input 
                    type="text" 
                    className="adm-search-input" 
                    placeholder="İşlem, e-posta veya ip ara..." 
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
              
              <div className="adm-card" style={{padding: '0'}}>
                <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                   <thead>
                     <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                       <th style={{padding: '16px 20px'}}>Islem Tarihi</th>
                       <th style={{padding: '16px 20px'}}>Sayfa / Sekme</th>
                       <th style={{padding: '16px 20px'}}>Islem Tipi</th>
                       <th style={{padding: '16px 20px'}}>Kullanici & IP Adresi</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredLogs.length === 0 ? (
                       <tr>
                         <td colSpan="4" style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                           {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henuz bir islem logu bulunmuyor.'}
                         </td>
                       </tr>
                     ) : filteredLogs.map((log) => (
                       <tr key={log.id} style={{borderBottom: '1px solid var(--border)'}}>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                           {new Date(log.created_at).toLocaleString('tr-TR')}
                         </td>
                         <td style={{padding: '16px 20px'}}>
                           <span className="adm-badge adm-badge-blue" style={{textTransform:'uppercase'}}>{log.page_section || 'Genel'}</span>
                         </td>
                         <td style={{padding: '16px 20px', fontWeight: '500', color: 'var(--text-primary)'}}>
                            <i className="fas fa-check-circle" style={{marginRight:'8px', color:'var(--accent)'}}></i>
                            {log.action}
                         </td>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-muted)'}}>
                           <div style={{color:'var(--text-primary)', marginBottom:'4px'}}><i className="fas fa-user" style={{marginRight:'5px'}}></i>{log.user_email}</div>
                           <div style={{fontSize:'0.75rem', opacity:0.7}}><i className="fas fa-network-wired" style={{marginRight:'5px'}}></i>{log.ip_address || 'Bilinmiyor'}</div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 
                 {/* ✨ İNFINITE SCROLL YÜKLEME GÖSTERGESİ ✨ */}
                 {hasMore && !searchQuery && (
                    <div ref={loaderRef} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {isFetchingMore ? (
                        <span><i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i> Daha fazla log yükleniyor...</span>
                      ) : (
                        <span>Aşağı kaydırarak devam edin...</span>
                      )}
                    </div>
                 )}
                 
                 {/* ✨ TÜM VERİ BİTTİĞİNDE ÇIKAN UYARI ✨ */}
                 {!hasMore && logs.length > 0 && !searchQuery && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>
                      Mevcut tüm logların sonuna ulaştınız.
                    </div>
                 )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}