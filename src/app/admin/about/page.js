'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  about_general_title: "Hakkimizda", about_general_title_en: "About Us",
  about_consortium_title: "Konsorsiyum", about_consortium_title_en: "Consortium",
  about_impact_title: "Proje Etkisi", about_impact_title_en: "Project Impact",
  about_plan_title: "Proje Plani", about_plan_title_en: "Project Plan",
  about_roadmap_title: "Yol Haritasi", about_roadmap_title_en: "Roadmap",
  about_strategy_title: "Strateji", about_strategy_title_en: "Strategy",

  about_strategy_desc: "Bu rapor, Kapakli Belediyesi tarafindan sunulan ve Erasmus+ programi kapsaminda desteklenen projenin kapsamli bir sunumudur.",
  about_strategy_desc_en: "This report provides a comprehensive presentation of the project supported by the Erasmus+ program.",
  strategy_section_a_title: "A. Proje Kimligi ve Temel Bilgiler",
  strategy_section_a_title_en: "A. Project Identity and Basic Info",
  strategy_text_a_1: "Bu rapor, Kapakli Belediyesi tarafindan sunulan ve Erasmus+ programi kapsaminda desteklenen 'Vatandas Odakli Yerel Yesil Gelecek Icin Dijital Donusum' (DIGI-GREEN FUTURE) baslikli projenin kapsamli bir sunumunu saglamak amaciyla hazirlanmistir.",
  strategy_text_a_1_en: "This report is prepared to provide a comprehensive presentation...",
  strategy_text_a_2: "Toplam 24 ay surecek olan proje, 1 Kasim 2025 tarihinde baslayip 31 Ekim 2027 tarihinde sona erecektir. Projenin yurutulmesi icin 250.000,00 €'luk sabit bir hibe tahsis edilmistir.",
  strategy_text_a_2_en: "The project, which will last a total of 24 months...",
  
  strategy_section_b_title: "B. Projenin Ruhu: Gerekce ve Motivasyon",
  strategy_section_b_title_en: "B. Spirit of the Project: Rationale and Motivation",
  strategy_text_b: "Projemiz, iklim kriziyle mucadelede yerel yonetimler ve vatandaslarin aktif rol almasi gerekliliginden dogmustur. Kapakli gibi sanayilesme bolgelerinin hava/su kirliligi ve yetersiz atik yonetimi gibi acil cevresel sorunlarina odaklanmaktadir.",
  strategy_text_b_en: "Our project was born from the need for local governments and citizens to take an active role...",
  strategy_quote: "Temel felsefemiz; dijitallesmeyi amac degil, cevresel surdurulebilirlik hedeflerine ulasmak icin guclu bir arac olarak kullanmaktir.",
  strategy_quote_en: "Our basic philosophy is to use digitalization not as a goal, but as a powerful tool...",
  
  strategy_section_c_title: "C. Avrupa Politikalariyla Stratejik Uyum",
  strategy_section_c_title_en: "C. Strategic Alignment with European Policies",
  strategy_text_c: "DIGI-GREEN FUTURE, Erasmus+ programinin uc temel yatay onceligiyle dogrudan uyumludur.",
  strategy_text_c_en: "DIGI-GREEN FUTURE is directly aligned with the three main horizontal priorities of the Erasmus+ program."
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
    <div className="adm-section-num"><i className={iconClass || 'fas fa-hashtag'} /></div>
    <div className="adm-section-title">{title}</div>
  </div>
);

function AdminAboutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subTab = searchParams.get('tab') || 'general'; 
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor');
  const [userIp, setUserIp] = useState('Bilinmiyor');
  const [settings, setSettings] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchSettingsData = useCallback(async () => {
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

      await fetchSettingsData();
    }
    load();
    return () => { isMounted = false; };
  }, [router, fetchSettingsData]);

  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { 
      showToast('Yukleme Hatasi: ' + error.message, 'error'); 
      return null; 
    }
    
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
      await logAction(`Hakkinda sayfasi ayari guncellendi: ${key}`);
      fetchSettingsData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    await supabase.from('admin_logs').insert([{ 
      action: actionDescription, 
      user_email: currentUser.email,
      page_section: `about_${subTab}`,
      ip_address: userIp
    }]);
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      <div className="adm-content">
        <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
          
          {subTab === 'general' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Genel)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Genel Hakkinda (Hero) Bolumu" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="about_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="about_hero_eyebrow_en" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Baslik Alani ("Geleceginize Yesil Bir Iz Birakin")</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Satir 1 (TR)" settingKey="about_hero_title1" placeholder="Geleceginize" {...commonProps} />
                  <SettingInput label="Satir 1 (EN)" settingKey="about_hero_title1_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Satir 2 (TR)" settingKey="about_hero_title2" placeholder="Yesil Bir..." {...commonProps} />
                  <SettingInput label="Satir 2 (EN)" settingKey="about_hero_title2_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Vurgulu Kisim (TR)" settingKey="about_hero_title3" placeholder="Iz Birakin" {...commonProps} />
                  <SettingInput label="Vurgulu Kisim (EN)" settingKey="about_hero_title3_en" {...commonProps} />
                </div>
              </div>
              <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                <SettingInput label="Hero Aciklama (TR)" settingKey="about_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Hero Aciklama (EN)" settingKey="about_page_desc_en" type="textarea" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-eye" title="Vizyon & Misyon ve Gorsel" />
              <SettingInput label="Sag Taraf Gorseli" settingKey="about_vision_image" type="image" {...commonProps} />
              
              <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                <SettingInput label="Bolum Etiketi (TR)" settingKey="about_vision_label" placeholder="Vizyonumuz" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="about_vision_label_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Vizyon Baslik (TR)" settingKey="about_vision_title" {...commonProps} />
                <SettingInput label="Vizyon Baslik (EN)" settingKey="about_vision_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Vizyon Metni (TR)" settingKey="about_vision_text" type="textarea" {...commonProps} />
                <SettingInput label="Vizyon Metni (EN)" settingKey="about_vision_text_en" type="textarea" {...commonProps} />
              </div>
              
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Vizyon Maddeleri (Liste)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Madde 1 (TR)" settingKey="about_vision_list1" {...commonProps} />
                  <SettingInput label="Madde 1 (EN)" settingKey="about_vision_list1_en" {...commonProps} />
                  <SettingInput label="Madde 2 (TR)" settingKey="about_vision_list2" {...commonProps} />
                  <SettingInput label="Madde 2 (EN)" settingKey="about_vision_list2_en" {...commonProps} />
                  <SettingInput label="Madde 3 (TR)" settingKey="about_vision_list3" {...commonProps} />
                  <SettingInput label="Madde 3 (EN)" settingKey="about_vision_list3_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-chart-line" title="Rakamlarla Biz (Istatistikler)" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="about_stats_label" placeholder="Rakamlarla Biz" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="about_stats_label_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Basligi (TR)" settingKey="about_stats_title" placeholder="Projenin Etkisi" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="about_stats_title_en" {...commonProps} />
              </div>
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="adm-card-inner">
                      <div className="adm-card-inner-label">Sayac {n}</div>
                      <SettingInput label="Deger (Sayi)" settingKey={`about_stat_${n}_val`} {...commonProps} />
                      <SettingInput label="Isaret (+, %)" settingKey={`about_stat_${n}_suffix`} {...commonProps} />
                      <div style={{marginTop:'10px'}}>
                          <SettingInput label="Etiket (TR)" settingKey={`about_stat_${n}_label`} {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`about_stat_${n}_label_en`} {...commonProps} />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-users" title="Hedef Kitle Kartlari" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="about_target_label" placeholder="Kimin Icin?" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="about_target_label_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Basligi (TR)" settingKey="about_target_title" placeholder="Hedef Kitlemiz" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="about_target_title_en" {...commonProps} />
              </div>
              <div style={{marginTop:'15px'}}>
                {[1, 2, 3].map(n => (
                  <div key={n} className="adm-card-inner" style={{marginBottom:'15px'}}>
                    <div className="adm-card-inner-label">Hedef Karti {n}</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik (TR)" settingKey={`about_target_${n}_title`} {...commonProps} />
                      <SettingInput label="Baslik (EN)" settingKey={`about_target_${n}_title_en`} {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Aciklama (TR)" settingKey={`about_target_${n}_desc`} type="textarea" {...commonProps} />
                      <SettingInput label="Aciklama (EN)" settingKey={`about_target_${n}_desc_en`} type="textarea" {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-table" title="Proje Kunyesi (Tablo)" />
              <div className="adm-form-grid2">
                <SettingInput label="Tablo Ust Etiketi (TR)" settingKey="about_spec_label" placeholder="Ozet Bilgi" {...commonProps} />
                <SettingInput label="Tablo Ust Etiketi (EN)" settingKey="about_spec_label_en" placeholder="Summary Info" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Tablo Ana Basligi (TR)" settingKey="about_spec_title" placeholder="Proje Kunyesi" {...commonProps} />
                <SettingInput label="Tablo Ana Basligi (EN)" settingKey="about_spec_title_en" placeholder="Project Details" {...commonProps} />
              </div>
              
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>1. Satir (Orn: Proje Adi)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="1. Satir BASLIK (TR)" settingKey="about_project_name_label" placeholder="Proje Adi" {...commonProps} />
                  <SettingInput label="1. Satir BASLIK (EN)" settingKey="about_project_name_label_en" placeholder="Project Name" {...commonProps} />
                  <SettingInput label="1. Satir DEGER (TR)" settingKey="about_project_name" placeholder="DIGI-GREEN FUTURE" {...commonProps} />
                  <SettingInput label="1. Satir DEGER (EN)" settingKey="about_project_name_en" placeholder="DIGI-GREEN FUTURE" {...commonProps} />
                </div>

                <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>2. Satir (Orn: Proje Kodu)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="2. Satir BASLIK (TR)" settingKey="about_project_code_label" placeholder="Proje Kodu" {...commonProps} />
                  <SettingInput label="2. Satir BASLIK (EN)" settingKey="about_project_code_label_en" placeholder="Project Code" {...commonProps} />
                  <SettingInput label="2. Satir DEGER (TR)" settingKey="about_project_code" placeholder="2023-1-TR01-KA220-ADU-00015421" {...commonProps} />
                  <SettingInput label="2. Satir DEGER (EN)" settingKey="about_project_code_en" placeholder="2023-1-TR01-KA220-ADU-00015421" {...commonProps} />
                </div>

                <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>3. Satir (Orn: Program)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="3. Satir BASLIK (TR)" settingKey="about_project_program_label" placeholder="Program" {...commonProps} />
                  <SettingInput label="3. Satir BASLIK (EN)" settingKey="about_project_program_label_en" placeholder="Program" {...commonProps} />
                  <SettingInput label="3. Satir DEGER (TR)" settingKey="about_project_program" placeholder="Erasmus+ Yetiskin Egitimi" {...commonProps} />
                  <SettingInput label="3. Satir DEGER (EN)" settingKey="about_project_program_en" placeholder="Erasmus+ Adult Education" {...commonProps} />
                </div>

                <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>4. Satir (Orn: Sure)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="4. Satir BASLIK (TR)" settingKey="about_project_duration_label" placeholder="Sure" {...commonProps} />
                  <SettingInput label="4. Satir BASLIK (EN)" settingKey="about_project_duration_label_en" placeholder="Duration" {...commonProps} />
                  <SettingInput label="4. Satir DEGER (TR)" settingKey="about_project_duration" placeholder="24 Ay" {...commonProps} />
                  <SettingInput label="4. Satir DEGER (EN)" settingKey="about_project_duration_en" placeholder="24 Months" {...commonProps} />
                </div>

                <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>5. Satir (Orn: Butce)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="5. Satir BASLIK (TR)" settingKey="about_project_budget_label" placeholder="Butce" {...commonProps} />
                  <SettingInput label="5. Satir BASLIK (EN)" settingKey="about_project_budget_label_en" placeholder="Budget" {...commonProps} />
                  <SettingInput label="5. Satir DEGER (TR)" settingKey="about_project_budget" placeholder="250.000 €" {...commonProps} />
                  <SettingInput label="5. Satir DEGER (EN)" settingKey="about_project_budget_en" placeholder="250.000 €" {...commonProps} />
                </div>
              </div>

              <SectionHeader iconClass="fas fa-flag-checkered" title="Alt Kapanis (CTA)" />
              <div className="adm-card-inner">
                <div className="adm-form-grid2">
                  <SettingInput label="Rozet Metni (TR)" settingKey="about_cta_badge" {...commonProps} />
                  <SettingInput label="Rozet Metni (EN)" settingKey="about_cta_badge_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Baslik Satir 1 (TR)" settingKey="about_cta_title1" {...commonProps} />
                  <SettingInput label="Baslik Satir 1 (EN)" settingKey="about_cta_title1_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Baslik Satir 2 (TR)" settingKey="about_cta_title2" {...commonProps} />
                  <SettingInput label="Baslik Satir 2 (EN)" settingKey="about_cta_title2_en" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Aciklama (TR)" settingKey="about_cta_desc" type="textarea" {...commonProps} />
                  <SettingInput label="Aciklama (EN)" settingKey="about_cta_desc_en" type="textarea" {...commonProps} />
                </div>
                <div className="adm-form-grid2">
                  <SettingInput label="Buton Yazisi (TR)" settingKey="about_cta_button" {...commonProps} />
                  <SettingInput label="Buton Yazisi (EN)" settingKey="about_cta_button_en" {...commonProps} />
                </div>
              </div>

            </div>
          )}

          {subTab === 'consortium' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Konsorsiyum)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Sayfa Girisi (Hero)" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="consortium_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="consortium_hero_eyebrow_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="consortium_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="consortium_hero_title1_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 2 (TR)" settingKey="consortium_hero_title2" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 2 (EN)" settingKey="consortium_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="consortium_intro" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="consortium_intro_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="consortium_scroll_btn" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="consortium_scroll_btn_en" {...commonProps} />
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-chart-bar" title="Istatistikler" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="consortium_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="consortium_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="consortium_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="consortium_sec_title_en" {...commonProps} />
              </div>
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                {[1,2,3,4].map(n => (
                  <div key={n} className="adm-card-inner">
                    <div className="adm-card-inner-label">Sayac {n}</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Deger (TR) Orn: 150K" settingKey={`consortium_stat_${n}_val`} {...commonProps} />
                      <SettingInput label="Deger (EN)" settingKey={`consortium_stat_${n}_val_en`} {...commonProps} />
                      <SettingInput label="Birim/Isaret (TR) Orn: +" settingKey={`consortium_stat_${n}_unit`} {...commonProps} />
                      <SettingInput label="Birim/Isaret (EN)" settingKey={`consortium_stat_${n}_unit_en`} {...commonProps} />
                    </div>
                    <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                      <SettingInput label="Etiket (TR)" settingKey={`consortium_stat_${n}_label`} {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`consortium_stat_${n}_label_en`} {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-id-card" title="Kart A (Koordinator)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="consortium_badge_a" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="consortium_badge_a_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="consortium_section_a_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="consortium_section_a_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Aciklama (TR)" settingKey="consortium_text_a" type="textarea" {...commonProps} />
                <SettingInput label="Aciklama (EN)" settingKey="consortium_text_a_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart A Alt Ozellikleri</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_a_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_a_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_a_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_a_pill2_en" {...commonProps} />
                  <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_a_pill3" {...commonProps} />
                  <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_a_pill3_en" {...commonProps} />
                  <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_a_pill4" {...commonProps} />
                  <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_a_pill4_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-globe-europe" title="Kart B (Avrupali Ortaklar)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="consortium_badge_b" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="consortium_badge_b_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="consortium_section_b_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="consortium_section_b_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Aciklama (TR)" settingKey="consortium_text_b" type="textarea" {...commonProps} />
                <SettingInput label="Aciklama (EN)" settingKey="consortium_text_b_en" type="textarea" {...commonProps} />
              </div>
              
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label" style={{color:'#16a34a'}}>Ortak 1 (Avrupa)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Kurum Adi (TR)" settingKey="consortium_b_p1_name" {...commonProps} />
                  <SettingInput label="Kurum Adi (EN)" settingKey="consortium_b_p1_name_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_b_p1_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_b_p1_country_en" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_b_p1_desc" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_b_p1_desc_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label" style={{color:'#16a34a'}}>Ortak 2 (Avrupa)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Kurum Adi (TR)" settingKey="consortium_b_p2_name" {...commonProps} />
                  <SettingInput label="Kurum Adi (EN)" settingKey="consortium_b_p2_name_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_b_p2_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_b_p2_country_en" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_b_p2_desc" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_b_p2_desc_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart B Alt Ozellikleri</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_b_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_b_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_b_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_b_pill2_en" {...commonProps} />
                  <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_b_pill3" {...commonProps} />
                  <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_b_pill3_en" {...commonProps} />
                  <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_b_pill4" {...commonProps} />
                  <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_b_pill4_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-handshake" title="Kart C (Turk Ortaklar)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="consortium_badge_c" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="consortium_badge_c_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="consortium_section_c_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="consortium_section_c_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Aciklama (TR)" settingKey="consortium_text_c" type="textarea" {...commonProps} />
                <SettingInput label="Aciklama (EN)" settingKey="consortium_text_c_en" type="textarea" {...commonProps} />
              </div>
              
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label" style={{color:'#ea580c'}}>Ortak 1 (Turk)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Kurum Adi (TR)" settingKey="consortium_c_p1_name" {...commonProps} />
                  <SettingInput label="Kurum Adi (EN)" settingKey="consortium_c_p1_name_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_c_p1_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_c_p1_country_en" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_c_p1_desc" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_c_p1_desc_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label" style={{color:'#ea580c'}}>Ortak 2 (Turk)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Kurum Adi (TR)" settingKey="consortium_c_p2_name" {...commonProps} />
                  <SettingInput label="Kurum Adi (EN)" settingKey="consortium_c_p2_name_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_c_p2_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_c_p2_country_en" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (TR)" settingKey="consortium_c_p2_desc" {...commonProps} />
                  <SettingInput label="Kisa Bilgi (EN)" settingKey="consortium_c_p2_desc_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart C Alt Ozellikleri</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="consortium_c_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="consortium_c_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="consortium_c_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="consortium_c_pill2_en" {...commonProps} />
                  <SettingInput label="Ozellik 3 (TR)" settingKey="consortium_c_pill3" {...commonProps} />
                  <SettingInput label="Ozellik 3 (EN)" settingKey="consortium_c_pill3_en" {...commonProps} />
                  <SettingInput label="Ozellik 4 (TR)" settingKey="consortium_c_pill4" {...commonProps} />
                  <SettingInput label="Ozellik 4 (EN)" settingKey="consortium_c_pill4_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-network-wired" title="Kart D (Sinerji & Etki)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="consortium_badge_d" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="consortium_badge_d_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="consortium_section_d_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="consortium_section_d_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Icerik Metni (TR)" settingKey="consortium_text_d" type="textarea" {...commonProps} />
                <SettingInput label="Icerik Metni (EN)" settingKey="consortium_text_d_en" type="textarea" {...commonProps} />
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Sehir 1 (Orn: Kapakli)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c1_city" {...commonProps} />
                  <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c1_city_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_d_c1_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_d_c1_country_en" {...commonProps} />
                  <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c1_challenge" {...commonProps} />
                  <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c1_challenge_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Sehir 2 (Orn: Liepāja)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c2_city" {...commonProps} />
                  <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c2_city_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_d_c2_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_d_c2_country_en" {...commonProps} />
                  <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c2_challenge" {...commonProps} />
                  <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c2_challenge_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Sehir 3 (Orn: Cascais)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Sehir Adi (TR)" settingKey="consortium_d_c3_city" {...commonProps} />
                  <SettingInput label="Sehir Adi (EN)" settingKey="consortium_d_c3_city_en" {...commonProps} />
                  <SettingInput label="Ulke (TR)" settingKey="consortium_d_c3_country" {...commonProps} />
                  <SettingInput label="Ulke (EN)" settingKey="consortium_d_c3_country_en" {...commonProps} />
                  <SettingInput label="Odak Noktasi (TR)" settingKey="consortium_d_c3_challenge" {...commonProps} />
                  <SettingInput label="Odak Noktasi (EN)" settingKey="consortium_d_c3_challenge_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                <SettingInput label="Alt Sinerji Notu (TR)" settingKey="consortium_synergy_note" type="textarea" {...commonProps} />
                <SettingInput label="Alt Sinerji Notu (EN)" settingKey="consortium_synergy_note_en" type="textarea" {...commonProps} />
              </div>
            </div>
          )}

          {subTab === 'impact' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Proje Etkisi)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="impact_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="impact_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="impact_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="impact_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="impact_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="impact_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="impact_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="impact_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="impact_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="impact_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-chart-pie" title="Etki Istatistikleri" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="impact_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="impact_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="impact_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="impact_sec_title_en" {...commonProps} />
              </div>
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                {[1,2,3,4].map(n => (
                  <div key={n} className="adm-card-inner">
                    <div className="adm-card-inner-label">Metrik {n}</div>
                    <SettingInput label="Deger (Sayi / %)" settingKey={`impact_stat_${n}_val`} {...commonProps} />
                    <div style={{marginTop:'10px'}}>
                      <SettingInput label="Etiket (TR)" settingKey={`impact_stat_${n}_label`} {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`impact_stat_${n}_label_en`} {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-bolt" title="Stratejik Etki Karti (Kart A)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="impact_badge_a" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="impact_badge_a_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="impact_section_1_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="impact_section_1_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Metin (TR)" settingKey="impact_section_1_text" type="textarea" {...commonProps} />
                <SettingInput label="Metin (EN)" settingKey="impact_section_1_text_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                <div className="adm-card-inner-label">Etki Vurgulari (Madde Isaretleri)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Vurgu 1 (TR)" settingKey="impact_h1" {...commonProps} />
                  <SettingInput label="Vurgu 1 (EN)" settingKey="impact_h1_en" {...commonProps} />
                  <SettingInput label="Vurgu 2 (TR)" settingKey="impact_h2" {...commonProps} />
                  <SettingInput label="Vurgu 2 (EN)" settingKey="impact_h2_en" {...commonProps} />
                  <SettingInput label="Vurgu 3 (TR)" settingKey="impact_h3" {...commonProps} />
                  <SettingInput label="Vurgu 3 (EN)" settingKey="impact_h3_en" {...commonProps} />
                  <SettingInput label="Vurgu 4 (TR)" settingKey="impact_h4" {...commonProps} />
                  <SettingInput label="Vurgu 4 (EN)" settingKey="impact_h4_en" {...commonProps} />
                </div>
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Alt Vurgu Notu (TR)" settingKey="impact_highlight_text" type="textarea" {...commonProps} />
                <SettingInput label="Alt Vurgu Notu (EN)" settingKey="impact_highlight_text_en" type="textarea" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-eye" title="Vizyon Karti (Kart B)" />
              <div className="adm-form-grid2">
                <SettingInput label="Rozet (TR)" settingKey="impact_badge_b" {...commonProps} />
                <SettingInput label="Rozet (EN)" settingKey="impact_badge_b_en" {...commonProps} />
                <SettingInput label="Baslik (TR)" settingKey="impact_section_2_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="impact_section_2_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Metin (TR)" settingKey="impact_section_2_text" type="textarea" {...commonProps} />
                <SettingInput label="Metin (EN)" settingKey="impact_section_2_text_en" type="textarea" {...commonProps} />
              </div>
              
              <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                <div className="adm-card-inner-label">6'li Vizyon Sutunlari</div>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'5px'}}>Sutun {n}</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik (TR)" settingKey={`impact_vp${n}_title`} {...commonProps} />
                      <SettingInput label="Baslik (EN)" settingKey={`impact_vp${n}_title_en`} {...commonProps} />
                    </div>
                    <div className="adm-form-grid2" style={{marginTop:'5px'}}>
                      <SettingInput label="Aciklama (TR)" settingKey={`impact_vp${n}_desc`} type="textarea" {...commonProps} />
                      <SettingInput label="Aciklama (EN)" settingKey={`impact_vp${n}_desc_en`} type="textarea" {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adm-form-grid2">
                <SettingInput label="Kapanis Slogani (TR)" settingKey="impact_closing_msg" type="textarea" {...commonProps} />
                <SettingInput label="Kapanis Slogani (EN)" settingKey="impact_closing_msg_en" type="textarea" {...commonProps} />
              </div>
            </div>
          )}

          {subTab === 'plan' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Proje Plani)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="plan_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="plan_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="plan_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="plan_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="plan_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="plan_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="plan_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="plan_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="plan_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="plan_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-chart-bar" title="Plan Istatistikleri" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="plan_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="plan_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="plan_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="plan_sec_title_en" {...commonProps} />
              </div>
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="adm-card-inner">
                    <div className="adm-card-inner-label" style={{color: 'var(--accent)'}}>Sayac {n}</div>
                    
                    <div className="adm-form-grid2">
                      <SettingInput label="Deger (TR)" settingKey={`plan_stat_${n}_val`} placeholder="Orn: 4" {...commonProps} />
                      <SettingInput label="Deger (EN)" settingKey={`plan_stat_${n}_val_en`} placeholder="Orn: 4" {...commonProps} />
                    </div>

                    <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                      <SettingInput label="Birim (TR)" settingKey={`plan_stat_${n}_unit`} placeholder="Orn: Ay, IP" {...commonProps} />
                      <SettingInput label="Birim (EN)" settingKey={`plan_stat_${n}_unit_en`} placeholder="Orn: Months, WP" {...commonProps} />
                    </div>

                    <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                      <SettingInput label="Etiket (TR)" settingKey={`plan_stat_${n}_label`} placeholder="Alt Yazi" {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`plan_stat_${n}_label_en`} placeholder="Subtitle" {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-stream" title="Proje Asamalari (Timeline)" />
              <div className="adm-form-grid2">
                <SettingInput label="Kart Ici Alt Baslik (Orn: Neler Yapilacak?)" settingKey="plan_timeline_pills_label" {...commonProps} />
                <SettingInput label="Kart Ici Alt Baslik (EN)" settingKey="plan_timeline_pills_label_en" {...commonProps} />
              </div>
              
              <div style={{marginTop: '20px'}}>
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="adm-card-inner" style={{marginBottom:'20px'}}>
                    <div className="adm-card-inner-label" style={{fontSize:'1rem', color:'var(--accent)'}}>Asama {step} (IP{step+1})</div>
                    <div className="adm-form-grid2">
                      <SettingInput label={`Asama ${step} Baslik (TR)`} settingKey={`plan_step_${step}_title`} {...commonProps} />
                      <SettingInput label={`Asama ${step} Baslik (EN)`} settingKey={`plan_step_${step}_title_en`} {...commonProps} />
                    </div>
                    <div className="adm-form-grid2">
                      <SettingInput label={`Asama ${step} Metni (TR)`} settingKey={`plan_step_${step}_desc`} type="textarea" {...commonProps} />
                      <SettingInput label={`Asama ${step} Metni (EN)`} settingKey={`plan_step_${step}_desc_en`} type="textarea" {...commonProps} />
                    </div>
                    
                    <div style={{marginTop:'15px', padding:'10px', background:'var(--surface-1)', borderRadius:'8px', border:'1px solid var(--border)'}}>
                      <div style={{fontSize:'0.75rem', fontWeight:'bold', marginBottom:'10px'}}>Asama Ici Etiketler (Pills)</div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Etiket 1 (TR)" settingKey={`plan_step_${step}_pill_1`} {...commonProps} />
                        <SettingInput label="Etiket 1 (EN)" settingKey={`plan_step_${step}_pill_1_en`} {...commonProps} />
                        <SettingInput label="Etiket 2 (TR)" settingKey={`plan_step_${step}_pill_2`} {...commonProps} />
                        <SettingInput label="Etiket 2 (EN)" settingKey={`plan_step_${step}_pill_2_en`} {...commonProps} />
                        <SettingInput label="Etiket 3 (TR)" settingKey={`plan_step_${step}_pill_3`} {...commonProps} />
                        <SettingInput label="Etiket 3 (EN)" settingKey={`plan_step_${step}_pill_3_en`} {...commonProps} />
                        <SettingInput label="Etiket 4 (TR)" settingKey={`plan_step_${step}_pill_4`} {...commonProps} />
                        <SettingInput label="Etiket 4 (EN)" settingKey={`plan_step_${step}_pill_4_en`} {...commonProps} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {subTab === 'roadmap' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Yol Haritasi)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="roadmap_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="roadmap_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="roadmap_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="roadmap_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="roadmap_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="roadmap_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="roadmap_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="roadmap_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="roadmap_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="roadmap_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-table" title="Tablo Ust Bilgileri" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="roadmap_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="roadmap_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="roadmap_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="roadmap_sec_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Tablo Basligi (Orn: Is Paketleri)" settingKey="roadmap_table_header" {...commonProps} />
                <SettingInput label="Tablo Basligi (EN)" settingKey="roadmap_table_header_en" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-list-check" title="Gantt Semasi Gorevleri (1-21)" />
              <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                Asagidaki 21 adet gorevin ismini TR ve EN olarak duzenleyebilirsiniz. Bos biraktiginiz kutularda yedek (eski) ceviriler gorunmeye devam edecektir.
              </div>
              
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                {[...Array(21)].map((_, i) => (
                  <div key={i+1} className="adm-card-inner">
                    <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>Gorev {i+1}</div>
                    <SettingInput label={`Gorev ${i+1} Adi (TR)`} settingKey={`roadmap_task_${i+1}`} {...commonProps} />
                    <SettingInput label={`Gorev ${i+1} Adi (EN)`} settingKey={`roadmap_task_${i+1}_en`} {...commonProps} />
                  </div>
                ))}
              </div>

            </div>
          )}

          {subTab === 'strategy' && (
            <div className="adm-fade-in">
              <div className="adm-page-header">
                <div className="adm-page-title">Hakkinda <em>(Strateji)</em></div>
              </div>
              <SectionHeader iconClass="fas fa-layer-group" title="Hero (Giris) Bolumu" />
              <div className="adm-form-grid2">
                <SettingInput label="Ust Ufak Baslik (TR)" settingKey="strategy_hero_eyebrow" {...commonProps} />
                <SettingInput label="Ust Ufak Baslik (EN)" settingKey="strategy_hero_eyebrow_en" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="strategy_hero_title1" {...commonProps} />
                <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="strategy_hero_title1_en" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="strategy_hero_title2" {...commonProps} />
                <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="strategy_hero_title2_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Giris Aciklamasi (TR)" settingKey="strategy_page_desc" type="textarea" {...commonProps} />
                <SettingInput label="Giris Aciklamasi (EN)" settingKey="strategy_page_desc_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                <SettingInput label="Kaydirma Butonu (TR)" settingKey="strategy_hero_scroll" {...commonProps} />
                <SettingInput label="Kaydirma Butonu (EN)" settingKey="strategy_hero_scroll_en" {...commonProps} />
              </div>

              <div className="adm-divider" />

              <SectionHeader iconClass="fas fa-chart-line" title="Strateji Istatistikleri" />
              <div className="adm-form-grid2">
                <SettingInput label="Bolum Etiketi (TR)" settingKey="strategy_sec_label" {...commonProps} />
                <SettingInput label="Bolum Etiketi (EN)" settingKey="strategy_sec_label_en" {...commonProps} />
                <SettingInput label="Bolum Basligi (TR)" settingKey="strategy_sec_title" {...commonProps} />
                <SettingInput label="Bolum Basligi (EN)" settingKey="strategy_sec_title_en" {...commonProps} />
              </div>
              <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="adm-card-inner">
                    <div className="adm-card-inner-label" style={{color: 'var(--accent)'}}>Sayac {n}</div>
                    
                    <div className="adm-form-grid2">
                      <SettingInput label="Deger (TR)" settingKey={`strategy_stat_${n}_val`} placeholder="Orn: 24" {...commonProps} />
                      <SettingInput label="Deger (EN)" settingKey={`strategy_stat_${n}_val_en`} placeholder="Orn: 24" {...commonProps} />
                    </div>

                    <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                      <SettingInput label="Birim/Isaret (TR)" settingKey={`strategy_stat_${n}_unit`} placeholder="Orn: Ay, €, vb." {...commonProps} />
                      <SettingInput label="Birim/Isaret (EN)" settingKey={`strategy_stat_${n}_unit_en`} placeholder="Orn: Months" {...commonProps} />
                    </div>

                    <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                      <SettingInput label="Etiket (TR)" settingKey={`strategy_stat_${n}_label`} placeholder="Alt Yazi" {...commonProps} />
                      <SettingInput label="Etiket (EN)" settingKey={`strategy_stat_${n}_label_en`} placeholder="Subtitle" {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="adm-divider" />
              <SectionHeader iconClass="fas fa-calendar-alt" title="Kart A (Zaman Cizelgesi & Hazirlik)" />
              <div className="adm-form-grid2">
                <SettingInput label="Baslik (TR)" settingKey="strategy_section_a_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="strategy_section_a_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Paragraf 1 (TR)" settingKey="strategy_text_a_1" type="textarea" {...commonProps} />
                <SettingInput label="Paragraf 1 (EN)" settingKey="strategy_text_a_1_en" type="textarea" {...commonProps} />
                <SettingInput label="Paragraf 2 (TR)" settingKey="strategy_text_a_2" type="textarea" {...commonProps} />
                <SettingInput label="Paragraf 2 (EN)" settingKey="strategy_text_a_2_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart A Alt Ozellikleri (Pills)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_a_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_a_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_a_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_a_pill2_en" {...commonProps} />
                  <SettingInput label="Ozellik 3 (TR)" settingKey="strategy_a_pill3" {...commonProps} />
                  <SettingInput label="Ozellik 3 (EN)" settingKey="strategy_a_pill3_en" {...commonProps} />
                  <SettingInput label="Ozellik 4 (TR)" settingKey="strategy_a_pill4" {...commonProps} />
                  <SettingInput label="Ozellik 4 (EN)" settingKey="strategy_a_pill4_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-bullseye" title="Kart B (Odak Noktasi & Felsefe)" />
              <div className="adm-form-grid2">
                <SettingInput label="Baslik (TR)" settingKey="strategy_section_b_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="strategy_section_b_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Aciklama (TR)" settingKey="strategy_text_b" type="textarea" {...commonProps} />
                <SettingInput label="Aciklama (EN)" settingKey="strategy_text_b_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Alinti Soz (TR)" settingKey="strategy_quote" type="textarea" {...commonProps} />
                <SettingInput label="Alinti Soz (EN)" settingKey="strategy_quote_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart B Alt Ozellikleri (Pills)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_b_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_b_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_b_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_b_pill2_en" {...commonProps} />
                  <SettingInput label="Ozellik 3 (TR)" settingKey="strategy_b_pill3" {...commonProps} />
                  <SettingInput label="Ozellik 3 (EN)" settingKey="strategy_b_pill3_en" {...commonProps} />
                  <SettingInput label="Ozellik 4 (TR)" settingKey="strategy_b_pill4" {...commonProps} />
                  <SettingInput label="Ozellik 4 (EN)" settingKey="strategy_b_pill4_en" {...commonProps} />
                </div>
              </div>

              <div className="adm-divider" />
              
              <SectionHeader iconClass="fas fa-globe-europe" title="Kart C (Avrupa Politikalari Uyum)" />
              <div className="adm-form-grid2">
                <SettingInput label="Baslik (TR)" settingKey="strategy_section_c_title" {...commonProps} />
                <SettingInput label="Baslik (EN)" settingKey="strategy_section_c_title_en" {...commonProps} />
              </div>
              <div className="adm-form-grid2">
                <SettingInput label="Aciklama (TR)" settingKey="strategy_text_c" type="textarea" {...commonProps} />
                <SettingInput label="Aciklama (EN)" settingKey="strategy_text_c_en" type="textarea" {...commonProps} />
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">3 Temel Oncelik (Priorities)</div>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)'}}>Oncelik {n}</div>
                    <div className="adm-form-grid2">
                      <SettingInput label="Baslik (TR)" settingKey={`strategy_c_prio${n}_title`} {...commonProps} />
                      <SettingInput label="Baslik (EN)" settingKey={`strategy_c_prio${n}_title_en`} {...commonProps} />
                      <SettingInput label="Aciklama (TR)" settingKey={`strategy_c_prio${n}_desc`} type="textarea" {...commonProps} />
                      <SettingInput label="Aciklama (EN)" settingKey={`strategy_c_prio${n}_desc_en`} type="textarea" {...commonProps} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="adm-card-inner" style={{marginTop:'15px'}}>
                <div className="adm-card-inner-label">Kart C Alt Ozellikleri (Pills)</div>
                <div className="adm-form-grid2">
                  <SettingInput label="Ozellik 1 (TR)" settingKey="strategy_c_pill1" {...commonProps} />
                  <SettingInput label="Ozellik 1 (EN)" settingKey="strategy_c_pill1_en" {...commonProps} />
                  <SettingInput label="Ozellik 2 (TR)" settingKey="strategy_c_pill2" {...commonProps} />
                  <SettingInput label="Ozellik 2 (EN)" settingKey="strategy_c_pill2_en" {...commonProps} />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminAboutPage() {
  return (
    <Suspense fallback={<div className="adm-loading"><div className="adm-loading-spinner" /></div>}>
      <AdminAboutContent />
    </Suspense>
  );
}