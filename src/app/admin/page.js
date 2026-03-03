'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import '../globals.css';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const fallbackTrend = [
  { gun: 'Pzt', mesaj: 0 }, { gun: 'Sal', mesaj: 0 }, { gun: 'Çar', mesaj: 0 },
  { gun: 'Per', mesaj: 0 }, { gun: 'Cum', mesaj: 0 }, { gun: 'Cmt', mesaj: 0 }, { gun: 'Paz', mesaj: 0 },
];
const fallbackMonthly = [
  { ay: 'Eki', haber: 0, faaliyet: 0 }, { ay: 'Kas', haber: 0, faaliyet: 0 },
  { ay: 'Ara', haber: 0, faaliyet: 0 }, { ay: 'Oca', haber: 0, faaliyet: 0 },
  { ay: 'Şub', haber: 0, faaliyet: 0 }, { ay: 'Mar', haber: 0, faaliyet: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1c2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 1000 }}>
        <p style={{ color: '#7d8590', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0 }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon, label, value, color, bg, border, trend, link, prefix = '' }) => {
  const trendPositive = trend >= 0;
  return (
    <Link href={link || '#'} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
      <div className="stat-card" style={{ '--card-accent': color }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color }}>
            <i className={icon} />
          </div>
          {typeof trend !== 'undefined' && trend !== null && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: trendPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: trendPositive ? '#22c55e' : '#ef4444' }}>
              <i className={`fas fa-arrow-${trendPositive ? 'up' : 'down'}`} style={{ marginRight: 3 }} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1, marginBottom: 4 }}>
          {prefix}{value}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div className="stat-card-bar" />
      </div>
    </Link>
  );
};

const ActivityItem = ({ icon, color, bg, title, desc, time }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
      <i className={icon} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: '#7d8590', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
    </div>
    <div style={{ fontSize: '0.7rem', color: '#484f58', flexShrink: 0, marginTop: 2 }}>{time}</div>
  </div>
);

const QuickAction = ({ icon, label, color, bg, link }) => (
  <Link href={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.18s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '40'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
        <i className={icon} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#c9d1d9' }}>{label}</span>
      <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#484f58' }} />
    </div>
  </Link>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real-time Google Analytics States
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [topPages, setTopPages] = useState([]);

  // Dinamik Grafikler ve Veriler
  const [monthlyData, setMonthlyData] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [stats, setStats] = useState({ unreadMsgCount: 0, newsCount: 0, activitiesCount: 0, partnersCount: 0, resultsCount: 0, logsCount: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [contentDist, setContentDist] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const fetchStartTime = performance.now();
    try {
      const [msg, news, act, par, res, logCount, logsList] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('news').select('created_at'),
        supabase.from('activities').select('created_at'),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }),
        supabase.from('admin_logs').select('*', { count: 'exact', head: true }),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const newsData = news.data || [];
      const actData = act.data || [];

      const newStats = {
        unreadMsgCount: msg.count || 0, newsCount: newsData.length, activitiesCount: actData.length,
        partnersCount: par.count || 0, resultsCount: res.count || 0, logsCount: logCount.count || 0,
      };
      setStats(newStats);
      if(logsList.data) setRecentLogs(logsList.data);

      setContentDist([
        { name: 'Haberler', value: newStats.newsCount, color: '#22c55e' },
        { name: 'Faaliyetler', value: newStats.activitiesCount, color: '#3b82f6' },
        { name: 'Ortaklar', value: newStats.partnersCount, color: '#f59e0b' },
        { name: 'Dosyalar', value: newStats.resultsCount, color: '#a855f7' },
      ]);

      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const currentMonth = new Date().getMonth();
      const last6Months = [];
      
      for (let i = 5; i >= 0; i--) {
        let d = new Date(); d.setMonth(currentMonth - i);
        last6Months.push({ ay: months[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), haber: 0, faaliyet: 0 });
      }

      newsData.forEach(item => {
        const d = new Date(item.created_at);
        const match = last6Months.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
        if (match) match.haber += 1;
      });

      actData.forEach(item => {
        const d = new Date(item.created_at);
        const match = last6Months.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
        if (match) match.faaliyet += 1;
      });

      setMonthlyData(last6Months);

      const totalRows = newStats.newsCount + newStats.activitiesCount + newStats.partnersCount + newStats.resultsCount + newStats.logsCount;
      const dbUsage = Math.min(100, Math.max(1, Math.round((totalRows / 10000) * 100)));
      const fetchTime = performance.now() - fetchStartTime;
      const apiHealth = fetchTime < 500 ? 99 : (fetchTime < 1000 ? 85 : 60);
      const storageUsage = Math.min(100, Math.max(1, Math.round((newStats.resultsCount * 5) / 100))); 

      setSystemHealth([
        { label: 'Veritabanı', val: dbUsage < 5 ? 5 : dbUsage, color: '#22c55e' },
        { label: 'API Yanıt Hızı', val: apiHealth, color: '#3b82f6' },
        { label: 'Depolama', val: storageUsage < 5 ? 5 : storageUsage, color: '#f59e0b' },
        { label: 'Güvenlik', val: 100, color: '#a855f7' },
      ]);

      // GA API
      try {
        const gaRes = await fetch('/api/analytics');
        if (gaRes.ok) {
          const gaData = await gaRes.json();
          if (gaData.activeUsers !== undefined) setOnlineUsers(gaData.activeUsers);
          if (gaData.totalViews !== undefined) setTotalViews(gaData.totalViews);
          if (gaData.totalUsers !== undefined) setTotalUsers(gaData.totalUsers);
          if (gaData.newUsers !== undefined) setNewUsers(gaData.newUsers);
          if (gaData.trendData) setTrendData(gaData.trendData);
          if (gaData.deviceData) setDeviceData(gaData.deviceData);
          if (gaData.topPages) setTopPages(gaData.topPages);
        }
      } catch(e) { console.error("Analytics Hatası:", e); }

    } catch (err) { console.error('Dashboard error:', err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      if (mounted) setCurrentUser(session.user);
      await fetchDashboardData();
    }
    init();
    const interval = setInterval(fetchDashboardData, 15000); 
    return () => { mounted = false; clearInterval(interval); };
  }, [router, fetchDashboardData]);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin', active: currentPath === '/admin' },
    { id: 'messages', label: 'Mesajlar', icon: 'fas fa-inbox', badge: stats.unreadMsgCount, group: 'Genel', link: '/admin/messages', active: currentPath === '/admin/messages' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'İçerik', link: '/admin/homepage', active: currentPath === '/admin/homepage' },
    { id: 'about', label: 'Hakkında', icon: 'fas fa-circle-info', group: 'İçerik', subItems: [
      { id: 'general', label: 'Genel Hakkinda', tab: 'general' },
      { id: 'consortium', label: 'Konsorsiyum', tab: 'consortium' },
      { id: 'impact', label: 'Proje Etkisi', tab: 'impact' },
      { id: 'plan', label: 'Proje Plani', tab: 'plan' },
      { id: 'roadmap', label: 'Yol Haritasi', tab: 'roadmap' },
      { id: 'strategy', label: 'Strateji', tab: 'strategy' },
    ]},
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: stats.newsCount, group: 'İçerik', link: '/admin/news', active: currentPath === '/admin/news' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: stats.activitiesCount, group: 'İçerik', link: '/admin/activities', active: currentPath === '/admin/activities' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: stats.partnersCount, group: 'İçerik', link: '/admin/partners', active: currentPath === '/admin/partners' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: stats.resultsCount, group: 'İçerik', link: '/admin/results', active: currentPath === '/admin/results' },
    { id: 'contact', label: 'İletişim', icon: 'fas fa-phone', group: 'İçerik', link: '/admin/contact', active: currentPath === '/admin/contact' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'İçerik', link: '/admin/site', active: currentPath === '/admin/site' },
    { id: 'users', label: 'Kullanıcılar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin/users', active: currentPath === '/admin/users' },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs', active: currentPath === '/admin/logs' },
    { id: 'security', label: 'Şifre & Güvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin/security', active: currentPath === '/admin/security' },
  ];
  
  const groupedNav = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []; acc[item.group].push(item); return acc;
  }, {});

  const totalContent = stats.newsCount + stats.activitiesCount + stats.partnersCount + stats.resultsCount;
  const fmtTime = (d) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const timeAgo = (dateStr) => {
      const diff = new Date() - new Date(dateStr);
      const minutes = Math.floor(diff / 60000);
      if(minutes < 1) return 'Az önce';
      if(minutes < 60) return `${minutes}dk önce`;
      const hours = Math.floor(minutes / 60);
      if(hours < 24) return `${hours}sa önce`;
      return `${Math.floor(hours / 24)}g önce`;
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d1117', gap: 16, fontFamily: "'DM Sans', sans-serif", color: '#e6edf3' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '0.9rem', color: '#7d8590' }}>Sistem Canlı Bağlantısı Kuruluyor…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0d1117; --surface: #161b22; --surface-2: #1c2333; --surface-3: #21262d;
          --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.14);
          --accent: #22c55e; --accent-dim: rgba(34,197,94,0.12); --accent-glow: rgba(34,197,94,0.25);
          --blue: #3b82f6; --red: #ef4444; --yellow: #f59e0b; --purple: #a855f7; --cyan: #06b6d4; --pink: #ec4899;
          --text-primary: #e6edf3; --text-secondary: #7d8590; --text-muted: #484f58;
          --sidebar-w: 260px; --radius: 10px; --radius-lg: 14px;
          --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --font-mono: 'JetBrains Mono', monospace;
          --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        body { background: var(--bg); color: var(--text-primary); font-family: var(--font); -webkit-font-smoothing: antialiased; }
        .adm-layout { display: flex; min-height: 100vh; width: 100%; background: var(--bg); overflow-x: hidden; }
        .adm-sidebar { width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
        .adm-sidebar::-webkit-scrollbar { width: 3px; } .adm-sidebar::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }
        .adm-brand-wrapper { padding: 22px 18px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .adm-brand-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02)); border: 1px solid rgba(34,197,94,0.15); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; cursor: pointer; }
        .adm-brand-card:hover { background: rgba(34,197,94,0.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .adm-brand-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; flex-shrink: 0; box-shadow: 0 4px 12px rgba(34,197,94,0.35); }
        .adm-brand-logo { font-family: var(--font-display); font-weight: 800; font-size: 1.05rem; color: #fff; line-height: 1; letter-spacing: 0.5px; }
        .adm-brand-logo span { color: #22c55e; }
        .adm-brand-sub { font-size: 0.6rem; color: #6b7280; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 600; margin-top: 3px; }
        .adm-nav { padding: 14px 10px; flex: 1; }
        .adm-nav-section { margin-bottom: 22px; }
        .adm-nav-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); padding: 0 10px; margin-bottom: 5px; }
        .adm-nav-btn { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px; border-radius: 8px; border: none; background: transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.84rem; font-weight: 500; cursor: pointer; transition: var(--transition); text-align: left; position: relative; margin-bottom: 1px; }
        .adm-nav-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .adm-nav-btn.active { background: var(--accent-dim); color: var(--accent); }
        .adm-nav-icon { width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; flex-shrink: 0; }
        .adm-nav-badge { margin-left: auto; background: var(--accent); color: #000; font-size: 0.63rem; font-weight: 800; padding: 2px 6px; border-radius: 20px; min-width: 18px; text-align: center; }
        .adm-nav-submenu { display: flex; flex-direction: column; gap: 1px; padding-left: 35px; padding-right: 6px; margin: 2px 0 6px; animation: fadeDown 0.2s ease; }
        .adm-nav-subitem { display: flex; align-items: center; padding: 7px 10px; font-size: 0.79rem; color: var(--text-secondary); background: transparent; border: none; border-radius: 7px; cursor: pointer; transition: var(--transition); text-align: left; font-family: var(--font); }
        .adm-nav-subitem:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
        .adm-sidebar-footer { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
        .adm-online-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .adm-main { margin-left: var(--sidebar-w); width: calc(100% - var(--sidebar-w)); display: flex; flex-direction: column; min-height: 100vh; }
        .adm-topbar { height: 68px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .adm-topbar-left { display: flex; align-items: center; gap: 14px; }
        .adm-topbar-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
        .adm-page-title-sm { font-family: var(--font-display); font-weight: 700; font-size: 0.92rem; color: var(--text-primary); }
        .adm-breadcrumb { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .adm-clock { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent); letter-spacing: 0.05em; font-weight: 500; }
        .adm-content { padding: 28px; flex: 1; max-width: 1600px; margin: 0 auto; width: 100%; }
        .adm-welcome { background: linear-gradient(135deg, #0f2d1a 0%, #0d1f2d 60%, #1a0f2d 100%); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-lg); padding: 28px 32px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1); }
        .adm-welcome::before { content: ''; position: absolute; top: -60px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%); pointer-events: none; }
        .adm-welcome-greeting { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 6px; }
        .adm-welcome-greeting em { color: #22c55e; font-style: normal; }
        .adm-welcome-desc { font-size: 0.85rem; color: #7d8590; max-width: 420px; }
        .adm-welcome-right { text-align: right; flex-shrink: 0; }
        .adm-welcome-time { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 600; color: #22c55e; letter-spacing: 0.04em; line-height: 1; margin-bottom: 4px; }
        .adm-welcome-date { font-size: 0.77rem; color: #6b7280; text-transform: capitalize; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 22px; transition: all 0.25s ease; position: relative; overflow: hidden; animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; cursor: pointer; }
        .stat-card:hover { transform: translateY(-3px); border-color: var(--card-accent, var(--border-hover)); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .stat-card-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--card-accent, transparent); opacity: 0; transition: opacity 0.25s; }
        .stat-card:hover .stat-card-bar { opacity: 1; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 22px; animation: fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) both; }
        .chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .chart-title { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
        .chart-subtitle { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
        .chart-badge { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; border: 1px solid; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 350px; gap: 16px; margin-bottom: 24px;}
        @media (max-width: 1024px) { .bottom-grid { grid-template-columns: 1fr; } }
        .activity-feed .activity-item:last-child { border-bottom: none; }
        .health-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); margin-top: 6px; overflow: hidden; }
        .health-bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
        
        .page-list-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .page-list-item:last-child { border-bottom: none; }
        .page-path { font-size: 0.8rem; color: #e6edf3; font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;}
        .page-views { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent); font-weight: 700; background: var(--accent-dim); padding: 2px 8px; border-radius: 12px;}

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes topbarDropdown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0); } }
        .stat-card:nth-child(1) { animation-delay: 0.05s; } .stat-card:nth-child(2) { animation-delay: 0.1s; } .stat-card:nth-child(3) { animation-delay: 0.15s; } .stat-card:nth-child(4) { animation-delay: 0.2s; }
      `}</style>

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand-wrapper">
            <Link href="/" className="adm-brand-card">
              <div className="adm-brand-icon"><i className="fas fa-leaf" /></div>
              <div>
                <div className="adm-brand-logo"><span>DIGI-<span>GREEN</span></span></div>
                <div className="adm-brand-sub">Yönetim Paneli <i className="fas fa-external-link-alt" style={{ marginLeft: 4, fontSize: '0.55rem' }} /></div>
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
                  if (item.link) return (
                    <Link href={item.link} key={item.id} className={`adm-nav-btn${item.active ? ' active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span className="adm-nav-icon"><i className={item.icon} /></span>
                      {item.label}
                      {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                    </Link>
                  );
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

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-left">
              <div className="adm-topbar-icon">
                <i className="fas fa-chart-pie" style={{ color: '#fff', fontSize: '0.9rem' }} />
              </div>
              <div>
                <div className="adm-page-title-sm">Yönetim Paneli</div>
                <div className="adm-breadcrumb">
                  <i className="fas fa-home" style={{ fontSize: '0.65rem' }} /> Ana / Dashboard
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="adm-clock">
                <i className="fas fa-clock" style={{ fontSize: '0.75rem', opacity: 0.7 }} />
                {fmtTime(currentTime)}
              </div>
              
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 12px 5px 5px', background: profileOpen ? 'rgba(34,197,94,0.08)' : 'var(--surface-2)', border: `1px solid ${profileOpen ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`, borderRadius: 999, cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', outline: 'none' }}>
                  <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}>
                    {currentUser?.email ? currentUser.email[0].toUpperCase() : 'A'}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser?.email?.split('@')[0] || 'Admin'}
                  </span>
                  <i className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem', opacity: 0.5 }} />
                </button>
                {profileOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />
                    <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 230, background: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100, animation: 'topbarDropdown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                      <div style={{ padding: '10px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                          {currentUser?.email ? currentUser.email[0].toUpperCase() : 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.68rem', color: '#484f58' }}>Oturum açık</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
                        </div>
                      </div>
                      <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', background: 'transparent', border: '1px solid transparent', borderRadius: 9, cursor: 'pointer', color: '#f87171', fontSize: '0.84rem', fontWeight: 500, transition: 'all 0.15s', textAlign: 'left', fontFamily: 'var(--font)' }}>
                        <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.9rem', width: 16 }} />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="adm-content">
            <div className="adm-welcome">
              <div>
                <div className="adm-welcome-greeting">
                  Merhaba, <em>{currentUser?.email?.split('@')[0] || 'Admin'}</em> 👋
                </div>
                <div className="adm-welcome-desc">
                  DIGI-GREEN yönetim panelinize hoş geldiniz. Aşağıda projenizin güncel istatistikleri ve sistem durumu yer almaktadır.
                </div>
              </div>
              <div className="adm-welcome-right">
                <div className="adm-welcome-time">{fmtTime(currentTime)}</div>
                <div className="adm-welcome-date">{fmtDate(currentTime)}</div>
              </div>
            </div>

            {/* Yeni Ziyaretçi İstatistikleri Satırı */}
            <div className="stats-grid">
              <StatCard icon="fas fa-users" label="Anlık Kullanıcı" value={onlineUsers} color="var(--cyan)" bg="rgba(6,182,212,0.12)" border="rgba(6,182,212,0.25)" />
              <StatCard icon="fas fa-eye" label="Toplam Gösterim" value={totalViews} color="var(--pink)" bg="rgba(236,72,153,0.12)" border="rgba(236,72,153,0.25)" />
              <StatCard icon="fas fa-user-check" label="Toplam Ziyaretçi" value={totalUsers} color="var(--blue)" bg="rgba(59,130,246,0.12)" border="rgba(59,130,246,0.25)" />
              <StatCard icon="fas fa-user-plus" label="Yeni Kullanıcılar" value={newUsers} color="var(--accent)" bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.25)" />
            </div>

            {/* İçerik İstatistikleri Satırı */}
            <div className="stats-grid">
              <StatCard icon="fas fa-inbox" label="Okunmamış Mesaj" value={stats.unreadMsgCount} color="var(--red)" bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.25)" link="/admin/messages" />
              <StatCard icon="fas fa-newspaper" label="Yayındaki Haber" value={stats.newsCount} color="var(--accent)" bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.25)" link="/admin/news" />
              <StatCard icon="fas fa-calendar-check" label="Faaliyet & Etkinlik" value={stats.activitiesCount} color="var(--blue)" bg="rgba(59,130,246,0.12)" border="rgba(59,130,246,0.25)" link="/admin/activities" />
              <StatCard icon="fas fa-database" label="Toplam İçerik" value={totalContent} color="var(--text-secondary)" bg="rgba(255,255,255,0.08)" border="rgba(255,255,255,0.1)" />
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Ziyaretçi Trafiği</div>
                    <div className="chart-subtitle">Son 7 günün site etkileşimi</div>
                  </div>
                  <span className="chart-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }}>
                    <i className="fas fa-chart-line" style={{ marginRight: 5 }} />Son 7 Gün
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={trendData.length > 0 ? trendData : fallbackTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="gun" tick={{ fontSize: 11, fill: '#7d8590' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#7d8590' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="mesaj" name="Görüntüleme" stroke="#ef4444" strokeWidth={2} fill="url(#msgGrad)" dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Aylık İçerik Üretimi</div>
                    <div className="chart-subtitle">Haber ve faaliyet karşılaştırması</div>
                  </div>
                  <span className="chart-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.25)' }}>
                    <i className="fas fa-chart-bar" style={{ marginRight: 5 }} />6 Ay
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthlyData.length > 0 ? monthlyData : fallbackMonthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="ay" tick={{ fontSize: 11, fill: '#7d8590' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#7d8590' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.72rem', color: '#7d8590', paddingTop: 10 }} />
                    <Bar dataKey="haber" name="Haber" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="faaliyet" name="Faaliyet" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bottom-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* YENİ: En Çok Ziyaret Edilen Sayfalar */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">En Popüler Sayfalar</div>
                      <div className="chart-subtitle">En çok görüntülenen 5 içerik (Son 28 Gün)</div>
                    </div>
                  </div>
                  <div>
                    {topPages.length === 0 ? (
                      <div style={{color:'var(--text-muted)', fontSize:'0.8rem', padding:'10px 0'}}>Henüz yeterli veri yok.</div>
                    ) : (
                      topPages.map((page, i) => (
                        <div key={i} className="page-list-item">
                          <span className="page-path" title={page.title}>{page.path === '/' ? '/ (Ana Sayfa)' : page.path}</span>
                          <span className="page-views">{page.views}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Son Sistem Aktiviteleri</div>
                      <div className="chart-subtitle">Veritabanına kaydedilen son loglar</div>
                    </div>
                    <Link href="/admin/logs" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Tümü →</Link>
                  </div>
                  <div className="activity-feed">
                    {recentLogs.length === 0 ? (
                        <div style={{color:'var(--text-muted)', fontSize:'0.8rem', padding:'10px 0'}}>Henüz kaydedilen bir aktivite yok.</div>
                    ) : (
                        recentLogs.map((log) => (
                            <ActivityItem 
                                key={log.id}
                                icon="fas fa-bolt" 
                                color="var(--purple)" 
                                bg="rgba(168,85,247,0.1)" 
                                title={log.action} 
                                desc={`${log.user_email} tarafından yapıldı`} 
                                time={timeAgo(log.created_at)} 
                            />
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* YENİ: Cihaz Dağılımı Grafiği */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Cihaz Dağılımı</div>
                      <div className="chart-subtitle">Ziyaretçilerin kullandığı cihazlar</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={deviceData.length === 0 ? [{ name: 'Veri Yok', value: 1, color: '#21262d' }] : deviceData}
                          cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                          paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {(deviceData.length === 0 ? [{ color: '#21262d' }] : deviceData).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
                      {deviceData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <span style={{ color: '#7d8590' }}>{d.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#e6edf3', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Sistem Durumu</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {systemHealth.map((item, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                          <span style={{ color: '#7d8590' }}>{item.label}</span>
                          <span style={{ color: item.color, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{item.val}%</span>
                        </div>
                        <div className="health-bar">
                          <div className="health-bar-fill" style={{ width: `${item.val}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
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