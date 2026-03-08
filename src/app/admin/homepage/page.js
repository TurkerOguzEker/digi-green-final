'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  hero_title: "Yerel Yesil Gelecek Icin Dijital Donusum",
  hero_desc: "Erasmus+ KA220-ADU kapsaminda, iklim degisikligi ile mucadelede dijital araclari kullanmayi hedefleyen oncu proje.",
  home_summary_1_val: "24 Ay", home_summary_1_label: "Proje Suresi",
  home_summary_2_val: "250.000€", home_summary_2_label: "Toplam Hibe",
  home_summary_3_val: "KA220-ADU", home_summary_3_label: "Program",
  home_summary_4_val: "3 Ulke", home_summary_4_label: "Kapsam",
  home_about_title: "Teknoloji ve Doganin Mukemmel Uyumu",
  home_about_text: "Projemiz, iklim kriziyle mucadelede yerel yonetimler ve vatandaslarin aktif rol almasi gerekliliginden dogmustur.",
  home_target_1_title: "Vatandaslar", home_target_1_desc: "Mobil uygulamalar ile geri donusume katilin.",
  home_target_2_title: "Yerel Yonetimler", home_target_2_desc: "Veriye dayali kararlar alarak kaynaklari verimli kullanin.",
  home_target_3_title: "STK ve Akademik", home_target_3_desc: "Arastirma ve egitim calismalarinda aktif rol alin.",
  home_counter_1_val: "250000", home_counter_1_label: "Toplam Hibe (€)",
  home_counter_2_val: "3", home_counter_2_label: "Ortak Ulke",
  home_counter_3_val: "5", home_counter_3_label: "Proje Ortagi",
  home_counter_4_val: "24", home_counter_4_label: "Ay Sure",
  home_cta_title: "Gelecegi Birlikte Tasarlayalim",
  home_cta_text: "Daha fazla bilgi almak icin bize ulasin."
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

/* ─── KULLANILABILIR IKONLAR LISTESI ─── */
const AVAILABLE_ICONS = [
  { value: 'fa-leaf', label: 'Yaprak / Doga' },
  { value: 'fa-mobile-screen', label: 'Mobil Cihaz / Uygulama' },
  { value: 'fa-recycle', label: 'Geri Donusum' },
  { value: 'fa-graduation-cap', label: 'Egitim / Okul' },
  { value: 'fa-globe', label: 'Dunya / Kuresel' },
  { value: 'fa-tree', label: 'Agac / Orman' },
  { value: 'fa-seedling', label: 'Fidan / Buyume' },
  { value: 'fa-solar-panel', label: 'Gunes Paneli / Enerji' },
  { value: 'fa-wind', label: 'Ruzgar / Temiz Hava' },
  { value: 'fa-water', label: 'Su / Deniz' },
  { value: 'fa-lightbulb', label: 'Fikir / Yenilik' },
  { value: 'fa-users', label: 'Insanlar / Toplum' },
  { value: 'fa-handshake', label: 'Isbirligi / Ortaklik' },
  { value: 'fa-chart-line', label: 'Grafik / Gelisim' },
  { value: 'fa-laptop', label: 'Bilgisayar / Dijital' },
  { value: 'fa-city', label: 'Sehir / Yerel Yonetim' },
  { value: 'fa-bolt', label: 'Enerji / Hiz' },
  { value: 'fa-bullhorn', label: 'Duyuru / Kampanya' }
];

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

export default function AdminHomePageSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [ecoItems, setEcoItems] = useState([]);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchSettingsData = useCallback(async () => {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      const existingSettings = s.data || [];
      setSettings(existingSettings);

      const heroSliderStr = existingSettings.find(x => x.key === 'hero_slider_images')?.value;
      if (heroSliderStr) { try { setHeroImages(JSON.parse(heroSliderStr)); } catch(e){} }
      else {
        const oldHeroBg = existingSettings.find(x => x.key === 'hero_bg_image')?.value;
        if (oldHeroBg) setHeroImages([oldHeroBg]);
      }

      const ecoStr = existingSettings.find(x => x.key === 'home_eco_list')?.value;
      if (ecoStr) { try { setEcoItems(JSON.parse(ecoStr)); } catch(e){} } 
      else {
          setEcoItems([
              { title: 'Mobil Uygulama', desc: 'Vatandaslara yonelik dijital araclar.', icon: 'fa-mobile-screen' },
              { title: 'Geri Donusum', desc: 'Cevre dostu aliskanliklar.', icon: 'fa-recycle' },
              { title: 'Egitim', desc: 'Farkindalik ve kapasite gelistirme.', icon: 'fa-graduation-cap' },
              { title: 'Doga', desc: 'Surdurulebilir yasam pratikleri.', icon: 'fa-leaf' }
          ]);
      }
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

      await fetchSettingsData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchSettingsData]);

  const handleEcoChange = (index, field, value) => {
    const newItems = [...ecoItems];
    newItems[index][field] = value;
    setEcoItems(newItems);
  };

  const saveEcoItems = async (itemsToSave) => {
    setEcoItems(itemsToSave);
    const { error } = await supabase.from('settings').upsert({ key: 'home_eco_list', value: JSON.stringify(itemsToSave) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Agac kutulari guncellendi.', 'success');
  };

  const saveHeroImages = async (newArr) => {
    setHeroImages(newArr);
    const { error } = await supabase.from('settings').upsert({ key: 'hero_slider_images', value: JSON.stringify(newArr) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error'); else showToast('Slider guncellendi.', 'success');
  };

  const moveHeroImage = (index, direction) => {
    const newArr = [...heroImages];
    if (direction === -1 && index > 0) { [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]; }
    else if (direction === 1 && index < newArr.length - 1) { [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]]; }
    saveHeroImages(newArr);
  };

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
      await logAction(`Ana sayfa ayari guncellendi: ${key}`);
      fetchSettingsData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: 'homepage',
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
              Ana Sayfa <em>Duzenle</em>
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-images" title="Kapak Slider Resimleri" />
            <div className="adm-card">
              <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'14px'}}>Resimleri surukleyip siralayabilir, ok butonlariyla yukari/asagi tasiyabilirsiniz.</p>
              {heroImages.map((img, i) => (
                <div key={i} className="adm-slider-item">
                  <span className="adm-slider-idx">{i + 1}</span>
                  <img src={img} className="adm-slider-thumb" alt="" onError={e => e.target.style.background='var(--surface-2)'} />
                  <input className="adm-slider-url" placeholder="Resim URL" value={img} onChange={e => { const a = [...heroImages]; a[i] = e.target.value; setHeroImages(a); }} />
                  <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, -1)} disabled={i === 0} title="Yukari"><i className="fas fa-chevron-up" /></button>
                  <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, 1)} disabled={i === heroImages.length - 1} title="Asagi"><i className="fas fa-chevron-down" /></button>
                  <button className="adm-btn adm-btn-danger" style={{height:'30px', padding:'0 10px', fontSize:'0.75rem'}} onClick={() => saveHeroImages(heroImages.filter((_, idx) => idx !== i))}><i className="fas fa-xmark" /></button>
                </div>
              ))}
              <div className="adm-slider-add">
                <div className="adm-slider-add-label"><i className="fas fa-plus" /> Yeni Resim Ekle</div>
                <FileInput value="" onChange={url => { if (url) saveHeroImages([...heroImages, url]); }} placeholder="URL yapistirin veya dosya yukleyin..." uploadFile={uploadFile} showToast={showToast} />
              </div>
              <button className="adm-btn adm-btn-ghost" style={{marginTop:'12px'}} onClick={() => saveHeroImages(heroImages)}><i className="fas fa-floppy-disk" /> URL Degisikliklerini Kaydet</button>
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-heading" title="Kapak Metinleri ve Butonlar" />
            <div className="adm-form-grid2">
              <SettingInput label="Ust Vurgu / Logo Metni (TR)" settingKey="home_hero_eyebrow" {...commonProps} />
              <SettingInput label="Ust Vurgu / Logo Metni (EN)" settingKey="home_hero_eyebrow_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Ana Baslik (TR)" settingKey="hero_title" {...commonProps} />
              <SettingInput label="Ana Baslik (EN)" settingKey="hero_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Aciklama Metni (TR)" settingKey="hero_desc" type="textarea" {...commonProps} />
              <SettingInput label="Aciklama Metni (EN)" settingKey="hero_desc_en" type="textarea" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Buton 1 (TR)" settingKey="home_hero_btn1" {...commonProps} />
              <SettingInput label="Buton 1 (EN)" settingKey="home_hero_btn1_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Buton 2 (TR)" settingKey="home_hero_btn2" {...commonProps} />
              <SettingInput label="Buton 2 (EN)" settingKey="home_hero_btn2_en" {...commonProps} />
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-chart-pie" title="Ozet Bilgi Kartlari" />
            <div className="adm-card-grid2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="adm-card-inner">
                  <div className="adm-card-inner-label">Kart {n}</div>
                  <div className="adm-form-grid2">
                      <SettingInput label="Deger (TR)" settingKey={`home_summary_${n}_val`} {...commonProps} />
                      <SettingInput label="Etiket (TR)" settingKey={`home_summary_${n}_label`} {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                      <SettingInput label="Deger (EN)" settingKey={`home_summary_${n}_val_en`} {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`home_summary_${n}_label_en`} {...commonProps} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-address-card" title="Hakkinda Bolumu (Gorsel & Metinler)" />
            <SettingInput label="Sol Taraf Gorseli" settingKey="home_about_image" type="image" {...commonProps} />
            <div className="adm-form-grid2">
              <SettingInput label="Ust Baslik (TR)" settingKey="home_about_eyebrow" {...commonProps} />
              <SettingInput label="Ust Baslik (EN)" settingKey="home_about_eyebrow_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Ana Baslik (TR)" settingKey="home_about_title" {...commonProps} />
              <SettingInput label="Ana Baslik (EN)" settingKey="home_about_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Aciklama Metni (TR)" settingKey="home_about_text" type="textarea" {...commonProps} />
              <SettingInput label="Aciklama Metni (EN)" settingKey="home_about_text_en" type="textarea" {...commonProps} />
            </div>

            <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Gorsel Ustu Rozet (Yesil Kutu)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Buyuk Rakam/Yazi (TR)" settingKey="home_about_badge_val" placeholder="24 Ay" {...commonProps} />
                  <SettingInput label="Buyuk Rakam/Yazi (EN)" settingKey="home_about_badge_val_en" placeholder="24 Months" {...commonProps} />
                  <SettingInput label="Alt Aciklama (TR)" settingKey="home_about_badge" placeholder="Surecek Dijital..." {...commonProps} />
                  <SettingInput label="Alt Aciklama (EN)" settingKey="home_about_badge_en" placeholder="Digital Journey..." {...commonProps} />
                </div>
            </div>
            
            <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Madde Isaretleri (Tik Listesi)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Madde 1 (TR)" settingKey="home_about_bullet_1" {...commonProps} />
                  <SettingInput label="Madde 1 (EN)" settingKey="home_about_bullet_1_en" {...commonProps} />
                  <SettingInput label="Madde 2 (TR)" settingKey="home_about_bullet_2" {...commonProps} />
                  <SettingInput label="Madde 2 (EN)" settingKey="home_about_bullet_2_en" {...commonProps} />
                  <SettingInput label="Madde 3 (TR)" settingKey="home_about_bullet_3" {...commonProps} />
                  <SettingInput label="Madde 3 (EN)" settingKey="home_about_bullet_3_en" {...commonProps} />
                </div>
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-users-viewfinder" title="Hedef Kitle Bolumu" />
            <div className="adm-form-grid2">
              <SettingInput label="Ana Baslik (TR)" settingKey="home_target_main_title" {...commonProps} />
              <SettingInput label="Ana Baslik (EN)" settingKey="home_target_main_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Alt Baslik (TR)" settingKey="home_target_main_subtitle" type="textarea" {...commonProps} />
              <SettingInput label="Alt Baslik (EN)" settingKey="home_target_main_subtitle_en" type="textarea" {...commonProps} />
            </div>
            <div style={{marginTop: '20px'}}>
                {[1, 2, 3].map(n => (
                  <div key={n} className="adm-card-inner" style={{marginBottom:'10px'}}>
                    <div className="adm-card-inner-label">Hedef Karti {n}</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik (TR)" settingKey={`home_target_${n}_title`} {...commonProps} />
                      <SettingInput label="Baslik (EN)" settingKey={`home_target_${n}_title_en`} {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Aciklama (TR)" settingKey={`home_target_${n}_desc`} type="textarea" {...commonProps} />
                      <SettingInput label="Aciklama (EN)" settingKey={`home_target_${n}_desc_en`} type="textarea" {...commonProps} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-network-wired" title="Dijital Ekosistem (Agac Yapisi)" />
            <div className="adm-form-grid2">
              <SettingInput label="1. Renkli Baslik (TR)" settingKey="home_eco_main_title1" {...commonProps} />
              <SettingInput label="1. Renkli Baslik (EN)" settingKey="home_eco_main_title1_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="2. Baslik Devami (TR)" settingKey="home_eco_main_title2" {...commonProps} />
              <SettingInput label="2. Baslik Devami (EN)" settingKey="home_eco_main_title2_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Alt Aciklama (TR)" settingKey="home_eco_main_subtitle" type="textarea" {...commonProps} />
              <SettingInput label="Alt Aciklama (EN)" settingKey="home_eco_main_subtitle_en" type="textarea" {...commonProps} />
            </div>

            <div className="adm-card" style={{marginTop: '20px', padding: '15px'}}>
              <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                Asagidaki kartlar ana sayfadaki agac gorunumunde (slider) listelenir. Istediginiz kadar ekleyebilirsiniz. Ikonlar icin FontAwesome classlarini kullanin.
              </p>
              
              {ecoItems.map((eco, idx) => (
                <div key={idx} className="adm-eco-item" style={{marginBottom:'15px', padding:'15px', background:'var(--surface-1)', border:'1px solid var(--border)', borderRadius:'8px'}}>
                  <div className="adm-eco-header" style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <div className="adm-eco-idx" style={{fontWeight:'bold', color:'var(--accent)'}}><i className={`fas ${eco.icon || 'fa-leaf'}`} style={{marginRight:'8px'}}></i> Kart {idx + 1}</div>
                    <button className="adm-btn adm-btn-danger" style={{height:'26px', fontSize:'0.7rem', padding:'0 10px'}} 
                      onClick={() => {
                        const newArr = [...ecoItems];
                        newArr.splice(idx, 1);
                        saveEcoItems(newArr);
                      }}>
                      <i className="fas fa-trash" /> Sil
                    </button>
                  </div>
                  <div className="adm-form-grid3" style={{marginBottom:'10px'}}>
                    <div className="adm-form-item">
                      <label>Ikon Secimi</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>
                          <i className={`fas ${eco.icon || 'fa-leaf'}`} />
                        </div>
                        <select 
                          className="adm-input-full" 
                          value={eco.icon || 'fa-leaf'} 
                          onChange={e => handleEcoChange(idx, 'icon', e.target.value)}
                          style={{ cursor: 'pointer', margin: 0 }}
                        >
                          {AVAILABLE_ICONS.map(iconOpt => (
                            <option key={iconOpt.value} value={iconOpt.value}>
                              {iconOpt.label}
                            </option>
                          ))}
                          {!AVAILABLE_ICONS.find(i => i.value === eco.icon) && eco.icon && (
                            <option value={eco.icon}>Ozel: {eco.icon}</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="adm-form-item">
                      <label>Baslik (TR)</label>
                      <input className="adm-input-full" value={eco.title || ''} onChange={e => handleEcoChange(idx, 'title', e.target.value)} />
                    </div>
                    <div className="adm-form-item">
                      <label>Baslik (EN)</label>
                      <input className="adm-input-full" value={eco.title_en || ''} onChange={e => handleEcoChange(idx, 'title_en', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-form-grid2">
                    <div className="adm-form-item">
                      <label>Aciklama (TR)</label>
                      <textarea className="adm-textarea-full" rows={2} style={{minHeight:'60px'}} value={eco.desc || ''} onChange={e => handleEcoChange(idx, 'desc', e.target.value)} />
                    </div>
                    <div className="adm-form-item">
                      <label>Aciklama (EN)</label>
                      <textarea className="adm-textarea-full" rows={2} style={{minHeight:'60px'}} value={eco.desc_en || ''} onChange={e => handleEcoChange(idx, 'desc_en', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="adm-btn adm-btn-ghost" style={{width:'100%', borderStyle:'dashed', marginTop:'10px'}} 
                onClick={() => {
                  const newArr = [...ecoItems, { title: 'Yeni Kart', title_en: 'New Card', desc: 'Aciklama', desc_en: 'Description', icon: 'fa-leaf' }];
                  setEcoItems(newArr);
                }}>
                <i className="fas fa-plus" /> Yeni Ekosistem Karti Ekle
              </button>
              <button className="adm-btn adm-btn-save" style={{width:'100%', marginTop:'10px'}} onClick={() => saveEcoItems(ecoItems)}>
                <i className="fas fa-floppy-disk" /> Kartlari Veritabanina Kaydet
              </button>
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-stopwatch" title="Etki Sayaclari" />
            <div className="adm-card-grid2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="adm-card-inner">
                  <div className="adm-card-inner-label">Sayac {n}</div>
                  <SettingInput label="Deger (Rakam)" settingKey={`home_counter_${n}_val`} {...commonProps} />
                  <SettingInput label="Etiket (TR)" settingKey={`home_counter_${n}_label`} {...commonProps} />
                  <SettingInput label="Etiket (EN)" settingKey={`home_counter_${n}_label_en`} {...commonProps} />
                </div>
              ))}
            </div>
          </div>

          <div className="adm-section">
            <SectionHeader iconClass="fas fa-flag-checkered" title="Alt Kapanis (CTA)" />
            <div className="adm-form-grid2">
              <SettingInput label="Baslik (TR)" settingKey="home_cta_title" {...commonProps} />
              <SettingInput label="Baslik (EN)" settingKey="home_cta_title_en" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Metin (TR)" settingKey="home_cta_text" type="textarea" {...commonProps} />
              <SettingInput label="Metin (EN)" settingKey="home_cta_text_en" type="textarea" {...commonProps} />
            </div>
            <div className="adm-form-grid2">
              <SettingInput label="Buton Yazisi (TR)" settingKey="home_cta_btn" {...commonProps} />
              <SettingInput label="Buton Yazisi (EN)" settingKey="home_cta_btn_en" {...commonProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}