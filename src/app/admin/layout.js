'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import '../globals.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Bildirim State'leri
  const [loginAlerts, setLoginAlerts] = useState([]);
  const [notifLastSeen, setNotifLastSeen] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const notifRef = useRef(null);
  
  // Hareketsizlik Sayacı Ref'leri
  const inactivityTimerRef = useRef(null);
  const timeoutRef = useRef(30 * 60 * 1000); // Varsayılan: 30 dk
  
  const [navBadges, setNavBadges] = useState({ unreadMsgCount: 0, newsCount: 0, activitiesCount: 0, partnersCount: 0, resultsCount: 0 });

  const isMessagesPage = currentPath.includes('/admin/messages');
  
  // ✨ YENİ: Hangi sayfalarda "Sitede Görüntüle" butonunun gizleneceği ✨
  const hideViewButtonPaths = ['/admin/users', '/admin/logs', '/admin/security','/admin/messages'];
  const shouldShowViewButton = !hideViewButtonPaths.some(p => currentPath.includes(p));

  // ✨ YENİ: Hakkında alt sekmelerinin doğru linke yönlendirilmesi ✨
  const getViewUrl = () => {
    if (currentPath.includes('/admin/news')) return '/news';
    if (currentPath.includes('/admin/activities')) return '/activities';
    if (currentPath.includes('/admin/partners')) return '/partners';
    if (currentPath.includes('/admin/contact')) return '/contact';
    if (currentPath.includes('/admin/results')) return '/results';
    
    // Hakkında alt sayfaları için dinamik yönlendirme
    if (currentPath.includes('/admin/about')) {
      const tab = searchParams.get('tab');
      if (tab && tab !== 'general') return `/about/${tab}`;
      return '/about';
    }
    
    return '/'; 
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const fetchLayoutData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setCurrentUser(session.user);

    try {
      const promises = [
        supabase.from('user_profiles').select('role, notif_last_seen').eq('id', session.user.id).single(),
        supabase.from('login_logs')
                .select('*')
                .eq('status', 'success')
                .order('created_at', { ascending: false })
                .limit(10), // Son 10 başarılı girişi her zaman çek
      ];

      const [profileReq, loginLogsReq] = await Promise.all(promises);

      if (profileReq?.data) {
        setUserRole(profileReq.data.role);
        
        // ✨ YENİ: Bildirimleri sayma mantığı düzeltildi ✨
        // Eğer notif_last_seen yoksa (veya eskiyse), tüm logları yeni kabul et (geçmişe dair bir sınır koymadık ki çan yansın)
        const lastSeenDate = profileReq.data.notif_last_seen ? new Date(profileReq.data.notif_last_seen) : new Date(0);
        setNotifLastSeen(lastSeenDate);
        
        if (loginLogsReq?.data) {
          setLoginAlerts(loginLogsReq.data);
          // Bildirim ayarı kapalı mı kontrol et
          const savedAlerts = localStorage.getItem(`admin_alerts_${session.user.id}`);
          if (savedAlerts !== 'false') {
             const unseen = loginLogsReq.data.filter(log => new Date(log.created_at).getTime() > lastSeenDate.getTime()).length;
             setUnseenCount(unseen);
          }
        }
      }
    } catch (error) {
      console.error('Layout data fetch error:', error);
    }
  }, [router]);

  useEffect(() => {
    fetchLayoutData();
  }, [fetchLayoutData]);

  useEffect(() => {
    let channel;

    const logoutUser = async (reason) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          await supabase.from('login_logs').insert([{ 
            user_email: session.user.email, 
            location: reason === 'timeout' ? 'Zaman Aşımı' : 'Güvenlik Çıkışı', 
            status: 'logout' 
          }]);
        }
      } catch(e) {}
      
      localStorage.removeItem('digigreen_last_activity');
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      await supabase.auth.signOut();
      
      if (reason === 'timeout') alert('Uzun süre işlem yapmadığınız için oturumunuz kapatıldı.');
      else if (reason === 'blocked') alert('Hesabınız yönetici tarafından engellendi.');
      else if (reason === 'force') alert('Güvenlik nedeniyle oturumunuz sonlandırıldı.');
      
      window.location.href = '/login';
    };

    const updateActivityTime = () => {
      localStorage.setItem('digigreen_last_activity', Date.now().toString());
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        logoutUser('timeout');
      }, timeoutRef.current);
    };

    async function initSecurityAndListen() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; 

      const { data: profile } = await supabase.from('user_profiles').select('is_blocked').eq('id', session.user.id).single();
      if (profile?.is_blocked) {
        await logoutUser('blocked');
        return;
      }

      try {
        const { data: settings } = await supabase.from('system_settings').select('value').eq('id', 'session_timeout').single();
        if (settings?.value?.minutes) {
          timeoutRef.current = settings.value.minutes * 60 * 1000;
        }
      } catch(e) {}

      const lastActive = localStorage.getItem('digigreen_last_activity');
      if (lastActive && (Date.now() - parseInt(lastActive, 10)) > timeoutRef.current) {
        await logoutUser('timeout');
        return;
      }

      updateActivityTime();
      window.addEventListener('mousemove', updateActivityTime);
      window.addEventListener('keydown', updateActivityTime);
      window.addEventListener('click', updateActivityTime);
      window.addEventListener('scroll', updateActivityTime);

      channel = supabase
        .channel('security-watcher')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${session.user.id}` }, (payload) => {
            if (payload.new.is_blocked === true && payload.old.is_blocked === false) {
              logoutUser('blocked');
            } else if (payload.new.force_logout_at && payload.new.force_logout_at !== payload.old.force_logout_at) {
              logoutUser('force');
            }
          }
        ).subscribe();
    }

    initSecurityAndListen();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', updateActivityTime);
      window.removeEventListener('keydown', updateActivityTime);
      window.removeEventListener('click', updateActivityTime);
      window.removeEventListener('scroll', updateActivityTime);
    };
  }, []); 

  const fullNAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin', active: currentPath === '/admin', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: navBadges.unreadMsgCount, group: 'Genel', link: '/admin/messages', active: currentPath === '/admin/messages', roles: ['Super Admin', 'Admin', 'Editor'] },
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
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: navBadges.newsCount, group: 'Icerik', link: '/admin/news', active: currentPath === '/admin/news', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: navBadges.activitiesCount, group: 'Icerik', link: '/admin/activities', active: currentPath === '/admin/activities', roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: navBadges.partnersCount, group: 'Icerik', link: '/admin/partners', active: currentPath === '/admin/partners', roles: ['Super Admin', 'Admin'] },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: navBadges.resultsCount, group: 'Icerik', link: '/admin/results', active: currentPath === '/admin/results', roles: ['Super Admin', 'Admin', 'Editor'] },
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

  const fmtTime = (d) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeAgo = (dateStr) => {
      const diff = new Date() - new Date(dateStr);
      const minutes = Math.floor(diff / 60000);
      if(minutes < 1) return 'Az önce';
      if(minutes < 60) return `${minutes}dk önce`;
      const hours = Math.floor(minutes / 60);
      if(hours < 24) return `${hours}sa önce`;
      return `${Math.floor(hours / 24)}g önce`;
  };

  return (
    <div className="adm-layout">
      
      {!isMessagesPage && (
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/admin" className="adm-brand-card" title="Site Ana Sayfasina Git">
              <div className="adm-brand-icon">
                <i className="fas fa-leaf" />
              </div>
              <div className="adm-brand-text">
                <div className="adm-brand-logo"><span>DIGI-<span>GREEN</span></span></div>
                <div className="adm-brand-sub">
                  Yönetim Paneli <i className="fas fa-external-link-alt" style={{ marginLeft: 4, fontSize: '0.55rem' }} />
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
                        <button className={`adm-nav-btn${item.active ? ' active' : ''}`} onClick={() => setIsAboutMenuOpen(!isAboutMenuOpen)}>
                          <span className="adm-nav-icon"><i className={item.icon} /></span>
                          {item.label}
                          <i className={`fas fa-chevron-${isAboutMenuOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.5 }} />
                        </button>
                        {isAboutMenuOpen && (
                          <div className="adm-nav-submenu">
                            {item.subItems.map(sub => (
                              <button key={sub.id} className="adm-nav-subitem" onClick={() => router.push(`/admin/about?tab=${sub.tab}`, { scroll: false })}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', marginRight: 8, display: 'inline-block', opacity: 0.4 }} />
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
                      <Link href={item.link} key={item.id} className={`adm-nav-btn${item.active ? ' active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className="adm-nav-icon"><i className={item.icon} /></span>
                        {item.label}
                        {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                      </Link>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <div className="adm-online-dot" />
            <span style={{ fontSize: '0.72rem', color: '#484f58' }}>Canlı Bağlantı Aktif</span>
          </div>
        </aside>
      )}

      <main className="adm-main" style={isMessagesPage ? { marginLeft: 0 } : undefined}>
        
        <div className="adm-topbar" style={isMessagesPage ? { left: 0, width: '100%' } : undefined}>
          <div className="adm-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="adm-clock" style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-clock" style={{ fontSize: '0.85rem', marginRight: '6px', opacity: 0.7 }} />
              {fmtTime(currentTime)}
            </div>
            
            {/* ✨ SADECE GEREKLİ SAYFALARDA BUTONU GÖSTER ✨ */}
            {shouldShowViewButton && (
              <a 
                href={getViewUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '34px',
                  padding: '0 16px', background: 'var(--accent-dim)', color: 'var(--accent)', 
                  border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', fontSize: '0.78rem', 
                  fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s ease', lineHeight: 1
                }}
              >
                <i className="fas fa-external-link-alt" style={{ fontSize: '0.95rem', marginTop: '-1px' }}></i> 
                Sitede Görüntüle
              </a>
            )}
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', gap: '15px' }}>
            {(userRole === 'Super Admin' || userRole === 'Admin') && (
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button className={`adm-notif-btn ${notifOpen ? 'active' : ''}`} onClick={async () => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen && unseenCount > 0) {
                    const now = new Date().toISOString(); 
                    setUnseenCount(0);
                    if (currentUser?.id) { 
                      await supabase.from('user_profiles').update({ notif_last_seen: now }).eq('id', currentUser.id); 
                      setNotifLastSeen(new Date(now));
                    }
                  }
                }}>
                  <i className="fas fa-bell" />
                  {unseenCount > 0 && <span className="adm-notif-badge">{unseenCount}</span>}
                </button>

                {notifOpen && (
                  <div className="adm-notif-dropdown">
                    <div className="adm-notif-header">
                      <div className="adm-notif-title">Son Giriş Yapanlar</div>
                    </div>
                    <div className="adm-notif-body">
                      {loginAlerts.length === 0 ? (
                        <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginBottom: '10px', opacity: 0.4, display: 'block' }}></i>
                          Yeni bir giriş kaydı bulunmuyor.
                        </div>
                      ) : (
                        loginAlerts.map(alert => {
                          const isNew = notifLastSeen && new Date(alert.created_at).getTime() > notifLastSeen.getTime();
                          return (
                            <div key={alert.id} className={`adm-notif-item ${isNew ? 'is-new' : ''}`}>
                              <div className="adm-notif-icon"><i className="fas fa-right-to-bracket" /></div>
                              <div>
                                <div className="adm-notif-text"><span>{alert.user_email}</span> sisteme giriş yaptı.</div>
                                <div className="adm-notif-time"><i className="fas fa-desktop" /> {alert.device || 'Bilinmeyen'} • {timeAgo(alert.created_at)}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px 6px 6px', background: profileOpen ? 'var(--surface-3, rgba(255,255,255,0.08))' : 'var(--surface-2, rgba(255,255,255,0.04))', border: '1px solid', borderColor: profileOpen ? 'var(--accent, #6366f1)' : 'var(--border, rgba(255,255,255,0.08))', borderRadius: '999px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s ease', outline: 'none', userSelect: 'none' }}>
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
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{currentUser?.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (currentUser?.email) {
                          await supabase.from('login_logs').insert([{ user_email: currentUser.email, location: 'Çıkış Yapıldı', status: 'logout' }]);
                        }
                        localStorage.removeItem('digigreen_last_activity');
                        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                        await supabase.auth.signOut(); 
                        router.push('/login'); 
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '10px', cursor: 'pointer', color: '#f87171', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s ease', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.9rem', width: '16px' }} /> Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {children}
        
      </main>
    </div>
  );
}