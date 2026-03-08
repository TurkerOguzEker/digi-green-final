'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  contact_email: "info@digigreenfuture.eu",
  contact_phone: "+90 282 000 00 00"
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

/* ─── SECTION HEADER ─── */
const SectionHeader = ({ iconClass, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num"><i className={iconClass}></i></div>
    <div className="adm-section-title">{title}</div>
  </div>
);

export default function AdminContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchPageData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      setSettings(s.data || []);
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

      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'Editor';

      if (role === 'Editor') {
        router.replace('/admin');
        return; 
      }

      if (isMounted) {
        setCurrentUser(session.user);
        setUserRole(role);
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
    if (userRole === 'Editor') return; 

    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Iletisim sayfa ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'contact',
      ip_address: userIp
    }]);
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="adm-content">
        <div className="adm-fade-in">
          <div className="adm-page-header">
            <div className="adm-page-title">
              Iletisim <em>Bilgileri</em>
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Ust Bilgileri (Hero)" />
            <div className="adm-form-grid2">
              <SettingInput label="Ust Ufak Baslik (TR)" settingKey="contact_hero_eyebrow" {...commonProps} />
              <SettingInput label="Ust Ufak Baslik (EN)" settingKey="contact_hero_eyebrow_en" {...commonProps} />
              <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="contact_hero_title1" {...commonProps} />
              <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="contact_hero_title1_en" {...commonProps} />
              <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="contact_hero_title2" {...commonProps} />
              <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="contact_hero_title2_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2" style={{marginTop:'10px'}}>
              <SettingInput label="Giris Aciklamasi (TR)" settingKey="contact_page_desc" type="textarea" {...commonProps} />
              <SettingInput label="Giris Aciklamasi (EN)" settingKey="contact_page_desc_en" type="textarea" {...commonProps} />
            </div>
            <div className="adm-form-grid2" style={{marginTop:'10px'}}>
              <SettingInput label="Kaydirma Butonu (TR)" settingKey="contact_hero_scroll" {...commonProps} />
              <SettingInput label="Kaydirma Butonu (EN)" settingKey="contact_hero_scroll_en" {...commonProps} />
            </div>

            <div className="adm-divider" style={{margin: '20px 0'}} />

            <SectionHeader iconClass="fas fa-bars" title="Icerik Bolumu Basliklari" />
            <div className="adm-form-grid2">
              <SettingInput label="Bolum Etiketi (TR)" settingKey="contact_sec_label" {...commonProps} />
              <SettingInput label="Bolum Etiketi (EN)" settingKey="contact_sec_label_en" {...commonProps} />
              <SettingInput label="Bolum Basligi (TR)" settingKey="contact_sec_title" {...commonProps} />
              <SettingInput label="Bolum Basligi (EN)" settingKey="contact_sec_title_en" {...commonProps} />
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-phone" title="Kurum Iletisim Bilgileri" />
            <div className="adm-form-grid2">
              <SettingInput label="Sol Kart Basligi (TR)" settingKey="contact_info_title" {...commonProps} />
              <SettingInput label="Sol Kart Basligi (EN)" settingKey="contact_info_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2" style={{marginTop:'10px'}}>
              <SettingInput label="E-posta Adresi" settingKey="contact_email" {...commonProps} />
              <SettingInput label="Telefon Numarasi" settingKey="contact_phone" {...commonProps} />
            </div>
            <div className="adm-form-grid2" style={{marginTop:'10px'}}>
              <SettingInput label="Acik Adres (TR)" settingKey="contact_address" type="textarea" {...commonProps} />
              <SettingInput label="Acik Adres (EN)" settingKey="contact_address_en" type="textarea" {...commonProps} />
            </div>
            <div className="adm-form-grid2" style={{marginTop:'10px'}}>
              <SettingInput label="Sosyal Medya Basligi (TR)" settingKey="contact_social_title" {...commonProps} />
              <SettingInput label="Sosyal Medya Basligi (EN)" settingKey="contact_social_title_en" {...commonProps} />
            </div>
            <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'5px'}}>
              * Sosyal Medya linklerini (URL) sol menudeki "Header / Footer" sekmesinden degistirebilirsiniz.
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-envelope" title="Iletisim Formu Ayarlari" />
            <div className="adm-form-grid2">
              <SettingInput label="Form Karti Basligi (TR)" settingKey="contact_form_title" {...commonProps} />
              <SettingInput label="Form Karti Basligi (EN)" settingKey="contact_form_title_en" {...commonProps} />
              <SettingInput label="Basarili Mesaji (TR)" settingKey="contact_form_success" {...commonProps} />
              <SettingInput label="Basarili Mesaji (EN)" settingKey="contact_form_success_en" {...commonProps} />
              <SettingInput label="Hata Mesaji (TR)" settingKey="contact_form_error" {...commonProps} />
              <SettingInput label="Hata Mesaji (EN)" settingKey="contact_form_error_en" {...commonProps} />
              <SettingInput label="Gonder Butonu (TR)" settingKey="contact_form_btn" {...commonProps} />
              <SettingInput label="Gonder Butonu (EN)" settingKey="contact_form_btn_en" {...commonProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}