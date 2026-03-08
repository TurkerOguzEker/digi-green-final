'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import CustomTooltip from '../../components/admin/CustomTooltip';
import StatCard from '../../components/admin/StatCard';
import ActivityItem from '../../components/admin/ActivityItem';
import QuickAction from '../../components/admin/QuickAction';

const fallbackTrend = [
  { gun: 'Pzt', mesaj: 0 }, { gun: 'Sal', mesaj: 0 }, { gun: 'Çar', mesaj: 0 },
  { gun: 'Per', mesaj: 0 }, { gun: 'Cum', mesaj: 0 }, { gun: 'Cmt', mesaj: 0 }, { gun: 'Paz', mesaj: 0 },
];
const fallbackMonthly = [
  { ay: 'Eki', haber: 0, faaliyet: 0 }, { ay: 'Kas', haber: 0, faaliyet: 0 },
  { ay: 'Ara', haber: 0, faaliyet: 0 }, { ay: 'Oca', haber: 0, faaliyet: 0 },
  { ay: 'Şub', haber: 0, faaliyet: 0 }, { ay: 'Mar', haber: 0, faaliyet: 0 },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [topPages, setTopPages] = useState([]);

  const [monthlyData, setMonthlyData] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [stats, setStats] = useState({ unreadMsgCount: 0, newsCount: 0, activitiesCount: 0, partnersCount: 0, resultsCount: 0, logsCount: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [contentDist, setContentDist] = useState([]);

  // Hoş geldin ekranındaki saat için
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const fetchStartTime = performance.now();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const promises = [
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('news').select('created_at'),
        supabase.from('activities').select('created_at'),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }),
        supabase.from('admin_logs').select('*', { count: 'exact', head: true }),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(5)
      ];

      // Eğer oturum varsa profil bilgisini ekle (Hoş geldin ismi ve yetki bazlı hızlı eylemler için)
      if (session) {
        setCurrentUser(session.user);
        promises.push(supabase.from('user_profiles').select('role').eq('id', session.user.id).single());
      }

      const results = await Promise.all(promises);
      const [msg, news, act, par, res, logCount, logsList, profileReq] = results;

      if (profileReq?.data) {
        setUserRole(profileReq.data.role);
      }

      const newsData = news?.data || [];
      const actData = act?.data || [];

      const newStats = {
        unreadMsgCount: msg?.count || 0, newsCount: newsData.length, activitiesCount: actData.length,
        partnersCount: par?.count || 0, resultsCount: res?.count || 0, logsCount: logCount?.count || 0,
      };
      
      setStats(newStats);
      if(logsList?.data) setRecentLogs(logsList.data);

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
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); 
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', gap: 16, color: '#e6edf3' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '0.9rem', color: '#7d8590' }}>Sistem Verileri Yükleniyor…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
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

      <div className="stats-grid">
        <StatCard icon="fas fa-users" label="Anlık Kullanıcı" value={onlineUsers} color="var(--cyan)" bg="rgba(6,182,212,0.12)" border="rgba(6,182,212,0.25)" />
        <StatCard icon="fas fa-eye" label="Toplam Gösterim" value={totalViews} color="var(--pink)" bg="rgba(236,72,153,0.12)" border="rgba(236,72,153,0.25)" />
        <StatCard icon="fas fa-user-check" label="Toplam Ziyaretçi" value={totalUsers} color="var(--blue)" bg="rgba(59,130,246,0.12)" border="rgba(59,130,246,0.25)" />
        <StatCard icon="fas fa-user-plus" label="Yeni Kullanıcılar" value={newUsers} color="var(--accent)" bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.25)" />
      </div>

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
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">En Popüler Sayfalar</div>
                <div className="chart-subtitle">Sadece haber ve faaliyet içerikleri (Son 28 Gün)</div>
              </div>
            </div>
            <div>
              {topPages.length === 0 ? (
                <div style={{color:'var(--text-muted)', fontSize:'0.8rem', padding:'10px 0'}}>Henüz yeterli veri yok.</div>
              ) : (
                topPages.map((page, i) => {
                  let cleanTitle = page.title || page.displayName;
                  if (cleanTitle.includes(' | ')) cleanTitle = cleanTitle.split(' | ')[0];
                  else if (cleanTitle.includes(' - ')) cleanTitle = cleanTitle.split(' - ')[0];
                  
                  return (
                    <div key={i} className="page-list-item">
                      <span className="page-path" title={page.path}>{cleanTitle}</span>
                      <span className="page-views">{page.views}</span>
                    </div>
                  );
                })
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

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">Hızlı Eylemler</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              <QuickAction icon="fas fa-plus" label="Yeni Haber" color="var(--accent)" bg="rgba(34,197,94,0.1)" link="/admin/news" />
              <QuickAction icon="fas fa-calendar-plus" label="Yeni Faaliyet" color="var(--blue)" bg="rgba(59,130,246,0.1)" link="/admin/activities" />
              <QuickAction icon="fas fa-inbox" label="Mesajlar" color="var(--red)" bg="rgba(239,68,68,0.1)" link="/admin/messages" />
              {(userRole === 'Super Admin' || userRole === 'Admin') && (
                <QuickAction icon="fas fa-handshake" label="Yeni Ortak" color="var(--yellow)" bg="rgba(245,158,11,0.1)" link="/admin/partners" />
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div>
                <div className="chart-title">İçerik Dağılımı</div>
                <div className="chart-subtitle">Toplam {totalContent} içerik</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={contentDist.every(d => d.value === 0) ? [{ name: 'Boş', value: 1, color: '#21262d' }] : contentDist}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {(contentDist.every(d => d.value === 0) ? [{ color: '#21262d' }] : contentDist).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
                {contentDist.map((d, i) => (
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
  );
}