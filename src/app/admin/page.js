'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import '../globals.css';

/* ─── DEFAULTS ──────── */
const DEFAULTS = {
  
  header_logo_text: "DIGI-GREEN",
  header_logo_highlight: "FUTURE",
  footer_desc: "Kapaklı Belediyesi liderliğinde yürütülen sürdürülebilir kalkınma projesi.",
  footer_column2_title: "Hızlı Menü",
  footer_column3_title: "İletişim",
  footer_eu_logo: "/assets/images/eu-flag.png",
  footer_disclaimer: "Avrupa Birliği tarafından finanse edilmiştir. Ancak ifade edilen görüş ve düşünceler yalnızca yazar(lar)a aittir...",
  contact_email: "info@digigreenfuture.eu",
  contact_phone: "+90 282 000 00 00",
  hero_title: "Yerel Yeşil Gelecek İçin Dijital Dönüşüm",
  hero_desc: "Erasmus+ KA220-ADU kapsamında, iklim değişikliği ile mücadelede dijital araçları kullanmayı hedefleyen öncü proje.",
  
  home_summary_1_val: "24 Ay", home_summary_1_label: "Proje Süresi",
  home_summary_2_val: "250.000€", home_summary_2_label: "Toplam Hibe",
  home_summary_3_val: "KA220-ADU", home_summary_3_label: "Program",
  home_summary_4_val: "3 Ülke", home_summary_4_label: "Kapsam",
  
  home_about_title: "Teknoloji ve Doğanın Mükemmel Uyumu",
  home_about_text: "Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur.",
  home_target_1_title: "Vatandaşlar", home_target_1_desc: "Mobil uygulamalar ile geri dönüşüme katılın.",
  home_target_2_title: "Yerel Yönetimler", home_target_2_desc: "Veriye dayalı kararlar alarak kaynakları verimli kullanın.",
  home_target_3_title: "STK ve Akademik", home_target_3_desc: "Araştırma ve eğitim çalışmalarında aktif rol alın.",
  
  home_counter_1_val: "250000", home_counter_1_label: "Toplam Hibe (€)",
  home_counter_2_val: "3", home_counter_2_label: "Ortak Ülke",
  home_counter_3_val: "5", home_counter_3_label: "Proje Ortağı",
  home_counter_4_val: "24", home_counter_4_label: "Ay Süre",
  
  home_cta_title: "Geleceği Birlikte Tasarlayalım",
  home_cta_text: "Daha fazla bilgi almak için bize ulaşın.",
  
  // HAKKINDA ALT SAYFALARI
  about_general_title: "Hakkımızda", about_general_title_en: "About Us",
  about_consortium_title: "Konsorsiyum", about_consortium_title_en: "Consortium",
  about_impact_title: "Proje Etkisi", about_impact_title_en: "Project Impact",
  about_plan_title: "Proje Planı", about_plan_title_en: "Project Plan",
  about_roadmap_title: "Yol Haritası", about_roadmap_title_en: "Roadmap",
  about_strategy_title: "Strateji", about_strategy_title_en: "Strategy",

  // STRATEJİ (Gerçek metinler)
  about_strategy_desc: "Bu rapor, Kapaklı Belediyesi tarafından sunulan ve Erasmus+ programı kapsamında desteklenen projenin kapsamlı bir sunumudur.",
  about_strategy_desc_en: "This report provides a comprehensive presentation of the project supported by the Erasmus+ program.",
  strategy_section_a_title: "A. Proje Kimliği ve Temel Bilgiler",
  strategy_section_a_title_en: "A. Project Identity and Basic Info",
  strategy_text_a_1: "Bu rapor, Kapaklı Belediyesi tarafından sunulan ve Erasmus+ programı kapsamında desteklenen 'Vatandaş Odaklı Yerel Yeşil Gelecek için Dijital Dönüşüm' (DIGI-GREEN FUTURE) başlıklı projenin kapsamlı bir sunumunu sağlamak amacıyla hazırlanmıştır.",
  strategy_text_a_1_en: "This report is prepared to provide a comprehensive presentation...",
  strategy_text_a_2: "Toplam 24 ay sürecek olan proje, 1 Kasım 2025 tarihinde başlayıp 31 Ekim 2027 tarihinde sona erecektir. Projenin yürütülmesi için 250.000,00 €'luk sabit bir hibe tahsis edilmiştir.",
  strategy_text_a_2_en: "The project, which will last a total of 24 months...",
  
  strategy_section_b_title: "B. Projenin Ruhu: Gerekçe ve Motivasyon",
  strategy_section_b_title_en: "B. Spirit of the Project: Rationale and Motivation",
  strategy_text_b: "Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur. Kapaklı gibi sanayileşme bölgelerinin hava/su kirliliği ve yetersiz atık yönetimi gibi acil çevresel sorunlarına odaklanmaktadır.",
  strategy_text_b_en: "Our project was born from the need for local governments and citizens to take an active role...",
  strategy_quote: "Temel felsefemiz; dijitalleşmeyi amaç değil, çevresel sürdürülebilirlik hedeflerine ulaşmak için güçlü bir araç olarak kullanmaktır.",
  strategy_quote_en: "Our basic philosophy is to use digitalization not as a goal, but as a powerful tool...",
  
  strategy_section_c_title: "C. Avrupa Politikalarıyla Stratejik Uyum",
  strategy_section_c_title_en: "C. Strategic Alignment with European Policies",
  strategy_text_c: "DIGI-GREEN FUTURE, Erasmus+ programının üç temel yatay önceliğiyle doğrudan uyumludur.",
  strategy_text_c_en: "DIGI-GREEN FUTURE is directly aligned with the three main horizontal priorities of the Erasmus+ program.",

  news_page_title: "Haberler & Duyurular",
  news_page_title_en: "News & Announcements",
  news_page_desc: "Projemizle ilgili en güncel gelişmeleri, duyuruları ve etkinlikleri buradan takip edebilirsiniz.",
  news_page_desc_en: "You can follow the latest developments, announcements and events about our project here.",
  
  activities_page_title: "Faaliyetler & Etkinlikler",
  activities_page_title_en: "Activities & Events",
  activities_page_desc: "Proje kapsamında gerçekleştirdiğimiz toplantılar ve faaliyetler.",
  activities_page_desc_en: "Meetings and activities we held within the scope of the project.",

  partners_page_title: "Ortaklar & Kurumlar",
  partners_page_title_en: "Partners & Institutions",
  partners_page_desc: "Projemize güç katan uluslararası ortaklarımız.",
  partners_page_desc_en: "Our international partners who add strength to our project.",

  results_page_title: "Proje Dosyaları",
  results_page_title_en: "Project Files",
  results_page_desc: "Projemiz sonucunda ortaya çıkan fikri çıktılar, raporlar ve materyaller.",
  results_page_desc_en: "Intellectual outputs, reports and materials resulting from our project."
};

/* ─── TOAST ──────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <div className={`adm-toast-icon ${type}`}><i className={type === 'error' ? 'fas fa-xmark' : 'fas fa-check'} /></div>
      <div className="adm-toast-text"><strong>{type === 'error' ? 'Hata oluştu' : 'Başarılı'}</strong><span>{message}</span></div>
      <button className="adm-toast-close" onClick={onClose}><i className="fas fa-xmark" /></button>
    </div>
  );
};
/* ─── KULLANILABİLİR İKONLAR LİSTESİ ─── */
const AVAILABLE_ICONS = [
  { value: 'fa-leaf', label: 'Yaprak / Doğa' },
  { value: 'fa-mobile-screen', label: 'Mobil Cihaz / Uygulama' },
  { value: 'fa-recycle', label: 'Geri Dönüşüm' },
  { value: 'fa-graduation-cap', label: 'Eğitim / Okul' },
  { value: 'fa-globe', label: 'Dünya / Küresel' },
  { value: 'fa-tree', label: 'Ağaç / Orman' },
  { value: 'fa-seedling', label: 'Fidan / Büyüme' },
  { value: 'fa-solar-panel', label: 'Güneş Paneli / Enerji' },
  { value: 'fa-wind', label: 'Rüzgar / Temiz Hava' },
  { value: 'fa-water', label: 'Su / Deniz' },
  { value: 'fa-lightbulb', label: 'Fikir / Yenilik' },
  { value: 'fa-users', label: 'İnsanlar / Toplum' },
  { value: 'fa-handshake', label: 'İşbirliği / Ortaklık' },
  { value: 'fa-chart-line', label: 'Grafik / Gelişim' },
  { value: 'fa-laptop', label: 'Bilgisayar / Dijital' },
  { value: 'fa-city', label: 'Şehir / Yerel Yönetim' },
  { value: 'fa-bolt', label: 'Enerji / Hız' },
  { value: 'fa-bullhorn', label: 'Duyuru / Kampanya' }
];
/* ─── CONFIRM MODAL ──────────────────────────────────────────────────── */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal">
        <div className="adm-modal-icon"><i className="fas fa-trash" /></div>
        <h3>Emin misiniz?</h3><p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgeç</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Sil</button>
        </div>
      </div>
    </div>
  );
};

/* ─── SETTING INPUT ──────────────────────────────────────────────────── */
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
          <textarea className="adm-textarea" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} rows={4} />
        ) : type === 'image' ? (
          <div className="adm-img-field">
            <div className="adm-img-preview-wrap">
              {val ? <img src={val} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
              <input type="text" className="adm-img-url-input" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder="URL girin veya dosya yükleyin..." />
            </div>
            <label className="adm-upload-btn" title="Masaüstünden Yükle"><i className="fas fa-upload" />
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

/* ─── FILE INPUT ─────────────────────────────────────────────────────── */
const FileInput = ({ value, onChange, placeholder, uploadFile, showToast }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async e => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const url = await uploadFile(file);
      if (url) { onChange(url); if (showToast) showToast('Dosya başarıyla yüklendi.', 'success'); }
    } catch { if (showToast) showToast('Yükleme hatası oluştu.', 'error'); }
    finally { setUploading(false); }
  };
  return (
    <div className="adm-img-field">
      <div className="adm-img-preview-wrap">
        {value ? <img src={value} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
        <input type="text" className="adm-img-url-input" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
      </div>
      <label className="adm-upload-btn" title="Yükle">
        {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-upload" />}
        <input type="file" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
};

/* ─── SECTION HEADER ─────────────────────────────────────────────────── */
const SectionHeader = ({ num, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num">{num}</div>
    <div className="adm-section-title">{title}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setAboutSubTab] = useState('strategy'); 
  const [loading, setLoading] = useState(true);
  
  // Auth ve Güvenlik States
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [logs, setLogs] = useState([]);

  // Data States
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [ecoItems, setEcoItems] = useState([]); // AĞAÇ YAPISI İÇİN STATE

  // Form States
  const [newsForm, setNewsForm] = useState({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
  const [activityForm, setActivityForm] = useState({ id: null, title: '', title_en: '', type: 'Toplantı (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlanıyor', status_en: '', link: '', icon: 'file' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };
  
  useEffect(() => { checkSessionAndLoad(); }, []);

  async function checkSessionAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }
    
    setCurrentUser(session.user);
    await loadAllData();
    setLoading(false);
  }

  async function loadAllData() {
    const s = await supabase.from('settings').select('*').order('id');
    const n = await supabase.from('news').select('*').order('date', { ascending: false });
    const a = await supabase.from('activities').select('*').order('id', { ascending: false });
    const p = await supabase.from('partners').select('*').order('id');
    const r = await supabase.from('results').select('*').order('id');
    const m = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    setLogs([
      { id: 1, action: "Admin Paneline Giriş Yapıldı", date: new Date().toLocaleString('tr-TR'), ip: "192.168.1.1" }
    ]);

    const existingSettings = s.data || [];
    setSettings(existingSettings);
    setNews(n.data || []);
    setActivities(a.data || []);
    setPartners(p.data || []);
    setResults(r.data || []);
    setMessages(m.data || []);

    const heroSliderStr = existingSettings.find(x => x.key === 'hero_slider_images')?.value;
    if (heroSliderStr) { try { setHeroImages(JSON.parse(heroSliderStr)); } catch(e){} }
    else {
      const oldHeroBg = existingSettings.find(x => x.key === 'hero_bg_image')?.value;
      if (oldHeroBg) setHeroImages([oldHeroBg]);
    }

    // AĞAÇ YAPISI VERİSİNİ ÇEKME
    const ecoStr = existingSettings.find(x => x.key === 'home_eco_list')?.value;
    if (ecoStr) { 
        try { setEcoItems(JSON.parse(ecoStr)); } catch(e){} 
    } else {
        setEcoItems([
            { title: 'Mobil Uygulama', desc: 'Vatandaşlara yönelik dijital araçlar.', icon: 'fa-mobile-screen' },
            { title: 'Geri Dönüşüm', desc: 'Çevre dostu alışkanlıklar.', icon: 'fa-recycle' },
            { title: 'Eğitim', desc: 'Farkındalık ve kapasite geliştirme.', icon: 'fa-graduation-cap' },
            { title: 'Doğa', desc: 'Sürdürülebilir yaşam pratikleri.', icon: 'fa-leaf' }
        ]);
    }
  }

  // AĞAÇ YAPISI DÜZENLEME FONKSİYONLARI
  const handleEcoChange = (index, field, value) => {
    const newItems = [...ecoItems];
    newItems[index][field] = value;
    setEcoItems(newItems);
  };

  const saveEcoItems = async (itemsToSave) => {
    setEcoItems(itemsToSave);
    const { error } = await supabase.from('settings').upsert({ key: 'home_eco_list', value: JSON.stringify(itemsToSave) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Ağaç kutuları güncellendi.', 'success');
  };

  // ŞİFRE DEĞİŞTİRME FONKSİYONU
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { showToast('Şifre güncellenemedi: ' + error.message, 'error'); } 
    else { showToast('Şifreniz başarıyla güncellendi!', 'success'); setNewPassword(''); }
  };

  const autoTranslateText = async (text) => {
    if (!text) return '';
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (error) { return text; }
  }

  const handleTranslateNews = async (e) => { e.preventDefault(); setIsTranslating(true); showToast('Çevriliyor...', 'success'); const t_title = await autoTranslateText(newsForm.title); const t_summary = await autoTranslateText(newsForm.summary); const t_desc = await autoTranslateText(newsForm.description); setNewsForm(prev => ({...prev, title_en: t_title, summary_en: t_summary, description_en: t_desc})); setIsTranslating(false); showToast('Tamamlandı!', 'success'); };
  const handleTranslateActivities = async (e) => { e.preventDefault(); setIsTranslating(true); showToast('Çevriliyor...', 'success'); const t_title = await autoTranslateText(activityForm.title); const t_type = await autoTranslateText(activityForm.type); const t_loc = await autoTranslateText(activityForm.location); const t_summary = await autoTranslateText(activityForm.summary); const t_desc = await autoTranslateText(activityForm.description); setActivityForm(prev => ({...prev, title_en: t_title, type_en: t_type, location_en: t_loc, summary_en: t_summary, description_en: t_desc})); setIsTranslating(false); showToast('Tamamlandı!', 'success'); };
  const handleTranslatePartners = async (e) => { e.preventDefault(); setIsTranslating(true); showToast('Çevriliyor...', 'success'); const t_name = await autoTranslateText(partnerForm.name); const t_country = await autoTranslateText(partnerForm.country); const t_desc = await autoTranslateText(partnerForm.description); setPartnerForm(prev => ({...prev, name_en: t_name, country_en: t_country, description_en: t_desc})); setIsTranslating(false); showToast('Tamamlandı!', 'success'); };
  const handleTranslateResults = async (e) => { e.preventDefault(); setIsTranslating(true); showToast('Çevriliyor...', 'success'); const t_title = await autoTranslateText(resultForm.title); const t_desc = await autoTranslateText(resultForm.description); setResultForm(prev => ({...prev, title_en: t_title, description_en: t_desc})); setIsTranslating(false); showToast('Tamamlandı!', 'success'); };

  const saveHeroImages = async (newArr) => {
    setHeroImages(newArr);
    const { error } = await supabase.from('settings').upsert({ key: 'hero_slider_images', value: JSON.stringify(newArr) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error'); else showToast('Slider güncellendi.', 'success');
  };

  const moveHeroImage = (index, direction) => {
    const newArr = [...heroImages];
    if (direction === -1 && index > 0) { [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]; }
    else if (direction === 1 && index < newArr.length - 1) { [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]]; }
    saveHeroImages(newArr);
  };

  async function uploadFile(file) {
    if (!file) return null;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { showToast('Yükleme Hatası: ' + error.message, 'error'); return null; }
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
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error'); else showToast('Ayar kaydedildi.', 'success');
  }

  async function deleteItem(table, id) {
    showConfirm('Bu öğeyi kalıcı olarak silmek istediğinizden emin misiniz?', async () => {
      await supabase.from(table).delete().eq('id', id);
      loadAllData(); showToast('Başarıyla silindi.', 'success');
    });
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    let result = id ? await supabase.from(table).update(data).eq('id', id) : await supabase.from(table).insert([data]);
    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    setIsEditing(false); loadAllData(); showToast('Başarıyla kaydedildi.', 'success');
    if (table === 'news') setNewsForm({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
    if (table === 'activities') setActivityForm({ id: null, title: '', title_en: '', type: 'Toplantı (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
    if (table === 'partners') setPartnerForm({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
    if (table === 'results') setResultForm({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlanıyor', status_en: '', link: '', icon: 'file' });
  }

  function startEdit(item, type) {
    setIsEditing(true);
    if (type === 'news') setNewsForm({ ...item });
    if (type === 'activities') setActivityForm({ ...item });
    if (type === 'partners') setPartnerForm({ ...item });
    if (type === 'results') setResultForm({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  const NAV = [
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: messages.length, group: 'Genel' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'İçerik' },
    { id: 'about', label: 'Hakkında', icon: 'fas fa-circle-info', group: 'İçerik' },
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: news.length, group: 'İçerik' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activities.length, group: 'İçerik' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partners.length, group: 'İçerik' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: results.length, group: 'İçerik' },
    { id: 'contact', label: 'İletişim', icon: 'fas fa-phone', group: 'İçerik' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'İçerik' },
    { id: 'users', label: 'Kullanıcılar', icon: 'fas fa-users', group: 'Ayarlar' },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar' },
    { id: 'security', label: 'Şifre & Güvenlik', icon: 'fas fa-lock', group: 'Ayarlar' },
  ];

  const groupedNav = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const currentTab = NAV.find(n => n.id === activeTab);

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Yükleniyor...</p></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-logo"><div className="adm-brand-icon"><i className="fas fa-leaf" /></div>DIGI-<span>GREEN</span></div>
            <div className="adm-brand-sub">Yönetim Paneli</div>
          </div>
          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
                <div className="adm-nav-label">{group}</div>
                {items.map(item => (
                  <button key={item.id} className={`adm-nav-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => { setActiveTab(item.id); setIsEditing(false); }}>
                    <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                    {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <button className="adm-signout" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}><i className="fas fa-arrow-right-from-bracket" /> Çıkış Yap</button>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">{currentTab && <><i className={currentTab.icon} style={{marginRight:'10px', color:'var(--accent)'}} />{currentTab.label}</>}</div>
            <div className="adm-topbar-pill"><span className="dot" /> {currentUser?.email || 'Admin'}</div>
          </div>

          <div className="adm-content">

            {/* ══ ANA SAYFA ══════════════════════════════════════════════ */}
            {activeTab === 'home' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ana Sayfa <em>Düzenle</em></div>
                </div>

                {/* 1. SLIDER */}
                <div className="adm-section">
                  <SectionHeader num="1" title="Kapak Slider Resimleri" />
                  <div className="adm-card">
                    <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'14px'}}>Resimleri sürükleyip sıralayabilir, ok butonlarıyla yukarı/aşağı taşıyabilirsiniz.</p>
                    {heroImages.map((img, i) => (
                      <div key={i} className="adm-slider-item">
                        <span className="adm-slider-idx">{i + 1}</span>
                        <img src={img} className="adm-slider-thumb" alt="" onError={e => e.target.style.background='var(--surface-2)'} />
                        <input className="adm-slider-url" placeholder="Resim URL" value={img} onChange={e => { const a = [...heroImages]; a[i] = e.target.value; setHeroImages(a); }} />
                        <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, -1)} disabled={i === 0} title="Yukarı"><i className="fas fa-chevron-up" /></button>
                        <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, 1)} disabled={i === heroImages.length - 1} title="Aşağı"><i className="fas fa-chevron-down" /></button>
                        <button className="adm-btn adm-btn-danger" style={{height:'30px', padding:'0 10px', fontSize:'0.75rem'}} onClick={() => saveHeroImages(heroImages.filter((_, idx) => idx !== i))}><i className="fas fa-xmark" /></button>
                      </div>
                    ))}
                    <div className="adm-slider-add">
                      <div className="adm-slider-add-label"><i className="fas fa-plus" /> Yeni Resim Ekle</div>
                      <FileInput value="" onChange={url => { if (url) saveHeroImages([...heroImages, url]); }} placeholder="URL yapıştırın veya dosya yükleyin..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    <button className="adm-btn adm-btn-ghost" style={{marginTop:'12px'}} onClick={() => saveHeroImages(heroImages)}><i className="fas fa-floppy-disk" /> URL Değişikliklerini Kaydet</button>
                  </div>
                </div>

                {/* 2. HERO METİNLER VE BUTONLAR */}
                <div className="adm-section">
                  <SectionHeader num="2" title="Kapak Metinleri ve Butonlar" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Vurgu / Logo Metni (TR)" settingKey="home_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Vurgu / Logo Metni (EN)" settingKey="home_hero_eyebrow_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Ana Başlık (TR)" settingKey="hero_title" {...commonProps} />
                    <SettingInput label="Ana Başlık (EN)" settingKey="hero_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Açıklama Metni (TR)" settingKey="hero_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Açıklama Metni (EN)" settingKey="hero_desc_en" type="textarea" {...commonProps} />
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

                {/* 3. ÖZET KARTLAR */}
                <div className="adm-section">
                  <SectionHeader num="3" title="Özet Bilgi Kartları" />
                  <div className="adm-card-grid2">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Kart {n}</div>
                        <div className="adm-form-grid2">
                            <SettingInput label="Değer (TR)" settingKey={`home_summary_${n}_val`} {...commonProps} />
                            <SettingInput label="Etiket (TR)" settingKey={`home_summary_${n}_label`} {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                            <SettingInput label="Değer (EN)" settingKey={`home_summary_${n}_val_en`} {...commonProps} />
                            <SettingInput label="Etiket (EN)" settingKey={`home_summary_${n}_label_en`} {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. HAKKINDA */}
                <div className="adm-section">
                  <SectionHeader num="4" title="Hakkında Bölümü (Görsel & Metinler)" />
                  <SettingInput label="Sol Taraf Görseli" settingKey="home_about_image" type="image" {...commonProps} />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Başlık (TR)" settingKey="home_about_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Başlık (EN)" settingKey="home_about_eyebrow_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Ana Başlık (TR)" settingKey="home_about_title" {...commonProps} />
                    <SettingInput label="Ana Başlık (EN)" settingKey="home_about_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Açıklama Metni (TR)" settingKey="home_about_text" type="textarea" {...commonProps} />
                    <SettingInput label="Açıklama Metni (EN)" settingKey="home_about_text_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Görsel Üstü Rozet Metni (TR)" settingKey="home_about_badge" {...commonProps} />
                    <SettingInput label="Görsel Üstü Rozet Metni (EN)" settingKey="home_about_badge_en" {...commonProps} />
                  </div>
                  <div className="adm-card-inner" style={{marginTop:'15px'}}>
                      <div className="adm-card-inner-label">Madde İşaretleri (Tik Listesi)</div>
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

                {/* 5. HEDEF KİTLE */}
                <div className="adm-section">
                  <SectionHeader num="5" title="Hedef Kitle Bölümü" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ana Başlık (TR)" settingKey="home_target_main_title" {...commonProps} />
                    <SettingInput label="Ana Başlık (EN)" settingKey="home_target_main_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Alt Başlık (TR)" settingKey="home_target_main_subtitle" type="textarea" {...commonProps} />
                    <SettingInput label="Alt Başlık (EN)" settingKey="home_target_main_subtitle_en" type="textarea" {...commonProps} />
                  </div>
                  <div style={{marginTop: '20px'}}>
                      {[1, 2, 3].map(n => (
                        <div key={n} className="adm-card-inner" style={{marginBottom:'10px'}}>
                          <div className="adm-card-inner-label">Hedef Kartı {n}</div>
                          <div className="adm-form-grid2">
                            <SettingInput label="Başlık (TR)" settingKey={`home_target_${n}_title`} {...commonProps} />
                            <SettingInput label="Başlık (EN)" settingKey={`home_target_${n}_title_en`} {...commonProps} />
                          </div>
                          <div className="adm-form-grid2">
                            <SettingInput label="Açıklama (TR)" settingKey={`home_target_${n}_desc`} type="textarea" {...commonProps} />
                            <SettingInput label="Açıklama (EN)" settingKey={`home_target_${n}_desc_en`} type="textarea" {...commonProps} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 6. DİJİTAL EKOSİSTEM (DİNAMİK JSON) */}
                <div className="adm-section">
                  <SectionHeader num="6" title="Dijital Ekosistem (Ağaç Yapısı)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="1. Renkli Başlık (TR)" settingKey="home_eco_main_title1" {...commonProps} />
                    <SettingInput label="1. Renkli Başlık (EN)" settingKey="home_eco_main_title1_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="2. Başlık Devamı (TR)" settingKey="home_eco_main_title2" {...commonProps} />
                    <SettingInput label="2. Başlık Devamı (EN)" settingKey="home_eco_main_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Alt Açıklama (TR)" settingKey="home_eco_main_subtitle" type="textarea" {...commonProps} />
                    <SettingInput label="Alt Açıklama (EN)" settingKey="home_eco_main_subtitle_en" type="textarea" {...commonProps} />
                  </div>

                  <div className="adm-card" style={{marginTop: '20px', padding: '15px'}}>
                    <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                      Aşağıdaki kartlar ana sayfadaki ağaç görünümünde (slider) listelenir. İstediğiniz kadar ekleyebilirsiniz. İkonlar için <a href="https://fontawesome.com/icons" target="_blank" style={{color:'var(--accent)'}}>FontAwesome</a> class'larını (örn: fa-mobile-screen) kullanın.
                    </p>
                    
                    {ecoItems.map((eco, idx) => (
                      <div key={idx} className="adm-eco-item">
                        <div className="adm-eco-header">
                          <div className="adm-eco-idx"><i className={`fas ${eco.icon || 'fa-leaf'}`} style={{marginRight:'8px'}}></i> Kart {idx + 1}</div>
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
                            <label>İkon Seçimi</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {/* İkon Önizleme Kutusu */}
                              <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>
                                <i className={`fas ${eco.icon || 'fa-leaf'}`} />
                              </div>
                              {/* Açılır Liste */}
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
                                {/* Listede olmayan ama manuel eklenmiş eski ikonlar varsa onu da gösterir */}
                                {!AVAILABLE_ICONS.find(i => i.value === eco.icon) && eco.icon && (
                                  <option value={eco.icon}>Özel: {eco.icon}</option>
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="adm-form-item">
                            <label>Başlık (TR)</label>
                            <input className="adm-input-full" value={eco.title || ''} onChange={e => handleEcoChange(idx, 'title', e.target.value)} />
                          </div>
                          <div className="adm-form-item">
                            <label>Başlık (EN)</label>
                            <input className="adm-input-full" value={eco.title_en || ''} onChange={e => handleEcoChange(idx, 'title_en', e.target.value)} />
                          </div>
                        </div>
                        <div className="adm-form-grid2">
                          <div className="adm-form-item">
                            <label>Açıklama (TR)</label>
                            <textarea className="adm-textarea-full" rows={2} value={eco.desc || ''} onChange={e => handleEcoChange(idx, 'desc', e.target.value)} />
                          </div>
                          <div className="adm-form-item">
                            <label>Açıklama (EN)</label>
                            <textarea className="adm-textarea-full" rows={2} value={eco.desc_en || ''} onChange={e => handleEcoChange(idx, 'desc_en', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button className="adm-btn adm-btn-ghost" style={{width:'100%', borderStyle:'dashed', marginTop:'10px'}} 
                      onClick={() => {
                        const newArr = [...ecoItems, { title: 'Yeni Kart', title_en: 'New Card', desc: 'Açıklama', desc_en: 'Description', icon: 'fa-leaf' }];
                        setEcoItems(newArr);
                      }}>
                      <i className="fas fa-plus" /> Yeni Ekosistem Kartı Ekle
                    </button>
                    <button className="adm-btn adm-btn-save" style={{width:'100%', marginTop:'10px'}} onClick={() => saveEcoItems(ecoItems)}>
                      <i className="fas fa-floppy-disk" /> Kartları Veritabanına Kaydet
                    </button>
                  </div>
                </div>

                {/* 7. SAYAÇLAR */}
                <div className="adm-section">
                  <SectionHeader num="7" title="Etki Sayaçları" />
                  <div className="adm-counter-grid">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Sayaç {n}</div>
                        <SettingInput label="Değer (Rakam)" settingKey={`home_counter_${n}_val`} {...commonProps} />
                        <SettingInput label="Etiket (TR)" settingKey={`home_counter_${n}_label`} {...commonProps} />
                        <SettingInput label="Etiket (EN)" settingKey={`home_counter_${n}_label_en`} {...commonProps} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. CTA */}
                <div className="adm-section">
                  <SectionHeader num="8" title="Alt Kapanış (CTA)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Başlık (TR)" settingKey="home_cta_title" {...commonProps} />
                    <SettingInput label="Başlık (EN)" settingKey="home_cta_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Metin (TR)" settingKey="home_cta_text" type="textarea" {...commonProps} />
                    <SettingInput label="Metin (EN)" settingKey="home_cta_text_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Buton Yazısı (TR)" settingKey="home_cta_btn" {...commonProps} />
                    <SettingInput label="Buton Yazısı (EN)" settingKey="home_cta_btn_en" {...commonProps} />
                  </div>
                </div>
              </div>
            )}

            {/* ══ HAKKINDA (DETAYLI SAYFALAR) ═══════════════════════════════════ */}
            {activeTab === 'about' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Hakkında <em>Sayfaları</em></div>
                  <div className="adm-page-desc">Hakkında açılır menüsündeki tüm alt sayfaların içeriklerini buradan yönetebilirsiniz.</div>
                </div>

                <div className="adm-subtabs">
                  <button className={`adm-subtab ${subTab === 'general' ? 'active' : ''}`} onClick={() => setAboutSubTab('general')}>Genel Hakkında</button>
                  <button className={`adm-subtab ${subTab === 'consortium' ? 'active' : ''}`} onClick={() => setAboutSubTab('consortium')}>Konsorsiyum</button>
                  <button className={`adm-subtab ${subTab === 'impact' ? 'active' : ''}`} onClick={() => setAboutSubTab('impact')}>Proje Etkisi</button>
                  <button className={`adm-subtab ${subTab === 'plan' ? 'active' : ''}`} onClick={() => setAboutSubTab('plan')}>Proje Planı</button>
                  <button className={`adm-subtab ${subTab === 'roadmap' ? 'active' : ''}`} onClick={() => setAboutSubTab('roadmap')}>Yol Haritası</button>
                  <button className={`adm-subtab ${subTab === 'strategy' ? 'active' : ''}`} onClick={() => setAboutSubTab('strategy')}>Strateji</button>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  
                  {/* 1. GENEL HAKKINDA SAYFASI (TAM YÖNETİM) */}
                  {subTab === 'general' && (
                    <div className="adm-fade-in">
                      
                      {/* --- 1. HERO BÖLÜMÜ --- */}
                      <SectionHeader num="1" title="Hero (Giriş) Bölümü" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="about_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="about_hero_eyebrow_en" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Başlık Alanı ("Geleceğinize Yeşil Bir İz Bırakın")</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Satır 1 (TR)" settingKey="about_hero_title1" placeholder="Geleceğinize" {...commonProps} />
                          <SettingInput label="Satır 1 (EN)" settingKey="about_hero_title1_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Satır 2 (TR)" settingKey="about_hero_title2" placeholder="Yeşil Bir..." {...commonProps} />
                          <SettingInput label="Satır 2 (EN)" settingKey="about_hero_title2_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Vurgulu Kısım (TR)" settingKey="about_hero_title3" placeholder="İz Bırakın" {...commonProps} />
                          <SettingInput label="Vurgulu Kısım (EN)" settingKey="about_hero_title3_en" {...commonProps} />
                        </div>
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                        <SettingInput label="Hero Açıklama (TR)" settingKey="about_page_desc" type="textarea" {...commonProps} />
                        <SettingInput label="Hero Açıklama (EN)" settingKey="about_page_desc_en" type="textarea" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- 2. VİZYON BÖLÜMÜ --- */}
                      <SectionHeader num="2" title="Vizyon & Misyon ve Görsel" />
                      
                      {/* RESİM DÜZENLEME ALANI EKLENDİ */}
                      <SettingInput label="Sağ Taraf Görseli" settingKey="home_about_image" type="image" {...commonProps} />
                      
                      <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="about_vision_label" placeholder="Vizyonumuz" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="about_vision_label_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Vizyon Başlık (TR)" settingKey="about_vision_title" {...commonProps} />
                        <SettingInput label="Vizyon Başlık (EN)" settingKey="about_vision_title_en" {...commonProps} />
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

                      {/* --- 3. İSTATİSTİKLER (RAKAMLARLA BİZ) --- */}
                      <SectionHeader num="3" title="Rakamlarla Biz (İstatistikler)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="about_stats_label" placeholder="Rakamlarla Biz" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="about_stats_label_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="about_stats_title" placeholder="Projenin Etkisi" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="about_stats_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                           {[1, 2, 3, 4].map(n => (
                             <div key={n} className="adm-card-inner">
                               <div className="adm-card-inner-label">Sayaç {n}</div>
                               <SettingInput label="Değer (Sayı)" settingKey={`about_stat_${n}_val`} {...commonProps} />
                               <SettingInput label="İşaret (+, %)" settingKey={`about_stat_${n}_suffix`} {...commonProps} />
                               <div style={{marginTop:'10px'}}>
                                  <SettingInput label="Etiket (TR)" settingKey={`about_stat_${n}_label`} {...commonProps} />
                                  <SettingInput label="Etiket (EN)" settingKey={`about_stat_${n}_label_en`} {...commonProps} />
                               </div>
                             </div>
                           ))}
                      </div>

                      <div className="adm-divider" />

                      {/* --- 4. HEDEF KİTLE --- */}
                      <SectionHeader num="4" title="Hedef Kitle Kartları" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="about_target_label" placeholder="Kimin İçin?" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="about_target_label_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="about_target_title" placeholder="Hedef Kitlemiz" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="about_target_title_en" {...commonProps} />
                      </div>
                      <div style={{marginTop:'15px'}}>
                        {[1, 2, 3].map(n => (
                          <div key={n} className="adm-card-inner" style={{marginBottom:'15px'}}>
                            <div className="adm-card-inner-label">Hedef Kartı {n}</div>
                            <div className="adm-form-grid2">
                              <SettingInput label="Başlık (TR)" settingKey={`about_target_${n}_title`} {...commonProps} />
                              <SettingInput label="Başlık (EN)" settingKey={`about_target_${n}_title_en`} {...commonProps} />
                            </div>
                            <div className="adm-form-grid2">
                              <SettingInput label="Açıklama (TR)" settingKey={`about_target_${n}_desc`} type="textarea" {...commonProps} />
                              <SettingInput label="Açıklama (EN)" settingKey={`about_target_${n}_desc_en`} type="textarea" {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-divider" />

                      {/* --- 5. PROJE KÜNYESİ --- */}
                      <SectionHeader num="5" title="Proje Künyesi (Tablo)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="about_spec_label" placeholder="Teknik Detaylar" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="about_spec_label_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="about_spec_title" placeholder="Proje Künyesi" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="about_spec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-form-grid2">
                          <SettingInput label="Proje Adı (TR)" settingKey="about_project_name" {...commonProps} />
                          <SettingInput label="Proje Adı (EN)" settingKey="about_project_name_en" {...commonProps} />
                          <SettingInput label="Proje Kodu (TR)" settingKey="about_project_code" {...commonProps} />
                          <SettingInput label="Proje Kodu (EN)" settingKey="about_project_code_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Program (TR)" settingKey="about_project_program" {...commonProps} />
                          <SettingInput label="Program (EN)" settingKey="about_project_program_en" {...commonProps} />
                          <SettingInput label="Süre (TR)" settingKey="about_project_duration" {...commonProps} />
                          <SettingInput label="Süre (EN)" settingKey="about_project_duration_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Bütçe (TR)" settingKey="about_project_budget" {...commonProps} />
                          <SettingInput label="Bütçe (EN)" settingKey="about_project_budget_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />

                      {/* --- 6. SAYFA SONU CTA --- */}
                      <SectionHeader num="6" title="Alt Kapanış (CTA)" />
                      <div className="adm-card-inner">
                        <div className="adm-form-grid2">
                          <SettingInput label="Rozet Metni (TR)" settingKey="about_cta_badge" {...commonProps} />
                          <SettingInput label="Rozet Metni (EN)" settingKey="about_cta_badge_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Başlık Satır 1 (TR)" settingKey="about_cta_title1" {...commonProps} />
                          <SettingInput label="Başlık Satır 1 (EN)" settingKey="about_cta_title1_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Başlık Satır 2 (TR)" settingKey="about_cta_title2" {...commonProps} />
                          <SettingInput label="Başlık Satır 2 (EN)" settingKey="about_cta_title2_en" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Açıklama (TR)" settingKey="about_cta_desc" type="textarea" {...commonProps} />
                          <SettingInput label="Açıklama (EN)" settingKey="about_cta_desc_en" type="textarea" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Buton Yazısı (TR)" settingKey="about_cta_button" {...commonProps} />
                          <SettingInput label="Buton Yazısı (EN)" settingKey="about_cta_button_en" {...commonProps} />
                        </div>
                      </div>

                    </div>
                  )}

                 {/* 2. KONSORSİYUM SAYFASI */}
                  {subTab === 'consortium' && (
                    <div className="adm-fade-in">
                      <SectionHeader num="1" title="Sayfa Girişi (Hero)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="consortium_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="consortium_hero_eyebrow_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="consortium_hero_title1" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="consortium_hero_title1_en" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 2 (TR)" settingKey="consortium_hero_title2" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 2 (EN)" settingKey="consortium_hero_title2_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Giriş Açıklaması (TR)" settingKey="consortium_intro" type="textarea" {...commonProps} />
                        <SettingInput label="Giriş Açıklaması (EN)" settingKey="consortium_intro_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                        <SettingInput label="Kaydırma Butonu (TR)" settingKey="consortium_scroll_btn" {...commonProps} />
                        <SettingInput label="Kaydırma Butonu (EN)" settingKey="consortium_scroll_btn_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />
                      <SectionHeader num="2" title="İstatistikler" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="consortium_sec_label" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="consortium_sec_label_en" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="consortium_sec_title" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="consortium_sec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                        {[1,2,3,4].map(n => (
                          <div key={n} className="adm-card-inner">
                            <div className="adm-card-inner-label">Sayaç {n}</div>
                            <SettingInput label="Değer" settingKey={`consortium_stat_${n}_val`} {...commonProps} />
                            <SettingInput label="İşaret (+, %)" settingKey={`consortium_stat_${n}_unit`} {...commonProps} />
                            <div style={{marginTop:'10px'}}>
                              <SettingInput label="Etiket (TR)" settingKey={`consortium_stat_${n}_label`} {...commonProps} />
                              <SettingInput label="Etiket (EN)" settingKey={`consortium_stat_${n}_label_en`} {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-divider" />
                      <SectionHeader num="3" title="Kart A (Koordinatör)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="consortium_badge_a" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="consortium_badge_a_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="consortium_section_a_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="consortium_section_a_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Açıklama (TR)" settingKey="consortium_text_a" type="textarea" {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey="consortium_text_a_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart A Alt Özellikleri</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Özellik 1 (TR)" settingKey="consortium_a_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="consortium_a_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="consortium_a_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="consortium_a_pill2_en" {...commonProps} />
                          <SettingInput label="Özellik 3 (TR)" settingKey="consortium_a_pill3" {...commonProps} />
                          <SettingInput label="Özellik 3 (EN)" settingKey="consortium_a_pill3_en" {...commonProps} />
                          <SettingInput label="Özellik 4 (TR)" settingKey="consortium_a_pill4" {...commonProps} />
                          <SettingInput label="Özellik 4 (EN)" settingKey="consortium_a_pill4_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />
                      <SectionHeader num="4" title="Kart B (Avrupalı Ortaklar)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="consortium_badge_b" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="consortium_badge_b_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="consortium_section_b_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="consortium_section_b_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Açıklama (TR)" settingKey="consortium_text_b" type="textarea" {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey="consortium_text_b_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart B Ortakları ve Özellikleri</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Ortak 1 Adı" settingKey="consortium_b_p1_name" {...commonProps} />
                          <SettingInput label="Ortak 1 Ülke" settingKey="consortium_b_p1_country" {...commonProps} />
                          <SettingInput label="Ortak 1 Kısa Bilgi" settingKey="consortium_b_p1_desc" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Ortak 2 Adı" settingKey="consortium_b_p2_name" {...commonProps} />
                          <SettingInput label="Ortak 2 Ülke" settingKey="consortium_b_p2_country" {...commonProps} />
                          <SettingInput label="Ortak 2 Kısa Bilgi" settingKey="consortium_b_p2_desc" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                          <SettingInput label="Özellik 1 (TR)" settingKey="consortium_b_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="consortium_b_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="consortium_b_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="consortium_b_pill2_en" {...commonProps} />
                          <SettingInput label="Özellik 3 (TR)" settingKey="consortium_b_pill3" {...commonProps} />
                          <SettingInput label="Özellik 3 (EN)" settingKey="consortium_b_pill3_en" {...commonProps} />
                          <SettingInput label="Özellik 4 (TR)" settingKey="consortium_b_pill4" {...commonProps} />
                          <SettingInput label="Özellik 4 (EN)" settingKey="consortium_b_pill4_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />
                      <SectionHeader num="5" title="Kart C (Türk Ortaklar)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="consortium_badge_c" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="consortium_badge_c_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="consortium_section_c_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="consortium_section_c_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Açıklama (TR)" settingKey="consortium_text_c" type="textarea" {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey="consortium_text_c_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart C Ortakları ve Özellikleri</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Ortak 1 Adı" settingKey="consortium_c_p1_name" {...commonProps} />
                          <SettingInput label="Ortak 1 Ülke" settingKey="consortium_c_p1_country" {...commonProps} />
                          <SettingInput label="Ortak 1 Kısa Bilgi" settingKey="consortium_c_p1_desc" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                          <SettingInput label="Ortak 2 Adı" settingKey="consortium_c_p2_name" {...commonProps} />
                          <SettingInput label="Ortak 2 Ülke" settingKey="consortium_c_p2_country" {...commonProps} />
                          <SettingInput label="Ortak 2 Kısa Bilgi" settingKey="consortium_c_p2_desc" {...commonProps} />
                        </div>
                        <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                          <SettingInput label="Özellik 1 (TR)" settingKey="consortium_c_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="consortium_c_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="consortium_c_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="consortium_c_pill2_en" {...commonProps} />
                          <SettingInput label="Özellik 3 (TR)" settingKey="consortium_c_pill3" {...commonProps} />
                          <SettingInput label="Özellik 3 (EN)" settingKey="consortium_c_pill3_en" {...commonProps} />
                          <SettingInput label="Özellik 4 (TR)" settingKey="consortium_c_pill4" {...commonProps} />
                          <SettingInput label="Özellik 4 (EN)" settingKey="consortium_c_pill4_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />
                      <SectionHeader num="6" title="Kart D (Sinerji & Etki)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="consortium_badge_d" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="consortium_badge_d_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="consortium_section_d_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="consortium_section_d_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="İçerik Metni (TR)" settingKey="consortium_text_d" type="textarea" {...commonProps} />
                        <SettingInput label="İçerik Metni (EN)" settingKey="consortium_text_d_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Karşılaştırmalı Şehirler</div>
                        <div className="adm-form-grid3">
                          <SettingInput label="Şehir 1" settingKey="consortium_d_c1_city" {...commonProps} />
                          <SettingInput label="Ülke 1" settingKey="consortium_d_c1_country" {...commonProps} />
                          <SettingInput label="Odak Noktası 1" settingKey="consortium_d_c1_challenge" {...commonProps} />
                        </div>
                        <div className="adm-form-grid3" style={{marginTop:'10px'}}>
                          <SettingInput label="Şehir 2" settingKey="consortium_d_c2_city" {...commonProps} />
                          <SettingInput label="Ülke 2" settingKey="consortium_d_c2_country" {...commonProps} />
                          <SettingInput label="Odak Noktası 2" settingKey="consortium_d_c2_challenge" {...commonProps} />
                        </div>
                        <div className="adm-form-grid3" style={{marginTop:'10px'}}>
                          <SettingInput label="Şehir 3" settingKey="consortium_d_c3_city" {...commonProps} />
                          <SettingInput label="Ülke 3" settingKey="consortium_d_c3_country" {...commonProps} />
                          <SettingInput label="Odak Noktası 3" settingKey="consortium_d_c3_challenge" {...commonProps} />
                        </div>
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'15px'}}>
                        <SettingInput label="Alt Sinerji Notu (TR)" settingKey="consortium_synergy_note" type="textarea" {...commonProps} />
                        <SettingInput label="Alt Sinerji Notu (EN)" settingKey="consortium_synergy_note_en" type="textarea" {...commonProps} />
                      </div>
                    </div>
                  )}

                 {/* 3. PROJE ETKİSİ SAYFASI */}
                  {subTab === 'impact' && (
                    <div className="adm-fade-in">
                      
                      {/* --- HERO (GİRİŞ) --- */}
                      <SectionHeader num="1" title="Hero (Giriş) Bölümü" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="impact_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="impact_hero_eyebrow_en" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="impact_hero_title1" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="impact_hero_title1_en" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="impact_hero_title2" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="impact_hero_title2_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Giriş Açıklaması (TR)" settingKey="impact_page_desc" type="textarea" {...commonProps} />
                        <SettingInput label="Giriş Açıklaması (EN)" settingKey="impact_page_desc_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Kaydırma Butonu (TR)" settingKey="impact_hero_scroll" {...commonProps} />
                        <SettingInput label="Kaydırma Butonu (EN)" settingKey="impact_hero_scroll_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- İSTATİSTİKLER --- */}
                      <SectionHeader num="2" title="Etki İstatistikleri" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="impact_sec_label" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="impact_sec_label_en" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="impact_sec_title" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="impact_sec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                        {[1,2,3,4].map(n => (
                          <div key={n} className="adm-card-inner">
                            <div className="adm-card-inner-label">Metrik {n}</div>
                            <SettingInput label="Değer (Sayı / %)" settingKey={`impact_stat_${n}_val`} {...commonProps} />
                            <div style={{marginTop:'10px'}}>
                              <SettingInput label="Etiket (TR)" settingKey={`impact_stat_${n}_label`} {...commonProps} />
                              <SettingInput label="Etiket (EN)" settingKey={`impact_stat_${n}_label_en`} {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-divider" />

                      {/* --- KART A --- */}
                      <SectionHeader num="3" title="Stratejik Etki Kartı (Kart A)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="impact_badge_a" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="impact_badge_a_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="impact_section_1_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="impact_section_1_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Metin (TR)" settingKey="impact_section_1_text" type="textarea" {...commonProps} />
                        <SettingInput label="Metin (EN)" settingKey="impact_section_1_text_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                        <div className="adm-card-inner-label">Etki Vurguları (Madde İşaretleri)</div>
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

                      {/* --- KART B --- */}
                      <SectionHeader num="4" title="Vizyon Kartı (Kart B)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Rozet (TR)" settingKey="impact_badge_b" {...commonProps} />
                        <SettingInput label="Rozet (EN)" settingKey="impact_badge_b_en" {...commonProps} />
                        <SettingInput label="Başlık (TR)" settingKey="impact_section_2_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="impact_section_2_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Metin (TR)" settingKey="impact_section_2_text" type="textarea" {...commonProps} />
                        <SettingInput label="Metin (EN)" settingKey="impact_section_2_text_en" type="textarea" {...commonProps} />
                      </div>
                      
                      <div className="adm-card-inner" style={{marginTop:'15px', marginBottom:'15px'}}>
                        <div className="adm-card-inner-label">6'lı Vizyon Sütunları</div>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                            <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'5px'}}>Sütun {n}</div>
                            <div className="adm-form-grid2">
                              <SettingInput label="Başlık (TR)" settingKey={`impact_vp${n}_title`} {...commonProps} />
                              <SettingInput label="Başlık (EN)" settingKey={`impact_vp${n}_title_en`} {...commonProps} />
                            </div>
                            <div className="adm-form-grid2" style={{marginTop:'5px'}}>
                              <SettingInput label="Açıklama (TR)" settingKey={`impact_vp${n}_desc`} type="textarea" {...commonProps} />
                              <SettingInput label="Açıklama (EN)" settingKey={`impact_vp${n}_desc_en`} type="textarea" {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-form-grid2">
                        <SettingInput label="Kapanış Sloganı (TR)" settingKey="impact_closing_msg" type="textarea" {...commonProps} />
                        <SettingInput label="Kapanış Sloganı (EN)" settingKey="impact_closing_msg_en" type="textarea" {...commonProps} />
                      </div>
                    </div>
                  )}

                  {/* 4. PROJE PLANI SAYFASI */}
                  {subTab === 'plan' && (
                    <div className="adm-fade-in">
                      
                      {/* --- HERO (GİRİŞ) --- */}
                      <SectionHeader num="1" title="Hero (Giriş) Bölümü" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="plan_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="plan_hero_eyebrow_en" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="plan_hero_title1" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="plan_hero_title1_en" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="plan_hero_title2" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="plan_hero_title2_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Giriş Açıklaması (TR)" settingKey="plan_page_desc" type="textarea" {...commonProps} />
                        <SettingInput label="Giriş Açıklaması (EN)" settingKey="plan_page_desc_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Kaydırma Butonu (TR)" settingKey="plan_hero_scroll" {...commonProps} />
                        <SettingInput label="Kaydırma Butonu (EN)" settingKey="plan_hero_scroll_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- İSTATİSTİKLER --- */}
                      <SectionHeader num="2" title="Plan İstatistikleri" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="plan_sec_label" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="plan_sec_label_en" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="plan_sec_title" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="plan_sec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className="adm-card-inner">
                            <div className="adm-card-inner-label">Sayaç {n}</div>
                            <SettingInput label="Değer" settingKey={`plan_stat_${n}_val`} {...commonProps} />
                            <SettingInput label="Birim (Ay, İP vb.)" settingKey={`plan_stat_${n}_unit`} {...commonProps} />
                            <div style={{marginTop:'10px'}}>
                              <SettingInput label="Etiket (TR)" settingKey={`plan_stat_${n}_label`} {...commonProps} />
                              <SettingInput label="Etiket (EN)" settingKey={`plan_stat_${n}_label_en`} {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="adm-divider" />

                      {/* --- TİMELİNE AŞAMALARI --- */}
                      <SectionHeader num="3" title="Proje Aşamaları (Timeline)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Kart İçi Alt Başlık (Örn: Neler Yapılacak?)" settingKey="plan_timeline_pills_label" {...commonProps} />
                        <SettingInput label="Kart İçi Alt Başlık (EN)" settingKey="plan_timeline_pills_label_en" {...commonProps} />
                      </div>
                      
                      <div style={{marginTop: '20px'}}>
                        {[1, 2, 3, 4].map(step => (
                          <div key={step} className="adm-card-inner" style={{marginBottom:'20px'}}>
                            <div className="adm-card-inner-label" style={{fontSize:'1rem', color:'var(--accent)'}}>Aşama {step} (İP{step+1})</div>
                            <div className="adm-form-grid2">
                              <SettingInput label={`Aşama ${step} Başlık (TR)`} settingKey={`plan_step_${step}_title`} {...commonProps} />
                              <SettingInput label={`Aşama ${step} Başlık (EN)`} settingKey={`plan_step_${step}_title_en`} {...commonProps} />
                            </div>
                            <div className="adm-form-grid2">
                              <SettingInput label={`Aşama ${step} Metni (TR)`} settingKey={`plan_step_${step}_desc`} type="textarea" {...commonProps} />
                              <SettingInput label={`Aşama ${step} Metni (EN)`} settingKey={`plan_step_${step}_desc_en`} type="textarea" {...commonProps} />
                            </div>
                            
                            {/* Aşama İçi Etiketler (Pills) */}
                            <div style={{marginTop:'15px', padding:'10px', background:'var(--surface-1)', borderRadius:'8px', border:'1px solid var(--border)'}}>
                              <div style={{fontSize:'0.75rem', fontWeight:'bold', marginBottom:'10px'}}>Aşama İçi Etiketler (Pills)</div>
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

               {/* 5. YOL HARİTASI SAYFASI */}
                  {subTab === 'roadmap' && (
                    <div className="adm-fade-in">
                      
                      {/* --- HERO (GİRİŞ) --- */}
                      <SectionHeader num="1" title="Hero (Giriş) Bölümü" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="roadmap_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="roadmap_hero_eyebrow_en" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="roadmap_hero_title1" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="roadmap_hero_title1_en" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="roadmap_hero_title2" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="roadmap_hero_title2_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        {/* ✨ DÜZELTME: roadmap_desc yerine roadmap_page_desc yapıldı ✨ */}
                        <SettingInput label="Giriş Açıklaması (TR)" settingKey="roadmap_page_desc" type="textarea" {...commonProps} />
                        <SettingInput label="Giriş Açıklaması (EN)" settingKey="roadmap_page_desc_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Kaydırma Butonu (TR)" settingKey="roadmap_hero_scroll" {...commonProps} />
                        <SettingInput label="Kaydırma Butonu (EN)" settingKey="roadmap_hero_scroll_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- BÖLÜM BAŞLIKLARI --- */}
                      <SectionHeader num="2" title="Tablo Üst Bilgileri" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="roadmap_sec_label" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="roadmap_sec_label_en" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="roadmap_sec_title" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="roadmap_sec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Tablo Başlığı (Örn: İş Paketleri)" settingKey="roadmap_table_header" {...commonProps} />
                        <SettingInput label="Tablo Başlığı (EN)" settingKey="roadmap_table_header_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- TABLO GÖREVLERİ (1-21) --- */}
                      <SectionHeader num="3" title="Gantt Şeması Görevleri (1-21)" />
                      <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'15px'}}>
                        Aşağıdaki 21 adet görevin ismini TR ve EN olarak düzenleyebilirsiniz. Boş bıraktığınız kutularda yedek (eski) çeviriler görünmeye devam edecektir.
                      </div>
                      
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        {[...Array(21)].map((_, i) => (
                          <div key={i+1} className="adm-card-inner">
                            <div className="adm-card-inner-label" style={{color:'var(--accent)'}}>Görev {i+1}</div>
                            <SettingInput label={`Görev ${i+1} Adı (TR)`} settingKey={`roadmap_task_${i+1}`} {...commonProps} />
                            <SettingInput label={`Görev ${i+1} Adı (EN)`} settingKey={`roadmap_task_${i+1}_en`} {...commonProps} />
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* 6. STRATEJİ SAYFASI */}
                  {subTab === 'strategy' && (
                    <div className="adm-fade-in">
                      
                      {/* --- HERO (GİRİŞ) --- */}
                      <SectionHeader num="1" title="Hero (Giriş) Bölümü" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Üst Ufak Başlık (TR)" settingKey="strategy_hero_eyebrow" {...commonProps} />
                        <SettingInput label="Üst Ufak Başlık (EN)" settingKey="strategy_hero_eyebrow_en" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="strategy_hero_title1" {...commonProps} />
                        <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="strategy_hero_title1_en" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="strategy_hero_title2" {...commonProps} />
                        <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="strategy_hero_title2_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Giriş Açıklaması (TR)" settingKey="strategy_page_desc" type="textarea" {...commonProps} />
                        <SettingInput label="Giriş Açıklaması (EN)" settingKey="strategy_page_desc_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                        <SettingInput label="Kaydırma Butonu (TR)" settingKey="strategy_hero_scroll" {...commonProps} />
                        <SettingInput label="Kaydırma Butonu (EN)" settingKey="strategy_hero_scroll_en" {...commonProps} />
                      </div>

                      <div className="adm-divider" />

                      {/* --- İSTATİSTİKLER --- */}
                      <SectionHeader num="2" title="Strateji İstatistikleri" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Bölüm Etiketi (TR)" settingKey="strategy_sec_label" {...commonProps} />
                        <SettingInput label="Bölüm Etiketi (EN)" settingKey="strategy_sec_label_en" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (TR)" settingKey="strategy_sec_title" {...commonProps} />
                        <SettingInput label="Bölüm Başlığı (EN)" settingKey="strategy_sec_title_en" {...commonProps} />
                      </div>
                      <div className="adm-card-grid2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className="adm-card-inner">
                            <div className="adm-card-inner-label">Sayaç {n}</div>
                            <SettingInput label="Değer" settingKey={`strategy_stat_${n}_val`} {...commonProps} />
                            <SettingInput label="Birim (Ay, €, vb.)" settingKey={`strategy_stat_${n}_unit`} {...commonProps} />
                            <div style={{marginTop:'10px'}}>
                              <SettingInput label="Etiket (TR)" settingKey={`strategy_stat_${n}_label`} {...commonProps} />
                              <SettingInput label="Etiket (EN)" settingKey={`strategy_stat_${n}_label_en`} {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="adm-divider" />
                      
                      {/* --- KART A --- */}
                      <SectionHeader num="3" title="Kart A (Zaman Çizelgesi & Hazırlık)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Başlık (TR)" settingKey="strategy_section_a_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="strategy_section_a_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Paragraf 1 (TR)" settingKey="strategy_text_a_1" type="textarea" {...commonProps} />
                        <SettingInput label="Paragraf 1 (EN)" settingKey="strategy_text_a_1_en" type="textarea" {...commonProps} />
                        <SettingInput label="Paragraf 2 (TR)" settingKey="strategy_text_a_2" type="textarea" {...commonProps} />
                        <SettingInput label="Paragraf 2 (EN)" settingKey="strategy_text_a_2_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart A Alt Özellikleri (Pills)</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Özellik 1 (TR)" settingKey="strategy_a_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="strategy_a_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="strategy_a_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="strategy_a_pill2_en" {...commonProps} />
                          <SettingInput label="Özellik 3 (TR)" settingKey="strategy_a_pill3" {...commonProps} />
                          <SettingInput label="Özellik 3 (EN)" settingKey="strategy_a_pill3_en" {...commonProps} />
                          <SettingInput label="Özellik 4 (TR)" settingKey="strategy_a_pill4" {...commonProps} />
                          <SettingInput label="Özellik 4 (EN)" settingKey="strategy_a_pill4_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />
                      
                      {/* --- KART B --- */}
                      <SectionHeader num="4" title="Kart B (Odak Noktası & Felsefe)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Başlık (TR)" settingKey="strategy_section_b_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="strategy_section_b_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Açıklama (TR)" settingKey="strategy_text_b" type="textarea" {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey="strategy_text_b_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Alıntı Söz (TR)" settingKey="strategy_quote" type="textarea" {...commonProps} />
                        <SettingInput label="Alıntı Söz (EN)" settingKey="strategy_quote_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart B Alt Özellikleri (Pills)</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Özellik 1 (TR)" settingKey="strategy_b_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="strategy_b_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="strategy_b_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="strategy_b_pill2_en" {...commonProps} />
                          <SettingInput label="Özellik 3 (TR)" settingKey="strategy_b_pill3" {...commonProps} />
                          <SettingInput label="Özellik 3 (EN)" settingKey="strategy_b_pill3_en" {...commonProps} />
                          <SettingInput label="Özellik 4 (TR)" settingKey="strategy_b_pill4" {...commonProps} />
                          <SettingInput label="Özellik 4 (EN)" settingKey="strategy_b_pill4_en" {...commonProps} />
                        </div>
                      </div>

                      <div className="adm-divider" />
                      
                      {/* --- KART C --- */}
                      <SectionHeader num="5" title="Kart C (Avrupa Politikaları Uyum)" />
                      <div className="adm-form-grid2">
                        <SettingInput label="Başlık (TR)" settingKey="strategy_section_c_title" {...commonProps} />
                        <SettingInput label="Başlık (EN)" settingKey="strategy_section_c_title_en" {...commonProps} />
                      </div>
                      <div className="adm-form-grid2">
                        <SettingInput label="Açıklama (TR)" settingKey="strategy_text_c" type="textarea" {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey="strategy_text_c_en" type="textarea" {...commonProps} />
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">3 Temel Öncelik (Priorities)</div>
                        {[1, 2, 3].map(n => (
                          <div key={n} style={{marginBottom:'10px', paddingBottom:'10px', borderBottom:'1px solid var(--border)'}}>
                            <div style={{fontWeight:'bold', fontSize:'0.8rem', color:'var(--text-muted)'}}>Öncelik {n}</div>
                            <div className="adm-form-grid2">
                              <SettingInput label="Başlık (TR)" settingKey={`strategy_c_prio${n}_title`} {...commonProps} />
                              <SettingInput label="Başlık (EN)" settingKey={`strategy_c_prio${n}_title_en`} {...commonProps} />
                              <SettingInput label="Açıklama (TR)" settingKey={`strategy_c_prio${n}_desc`} type="textarea" {...commonProps} />
                              <SettingInput label="Açıklama (EN)" settingKey={`strategy_c_prio${n}_desc_en`} type="textarea" {...commonProps} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="adm-card-inner" style={{marginTop:'15px'}}>
                        <div className="adm-card-inner-label">Kart C Alt Özellikleri (Pills)</div>
                        <div className="adm-form-grid2">
                          <SettingInput label="Özellik 1 (TR)" settingKey="strategy_c_pill1" {...commonProps} />
                          <SettingInput label="Özellik 1 (EN)" settingKey="strategy_c_pill1_en" {...commonProps} />
                          <SettingInput label="Özellik 2 (TR)" settingKey="strategy_c_pill2" {...commonProps} />
                          <SettingInput label="Özellik 2 (EN)" settingKey="strategy_c_pill2_en" {...commonProps} />
                        </div>
                      </div>

                    </div>
                  )}
                  
                </div>
              </div>
            )}

           {/* ══ HABERLER ══════════════════════════════════════════════ */}
            {activeTab === 'news' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Haberler & <em>Duyurular</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="news_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="news_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="news_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="news_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="news_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="news_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="news_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="news_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="news_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="news_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="news_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="news_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="news_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="news_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Haberi Düzenle' : ' Yeni Haber Ekle'}
                    </div>
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslateNews} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Haber Başlığı (TR) *</label>
                        <input className="adm-input-full" placeholder="Başlık..." value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Haber Başlığı (EN)</label>
                        <input className="adm-input-full" placeholder="Title..." value={newsForm.title_en} onChange={e => setNewsForm({...newsForm, title_en: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Tarih</label>
                      <input type="date" className="adm-input-full" value={newsForm.date || ''} onChange={e => setNewsForm({...newsForm, date: e.target.value})} style={{colorScheme:'dark', width: '50%'}} />
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Görsel</label>
                      <FileInput value={newsForm.image_url} onChange={url => setNewsForm({...newsForm, image_url: url})} placeholder="Haber görseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kısa Özet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="2-3 cümle özet..." value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kısa Özet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={newsForm.summary_en} onChange={e => setNewsForm({...newsForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Detaylı İçerik (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Haberin tam içeriği..." value={newsForm.description} onChange={e => setNewsForm({...newsForm, description: e.target.value})} rows={7} />
                        </div>
                        <div className="adm-form-item">
                          <label>Detaylı İçerik (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Full content..." value={newsForm.description_en} onChange={e => setNewsForm({...newsForm, description_en: e.target.value})} rows={7} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Değişiklikleri Kaydet' : '+ Haber Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Haberler ({news.length})</div>
                  {news.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-newspaper" />Haber bulunamadı.</div>
                  ) : news.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong>{item.title}</strong>
                        {item.date && <span><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date}</span>}
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'news')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('news', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           {/* ══ FAALİYETLER ═══════════════════════════════════════════ */}
            {activeTab === 'activities' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Faaliyetler & <em>Etkinlikler</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="activities_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="activities_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="activities_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="activities_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="activities_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="activities_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="activities_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="activities_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="activities_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="activities_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="activities_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="activities_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="activities_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="activities_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Faaliyeti Düzenle' : ' Yeni Faaliyet Ekle'}
                    </div>
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslateActivities} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'activities', activityForm, setActivityForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Faaliyet Başlığı (TR) *</label>
                          <input className="adm-input-full" placeholder="Başlık..." value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Faaliyet Başlığı (EN)</label>
                          <input className="adm-input-full" placeholder="Title..." value={activityForm.title_en} onChange={e => setActivityForm({...activityForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Türü (TR)</label>
                        <input className="adm-input-full" placeholder="Toplantı..." value={activityForm.type} onChange={e => setActivityForm({...activityForm, type: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Türü (EN)</label>
                        <input className="adm-input-full" placeholder="Meeting..." value={activityForm.type_en} onChange={e => setActivityForm({...activityForm, type_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid3">
                      <div className="adm-form-item">
                        <label>Konum (TR)</label>
                        <input className="adm-input-full" placeholder="İstanbul..." value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Konum (EN)</label>
                        <input className="adm-input-full" placeholder="Istanbul..." value={activityForm.location_en} onChange={e => setActivityForm({...activityForm, location_en: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Tarih</label>
                        <input type="date" className="adm-input-full" value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})} style={{colorScheme:'dark'}} />
                      </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Görsel</label>
                      <FileInput value={activityForm.image_url} onChange={url => setActivityForm({...activityForm, image_url: url})} placeholder="Faaliyet görseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kısa Özet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kısa açıklama..." value={activityForm.summary} onChange={e => setActivityForm({...activityForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kısa Özet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={activityForm.summary_en} onChange={e => setActivityForm({...activityForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Detaylı Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Detaylı..." value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} rows={6} />
                        </div>
                        <div className="adm-form-item">
                          <label>Detaylı Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Detailed..." value={activityForm.description_en} onChange={e => setActivityForm({...activityForm, description_en: e.target.value})} rows={6} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Değişiklikleri Kaydet' : '+ Faaliyet Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Faaliyetler ({activities.length})</div>
                  {activities.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-calendar" />Faaliyet bulunamadı.</div>
                  ) : activities.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong>{item.title}</strong>
                        <span>
                          {item.date && <><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date} &bull; </>}
                          <span className="adm-badge adm-badge-blue">{item.type}</span>
                        </span>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'activities')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('activities', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           {/* ══ ORTAKLAR ═════════════════════════════════════════════ */}
            {activeTab === 'partners' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ortaklar & <em>Kurumlar</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="partners_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="partners_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="partners_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="partners_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="partners_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="partners_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="partners_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="partners_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="partners_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="partners_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="partners_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="partners_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="partners_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="partners_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Ortak Düzenle' : ' Yeni Ortak Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Kurum Adı (TR) *</label>
                        <input className="adm-input-full" placeholder="Kurum adı..." value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Kurum Adı (EN)</label>
                        <input className="adm-input-full" placeholder="Institution name..." value={partnerForm.name_en} onChange={e => setPartnerForm({...partnerForm, name_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Ülke (TR) *</label>
                        <input className="adm-input-full" placeholder="Türkiye..." value={partnerForm.country} onChange={e => setPartnerForm({...partnerForm, country: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Ülke (EN)</label>
                        <input className="adm-input-full" placeholder="Turkey..." value={partnerForm.country_en} onChange={e => setPartnerForm({...partnerForm, country_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Rol (TR)</label>
                          <select className="adm-select-full" value={partnerForm.role} onChange={e => setPartnerForm({...partnerForm, role: e.target.value})}>
                            <option value="Ortak">Ortak</option>
                            <option value="Koordinatör">Koordinatör</option>
                          </select>
                        </div>
                        <div className="adm-form-item">
                          <label>Rol (EN)</label>
                          <select className="adm-select-full" value={partnerForm.role_en} onChange={e => setPartnerForm({...partnerForm, role_en: e.target.value})}>
                            <option value="">(İngilizce karşılığını girin...)</option>
                            <option value="Partner">Partner</option>
                            <option value="Coordinator">Coordinator</option>
                          </select>
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kurum hakkında..." value={partnerForm.description} onChange={e => setPartnerForm({...partnerForm, description: e.target.value})} rows={4} />
                        </div>
                        <div className="adm-form-item">
                          <label>Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="About the institution..." value={partnerForm.description_en} onChange={e => setPartnerForm({...partnerForm, description_en: e.target.value})} rows={4} />
                        </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Web Sitesi</label>
                      <input className="adm-input-full" placeholder="https://..." value={partnerForm.website} onChange={e => setPartnerForm({...partnerForm, website: e.target.value})} />
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kurum Logosu</label>
                          <FileInput value={partnerForm.image_url} onChange={url => setPartnerForm({...partnerForm, image_url: url})} placeholder="Logo URL..." uploadFile={uploadFile} showToast={showToast} />
                        </div>
                        <div className="adm-form-item">
                          <label>Ülke Bayrağı</label>
                          <FileInput value={partnerForm.flag_url} onChange={url => setPartnerForm({...partnerForm, flag_url: url})} placeholder="Bayrak URL..." uploadFile={uploadFile} showToast={showToast} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Ortak Bilgilerini Güncelle' : '+ Ortak Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Ortaklar ({partners.length})</div>
                  {partners.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-handshake" />Ortak bulunamadı.</div>
                  ) : partners.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        {item.image_url && <img src={item.image_url} style={{width:'40px', height:'28px', objectFit:'contain', borderRadius:'4px', border:'1px solid var(--border)', background:'white', padding:'2px'}} alt="" />}
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            <span className={`adm-badge ${item.role === 'Koordinatör' ? 'adm-badge-yellow' : 'adm-badge-green'}`}>{item.role}</span>
                            {' '}&bull; {item.country}
                          </span>
                        </div>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'partners')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('partners', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           {/* ══ DOSYALAR (ESKİ ÇIKTILAR) ═════════════════════════════════════════════ */}
            {activeTab === 'results' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Proje <em>Dosyaları</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="results_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="results_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="results_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="results_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="results_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="results_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="results_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="results_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="results_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="results_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="results_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="results_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="results_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="results_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className="fas fa-plus" /> {isEditing ? ' Dosya Güncelle' : ' Yeni Dosya Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Dosya Başlığı (TR) *</label>
                          <input className="adm-input-full" placeholder="Dosya başlığı..." value={resultForm.title} onChange={e => setResultForm({...resultForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Dosya Başlığı (EN)</label>
                          <input className="adm-input-full" placeholder="File title..." value={resultForm.title_en} onChange={e => setResultForm({...resultForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Açıklama..." value={resultForm.description} onChange={e => setResultForm({...resultForm, description: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Description..." value={resultForm.description_en} onChange={e => setResultForm({...resultForm, description_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Durum (TR)</label>
                          <select className="adm-select-full" value={resultForm.status} onChange={e => setResultForm({...resultForm, status: e.target.value})}>
                            <option value="Planlanıyor">Planlanıyor</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                        </div>
                        <div className="adm-form-item">
                          <label>Durum (EN)</label>
                          <select className="adm-select-full" value={resultForm.status_en} onChange={e => setResultForm({...resultForm, status_en: e.target.value})}>
                            <option value="Planned">Planned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Dosya / Link</label>
                      <FileInput value={resultForm.link} onChange={url => setResultForm({...resultForm, link: url})} placeholder="Dosya yükleyin veya URL girin..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Güncelle' : '+ Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  {results.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-file" />Dosya bulunamadı.</div>
                  ) : results.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong><i className="fas fa-file-circle-check" style={{color:'var(--accent)', marginRight:'8px'}} />{item.title}</strong>
                        <span>{item.status}</span>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'results')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('results', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ İLETİŞİM ═════════════════════════════════════════════ */}
            {activeTab === 'contact' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">İletişim <em>Bilgileri</em></div>
                </div>

                {/* --- SAYFA ÜST BİLGİLERİ (HERO) --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="contact_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="contact_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="contact_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="contact_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="contact_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="contact_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="contact_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="contact_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="contact_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="contact_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="contact_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="contact_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="contact_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="contact_sec_title_en" {...commonProps} />
                  </div>
                </div>

                {/* --- İLETİŞİM BİLGİLERİ KARTI --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="📞" title="Kurum İletişim Bilgileri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Sol Kart Başlığı (TR)" settingKey="contact_info_title" {...commonProps} />
                    <SettingInput label="Sol Kart Başlığı (EN)" settingKey="contact_info_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="E-posta Adresi" settingKey="contact_email" {...commonProps} />
                    <SettingInput label="Telefon Numarası" settingKey="contact_phone" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Açık Adres (TR)" settingKey="contact_address" type="textarea" {...commonProps} />
                    <SettingInput label="Açık Adres (EN)" settingKey="contact_address_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Sosyal Medya Başlığı (TR)" settingKey="contact_social_title" {...commonProps} />
                    <SettingInput label="Sosyal Medya Başlığı (EN)" settingKey="contact_social_title_en" {...commonProps} />
                  </div>
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'5px'}}>
                    * Sosyal Medya linklerini (URL) sol menüdeki "Header / Footer" sekmesinden değiştirebilirsiniz.
                  </div>
                </div>

                {/* --- İLETİŞİM FORMU METİNLERİ --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  <SectionHeader num="✉" title="İletişim Formu (Mesajlar) Ayarları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Form Kartı Başlığı (TR)" settingKey="contact_form_title" {...commonProps} />
                    <SettingInput label="Form Kartı Başlığı (EN)" settingKey="contact_form_title_en" {...commonProps} />
                    <SettingInput label="Başarılı Mesajı (TR)" settingKey="contact_form_success" {...commonProps} />
                    <SettingInput label="Başarılı Mesajı (EN)" settingKey="contact_form_success_en" {...commonProps} />
                    <SettingInput label="Hata Mesajı (TR)" settingKey="contact_form_error" {...commonProps} />
                    <SettingInput label="Hata Mesajı (EN)" settingKey="contact_form_error_en" {...commonProps} />
                    <SettingInput label="Gönder Butonu (TR)" settingKey="contact_form_btn" {...commonProps} />
                    <SettingInput label="Gönder Butonu (EN)" settingKey="contact_form_btn_en" {...commonProps} />
                  </div>
                </div>
              </div>
            )}

           {/* ══ İLETİŞİM ═════════════════════════════════════════════ */}
            {activeTab === 'contact' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">İletişim <em>Bilgileri</em></div>
                </div>

                {/* --- SAYFA ÜST BİLGİLERİ (HERO) --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="⚙" title="Sayfa Üst Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Üst Ufak Başlık (TR)" settingKey="contact_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Üst Ufak Başlık (EN)" settingKey="contact_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (TR)" settingKey="contact_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Başlık Satır 1 (EN)" settingKey="contact_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (TR)" settingKey="contact_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Başlık Satır 2 (EN)" settingKey="contact_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giriş Açıklaması (TR)" settingKey="contact_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giriş Açıklaması (EN)" settingKey="contact_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydırma Butonu (TR)" settingKey="contact_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydırma Butonu (EN)" settingKey="contact_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="☰" title="İçerik Bölümü Başlıkları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bölüm Etiketi (TR)" settingKey="contact_sec_label" {...commonProps} />
                    <SettingInput label="Bölüm Etiketi (EN)" settingKey="contact_sec_label_en" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (TR)" settingKey="contact_sec_title" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="contact_sec_title_en" {...commonProps} />
                  </div>
                </div>

                {/* --- İLETİŞİM BİLGİLERİ KARTI --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="📞" title="Kurum İletişim Bilgileri" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Sol Kart Başlığı (TR)" settingKey="contact_info_title" {...commonProps} />
                    <SettingInput label="Sol Kart Başlığı (EN)" settingKey="contact_info_title_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="E-posta Adresi" settingKey="contact_email" {...commonProps} />
                    <SettingInput label="Telefon Numarası" settingKey="contact_phone" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Açık Adres (TR)" settingKey="contact_address" type="textarea" {...commonProps} />
                    <SettingInput label="Açık Adres (EN)" settingKey="contact_address_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Sosyal Medya Başlığı (TR)" settingKey="contact_social_title" {...commonProps} />
                    <SettingInput label="Sosyal Medya Başlığı (EN)" settingKey="contact_social_title_en" {...commonProps} />
                  </div>
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'5px'}}>
                    * Sosyal Medya linklerini (URL) sol menüdeki "Header / Footer" sekmesinden değiştirebilirsiniz.
                  </div>
                </div>

                {/* --- İLETİŞİM FORMU METİNLERİ --- */}
                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  <SectionHeader num="✉" title="İletişim Formu (Mesajlar) Ayarları" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Form Kartı Başlığı (TR)" settingKey="contact_form_title" {...commonProps} />
                    <SettingInput label="Form Kartı Başlığı (EN)" settingKey="contact_form_title_en" {...commonProps} />
                    <SettingInput label="Başarılı Mesajı (TR)" settingKey="contact_form_success" {...commonProps} />
                    <SettingInput label="Başarılı Mesajı (EN)" settingKey="contact_form_success_en" {...commonProps} />
                    <SettingInput label="Hata Mesajı (TR)" settingKey="contact_form_error" {...commonProps} />
                    <SettingInput label="Hata Mesajı (EN)" settingKey="contact_form_error_en" {...commonProps} />
                    <SettingInput label="Gönder Butonu (TR)" settingKey="contact_form_btn" {...commonProps} />
                    <SettingInput label="Gönder Butonu (EN)" settingKey="contact_form_btn_en" {...commonProps} />
                  </div>
                </div>
              </div>
            )}
            {/* ══ SİTE AYARLARI (HEADER/FOOTER) ═════════════════════════ */}
            {activeTab === 'site' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Header / <em>Footer</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Üst Menü & Sekme (Header)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Favicon (Sekme İkonu)" settingKey="site_favicon" type="image" {...commonProps} />
                    <SettingInput label="Site Ana Logosu" settingKey="header_logo_image" type="image" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="Logo Ana Metni" settingKey="header_logo_text" placeholder="DIGI-GREEN" {...commonProps} />
                    <SettingInput label="Logo Vurgu Metni" settingKey="header_logo_highlight" placeholder="FUTURE" {...commonProps} />
                  </div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="2" title="Alt Bilgi (Footer)" />
                  <SettingInput label="AB Logosu / Bayrak" settingKey="footer_eu_logo" type="image" {...commonProps} />
                  <div className="adm-form-grid2">
                    <SettingInput label="Footer Hakkında Metni (TR)" settingKey="footer_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Footer Hakkında Metni (EN)" settingKey="footer_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2">
                    <SettingInput label="AB Bilgilendirme Metni (TR)" settingKey="footer_disclaimer" type="textarea" {...commonProps} />
                    <SettingInput label="AB Bilgilendirme Metni (EN)" settingKey="footer_disclaimer_en" type="textarea" {...commonProps} />
                  </div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  <SectionHeader num="3" title="Sosyal Medya" />
                  <div className="adm-form-grid3">
                    <SettingInput label="Facebook" settingKey="social_facebook" placeholder="https://facebook.com/..." {...commonProps} />
                    <SettingInput label="Twitter / X" settingKey="social_twitter" placeholder="https://twitter.com/..." {...commonProps} />
                    <SettingInput label="Instagram" settingKey="social_instagram" placeholder="https://instagram.com/..." {...commonProps} />
                  </div>
                </div>
              </div>
            )}

            {/* ══ KULLANICILAR PANElİ (YENİ EKLENDİ) ═════════════════════════ */}
            {activeTab === 'users' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Sistem <em>Kullanıcıları</em></div>
                  <div className="adm-page-desc">Panele erişim yetkisi olan admin hesapları.</div>
                </div>
                <div className="adm-card" style={{padding: '0'}}>
                   <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                     <thead>
                       <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                         <th style={{padding: '16px 20px'}}>Kullanıcı (Email)</th>
                         <th style={{padding: '16px 20px'}}>ID (Benzersiz)</th>
                         <th style={{padding: '16px 20px'}}>Son Giriş Tarihi</th>
                         <th style={{padding: '16px 20px'}}>Yetki Rolü</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr style={{borderBottom: '1px solid var(--border)'}}>
                         <td style={{padding: '16px 20px', fontWeight: '600', color: 'var(--text-primary)'}}>
                            <i className="fas fa-user-circle" style={{marginRight:'10px', color:'var(--accent)', fontSize:'1.2rem'}}></i>
                            {currentUser?.email}
                         </td>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', fontFamily:'monospace', color:'var(--text-muted)'}}>{currentUser?.id}</td>
                         <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                           {currentUser?.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                         </td>
                         <td style={{padding: '16px 20px'}}>
                           <span className="adm-badge adm-badge-green">Süper Admin</span>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* ══ SİSTEM LOGLARI (YENİ EKLENDİ) ═════════════════════════ */}
            {activeTab === 'logs' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Sistem <em>Logları</em></div>
                  <div className="adm-page-desc">Admin paneli üzerinde gerçekleştirilen son etkinlikler (Veritabanında admin_logs tablosu oluşturulmalıdır).</div>
                </div>
                <div className="adm-card" style={{padding: '0'}}>
                  <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                     <thead>
                       <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                         <th style={{padding: '16px 20px'}}>İşlem Tarihi</th>
                         <th style={{padding: '16px 20px'}}>İşlem Tipi</th>
                         <th style={{padding: '16px 20px'}}>IP Adresi / Cihaz</th>
                       </tr>
                     </thead>
                     <tbody>
                       {logs.map((log, i) => (
                         <tr key={i} style={{borderBottom: '1px solid var(--border)'}}>
                           <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>{log.date}</td>
                           <td style={{padding: '16px 20px', fontWeight: '500', color: 'var(--text-primary)'}}>
                              <i className="fas fa-check-circle" style={{marginRight:'8px', color:'var(--accent)'}}></i>
                              {log.action}
                           </td>
                           <td style={{padding: '16px 20px', fontSize:'0.85rem', fontFamily:'monospace', color:'var(--text-muted)'}}>{log.ip}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {/* ══ GÜVENLİK VE ŞİFRE (YENİ EKLENDİ) ═════════════════════════ */}
            {activeTab === 'security' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Güvenlik & <em>Şifre</em></div>
                  <div className="adm-page-desc">Hesabınızın güvenliğini sağlayın ve yönetici şifrenizi güncelleyin.</div>
                </div>
                
                <div className="adm-form-card" style={{maxWidth: '500px'}}>
                  <div className="adm-form-card-title">
                    <div><i className="fas fa-key" style={{marginRight:'10px'}}/> Yeni Şifre Oluştur</div>
                  </div>
                  <form onSubmit={handlePasswordChange} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    
                    <div className="adm-form-item">
                      <label>Giriş Yapılı Admin Hesabı</label>
                      <input className="adm-input-full" value={currentUser?.email || ''} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
                    </div>

                    <div className="adm-form-item">
                      <label>Güvenlik İçin Mevcut Şifreniz (Opsiyonel)</label>
                      <input type="password" placeholder="Mevcut şifre..." className="adm-input-full" />
                    </div>

                    <div className="adm-form-item">
                      <label>Yeni Şifre (En az 6 karakter)</label>
                      <input 
                        type="password" 
                        minLength={6} 
                        className="adm-input-full" 
                        placeholder="Yeni şifrenizi girin..." 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <button type="submit" className="adm-form-submit">
                      <i className="fas fa-lock" style={{marginRight:'5px'}}></i> Şifreyi Güncelle
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}