'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// ZENGIN METIN EDITORU (REACT QUILL) EKLENDI
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  news_page_title: "Haberler & Duyurular",
  news_page_title_en: "News & Announcements",
  news_page_desc: "Projemizle ilgili en guncel gelismeleri, duyurulari ve etkinlikleri buradan takip edebilirsiniz.",
  news_page_desc_en: "You can follow the latest developments, announcements and events about our project here."
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
          /* ✨ TEXTAREA İÇİN MİNİMUM YÜKSEKLİK EKLENDİ ✨ */
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

export default function AdminNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  
  // Arama State'i
  const [searchQuery, setSearchQuery] = useState('');

  // Formun Tamamen Sıfırlanması İçin Key
  const [formKey, setFormKey] = useState(0);

  // Form State
  const [newsForm, setNewsForm] = useState({ 
    id: null, title: '', title_en: '', summary: '', summary_en: '', 
    description: '', description_en: '', image_url: '', date: '', gallery: [] 
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
      const [s, n] = await Promise.all([
        supabase.from('settings').select('*').order('id'),
        supabase.from('news').select('*').order('date', { ascending: false })
      ]);
        
      setSettings(s.data || []);
      setNews(n.data || []);
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
      await logAction(`Haberler sayfa ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'news',
      ip_address: userIp
    }]);
  }

  async function deleteItem(item) {
    showConfirm('Bu haberi kalici olarak silmek istediginize emin misiniz?', async () => {
      let filesToDelete = [];

      if (item.image_url) {
        const mainFile = decodeURIComponent(item.image_url.split('/').pop().split('?')[0]);
        if (mainFile) filesToDelete.push(mainFile);
      }

      if (item.gallery) {
        let parsedGallery = [];
        try { parsedGallery = typeof item.gallery === 'string' ? JSON.parse(item.gallery) : item.gallery; } 
        catch(e) { parsedGallery = []; }
        
        parsedGallery.forEach(url => {
          const galFile = decodeURIComponent(url.split('/').pop().split('?')[0]);
          if (galFile) filesToDelete.push(galFile);
        });
      }

      if (filesToDelete.length > 0) {
        try { 
          await supabase.storage.from('images').remove(filesToDelete); 
        } catch (err) { 
          console.error("Storage silme hatasi:", err); 
        }
      }

      const { error: dbError } = await supabase.from('news').delete().eq('id', item.id);
      
      if (dbError) {
        showToast('Hata: ' + dbError.message, 'error');
      } else {
        await logAction(`Haberler tablosundan bir kayit silindi. (ID: ${item.id})`);
        fetchPageData(); 
        showToast('Basariyla tamamen silindi.', 'success');
      }
    });
  }

  const resetForm = () => {
    setIsEditing(false);
    setNewsForm({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '', gallery: [] });
    setFormKey(prev => prev + 1); 
  };

  async function saveItem(e) {
    e.preventDefault();
    
    const { id, ...restOfData } = newsForm; 
    const dataToSave = {
      ...restOfData,
      gallery: JSON.stringify(newsForm.gallery) 
    };

    let result;
    if (newsForm.id) {
      result = await supabase.from('news').update(dataToSave).eq('id', newsForm.id);
    } else {
      result = await supabase.from('news').insert([dataToSave]);
    }
      
    if (result?.error) { 
      showToast('Hata: ' + result.error.message, 'error'); 
      return; 
    }
    
    await logAction(`Haberler tablosunda islem yapildi. (Ekleme/Guncelleme)`);
    fetchPageData(); 
    showToast('Basariyla kaydedildi.', 'success');
    resetForm(); 
  }

  function startEdit(item) {
    setIsEditing(true);
    let parsedGallery = [];
    if(item.gallery) {
       try { parsedGallery = typeof item.gallery === 'string' ? JSON.parse(item.gallery) : item.gallery; } 
       catch(e) { parsedGallery = []; }
    }
    setNewsForm({ ...item, gallery: parsedGallery || [] });
    setFormKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleAddGalleryImage = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setNewsForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
      }
    }
    setLoading(false);
  };

  const removeGalleryImage = async (index) => {
    const urlToDelete = newsForm.gallery[index];
    
    if (urlToDelete) {
      const fileName = decodeURIComponent(urlToDelete.split('/').pop().split('?')[0]);
      if (fileName) {
        try {
          await supabase.storage.from('images').remove([fileName]);
        } catch (err) {
          console.error("Storage'dan silinirken hata:", err);
        }
      }
    }

    const updatedGallery = newsForm.gallery.filter((_, i) => i !== index);
    setNewsForm(prev => ({
      ...prev,
      gallery: updatedGallery
    }));
    
    if (newsForm.id) {
      await supabase.from('news').update({ gallery: JSON.stringify(updatedGallery) }).eq('id', newsForm.id);
      fetchPageData(); 
    }

    showToast('Gorsel kalici olarak silindi.', 'success');
  };

  const filteredNews = news.filter(item => {
    const searchVal = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchVal) ||
      item.title_en?.toLowerCase().includes(searchVal) ||
      item.summary?.toLowerCase().includes(searchVal) ||
      item.summary_en?.toLowerCase().includes(searchVal)
    );
  });

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Yükleniyor...</p></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      {/* ✨ İÇERİK (QUILL) İÇİN GLOBAL CSS KORUNDU ✨ */}
      <style jsx global>{`
        .quill { width: 100%; display: flex; flex-direction: column; }
        .ql-toolbar.ql-snow { border: 1px solid var(--border); background: var(--surface-3); border-radius: 8px 8px 0 0; }
        .ql-container.ql-snow { border: 1px solid var(--border); border-top: none; background: var(--surface-2); border-radius: 0 0 8px 8px; font-family: var(--font); color: var(--text-primary); font-size: 0.875rem; }
        .ql-editor { min-height: 200px; padding: 15px; cursor: text; }
        .ql-editor:focus { outline: none; box-shadow: inset 0 0 0 2px var(--accent-glow); border-radius: 0 0 8px 8px; }
        .ql-snow .ql-stroke { stroke: var(--text-secondary); }
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill { fill: var(--text-secondary); }
        .ql-snow .ql-picker { color: var(--text-secondary); }
        .ql-snow .ql-picker-options { background-color: var(--surface); border-color: var(--border); }
      `}</style>

      <div className="adm-content">
        <div className="adm-fade-in">
          
          {/* ✨ BAŞLIK VE BUTON HİZALAMASI İÇİN FLEX EKLENDİ ✨ */}
          <div className="adm-page-header">
            <div className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              Haberler & <em>Duyurular</em>
            </div>
          </div>

          {(userRole === 'Super Admin' || userRole === 'Admin') && (
            <div className="adm-section">
              <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Ust Bilgileri (Hero)" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="news_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="news_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="news_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="news_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="news_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="news_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="news_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="news_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="news_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="news_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" style={{margin: '20px 0'}} />

              <SectionHeader iconClass="fas fa-bars" title="Icerik Bolumu Basliklari" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="news_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="news_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="news_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="news_sec_title_en" {...commonProps} />
              </div>
            </div>
          )}

          <div className="adm-form-card">
            <div className="adm-form-card-title">
              <div>
                <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                {isEditing ? ' Haberi Duzenle' : ' Yeni Haber Ekle'}
              </div>
            </div>
            
            <form key={formKey} onSubmit={saveItem} style={{display:'grid', gap:'14px'}}>
              
              <div className="adm-form-grid2">
                <div className="adm-form-item">
                  <label>Haber Basligi (TR) *</label>
                  <input className="adm-input-full" placeholder="Baslik..." value={newsForm.title} onChange={e => setNewsForm(prev => ({...prev, title: e.target.value}))} required />
                </div>
                <div className="adm-form-item">
                  <label>Haber Basligi (EN)</label>
                  <input className="adm-input-full" placeholder="Title..." value={newsForm.title_en} onChange={e => setNewsForm(prev => ({...prev, title_en: e.target.value}))} />
                </div>
              </div>
              
              <div className="adm-form-item">
                <label>Tarih</label>
                <input type="date" className="adm-input-full" value={newsForm.date || ''} onChange={e => setNewsForm(prev => ({...prev, date: e.target.value}))} style={{colorScheme:'dark', width: '50%'}} />
              </div>
              
              <div className="adm-form-item">
                <label>Ana Gorsel (Kapak)</label>
                <FileInput value={newsForm.image_url} onChange={url => setNewsForm(prev => ({...prev, image_url: url}))} placeholder="Haber ana gorseli..." uploadFile={uploadFile} showToast={showToast} />
              </div>

              <div className="adm-form-item" style={{ padding: '15px', background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <label style={{ color: 'var(--accent)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-images"></i> Detay Sayfasi Galerisi (Coklu Gorsel)
                </label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                  {newsForm.gallery?.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeGalleryImage(idx)} 
                        style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.8)', color: 'white', border: 'none', width: '24px', height: '24px', cursor: 'pointer' }}>
                        <i className="fas fa-times" style={{ fontSize: '0.7rem' }}></i>
                      </button>
                    </div>
                  ))}
                </div>

                <label className="adm-upload-btn" style={{ width: 'auto', padding: '0 15px', height: '36px', display: 'inline-flex', fontSize: '0.8rem', fontWeight: 600 }}>
                  <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Galeriye Resim Ekle
                  <input type="file" hidden accept="image/*" onChange={handleAddGalleryImage} disabled={loading} />
                </label>
              </div>
              
              <div className="adm-form-grid2">
                  <div className="adm-form-item">
                    <label>Kisa Ozet (TR)</label>
                    <textarea className="adm-textarea-full" style={{minHeight:'100px'}} placeholder="2-3 cumle ozet..." value={newsForm.summary} onChange={e => setNewsForm(prev => ({...prev, summary: e.target.value}))} rows={3} />
                  </div>
                  <div className="adm-form-item">
                    <label>Kisa Ozet (EN)</label>
                    <textarea className="adm-textarea-full" style={{minHeight:'100px'}} placeholder="Short summary..." value={newsForm.summary_en} onChange={e => setNewsForm(prev => ({...prev, summary_en: e.target.value}))} rows={3} />
                  </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="adm-form-item">
                    <label>Detayli Icerik (TR)</label>
                    <div style={{ width: '100%' }}>
                      <ReactQuill theme="snow" modules={quillModules} value={newsForm.description || ''} onChange={val => setNewsForm(prev => ({...prev, description: val}))} />
                    </div>
                  </div>
                  <div className="adm-form-item">
                    <label>Detayli Icerik (EN)</label>
                    <div style={{ width: '100%' }}>
                      <ReactQuill theme="snow" modules={quillModules} value={newsForm.description_en || ''} onChange={val => setNewsForm(prev => ({...prev, description_en: val}))} />
                    </div>
                  </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {isEditing && (
                  <button type="button" className="adm-btn adm-btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                    Vazgec
                  </button>
                )}
                <button type="submit" className="adm-btn adm-btn-save" style={{ flex: isEditing ? 1 : 'unset', width: isEditing ? 'auto' : '100%' }}>
                  {isEditing ? 'Degisiklikleri Kaydet' : '+ Haber Ekle'}
                </button>
              </div>
            </form>
          </div>
          
          <div style={{marginTop:'24px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
                Mevcut Haberler ({filteredNews.length})
              </div>
              
              <div className="adm-search-wrap" style={{ width: '300px', marginBottom: 0 }}>
                <i className="fas fa-search" />
                <input 
                  type="text" 
                  className="adm-search-input" 
                  placeholder="Haber ara..." 
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

            {filteredNews.length === 0 ? (
              <div className="adm-empty" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                <i className="fas fa-newspaper" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '10px' }} />
                <div style={{ color: 'var(--text-secondary)' }}>{searchQuery ? 'Arama sonucu bulunamadi.' : 'Haber bulunamadi.'}</div>
              </div>
            ) : filteredNews.map(item => (
              <div key={item.id} className="adm-item-row">
                <div className="adm-item-info">
                  <strong>{item.title}</strong>
                  {item.date && <span><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date}</span>}
                </div>
                <div className="adm-item-actions">
                  <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item)} style={{height:'32px', fontSize:'0.78rem'}}>
                    <i className="fas fa-pen" /> Duzenle
                  </button>
                  <button className="adm-btn adm-btn-danger" onClick={() => deleteItem(item)}>
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