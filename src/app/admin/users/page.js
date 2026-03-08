'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

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
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgeç</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Onayla</button>
        </div>
      </div>
    </div>
  );
};

/* ✨ YENİ: PASSWORD STRENGTH COMPONENT'İ ✨ */
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
              <PasswordStrength password={formData.password} />
            </div>
          )}
          
          <div className="adm-form-item">
            <label style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Yetki Rolu</label>
            <select className="adm-input" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} style={{width: '100%', boxSizing:'border-box', cursor:'pointer', appearance:'none'}}>
              <option value="Editor">Editor</option> 
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
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [userModal, setUserModal] = useState({ isOpen: false, mode: 'add', data: { id: '', email: '', password: '', role: 'Editor', is_blocked: false } });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

  const fetchPageData = useCallback(async () => {
    try {
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

      // ✨ GÜVENLİK BEKÇİSİ (CLIENT-SIDE GUARD) ✨
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'Editor';

      // Eğer Editör girmeye çalışıyorsa, sayfayı hiç yüklemeden anında Dashboard'a fırlat!
      if (role === 'Editor') {
        router.replace('/admin');
        return; 
      }

      if (isMounted) setCurrentUser(session.user);
      await fetchPageData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchPageData]);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/admin/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: userModal.mode === 'add' ? 'CREATE' : 'UPDATE',
          ...userModal.data
        })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Bilinmeyen bir hata olustu.');
      } else {
        throw new Error('Sunucu yaniti JSON degil. API URL yolu veya route.js dosyasi hatali.');
      }
      
      showToast(userModal.mode === 'add' ? 'Kullanici basariyla olusturuldu.' : 'Kullanici guncellendi.', 'success');
      setUserModal({ ...userModal, isOpen: false });
      fetchPageData();
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = (id) => {
    showConfirm('Bu kullaniciyi ve tum yetkilerini kalici olarak silmek istediginize emin misiniz?', async () => {
      try {
        const res = await fetch('/admin/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE', id })
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await res.json();
          if (!res.ok) throw new Error(result.error);
        } else {
          throw new Error('Sunucu yaniti JSON degil. API URL yolu veya route.js dosyasi hatali.');
        }
        
        showToast('Kullanici silindi.', 'success');
        setUsersList(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
      }
      closeConfirm();
    });
  };

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

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
              onClick={() => setUserModal({ isOpen: true, mode: 'add', data: { id: '', email: '', password: '', role: 'Editor', is_blocked: false } })}
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
                 {usersList.map(user => (
                   <tr key={user.id} style={{borderBottom: '1px solid var(--border)'}}>
                     <td style={{padding: '16px 20px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        <i className="fas fa-user-circle" style={{marginRight:'10px', color: user.is_blocked ? 'var(--red)' : 'var(--accent)', fontSize:'1.2rem'}}></i>
                        {user.email}
                     </td>
                     <td style={{padding: '16px 20px'}}>
                       <span className={`adm-badge ${user.role === 'Super Admin' ? 'adm-badge-green' : user.role === 'Admin' ? 'adm-badge-blue' : 'adm-badge-gray'}`}>
                         {user.role || 'Editor'}
                       </span>
                     </td>
                     <td style={{padding: '16px 20px'}}>
                       {user.is_blocked 
                         ? <span style={{color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600}}><i className="fas fa-ban"></i> Engellendi</span> 
                         : <span style={{color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600}}><i className="fas fa-check-circle"></i> Aktif</span>}
                     </td>
                     <td style={{padding: '16px 20px', textAlign: 'right'}}>
                       <div className="adm-item-actions" style={{justifyContent: 'flex-end'}}>
                         
                         {/* ✨ SUPER ADMIN KONTROLÜ BURADA BAŞLIYOR ✨ */}
                         {user.role === 'Super Admin' ? (
                           <span style={{color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600'}}>
                             <i className="fas fa-lock" style={{marginRight: '5px'}}></i> Sabit
                           </span>
                         ) : (
                           <>
                             <button className="adm-btn adm-btn-ghost" onClick={() => setUserModal({ isOpen: true, mode: 'edit', data: user })} style={{height:'32px', fontSize:'0.78rem'}}>
                               <i className="fas fa-pen" /> Duzenle
                             </button>
                             
                             {user.id !== currentUser?.id && (
                               <button className="adm-btn adm-btn-danger" onClick={() => handleDeleteUser(user.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                                 <i className="fas fa-trash" /> Sil
                               </button>
                             )}
                           </>
                         )}
                         {/* ✨ SUPER ADMIN KONTROLÜ BURADA BİTİYOR ✨ */}

                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </>
  );
}