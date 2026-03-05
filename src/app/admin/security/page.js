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
      <div className="adm-toast-text"><strong>{type === 'error' ? 'Hata' : 'Basarili'}</strong><span>{message}</span></div>
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
        <div className="adm-modal-icon"><i className="fas fa-exclamation-triangle" style={{color:'var(--red)'}} /></div>
        <h3>Emin misiniz?</h3><p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgeç</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Onayla</button>
        </div>
      </div>
    </div>
  );
};

/* ─── PASSWORD STRENGTH ─── */
const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Çok Zayıf', color: '#ef4444' };
    if (score === 2) return { score, label: 'Zayıf', color: '#f97316' };
    if (score === 3) return { score, label: 'Orta', color: '#eab308' };
    if (score === 4) return { score, label: 'Güçlü', color: '#22c55e' };
    return { score: 5, label: 'Çok Güçlü', color: '#10b981' };
  };
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= score ? color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color, fontWeight: 600, letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );
};

/* ─── SECURITY SCORE ─── */
const SecurityScore = ({ score }) => {
  const [animated, setAnimated] = useState(0);
  const circumference = 2 * Math.PI * 54;
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(t);
  }, [score]);
  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Güvenli' : score >= 60 ? 'Orta' : 'Riskli';
  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>
          {animated}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

/* ─── TOGGLE ─── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? '#22c55e' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.25s ease', flexShrink: 0, opacity: disabled ? 0.5 : 1
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
      transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
    }} />
  </button>
);

export default function AdminSecurityPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); // ✨ KULLANICI ROLÜ
  const [userIp, setUserIp] = useState('Bilinmiyor');
  const [userAgent, setUserAgent] = useState('Bilinmeyen Cihaz');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [securityScore, setSecurityScore] = useState(0);

  // Dinamik Veriler
  const [actionLogs, setActionLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // Badge Counts
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

  const computeScore = useCallback(() => {
    let s = 50;
    if (loginAlerts) s += 25;
    if (parseInt(sessionTimeout) <= 30) s += 25;
    setSecurityScore(s);
  }, [loginAlerts, sessionTimeout]);

  useEffect(() => { computeScore(); }, [computeScore]);

  const parseUserAgent = (ua) => {
    let browser = "Tarayıcı"; let os = "İşletim Sistemi";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    return `${browser} — ${os}`;
  };

  const fetchPageData = useCallback(async (userEmail) => {
    try {
      const { count: msgCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { count: nCount } = await supabase.from('news').select('*', { count: 'exact', head: true });
      const { count: aCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
      if (msgCount) setUnreadMsgCount(msgCount);
      if (nCount) setNewsCount(nCount);
      if (aCount) setActivitiesCount(aCount);

      if (userEmail) {
        // Son İşlemler (Tüm admin işlemleri)
        const { data: logs } = await supabase.from('admin_logs').select('*').eq('user_email', userEmail).order('created_at', { ascending: false }).limit(5);
        if (logs) setActionLogs(logs);

        // Giriş Geçmişi (Sadece login/logout)
        const { data: logins } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(6);
        if (logins) setLoginHistory(logins);
      }
    } catch (error) {
      console.error('Veri hatasi:', error);
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
        setUserAgent(parseUserAgent(navigator.userAgent));
        
        const savedAlerts = localStorage.getItem(`admin_alerts_${session.user.id}`);
        const savedTimeout = localStorage.getItem(`admin_timeout_${session.user.id}`);
        if (savedAlerts !== null) setLoginAlerts(savedAlerts === 'true');
        if (savedTimeout !== null) setSessionTimeout(savedTimeout);
      }

      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        if (isMounted) setUserIp(data.ip);
      } catch (e) {}

      await fetchPageData(session.user.email);
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchPageData]);

  // ✨ OTOMATİK ÇIKIŞ (INACTIVITY TIMEOUT) SİSTEMİ ✨
  useEffect(() => {
    if (!currentUser) return;
    let timeoutId;
    const timeoutMs = parseInt(sessionTimeout) * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        // Süre dolduğunda çıkış yap ve log kaydet
        await supabase.from('admin_logs').insert([{ action: 'Sistemden otomatik çıkış yapıldı (Zaman Aşımı)', user_email: currentUser.email, page_section: 'Güvenlik', ip_address: userIp }]);
        await supabase.from('login_logs').insert([{ user_email: currentUser.email, device: userAgent, location: 'Zaman Aşımı', ip_address: userIp, status: 'error' }]);
        await supabase.auth.signOut();
        router.push('/login');
      }, timeoutMs);
    };

    // Kullanıcının fare, klavye veya scroll hareketlerini dinle
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // İlk sayacı başlat

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [currentUser, sessionTimeout, userIp, userAgent, router]);

  // Ayarları Kaydetme
  const handleAlertToggle = (v) => {
    setLoginAlerts(v);
    localStorage.setItem(`admin_alerts_${currentUser?.id}`, v);
    showToast(v ? 'Giriş bildirimleri açıldı.' : 'Giriş bildirimleri kapatıldı.');
  };

  const handleTimeoutChange = (e) => {
    const v = e.target.value;
    setSessionTimeout(v);
    localStorage.setItem(`admin_timeout_${currentUser?.id}`, v);
    showToast(`Oturum zaman aşımı ${v} dakika olarak ayarlandı.`);
  };

  // Tüm Oturumları Sonlandırma
  const handleGlobalSignOut = () => {
    showConfirm('Bu işlem, tüm cihazlardaki oturumlarınızı kapatacaktır. Yeniden giriş yapmanız gerekecek. Onaylıyor musunuz?', async () => {
      try {
        await logAction('Sistemden güvenli çıkış yapıldı.');
        await supabase.from('login_logs').insert([{ user_email: currentUser.email, device: userAgent, location: 'Güvenli Çıkış', ip_address: userIp, status: 'success' }]);
        await supabase.auth.signOut({ scope: 'global' });
        router.push('/login');
      } catch (err) {
        showToast('Çıkış yapılamadı.', 'error');
      }
      closeConfirm();
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { showToast('Yeni şifre en az 6 karakter olmalıdır.', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('Yeni şifreler eşleşmiyor!', 'error'); return; }
    setSubmitting(true);
    try {
      if (oldPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: oldPassword });
        if (verifyError) throw new Error('Mevcut şifrenizi yanlış girdiniz!');
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      showToast('Şifreniz başarıyla güncellendi!', 'success');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      await logAction('Yönetici şifresi güncellendi.');
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{
      action: actionDescription,
      user_email: currentUser.email,
      page_section: 'Güvenlik',
      ip_address: userIp
    }]);
    fetchPageData(currentUser.email); 
  }

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

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-loading-spinner" />
      <p>Yükleniyor...</p>
    </div>
  );

  const scoreColor = securityScore >= 70 ? '#22c55e' : securityScore >= 50 ? '#eab308' : '#ef4444';
  const scoreLabel = securityScore >= 70 ? 'Hesabınız güvende' : securityScore >= 50 ? 'Güvenliği artırın' : 'Acil önlem alın';

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); }} onCancel={closeConfirm} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0a0d12;
          --surface: #111318;
          --surface-2: #181d26;
          --surface-3: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.14);
          --accent: #22c55e;
          --accent-dim: rgba(34,197,94,0.1);
          --accent-glow: rgba(34,197,94,0.22);
          --red: #ef4444;
          --red-dim: rgba(239,68,68,0.1);
          --yellow: #eab308;
          --yellow-dim: rgba(234,179,8,0.1);
          --blue: #3b82f6;
          --blue-dim: rgba(59,130,246,0.1);
          --text-primary: #e8edf5;
          --text-secondary: #7a8494;
          --text-muted: #3d4450;
          --sidebar-w: 260px;
          --radius: 10px;
          --radius-lg: 14px;
          --font: 'DM Sans', sans-serif;
          --font-display: 'Syne', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-layout { font-family: var(--font); background: var(--bg); color: var(--text-primary); display: flex; min-height: 100vh; width: 100%; -webkit-font-smoothing: antialiased; }

        /* ── SIDEBAR ── */
        .adm-sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
        .adm-sidebar::-webkit-scrollbar { width: 3px; }
        .adm-sidebar::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }

        .adm-brand-wrapper { padding: 20px 16px; border-bottom: 1px solid var(--border); }
        .adm-brand-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; }
        .adm-brand-card:hover { background: var(--accent-dim); border-color: rgba(34,197,94,0.2); transform: translateY(-1px); }
        .adm-brand-icon { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; flex-shrink: 0; box-shadow: 0 4px 12px rgba(34,197,94,0.35); }
        .adm-brand-logo { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: #fff; display: block; }
        .adm-brand-logo span { color: #22c55e; }
        .adm-brand-sub { font-size: 0.6rem; color: var(--text-secondary); letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; display: flex; align-items: center; gap: 5px; transition: color 0.3s; }
        .adm-brand-card:hover .adm-brand-sub { color: var(--accent); }

        .adm-nav { padding: 14px 10px; flex: 1; }
        .adm-nav-section { margin-bottom: 22px; }
        .adm-nav-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); padding: 0 8px; margin-bottom: 6px; }
        .adm-nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: var(--transition); text-align: left; margin-bottom: 1px; }
        .adm-nav-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .adm-nav-btn.active { background: var(--accent-dim); color: var(--accent); }
        .adm-nav-btn.active .adm-nav-icon { color: var(--accent); }
        .adm-nav-icon { width: 16px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; flex-shrink: 0; }
        .adm-nav-badge { margin-left: auto; background: var(--accent); color: #000; font-size: 0.62rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center; }
        .adm-nav-submenu { display: flex; flex-direction: column; gap: 1px; padding-left: 34px; padding-right: 6px; margin: 2px 0 6px; animation: fadeDown 0.2s ease; }
        .adm-nav-subitem { display: flex; align-items: center; padding: 7px 10px; font-size: 0.78rem; color: var(--text-secondary); background: transparent; border: none; border-radius: 7px; cursor: pointer; transition: var(--transition); text-align: left; gap: 8px; }
        .adm-nav-subitem:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }

        /* ── MAIN ── */
        .adm-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .adm-topbar { height: 70px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(10px); }

        .adm-content { padding: 28px 32px; flex: 1; }

        /* ── PAGE HEADER ── */
        .adm-page-header { margin-bottom: 28px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
        .adm-page-title { font-family: var(--font-display); font-size: 1.55rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1.1; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-page-desc { font-size: 0.83rem; color: var(--text-secondary); margin-top: 5px; }

        /* ── GRID ── */
        .sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .sec-full { grid-column: 1 / -1; }

        /* ── CARD ── */
        .sec-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px; transition: border-color var(--transition); }
        .sec-card:hover { border-color: var(--border-hover); }
        .sec-card-title { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .sec-card-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; flex-shrink: 0; }

        /* ── SCORE CARD ── */
        .score-card { background: linear-gradient(135deg, #111318, #0f1520); border: 1px solid var(--border); border-radius: 18px; padding: 26px; display: flex; align-items: center; gap: 28px; position: relative; overflow: hidden; }
        .score-card::before { content: ''; position: absolute; top: -60px; right: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .score-info { flex: 1; }
        .score-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 6px; }
        .score-label { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
        .score-tips { display: flex; flex-direction: column; gap: 5px; }
        .score-tip { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-secondary); }
        .score-tip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* ── FORM ── */
        .form-grid { display: flex; flex-direction: column; gap: 14px; }
        .form-item label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .inp-wrap { position: relative; }
        .adm-input { width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 40px 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; }
        .adm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .adm-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .inp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.82rem; transition: color var(--transition); padding: 4px; }
        .inp-eye:hover { color: var(--text-primary); }
        .adm-submit { width: 100%; height: 42px; background: var(--accent); color: #000; border: none; border-radius: 9px; font-family: var(--font); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 4px; }
        .adm-submit:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); box-shadow: 0 6px 20px var(--accent-glow); }
        .adm-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── TOGGLE ROW ── */
        .toggle-list { display: flex; flex-direction: column; gap: 2px; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; background: var(--surface-2); border: 1px solid transparent; transition: border-color var(--transition); gap: 16px; }
        .toggle-row:hover { border-color: var(--border-hover); }
        .toggle-info { flex: 1; min-width: 0; }
        .toggle-info strong { display: block; font-size: 0.84rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .toggle-info span { font-size: 0.76rem; color: var(--text-secondary); }
        .toggle-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; }
        .tb-green { background: var(--accent-dim); color: var(--accent); }
        .tb-gray { background: rgba(255,255,255,0.06); color: var(--text-muted); }

        /* ── SESSION TIMEOUT ── */
        .timeout-select { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.82rem; padding: 6px 10px; outline: none; cursor: pointer; transition: border-color var(--transition); }
        .timeout-select:focus { border-color: var(--accent); }

        /* ── SESSIONS ── */
        .session-list { display: flex; flex-direction: column; gap: 8px; }
        .session-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--surface-2); border-radius: 10px; border: 1px solid transparent; transition: border-color var(--transition); }
        .session-row.current { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.04); }
        .session-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-3); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; color: var(--text-secondary); flex-shrink: 0; }
        .session-row.current .session-icon { color: var(--accent); }
        .session-info { flex: 1; min-width: 0; }
        .session-device { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .session-meta { font-size: 0.73rem; color: var(--text-secondary); margin-top: 2px; display: flex; align-items: center; gap: 8px; }
        .session-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
        .session-ip { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); flex-shrink: 0; }
        .session-current-badge { background: var(--accent-dim); color: var(--accent); font-size: 0.62rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; letter-spacing: 0.05em; }

        /* ── HISTORY ── */
        .history-list { display: flex; flex-direction: column; }
        .history-row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid var(--border); }
        .history-row:last-child { border-bottom: none; }
        .history-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .hi-success { background: var(--accent-dim); color: var(--accent); }
        .hi-error { background: var(--red-dim); color: var(--red); }
        .history-info { flex: 1; min-width: 0; }
        .history-device { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
        .history-loc { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; display: flex; gap: 6px; align-items: center; }
        .history-time { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; }

        /* ── DANGER ZONE ── */
        .danger-card { background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .danger-btn { background: none; border: 1px solid rgba(239,68,68,0.35); color: var(--red); border-radius: 9px; padding: 9px 18px; font-family: var(--font); font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all var(--transition); white-space: nowrap; }
        .danger-btn:hover { background: var(--red-dim); border-color: var(--red); }

        /* ── IP BADGE ── */
        .ip-badge { font-family: var(--font-mono); font-size: 0.72rem; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 3px 10px; color: var(--text-secondary); }

        /* ── UTILITIES ── */
        .adm-fade-in { animation: fadeUp 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .adm-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; font-family: var(--font); color: var(--text-primary); }
        .adm-loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .adm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .adm-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 400px; max-width: 90vw; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1); }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .adm-modal-icon { width: 48px; height: 48px; background: var(--red-dim); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--red); margin: 0 auto 16px; }
        .adm-modal h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
        .adm-modal p { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
        .adm-modal-btns { display: flex; gap: 10px; justify-content: center; }

        .adm-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; background: #151a22; border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 12px; min-width: 280px; animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1); }
        .adm-toast-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .adm-toast-icon.success { background: var(--accent-dim); color: var(--accent); }
        .adm-toast-icon.error { background: var(--red-dim); color: var(--red); }
        .adm-toast-text strong { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
        .adm-toast-text span { font-size: 0.8rem; color: var(--text-secondary); }
        .adm-toast-close { margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 4px; transition: color var(--transition); flex-shrink: 0; }
        .adm-toast-close:hover { color: var(--text-primary); }
        @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) { .sec-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="adm-layout">
        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/admin" className="adm-brand-card">
              <div className="adm-brand-icon"><i className="fas fa-leaf" /></div>
              <div>
                <div className="adm-brand-logo"><span>DIGI-<span>GREEN</span></span></div>
                <div className="adm-brand-sub">Yönetim Paneli <i className="fas fa-external-link-alt" style={{ fontSize: '0.55rem' }} /></div>
              </div>
            </Link>
          </div>
          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
                <div className="adm-nav-label">{group}</div>
                {items.map(item => {
                  if (item.subItems) return (
                    <div key={item.id}>
                      <button className={`adm-nav-btn ${item.active ? 'active' : ''}`} onClick={() => setIsAboutMenuOpen(!isAboutMenuOpen)}>
                        <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                        <i className={`fas fa-chevron-${isAboutMenuOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.5 }} />
                      </button>
                      {isAboutMenuOpen && (
                        <div className="adm-nav-submenu">
                          {item.subItems.map(sub => (
                            <button key={sub.id} className="adm-nav-subitem" onClick={() => router.push(`/admin/about?tab=${sub.tab}`)}>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', opacity: 0.4, flexShrink: 0 }} />
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  if (item.link) return (
                    <Link href={item.link} key={item.id} className={`adm-nav-btn ${item.active ? 'active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                      {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                    </Link>
                  );
                  return null;
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="adm-main">
          {/* TOPBAR */}
          <div className="adm-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent), #16a34a)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                <i className="fas fa-shield-halved" style={{ color: '#fff', fontSize: '0.8rem' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>Güvenlik Merkezi</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: profileOpen ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: profileOpen ? 'var(--accent)' : 'var(--border)', borderRadius: '999px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', outline: 'none' }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}>
                  {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: '0.83rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email?.split('@')[0] || 'Admin'}</span>
                <i className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem', opacity: 0.5 }} />
              </button>
              {profileOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '230px', background: '#111318', border: '1px solid var(--border)', borderRadius: '14px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 100, animation: 'topbarDropdown 0.18s ease' }}>
                    <div style={{ padding: '12px 14px', marginBottom: '6px', background: 'var(--surface-3)', borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', flexShrink: 0, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Oturum açık</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{currentUser?.email}</div>
                      </div>
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '9px', cursor: 'pointer', color: '#f87171', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s' }}>
                      <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.85rem' }} />Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="adm-content">
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div>
                  <div className="adm-page-title">Güvenlik & <em>Şifre</em></div>
                  <div className="adm-page-desc">Hesabınızı koruyun, oturumları yönetin ve güvenlik ayarlarını yapılandırın.</div>
                </div>
              </div>

              {/* ── SECURITY SCORE CARD ── */}
              <div className="score-card" style={{ marginBottom: '20px' }}>
                <SecurityScore score={securityScore} />
                <div className="score-info">
                  <div className="score-title">Güvenlik Skoru</div>
                  <div className="score-label" style={{ color: scoreColor }}>{scoreLabel}</div>
                  <div className="score-tips">
                    <div className="score-tip">
                      <div className="score-tip-dot" style={{ background: loginAlerts ? '#22c55e' : '#eab308' }} />
                      <span>{loginAlerts ? 'Giriş bildirimleri açık — +25 puan' : 'Giriş bildirimleri kapalı'}</span>
                    </div>
                    <div className="score-tip">
                      <div className="score-tip-dot" style={{ background: parseInt(sessionTimeout) <= 30 ? '#22c55e' : '#eab308' }} />
                      <span>Oturum zaman aşımı: {sessionTimeout} dk</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>IP Adresiniz</div>
                  <div className="ip-badge">{userIp}</div>
                  <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <i className="fas fa-clock" style={{ marginRight: '5px' }} />Son kontrol: şimdi
                  </div>
                </div>
              </div>

              <div className="sec-grid">

                {/* ── ŞİFRE GÜNCELLE ── */}
                <div className="sec-card">
                  <div className="sec-card-title">
                    <div className="sec-card-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                      <i className="fas fa-key" />
                    </div>
                    Şifre Güncelle
                  </div>
                  <form onSubmit={handlePasswordChange} className="form-grid">
                    <div className="form-item">
                      <label>Giriş Yapılan Hesap</label>
                      <input className="adm-input" value={currentUser?.email || ''} disabled />
                    </div>
                    <div className="form-item">
                      <label>Mevcut Şifre <span style={{ color: 'var(--red)' }}>*</span></label>
                      <div className="inp-wrap">
                        <input type={showOld ? 'text' : 'password'} placeholder="Mevcut şifreniz..." className="adm-input" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                        <button type="button" className="inp-eye" onClick={() => setShowOld(!showOld)}>
                          <i className={`fas fa-eye${showOld ? '-slash' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="form-item">
                      <label>Yeni Şifre <span style={{ color: 'var(--red)' }}>*</span></label>
                      <div className="inp-wrap">
                        <input type={showNew ? 'text' : 'password'} placeholder="En az 6 karakter..." className="adm-input" minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <button type="button" className="inp-eye" onClick={() => setShowNew(!showNew)}>
                          <i className={`fas fa-eye${showNew ? '-slash' : ''}`} />
                        </button>
                      </div>
                      <PasswordStrength password={newPassword} />
                    </div>
                    <div className="form-item">
                      <label>Yeni Şifre (Tekrar) <span style={{ color: 'var(--red)' }}>*</span></label>
                      <div className="inp-wrap">
                        <input type="password" placeholder="Şifreyi tekrar girin..." className="adm-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        {confirmPassword && (
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: newPassword === confirmPassword ? '#22c55e' : '#ef4444' }}>
                            <i className={`fas fa-${newPassword === confirmPassword ? 'check' : 'xmark'}`} />
                          </span>
                        )}
                      </div>
                    </div>
                    <button type="submit" className="adm-submit" disabled={submitting}>
                      {submitting ? <><i className="fas fa-spinner fa-spin" style={{marginRight:'5px'}}></i> Güncelleniyor...</> : <><i className="fas fa-shield-halved" style={{marginRight:'5px'}}></i> Şifreyi Güncelle</>}
                    </button>
                  </form>
                </div>

                {/* ── GÜVENLİK AYARLARI ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="sec-card">
                    <div className="sec-card-title">
                      <div className="sec-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                        <i className="fas fa-sliders" />
                      </div>
                      Güvenlik Ayarları
                    </div>
                    <div className="toggle-list">
                      <div className="toggle-row">
                        <div className="toggle-info">
                          <strong>Giriş Bildirimleri</strong>
                          <span>Yeni giriş yapıldığında e-posta bildir</span>
                        </div>
                        <span className={`toggle-badge ${loginAlerts ? 'tb-green' : 'tb-gray'}`}>{loginAlerts ? 'Açık' : 'Kapalı'}</span>
                        <Toggle checked={loginAlerts} onChange={handleAlertToggle} />
                      </div>
                      <div className="toggle-row">
                        <div className="toggle-info">
                          <strong>Oturum Zaman Aşımı</strong>
                          <span>Hareketsizlik sonrası oturumu kapat</span>
                        </div>
                        <select className="timeout-select" value={sessionTimeout} onChange={handleTimeoutChange}>
                          <option value="15">15 dk</option>
                          <option value="30">30 dk</option>
                          <option value="60">1 saat</option>
                          <option value="120">2 saat</option>
                          <option value="480">8 saat</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── TEHLİKELİ BÖLGE ── */}
                  <div className="sec-card" style={{ borderColor: 'rgba(239,68,68,0.12)', padding: '18px 20px' }}>
                    <div className="sec-card-title" style={{ marginBottom: '14px' }}>
                      <div className="sec-card-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
                        <i className="fas fa-triangle-exclamation" />
                      </div>
                      Tehlikeli Bölge
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="danger-card">
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Tüm Oturumları Sonlandır</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tüm cihazlardaki aktif oturumları kapat</div>
                        </div>
                        <button className="danger-btn" onClick={handleGlobalSignOut}>
                          <i className="fas fa-right-from-bracket" style={{ marginRight: '6px' }} />Sonlandır
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── AKTİF OTURUMLAR (Dinamik Cihaz Bilgisi) ── */}
                <div className="sec-card sec-full">
                  <div className="sec-card-title">
                    <div className="sec-card-icon" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308' }}>
                      <i className="fas fa-display" />
                    </div>
                    Aktif Oturumlar
                  </div>
                  <div className="session-list">
                    <div className="session-row current">
                      <div className="session-icon">
                        <i className={userAgent.includes('Mobile') || userAgent.includes('iOS') || userAgent.includes('Android') ? 'fas fa-mobile-screen' : 'fas fa-desktop'} />
                      </div>
                      <div className="session-info">
                        <div className="session-device">{userAgent}</div>
                        <div className="session-meta">
                          <i className="fas fa-location-dot" style={{ fontSize: '0.65rem', opacity: 0.5 }} />
                          Tahmini Konum
                          <span className="dot" />
                          Şu an aktif
                        </div>
                      </div>
                      <div className="session-ip">{userIp}</div>
                      <span className="session-current-badge"><i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px', animation: 'pulse 2s infinite' }} />Aktif Cihaz</span>
                    </div>
                  </div>
                </div>

                {/* ── GİRİŞ GEÇMİŞİ (Dinamik Login Logları) ── */}
                <div className="sec-card sec-full">
                  <div className="sec-card-title">
                    <div className="sec-card-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                      <i className="fas fa-right-to-bracket" />
                    </div>
                    Giriş & Çıkış Geçmişi
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Sisteme yapılan tüm girişler</span>
                  </div>
                  <div className="history-list">
                    {loginHistory.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Henüz giriş geçmişi bulunmuyor.
                      </div>
                    ) : (
                      loginHistory.map(h => (
                        <div key={h.id} className="history-row">
                          <div className={`history-icon ${h.status === 'success' ? 'hi-success' : 'hi-error'}`}>
                            <i className={h.status === 'success' ? 'fas fa-check' : 'fas fa-xmark'} />
                          </div>
                          <div className="history-info">
                            <div className="history-device" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {h.user_email} 
                              <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 'normal' }}>({h.device})</span>
                            </div>
                            <div className="history-loc">
                              <i className="fas fa-location-dot" style={{ fontSize: '0.62rem', opacity: 0.5 }} />
                              {h.location} • <span style={{ fontFamily: 'var(--font-mono)' }}>{h.ip_address}</span>
                            </div>
                          </div>
                          <div className="history-time">
                            {new Date(h.created_at).toLocaleString('tr-TR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── SON İŞLEMLER (Dinamik Admin Logları) ── */}
                <div className="sec-card sec-full">
                  <div className="sec-card-title">
                    <div className="sec-card-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                      <i className="fas fa-clock-rotate-left" />
                    </div>
                    Sistemdeki Son İşlemler (Sizin Eylemleriniz)
                  </div>
                  <div className="history-list">
                    {actionLogs.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Henüz kaydedilmiş bir eyleminiz bulunmuyor.
                      </div>
                    ) : (
                      actionLogs.map(log => (
                        <div key={log.id} className="history-row">
                          <div className="history-icon hi-success" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                            <i className="fas fa-layer-group" />
                          </div>
                          <div className="history-info">
                            <div className="history-device">{log.action}</div>
                            <div className="history-loc">
                              Modül: {log.page_section}
                            </div>
                          </div>
                          <div className="history-time">
                            {new Date(log.created_at).toLocaleString('tr-TR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}