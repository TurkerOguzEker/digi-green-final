'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

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
          /* ✨ DÜZELTME: TEXTAREA MİNİMUM YÜKSEKLİĞİ EKLENDİ ✨ */
          <textarea className="adm-textarea" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} rows={4} style={{ minHeight: '100px' }} />
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
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [partners, setPartners] = useState([]);

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
        
      setSettings(s.data || []);
      setPartners(p.data || []);
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
        showToast('Bu ayari degistirme yetkiniz bulunmuyor.', 'error');
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

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div className="adm-content">
        <div className="adm-fade-in">
          
          <div className="adm-page-header">
            <div className="adm-page-title">
              <span>Ortaklar & <em>Kurumlar</em></span>
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
                  <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff', minHeight:'100px'}} placeholder="Kurum hakkinda..." value={partnerForm.description} onChange={e => setPartnerForm(prev => ({...prev, description: e.target.value}))} rows={4} />
                </div>
                <div className="adm-form-item">
                  <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Aciklama (EN)</label>
                  <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff', minHeight:'100px'}} placeholder="About institution..." value={partnerForm.description_en} onChange={e => setPartnerForm(prev => ({...prev, description_en: e.target.value}))} rows={4} />
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
            <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>
              Mevcut Ortaklar ({partners.length})
            </div>
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
    </>
  );
}