'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── TOAST (BİLDİRİM) ─── */
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
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgec</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Onayla</button>
        </div>
      </div>
    </div>
  );
};

/* ─── KULLANICI EKLE / DÜZENLE MODAL ─── */
const UserModal = ({ isOpen, mode, formData, setFormData, onClose, onSave, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal" style={{width: '450px', textAlign: 'left', padding: '28px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h3 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem'}}>{mode === 'add' ? 'Yeni Kullanici Ekle' : 'Kullaniciyi Duzenle'}</h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem'}}><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={onSave} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          
          <div className="adm-form-item">
            <label style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Email Adresi</label>
            <input className="adm-input" type="email" placeholder="ornek@email.com" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} disabled={mode==='edit'} required style={{width: '100%', boxSizing:'border-box'}} />
          </div>
          
          {mode === 'add' && (
            <div className="adm-form-item">
              <label style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Sifre (En az 6 karakter)</label>
              <input className="adm-input" type="text" placeholder="******" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required minLength={6} style={{width: '100%', boxSizing:'border-box'}} />
            </div>
          )}
          
          <div className="adm-form-item">
            <label style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Yetki Rolu</label>
            <select className="adm-input" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} style={{width: '100%', boxSizing:'border-box', cursor:'pointer', appearance:'none'}}>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          
          {mode === 'edit' && (
            <div className="adm-form-item">
              <label style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Hesap Durumu</label>
              <select className="adm-input" value={formData.is_blocked} onChange={e=>setFormData({...formData, is_blocked: e.target.value === 'true'})} style={{width: '100%', boxSizing:'border-box', cursor:'pointer', appearance:'none', color: formData.is_blocked ? 'var(--red)' : 'var(--accent)'}}>
                <option value="false">Aktif (Giris Yapabilir)</option>
                <option value="true">Engellendi (Giris Yapamaz)</option>
              </select>
            </div>
          )}
          
          <div style={{display:'flex', gap:'10px', marginTop:'14px'}}>
            <button type="button" className="adm-btn adm-btn-ghost" style={{flex:1}} onClick={onClose}>Iptal</button>
            <button type="submit" className="adm-btn adm-btn-save" style={{flex:1}} disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check" />} {mode === 'add' ? 'Olustur' : 'Guncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  
  // Users Data State
  const [usersList, setUsersList] = useState([]);

  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  // Modal & Form States
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [userModal, setUserModal] = useState({ isOpen: false, mode: 'add', data: { id: '', email: '', password: '', role: 'Admin', is_blocked: false } });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

  const fetchPageData = useCallback(async () => {
    try {
      // Rozet sayıları
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

      // Kullanıcı Profillerini Çek
      const { data: profiles } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: true });
      if (profiles) setUsersList(profiles);

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
      await fetchPageData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchPageData]);

  // Yeni Kullanıcı veya Güncelleme İşlemi (API Üzerinden)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: userModal.mode === 'add' ? 'CREATE' : 'UPDATE',
          ...userModal.data
        })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Bilinmeyen bir hata olustu.');
      
      showToast(userModal.mode === 'add' ? 'Kullanici basariyla olusturuldu.' : 'Kullanici guncellendi.', 'success');
      setUserModal({ ...userModal, isOpen: false });
      fetchPageData();
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Silme İşlemi (API Üzerinden)
  const handleDeleteUser = (id) => {
    showConfirm('Bu kullaniciyi ve tum yetkilerini kalici olarak silmek istediginize emin misiniz?', async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE', id })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        
        showToast('Kullanici silindi.', 'success');
        setUsersList(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
      }
      closeConfirm();
    });
  };

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', group: 'Genel', link: '/admin' },
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: unreadMsgCount, group: 'Genel', link: '/admin/messages' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'Icerik', link: '/admin/homepage' },
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
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: newsCount, group: 'Icerik', link: '/admin/news' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activitiesCount, group: 'Icerik', link: '/admin/activities' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partnersCount, group: 'Icerik', link: '/admin/partners' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: resultsCount, group: 'Icerik', link: '/admin/results' },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik', link: '/admin/contact' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik', link: '/admin/site' },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar', link: '/admin/users', active: true },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar', link: '/admin/logs' },
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar', link: '/admin/security' },
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
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); }} onCancel={closeConfirm} />
      
      <UserModal 
        isOpen={userModal.isOpen} 
        mode={userModal.mode} 
        formData={userModal.data} 
        setFormData={(data) => setUserModal({...userModal, data})} 
        onClose={() => setUserModal({...userModal, isOpen: false})} 
        onSave={handleSaveUser}
        loading={submitting}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');
        .adm-layout, .adm-loading { --bg: #0d1117; --surface: #161b22; --surface-2: #1c2333; --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.15); --accent: #22c55e; --accent-dim: rgba(34,197,94,0.12); --accent-glow: rgba(34,197,94,0.25); --text-primary: #e6edf3; --text-secondary: #7d8590; --text-muted: #484f58; --red: #ef4444; --red-dim: rgba(239,68,68,0.12); --blue: #3b82f6; --blue-dim: rgba(59,130,246,0.12); --sidebar-w: 260px; --radius: 10px; --radius-lg: 14px; --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --transition: 0.18s cubic-bezier(0.4,0,0.2,1); }
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
        .adm-topbar { height: 76px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 50; }
        .adm-topbar-title { font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: var(--text-primary); flex: 1; }
        
        .adm-content { padding: 32px; flex: 1; }
        .adm-page-header { margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end;}
        .adm-page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.2; text-transform: capitalize; }
        .adm-page-title em { color: var(--accent); font-style: normal; }
        .adm-page-desc { font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px; }
        
        .adm-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 12px; overflow: hidden; }

        .adm-input { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; padding: 10px 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none; }
        .adm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        
        .adm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: none; border-radius: 8px; font-family: var(--font); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition); white-space: nowrap; line-height: 1; padding: 0 16px; height: 38px; }
        .adm-btn-save { background: var(--accent); color: #000; }
        .adm-btn-save:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
        .adm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .adm-btn-danger { background: transparent; border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
        .adm-btn-danger:hover { background: var(--red-dim); border-color: rgba(239,68,68,0.6); }
        .adm-btn-ghost { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-secondary); }
        .adm-btn-ghost:hover { border-color: var(--border-hover); color: var(--text-primary); }

        .adm-item-actions { display: flex; gap: 8px; align-items: center; }

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
        .adm-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 400px; max-width: 90vw; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1); }
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
        .adm-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .adm-badge-green { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(34,197,94,0.25); }
        .adm-badge-blue { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.25); }
        .adm-badge-gray { background: var(--surface-2); color: var(--text-secondary); border: 1px solid var(--border); }
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
                  <i className="fas fa-users" style={{ color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Kullanicilar
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Oturum acik</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
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
                <div>
                  <div className="adm-page-title">Sistem <em>Kullanicilari</em></div>
                  <div className="adm-page-desc">Panele erisim yetkisi olan admin hesaplari.</div>
                </div>
                
                {/* ✨ YENİ KULLANICI EKLE BUTONU ✨ */}
                <button 
                  className="adm-btn adm-btn-save" 
                  onClick={() => setUserModal({ isOpen: true, mode: 'add', data: { id: '', email: '', password: '', role: 'Admin', is_blocked: false } })}
                >
                  <i className="fas fa-plus"></i> Yeni Kullanici
                </button>
              </div>
              
              <div className="adm-card" style={{padding: '0'}}>
                 <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                   <thead>
                     <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                       <th style={{padding: '16px 20px'}}>Kullanici (Email)</th>
                       <th style={{padding: '16px 20px'}}>Yetki Rolu</th>
                       <th style={{padding: '16px 20px'}}>Hesap Durumu</th>
                       <th style={{padding: '16px 20px', textAlign: 'right'}}>Islemler</th>
                     </tr>
                   </thead>
                   <tbody>
                     {/* ✨ LİSTEYİ VERİTABANINDAN ÇEKİP BASTIRDIK ✨ */}
                     {usersList.map(user => (
                       <tr key={user.id} style={{borderBottom: '1px solid var(--border)'}}>
                         <td style={{padding: '16px 20px', fontWeight: '600', color: 'var(--text-primary)'}}>
                            <i className="fas fa-user-circle" style={{marginRight:'10px', color: user.is_blocked ? 'var(--red)' : 'var(--accent)', fontSize:'1.2rem'}}></i>
                            {user.email}
                         </td>
                         <td style={{padding: '16px 20px'}}>
                           <span className={`adm-badge ${user.role === 'Super Admin' ? 'adm-badge-green' : user.role === 'Admin' ? 'adm-badge-blue' : 'adm-badge-gray'}`}>
                             {user.role || 'Admin'}
                           </span>
                         </td>
                         <td style={{padding: '16px 20px'}}>
                           {user.is_blocked 
                             ? <span style={{color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600}}><i className="fas fa-ban"></i> Engellendi</span> 
                             : <span style={{color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600}}><i className="fas fa-check-circle"></i> Aktif</span>}
                         </td>
                         <td style={{padding: '16px 20px', textAlign: 'right'}}>
                           <div className="adm-item-actions" style={{justifyContent: 'flex-end'}}>
                             
                             <button className="adm-btn adm-btn-ghost" onClick={() => setUserModal({ isOpen: true, mode: 'edit', data: user })} style={{height:'32px', fontSize:'0.78rem'}}>
                               <i className="fas fa-pen" /> Duzenle
                             </button>
                             
                             {/* Kendisini silmesini engelliyoruz */}
                             {user.id !== currentUser?.id && (
                               <button className="adm-btn adm-btn-danger" onClick={() => handleDeleteUser(user.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                                 <i className="fas fa-trash" /> Sil
                               </button>
                             )}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}