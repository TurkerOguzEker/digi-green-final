'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  footer_desc: "Kapakli Belediyesi liderliginde yurutulen surdurulebilir kalkinma projesi.",
  footer_column2_title: "Hizli Menu",
  footer_column3_title: "Iletisim",
  footer_eu_logo: "/assets/images/eu-flag.png",
  footer_disclaimer: "Avrupa Birligi tarafindan finanse edilmistir. Ancak ifade edilen gorus ve dusunceler yalnizca yazar(lar)a aittir..."
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

/* ─── SECTION HEADER ─── */
const SectionHeader = ({ iconClass, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num"><i className={iconClass}></i></div>
    <div className="adm-section-title">{title}</div>
  </div>
);

export default function AdminSiteSettingsPage() {
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
    if (userRole === 'Editor') return; // Ekstra Güvenlik Koruması

    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Site ayari guncellendi: ${key}`);
      fetchPageData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'site',
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
              Header / <em>Footer</em>
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-window-maximize" title="Ust Menu & Sekme (Header)" />
            <div className="adm-form-grid2">
              <SettingInput label="Favicon (Sekme Ikonu)" settingKey="site_favicon" type="image" {...commonProps} />
              <SettingInput label="Site Ana Logosu" settingKey="header_logo_image" type="image" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Logo Ana Metni" settingKey="header_logo_text" placeholder="DIGI-GREEN" {...commonProps} />
              <SettingInput label="Logo Vurgu Metni" settingKey="header_logo_highlight" placeholder="FUTURE" {...commonProps} />
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-window-minimize" title="Alt Bilgi (Footer)" />
            <SettingInput label="AB Logosu / Bayrak" settingKey="footer_eu_logo" type="image" {...commonProps} />
            
            <div className="adm-form-grid2">
              <SettingInput label="Orta Sutun Basligi (TR) (Orn: Hizli Menu)" settingKey="footer_column2_title" {...commonProps} />
              <SettingInput label="Orta Sutun Basligi (EN)" settingKey="footer_column2_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Sag Sutun Basligi (TR) (Orn: Iletisim)" settingKey="footer_column3_title" {...commonProps} />
              <SettingInput label="Sag Sutun Basligi (EN)" settingKey="footer_column3_title_en" {...commonProps} />
            </div>

            <div className="adm-form-grid2">
              <SettingInput label="Footer Hakkinda Metni (TR)" settingKey="footer_desc" type="textarea" {...commonProps} />
              <SettingInput label="Footer Hakkinda Metni (EN)" settingKey="footer_desc_en" type="textarea" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="AB Bilgilendirme Metni (TR)" settingKey="footer_disclaimer" type="textarea" {...commonProps} />
              <SettingInput label="AB Bilgilendirme Metni (EN)" settingKey="footer_disclaimer_en" type="textarea" {...commonProps} />
            </div>
          </div>

          <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
            <SectionHeader iconClass="fas fa-share-nodes" title="Sosyal Medya" />
            <div className="adm-form-grid3">
              <SettingInput label="Facebook" settingKey="social_facebook" placeholder="https://facebook.com/..." {...commonProps} />
              <SettingInput label="Twitter / X" settingKey="social_twitter" placeholder="https://twitter.com/..." {...commonProps} />
              <SettingInput label="Instagram" settingKey="social_instagram" placeholder="https://instagram.com/..." {...commonProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}