'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  results_page_title: "Proje Dosyalari",
  results_page_title_en: "Project Files",
  results_page_desc: "Projemiz sonucunda ortaya cikan fikri ciktilar, raporlar ve materyaller.",
  results_page_desc_en: "Intellectual outputs, reports and materials resulting from our project."
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
                const url = await uploadFile(e.target.files[0], 'images'); // Site ayar resimleri images klasörüne gider
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
const FileInput = ({ value, onChange, placeholder, uploadFile, showToast, targetBucket = 'public-files' }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async e => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const url = await uploadFile(file, targetBucket);
      if (url) { onChange(url); if (showToast) showToast('Dosya basariyla yuklendi.', 'success'); }
    } catch { if (showToast) showToast('Yukleme hatasi olustu.', 'error'); }
    finally { setUploading(false); }
  };
  return (
    <div className="adm-img-field">
      <div className="adm-img-preview-wrap">
        {value ? <i className="fas fa-file-check" style={{color:'var(--accent)', fontSize:'1rem'}}></i> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
        <input type="text" className="adm-img-url-input" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
      </div>
      <label className="adm-upload-btn" title="Dosya Yukle">
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

export default function AdminResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor');
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [results, setResults] = useState([]);
  
  // Arama State'i
  const [searchQuery, setSearchQuery] = useState('');

  // Form Sıfırlama Key'i
  const [formKey, setFormKey] = useState(0);

  // Form State
  const [resultForm, setResultForm] = useState({ 
    id: null, 
    title: '', 
    title_en: '', 
    description: '', 
    description_en: '', 
    status: 'Planlaniyor', 
    status_en: 'Planned', 
    link: '', 
    icon: 'file' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  const fetchPageData = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        supabase.from('settings').select('*').order('id'),
        supabase.from('results').select('*').order('id')
      ]);
        
      setSettings(s.data || []);
      setResults(r.data || []);
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

  // Dinamik Yükleme Fonksiyonu
  async function uploadFile(file, bucketName = 'public-files') {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage.from(bucketName).upload(fileName, file);
    if (error) { showToast('Yukleme Hatasi: ' + error.message, 'error'); return null; }
    
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
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
      showToast('Bu ayarı değiştirme yetkiniz bulunmuyor.', 'error');
      return;
    }
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Dosyalar sayfa ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'results',
      ip_address: userIp
    }]);
  }

  async function deleteItem(item) {
    showConfirm('Bu dosyayi kalici olarak silmek istediginize emin misiniz?', async () => {
      
      if (item.link && item.link.includes('/storage/v1/object/public/')) {
        const fileName = decodeURIComponent(item.link.split('/').pop().split('?')[0]);
        if (fileName) {
          try { 
            await supabase.storage.from('public-files').remove([fileName]); 
          } catch (err) { 
            console.error("Storage silme hatasi:", err); 
          }
        }
      }

      const { error } = await supabase.from('results').delete().eq('id', item.id);
      
      if (error) {
        showToast('Hata: ' + error.message, 'error');
      } else {
        await logAction(`Dosyalar tablosundan bir kayit silindi. (ID: ${item.id})`);
        fetchPageData(); 
        showToast('Basariyla silindi.', 'success');
      }
    });
  }

  const resetForm = () => {
    setIsEditing(false);
    setResultForm({ 
      id: null, 
      title: '', 
      title_en: '', 
      description: '', 
      description_en: '', 
      status: 'Planlaniyor', 
      status_en: 'Planned', 
      link: '', 
      icon: 'file' 
    });
    setFormKey(prev => prev + 1);
  };

  async function saveItem(e) {
    e.preventDefault();
    
    const { id, ...dataToSave } = resultForm;

    let result;
    if (id) {
        result = await supabase.from('results').update(dataToSave).eq('id', id);
    } else {
        result = await supabase.from('results').insert([dataToSave]);
    }

    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    
    await logAction(`Dosyalar tablosunda islem yapildi. (Ekleme/Guncelleme)`);
    fetchPageData(); 
    showToast('Basariyla kaydedildi.', 'success');
    resetForm(); 
  }

  function startEdit(item) {
    setIsEditing(true);
    setResultForm({ ...item });
    setFormKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredResults = results.filter(item => {
    const searchVal = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchVal) ||
      item.title_en?.toLowerCase().includes(searchVal) ||
      item.description?.toLowerCase().includes(searchVal) ||
      item.description_en?.toLowerCase().includes(searchVal)
    );
  });

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
              <span>Proje <em>Dosyalari</em></span>
            </div>
          </div>

          {(userRole === 'Super Admin' || userRole === 'Admin') && (
            <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
              <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Ust Bilgileri (Hero)" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="results_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="results_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="results_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="results_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="results_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="results_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="results_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="results_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="results_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="results_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" style={{margin: '20px 0'}} />

              <SectionHeader iconClass="fas fa-bars" title="Icerik Bolumu Basliklari" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="results_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="results_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="results_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="results_sec_title_en" {...commonProps} />
              </div>
            </div>
          )}

          <div className="adm-form-card" style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'24px', marginBottom:'24px'}}>
            <div className="adm-form-card-title" style={{fontWeight:700, marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px'}}>
              <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} style={{color:'var(--accent)'}} />
              {isEditing ? ' Dosya Guncelle' : ' Yeni Dosya Ekle'}
            </div>
            <form key={formKey} onSubmit={saveItem} style={{display:'grid', gap:'14px'}}>
              
              <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Dosya Basligi (TR) *</label>
                    <input className="adm-input-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} placeholder="Dosya basligi..." value={resultForm.title} onChange={e => setResultForm(prev => ({...prev, title: e.target.value}))} required />
                  </div>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Dosya Başlığı (EN)</label>
                    <input 
                      className="adm-input-full" 
                      style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}}
                      placeholder="File title..." 
                      value={resultForm.title_en || ''}
                      onChange={e => setResultForm(prev => ({...prev, title_en: e.target.value}))} 
                    />
                  </div>
              </div>

              <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Aciklama (TR)</label>
                    <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff', minHeight:'100px'}} placeholder="Aciklama..." value={resultForm.description} onChange={e => setResultForm(prev => ({...prev, description: e.target.value}))} rows={3} />
                  </div>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Aciklama (EN)</label>
                    <textarea className="adm-textarea-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff', minHeight:'100px'}} placeholder="Description..." value={resultForm.description_en} onChange={e => setResultForm(prev => ({...prev, description_en: e.target.value}))} rows={3} />
                  </div>
              </div>

              <div className="adm-form-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Durum (TR)</label>
                    <select className="adm-select-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} value={resultForm.status} onChange={e => setResultForm(prev => ({...prev, status: e.target.value}))}>
                      <option value="Planlaniyor">Planlaniyor</option>
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Tamamlandi">Tamamlandi</option>
                    </select>
                  </div>
                  <div className="adm-form-item">
                    <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Durum (EN)</label>
                    <select className="adm-select-full" style={{width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', color:'#fff'}} value={resultForm.status_en} onChange={e => setResultForm(prev => ({...prev, status_en: e.target.value}))}>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
              </div>

              <div className="adm-form-item">
                <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'6px', display:'block'}}>Dosya / Link</label>
                <FileInput value={resultForm.link} onChange={url => setResultForm(prev => ({...prev, link: url}))} placeholder="Dosya yukleyin veya URL girin..." uploadFile={uploadFile} showToast={showToast} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {isEditing && (
                  <button type="button" className="adm-btn adm-btn-ghost" onClick={resetForm} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>
                    Vazgec
                  </button>
                )}
                <button type="submit" className="adm-btn adm-btn-save" style={{ flex: isEditing ? 1 : 'unset', width: isEditing ? 'auto' : '100%', padding: '10px', borderRadius: '8px' }}>
                  {isEditing ? 'Guncelle' : '+ Ekle'}
                </button>
              </div>
            </form>
          </div>
          
          <div style={{marginTop:'24px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
                Mevcut Dosyalar ({filteredResults.length})
              </div>
              
              <div className="adm-search-wrap" style={{ width: '300px', marginBottom: 0 }}>
                <i className="fas fa-search" />
                <input 
                  type="text" 
                  className="adm-search-input" 
                  placeholder="Dosya ara..." 
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

            {filteredResults.length === 0 ? (
              <div className="adm-empty" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                <i className="fas fa-file" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '10px' }} />
                <div style={{ color: 'var(--text-secondary)' }}>{searchQuery ? 'Arama sonucu bulunamadi.' : 'Dosya bulunamadi.'}</div>
              </div>
            ) : filteredResults.map(item => (
              <div key={item.id} className="adm-item-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '8px'}}>
                <div className="adm-item-info">
                  <strong style={{display: 'block', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600}}><i className="fas fa-file-circle-check" style={{color:'var(--accent)', marginRight:'8px'}} />{item.title}</strong>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{item.status}</span>
                </div>
                <div className="adm-item-actions" style={{display: 'flex', gap: '8px'}}>
                  <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item)} style={{height:'32px', fontSize:'0.78rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', padding: '0 12px'}}>
                    <i className="fas fa-pen" style={{marginRight: '6px'}}/> Duzenle
                  </button>
                  <button className="adm-btn adm-btn-danger" onClick={() => deleteItem(item)} style={{height:'32px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: '8px', cursor: 'pointer', padding: '0 12px'}}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}