'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

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

/* ✨ PASSWORD STRENGTH ✨ */
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
          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= score ? color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
};

/* ─── SECURITY SCORE ─── */
const SecurityScore = ({ score }) => {
  const [animated, setAnimated] = useState(0);
  const circumference = 2 * Math.PI * 54;
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 300); return () => clearTimeout(t); }, [score]);
  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Güvenli' : score >= 60 ? 'Orta' : 'Riskli';
  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{animated}</div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
};

/* ─── TOGGLE ─── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button onClick={() => !disabled && onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: checked ? '#22c55e' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s ease', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
  </button>
);

export default function AdminSecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor');
  const [userIp, setUserIp] = useState('Bilinmiyor');
  const [showNew, setShowNew] = useState(false);

  const [targetEmail, setTargetEmail] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [securityScore, setSecurityScore] = useState(0);

  const [actionLogs, setActionLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

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

  const fetchPageData = useCallback(async (userEmail, currentUserIp) => {
    try {
      if (userEmail) {
        const { data: logs } = await supabase.from('admin_logs').select('*').eq('user_email', userEmail).order('created_at', { ascending: false }).limit(5);
        if (logs) setActionLogs(logs);

        const { data: logins } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(6);
        if (logins) setLoginHistory(logins);

        const { data: allLogs } = await supabase
          .from('login_logs')
          .select('user_email, device, ip_address, created_at, location, status')
          .order('created_at', { ascending: false })
          .limit(150); 

        if (allLogs) {
          const latestLogsMap = new Map();
          allLogs.forEach(log => {
            if (!latestLogsMap.has(log.user_email)) {
              latestLogsMap.set(log.user_email, log);
            }
          });

          const activeSessionsArray = Array.from(latestLogsMap.values()).filter(log => {
            const isLogoutEvent = log.location === 'Çıkış Yapıldı' || log.location === 'Güvenli Çıkış' || log.location === 'Zaman Aşımı' || log.status === 'logout';
            
            const logTime = new Date(log.created_at).getTime();
            const nowTime = new Date().getTime();
            const isRecent = (nowTime - logTime) < (24 * 60 * 60 * 1000); 
            const isMe = log.user_email === userEmail;

            // ✨ GÜNCELLEME: Eğer kullanıcı "ben" isem, 24 saati geçmiş olsa bile beni aktifler listesinde KESİN göster.
            return !isLogoutEvent && log.status === 'success' && (isRecent || isMe);
          });

          // ✨ EKSTRA GÜVENLİK: Eğer 150 log limitinden dolayı benim ismim hiç gelmemişse beni manuel olarak en başa ekle
          const isMeInList = activeSessionsArray.some(s => s.user_email === userEmail);
          if (!isMeInList) {
            activeSessionsArray.unshift({
              user_email: userEmail,
              device: navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Masaüstü/Laptop',
              ip_address: currentUserIp || 'Bilinmiyor',
              created_at: new Date().toISOString(),
              status: 'success'
            });
          }

          setActiveSessions(activeSessionsArray);
        }

        const { data: settings } = await supabase.from('system_settings').select('value').eq('id', 'session_timeout').single();
        if (settings?.value?.minutes) {
          setSessionTimeout(settings.value.minutes.toString());
        }
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

      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'Editor';

      if (role === 'Editor') {
        router.replace('/admin');
        return; 
      }
      
      let ip = 'Bilinmiyor';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
        if (isMounted) setUserIp(ip);
      } catch (e) {}

      if (isMounted) {
        setCurrentUser(session.user);
        setTargetEmail(session.user.email); 
        setUserRole(role);
        
        const savedAlerts = localStorage.getItem(`admin_alerts_${session.user.id}`);
        if (savedAlerts !== null) setLoginAlerts(savedAlerts === 'true');
      }

      await fetchPageData(session.user.email, ip);
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchPageData]);

  const handleAlertToggle = (v) => {
    setLoginAlerts(v);
    localStorage.setItem(`admin_alerts_${currentUser?.id}`, v);
    showToast(v ? 'Giriş bildirimleri açıldı.' : 'Giriş bildirimleri kapatıldı.');
  };

  const handleTimeoutChange = async (e) => {
    const v = e.target.value;
    setSessionTimeout(v);
    try {
      await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_TIMEOUT', timeoutMinutes: v })
      });
      showToast(`Tüm sistem için oturum zaman aşımı ${v} dakika olarak ayarlandı.`);
    } catch (err) { showToast('Ayar kaydedilirken hata oluştu', 'error'); }
  };

  const handleKickAll = () => {
    showConfirm('Kendiniz dahil TÜM yöneticilerin oturumu kapatılacak. Emin misiniz?', async () => {
      try {
        await logAction('Tüm kullanıcıların oturumu zorla sonlandırıldı.');
        await fetch('/api/admin/security', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'KICK_ALL' }) });
        await supabase.from('login_logs').insert([{ user_email: currentUser.email, location: 'Tümünü Sonlandır', status: 'logout' }]);
        
        localStorage.removeItem('digigreen_last_activity');
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        await supabase.auth.signOut();
        router.push('/login');
      } catch (err) { showToast('Çıkış yapılamadı.', 'error'); }
      closeConfirm();
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!targetEmail) { showToast('Lütfen bir e-posta adresi girin.', 'error'); return; }
    if (newPassword.length < 6) { showToast('Yeni şifre en az 6 karakter olmalıdır.', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('Yeni şifreler eşleşmiyor!', 'error'); return; }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_PASSWORD', email: targetEmail, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Başarılı! ${targetEmail} hesabının şifresi güncellendi.`, 'success');
      setNewPassword(''); setConfirmPassword('');
      await logAction(`${targetEmail} kullanıcısının şifresi güncellendi.`);
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ action: actionDescription, user_email: currentUser.email, page_section: 'Güvenlik', ip_address: userIp }]);
    fetchPageData(currentUser.email, userIp); 
  }

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  const scoreColor = securityScore >= 70 ? '#22c55e' : securityScore >= 50 ? '#eab308' : '#ef4444';
  const scoreLabel = securityScore >= 70 ? 'Hesabınız güvende' : securityScore >= 50 ? 'Güvenliği artırın' : 'Acil önlem alın';

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); }} onCancel={closeConfirm} />

      <style>{`
        .sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .sec-full { grid-column: 1 / -1; }

        .sec-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px; transition: border-color var(--transition); }
        .sec-card:hover { border-color: var(--border-hover); }
        .sec-card-title { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .sec-card-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; flex-shrink: 0; }

        .score-card { background: linear-gradient(135deg, #111318, #0f1520); border: 1px solid var(--border); border-radius: 18px; padding: 26px; display: flex; align-items: center; gap: 28px; position: relative; overflow: hidden; }
        .score-card::before { content: ''; position: absolute; top: -60px; right: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .score-info { flex: 1; }
        .score-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 6px; }
        .score-label { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
        .score-tips { display: flex; flex-direction: column; gap: 5px; }
        .score-tip { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-secondary); }
        .score-tip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .form-grid { display: flex; flex-direction: column; gap: 14px; }
        .form-item label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .inp-wrap { position: relative; }
        .inp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.82rem; transition: color var(--transition); padding: 4px; }
        .inp-eye:hover { color: var(--text-primary); }

        .toggle-list { display: flex; flex-direction: column; gap: 2px; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; background: var(--surface-2); border: 1px solid transparent; transition: border-color var(--transition); gap: 16px; }
        .toggle-row:hover { border-color: var(--border-hover); }
        .toggle-info { flex: 1; min-width: 0; }
        .toggle-info strong { display: block; font-size: 0.84rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .toggle-info span { font-size: 0.76rem; color: var(--text-secondary); }
        .toggle-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; }
        .tb-green { background: var(--accent-dim); color: var(--accent); }
        .tb-gray { background: rgba(255,255,255,0.06); color: var(--text-muted); }

        .timeout-select { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.82rem; padding: 6px 10px; outline: none; cursor: pointer; transition: border-color var(--transition); }
        .timeout-select:focus { border-color: var(--accent); }

        .session-list { display: flex; flex-direction: column; gap: 8px; }
        .session-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--surface-2); border-radius: 10px; border: 1px solid transparent; transition: border-color var(--transition); }
        .session-row.current { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.04); }
        .session-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-3); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; color: var(--text-secondary); flex-shrink: 0; }
        .session-row.current .session-icon { color: var(--accent); }
        .session-info { flex: 1; min-width: 0; }
        .session-device { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
        .session-meta { font-size: 0.73rem; color: var(--text-secondary); margin-top: 2px; display: flex; align-items: center; gap: 8px; }
        .session-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
        .session-ip { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); flex-shrink: 0; }
        .session-current-badge { background: var(--accent-dim); color: var(--accent); font-size: 0.62rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; letter-spacing: 0.05em; }

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

        .danger-card { background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .danger-btn { background: none; border: 1px solid rgba(239,68,68,0.35); color: var(--red); border-radius: 9px; padding: 9px 18px; font-family: var(--font); font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all var(--transition); white-space: nowrap; }
        .danger-btn:hover { background: var(--red-dim); border-color: var(--red); }

        .ip-badge { font-family: var(--font-mono); font-size: 0.72rem; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 3px 10px; color: var(--text-secondary); }
        @media (max-width: 900px) { .sec-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="adm-content">
        <div className="adm-fade-in">
          <div className="adm-page-header">
            <div>
              <div className="adm-page-title">Güvenlik & <em>Şifre</em></div>
              <div className="adm-page-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Hesabınızı koruyun, oturumları yönetin ve güvenlik ayarlarını yapılandırın.</div>
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
                Şifre Güncelle (Admin İşlemi)
              </div>
              <form onSubmit={handlePasswordChange} className="form-grid">
                <div className="form-item">
                  <label>Hangi Hesabın Şifresi Değişecek? <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input type="email" className="adm-input" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} required placeholder="ornek@email.com" />
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
                
                <button type="submit" className="adm-btn adm-btn-save" style={{ width: '100%', marginTop: '10px', height: '42px' }} disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin" style={{marginRight:'5px'}}></i> Güncelleniyor...</> : <><i className="fas fa-shield-halved" style={{marginRight:'5px'}}></i> Şifreyi Değiştir</>}
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
                  Genel Güvenlik Ayarları
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
                      <strong>Sistem Oturum Zaman Aşımı</strong>
                      <span>Hareketsizlik sonrası tüm kullanıcıları at</span>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kendiniz ve diğer herkesin oturumu kapanır</div>
                    </div>
                    <button className="danger-btn" onClick={handleKickAll}>
                      <i className="fas fa-skull-crossbones" style={{ marginRight: '6px' }} />Herkesi At
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AKTİF OTURUMLAR (ÇIKIŞ YAPANLARI GİZLER) ── */}
            <div className="sec-card sec-full">
              <div className="sec-card-title">
                <div className="sec-card-icon" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308' }}>
                  <i className="fas fa-display" />
                </div>
                Aktif Oturumlar (Tüm Kullanıcılar)
              </div>
              <div className="session-list">
                {activeSessions.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aktif oturum bulunamadı.</div>
                ) : (
                  activeSessions.map((session, index) => {
                    const isMe = session.user_email === currentUser?.email;
                    return (
                      <div key={index} className={`session-row ${isMe ? 'current' : ''}`}>
                        <div className="session-icon">
                          <i className={session.device?.includes('Mobile') || session.device?.includes('iOS') || session.device?.includes('Android') ? 'fas fa-mobile-screen' : 'fas fa-desktop'} />
                        </div>
                        <div className="session-info">
                          <div className="session-device">
                            <span style={{color: 'var(--text-primary)'}}>{session.user_email}</span> 
                            <span style={{marginLeft: '6px', fontSize: '0.75rem', opacity: 0.6, fontWeight: 'normal'}}>({session.device})</span>
                          </div>
                          <div className="session-meta">
                            <i className="fas fa-location-dot" style={{ fontSize: '0.65rem', opacity: 0.5 }} />
                            {session.ip_address}
                            <span className="dot" />
                            {new Date(session.created_at).toLocaleString('tr-TR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                        {isMe ? (
                          <span className="session-current-badge"><i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px', animation: 'pulse 2s infinite' }} />Senin Cihazın</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Diğer Kullanıcı</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── GİRİŞ GEÇMİŞİ ── */}
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

            {/* ── SON İŞLEMLER ── */}
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
    </>
  );
}