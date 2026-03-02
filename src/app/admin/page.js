'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import '../globals.css';

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
  header_logo_text: "DIGI-GREEN",
  header_logo_highlight: "FUTURE",
  footer_desc: "Kapakli Belediyesi liderliginde yurutulen surdurulebilir kalkinma projesi.",
  footer_column2_title: "Hizli Menu",
  footer_column3_title: "Iletisim",
  footer_eu_logo: "/assets/images/eu-flag.png",
  footer_disclaimer: "Avrupa Birligi tarafindan finanse edilmistir. Ancak ifade edilen gorus ve dusunceler yalnizca yazar(lar)a aittir...",
  contact_email: "info@digigreenfuture.eu",
  contact_phone: "+90 282 000 00 00",
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
  home_cta_text: "Daha fazla bilgi almak icin bize ulasin.",
  
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
  strategy_text_c_en: "DIGI-GREEN FUTURE is directly aligned with the three main horizontal priorities of the Erasmus+ program.",

  news_page_title: "Haberler & Duyurular",
  news_page_title_en: "News & Announcements",
  news_page_desc: "Projemizle ilgili en guncel gelismeleri, duyurulari ve etkinlikleri buradan takip edebilirsiniz.",
  news_page_desc_en: "You can follow the latest developments, announcements and events about our project here.",
  
  activities_page_title: "Faaliyetler & Etkinlikler",
  activities_page_title_en: "Activities & Events",
  activities_page_desc: "Proje kapsaminda gerceklestirdigimiz toplantilar ve faaliyetler.",
  activities_page_desc_en: "Meetings and activities we held within the scope of the project.",

  partners_page_title: "Ortaklar & Kurumlar",
  partners_page_title_en: "Partners & Institutions",
  partners_page_desc: "Projemize guc katan uluslararasi ortaklarimiz.",
  partners_page_desc_en: "Our international partners who add strength to our project.",

  results_page_title: "Proje Dosyalari",
  results_page_title_en: "Project Files",
  results_page_desc: "Projemiz sonucunda ortaya cikan fikri ciktilar, raporlar ve materyaller.",
  results_page_desc_en: "Intellectual outputs, reports and materials resulting from our project."
};

/* ─── TOAST ──────────────────────────────────────────────────────────── */
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

/* ─── CONFIRM MODAL ──────────────────────────────────────────────────── */
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

/* ─── FILE INPUT ─────────────────────────────────────────────────────── */
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
  
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [logs, setLogs] = useState([]);
  const [userIp, setUserIp] = useState('Bilinmiyor');

  // Data States
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [ecoItems, setEcoItems] = useState([]);

  // Form States
  const [newsForm, setNewsForm] = useState({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
  const [activityForm, setActivityForm] = useState({ id: null, title: '', title_en: '', type: 'Toplanti (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlaniyor', status_en: '', link: '', icon: 'file' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };
  
  useEffect(() => { 
    let messageChannel;
    let isMounted = true;

    async function initRealtime() {
      await checkSessionAndLoad(); 

      if (!isMounted) return;

      messageChannel = supabase
        .channel('admin-global-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'contact_messages' },
          (payload) => {
            showToast('Yeni bir iletisim mesaji aldiniz!', 'success');
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        )
        .subscribe((status, err) => {
           console.log("[REALTIME] Ana Panel Durumu:", status);
           if (err) console.error("[REALTIME] Hata:", err);
        });
    }

    initRealtime();

    return () => {
      isMounted = false;
      if (messageChannel) supabase.removeChannel(messageChannel);
    };
  }, [router]);

  async function checkSessionAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }
    
    setCurrentUser(session.user);

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error('IP alinamadi:', error);
    }

    await loadAllData();
    setLoading(false);
  }

  async function loadAllData() {
    try {
      const s = await supabase.from('settings').select('*').order('id');
      const n = await supabase.from('news').select('*').order('date', { ascending: false });
      const a = await supabase.from('activities').select('*').order('id', { ascending: false });
      const p = await supabase.from('partners').select('*').order('id');
      const r = await supabase.from('results').select('*').order('id');
      
      const { data: mData, error: mError } = await supabase.from('contact_messages').select('*');
      if (mError) console.warn("Contact Messages tablosu henuz yok, bos geciliyor.");

      const { data: logData, error: logError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (logError) console.error("Supabase Log CEKME Hatasi:", logError.message);
        
      setLogs(logData || []);

      const existingSettings = s.data || [];
      setSettings(existingSettings);
      setNews(n.data || []);
      setActivities(a.data || []);
      setPartners(p.data || []);
      setResults(r.data || []);
      setMessages(mData || []); 

      const heroSliderStr = existingSettings.find(x => x.key === 'hero_slider_images')?.value;
      if (heroSliderStr) { try { setHeroImages(JSON.parse(heroSliderStr)); } catch(e){} }
      else {
        const oldHeroBg = existingSettings.find(x => x.key === 'hero_bg_image')?.value;
        if (oldHeroBg) setHeroImages([oldHeroBg]);
      }

      const ecoStr = existingSettings.find(x => x.key === 'home_eco_list')?.value;
      if (ecoStr) { 
          try { setEcoItems(JSON.parse(ecoStr)); } catch(e){} 
      } else {
          setEcoItems([
              { title: 'Mobil Uygulama', desc: 'Vatandaslara yonelik dijital araclar.', icon: 'fa-mobile-screen' },
              { title: 'Geri Donusum', desc: 'Cevre dostu aliskanliklar.', icon: 'fa-recycle' },
              { title: 'Egitim', desc: 'Farkindalik ve kapasite gelistirme.', icon: 'fa-graduation-cap' },
              { title: 'Doga', desc: 'Surdurulebilir yasam pratikleri.', icon: 'fa-leaf' }
          ]);
      }
    } catch (error) {
      console.error("Veriler yuklenirken genel bir hata olustu:", error);
    } finally {
      setLoading(false);
    }
  }

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
        showToast('Sifre en az 6 karakter olmalidir.', 'error');
        return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { showToast('Sifre guncellenemedi: ' + error.message, 'error'); } 
    else { showToast('Sifreniz basariyla guncellendi!', 'success'); setNewPassword(''); }
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
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      showToast('Hata: ' + error.message, 'error'); 
    } else {
      showToast('Ayar kaydedildi.', 'success');
      await logAction(`Sistem ayari guncellendi: ${key}`);
      loadAllData();
    }
  }

  async function logAction(actionDescription) {
    if (!currentUser) return;
    
    const { error } = await supabase.from('admin_logs').insert([
      { 
        action: actionDescription, 
        user_email: currentUser.email,
        page_section: activeTab,
        ip_address: userIp
      }
    ]);
    
    if (error) {
      console.error("Supabase Log KAYDETME Hatasi:", error.message);
    }
  }

  async function deleteItem(table, id, fileUrls = []) {
    showConfirm('Bu ogeyi kalici olarak silmek istediginize emin misiniz?', async () => {
      
      if (fileUrls && fileUrls.length > 0) {
        const fileNamesToDelete = fileUrls
          .filter(url => url)
          .map(url => {
            const parts = url.split('/images/');
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(name => name);

        if (fileNamesToDelete.length > 0) {
          try {
            await supabase.storage.from('images').remove(fileNamesToDelete);
          } catch (err) {
            console.error("Storage silme hatasi:", err);
          }
        }
      }

      await supabase.from(table).delete().eq('id', id);
      
      await logAction(`${table} tablosundan bir kayit silindi. (ID: ${id})`);
      loadAllData(); 
      showToast('Basariyla silindi.', 'success');
    });
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    let result = id ? await supabase.from(table).update(data).eq('id', id) : await supabase.from(table).insert([data]);
    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    setIsEditing(false); 
    
    await logAction(`${table} tablosunda islem yapildi. (Ekleme/Guncelleme)`);
    loadAllData(); 
    showToast('Basariyla kaydedildi.', 'success');
    
    if (table === 'news') setNewsForm({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
    if (table === 'activities') setActivityForm({ id: null, title: '', title_en: '', type: 'Toplanti (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
    if (table === 'partners') setPartnerForm({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
    if (table === 'results') setResultForm({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlaniyor', status_en: '', link: '', icon: 'file' });
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
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: messages.filter(m => !m.is_read).length || messages.length, group: 'Genel', link: '/admin/messages' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'Icerik' },
    { id: 'about', label: 'Hakkinda', icon: 'fas fa-circle-info', group: 'Icerik' },
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: news.length, group: 'Icerik' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activities.length, group: 'Icerik' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partners.length, group: 'Icerik' },
    { id: 'results', label: 'Dosyalar', icon: 'fas fa-file-circle-check', badge: results.length, group: 'Icerik' },
    { id: 'contact', label: 'Iletisim', icon: 'fas fa-phone', group: 'Icerik' },
    { id: 'site', label: 'Header/Footer', icon: 'fas fa-sliders', group: 'Icerik' },
    { id: 'users', label: 'Kullanicilar', icon: 'fas fa-users', group: 'Ayarlar' },
    { id: 'logs', label: 'Loglar', icon: 'fas fa-list', group: 'Ayarlar' },
    { id: 'security', label: 'Sifre & Guvenlik', icon: 'fas fa-lock', group: 'Ayarlar' },
  ];

  const groupedNav = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const currentTab = NAV.find(n => n.id === activeTab);

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /><p>Yukleniyor...</p></div>;

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-logo"><div className="adm-brand-icon"><i className="fas fa-leaf" /></div>DIGI-<span>GREEN</span></div>
            <div className="adm-brand-sub">Yonetim Paneli</div>
          </div>
          
          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
                <div className="adm-nav-label">{group}</div>
                {items.map(item => {
                  
                  if (item.link) {
                    return (
                      <Link 
                        href={item.link} 
                        key={item.id} 
                        className={`adm-nav-btn`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                        {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                      </Link>
                    );
                  }

                  return (
                    <button 
                      key={item.id} 
                      className={`adm-nav-btn ${activeTab === item.id ? 'active' : ''}`} 
                      onClick={() => { 
                          setActiveTab(item.id); 
                          setIsEditing(false); 
                      }}
                    >
                      <span className="adm-nav-icon"><i className={item.icon} /></span>{item.label}
                      {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          
          <div className="adm-sidebar-footer">
            <button className="adm-signout" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}><i className="fas fa-arrow-right-from-bracket" /> Cikis Yap</button>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">{currentTab && <><i className={currentTab.icon} style={{marginRight:'10px', color:'var(--accent)'}} />{currentTab.label}</>}</div>
            <div className="adm-topbar-pill"><span className="dot" /> {currentUser?.email || 'Admin'}</div>
          </div>

          <div className="adm-content">

            {/* ANA SAYFA */}
            {activeTab === 'home' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ana Sayfa <em>Duzenle</em></div>
                </div>

                <div className="adm-section">
                  <SectionHeader num="1" title="Kapak Slider Resimleri" />
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
                  <SectionHeader num="2" title="Kapak Metinleri ve Butonlar" />
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
                  <SectionHeader num="3" title="Ozet Bilgi Kartlari" />
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
                  <SectionHeader num="4" title="Hakkinda Bolumu (Gorsel & Metinler)" />
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
                  <SectionHeader num="5" title="Hedef Kitle Bolumu" />
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
                  <SectionHeader num="6" title="Dijital Ekosistem (Agac Yapisi)" />
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
                            <label>Ikon Secimi</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>
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
                            <textarea className="adm-textarea-full" rows={2} value={eco.desc || ''} onChange={e => handleEcoChange(idx, 'desc', e.target.value)} />
                          </div>
                          <div className="adm-form-item">
                            <label>Aciklama (EN)</label>
                            <textarea className="adm-textarea-full" rows={2} value={eco.desc_en || ''} onChange={e => handleEcoChange(idx, 'desc_en', e.target.value)} />
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
                  <SectionHeader num="7" title="Etki Sayaclari" />
                  <div className="adm-counter-grid">
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
                  <SectionHeader num="8" title="Alt Kapanis (CTA)" />
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
            )}

            {/* HAKKINDA (DETAYLI SAYFALAR) */}
            {activeTab === 'about' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Hakkinda <em>Sayfalari</em></div>
                  <div className="adm-page-desc">Hakkinda acilir menusundeki tum alt sayfalarin iceriklerini buradan yonetebilirsiniz.</div>
                </div>

                <div className="adm-subtabs">
                  <button className={`adm-subtab ${subTab === 'general' ? 'active' : ''}`} onClick={() => setAboutSubTab('general')}>Genel Hakkinda</button>
                  <button className={`adm-subtab ${subTab === 'consortium' ? 'active' : ''}`} onClick={() => setAboutSubTab('consortium')}>Konsorsiyum</button>
                  <button className={`adm-subtab ${subTab === 'impact' ? 'active' : ''}`} onClick={() => setAboutSubTab('impact')}>Proje Etkisi</button>
                  <button className={`adm-subtab ${subTab === 'plan' ? 'active' : ''}`} onClick={() => setAboutSubTab('plan')}>Proje Plani</button>
                  <button className={`adm-subtab ${subTab === 'roadmap' ? 'active' : ''}`} onClick={() => setAboutSubTab('roadmap')}>Yol Haritasi</button>
                  <button className={`adm-subtab ${subTab === 'strategy' ? 'active' : ''}`} onClick={() => setAboutSubTab('strategy')}>Strateji</button>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  
                  {subTab === 'general' && (
                    <div className="adm-fade-in">
                      
                      <SectionHeader num="1" title="Hero (Giris) Bolumu" />
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

                      <SectionHeader num="2" title="Vizyon & Misyon ve Gorsel" />
                      
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

                      <SectionHeader num="3" title="Rakamlarla Biz (Istatistikler)" />
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

                      <SectionHeader num="4" title="Hedef Kitle Kartlari" />
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

                      <SectionHeader num="5" title="Proje Kunyesi (Tablo)" />
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

                      <SectionHeader num="6" title="Alt Kapanis (CTA)" />
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
                      <SectionHeader num="1" title="Sayfa Girisi (Hero)" />
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
                      
                      <SectionHeader num="2" title="Istatistikler" />
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
                              <SettingInput label="Deger (TR)" settingKey={`consortium_stat_${n}_val`} {...commonProps} />
                              <SettingInput label="Deger (EN)" settingKey={`consortium_stat_${n}_val_en`} {...commonProps} />
                              <SettingInput label="Birim/Isaret (TR)" settingKey={`consortium_stat_${n}_unit`} {...commonProps} />
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
                      
                      <SectionHeader num="3" title="Kart A (Koordinator)" />
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
                      
                      <SectionHeader num="4" title="Kart B (Avrupali Ortaklar)" />
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
                      
                      <SectionHeader num="5" title="Kart C (Turk Ortaklar)" />
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
                      
                      <SectionHeader num="6" title="Kart D (Sinerji & Etki)" />
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
                      
                      <SectionHeader num="1" title="Hero (Giris) Bolumu" />
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

                      <SectionHeader num="2" title="Etki Istatistikleri" />
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

                      <SectionHeader num="3" title="Stratejik Etki Karti (Kart A)" />
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

                      <SectionHeader num="4" title="Vizyon Karti (Kart B)" />
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
                      
                      <SectionHeader num="1" title="Hero (Giris) Bolumu" />
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

                      <SectionHeader num="2" title="Plan Istatistikleri" />
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
                      
                      <div className="adm-divider" />

                      <SectionHeader num="3" title="Proje Asamalari (Timeline)" />
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
                      
                      <SectionHeader num="1" title="Hero (Giris) Bolumu" />
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

                      <SectionHeader num="2" title="Tablo Ust Bilgileri" />
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

                      <SectionHeader num="3" title="Gantt Semasi Gorevleri (1-21)" />
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
                      
                      <SectionHeader num="1" title="Hero (Giris) Bolumu" />
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

                      <SectionHeader num="2" title="Strateji Istatistikleri" />
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
                      <SectionHeader num="3" title="Kart A (Zaman Cizelgesi & Hazirlik)" />
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
                      
                      <SectionHeader num="4" title="Kart B (Odak Noktasi & Felsefe)" />
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
                      
                      <SectionHeader num="5" title="Kart C (Avrupa Politikalari Uyum)" />
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
            )}

            {activeTab === 'news' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Haberler & <em>Duyurular</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Sayfa Ust Bilgileri (Hero)" />
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

                  <SectionHeader num="2" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="news_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="news_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="news_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="news_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Haberi Duzenle' : ' Yeni Haber Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Haber Basligi (TR) *</label>
                        <input className="adm-input-full" placeholder="Baslik..." value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Haber Basligi (EN)</label>
                        <input className="adm-input-full" placeholder="Title..." value={newsForm.title_en} onChange={e => setNewsForm({...newsForm, title_en: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Tarih</label>
                      <input type="date" className="adm-input-full" value={newsForm.date || ''} onChange={e => setNewsForm({...newsForm, date: e.target.value})} style={{colorScheme:'dark', width: '50%'}} />
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Gorsel</label>
                      <FileInput value={newsForm.image_url} onChange={url => setNewsForm({...newsForm, image_url: url})} placeholder="Haber gorseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kisa Ozet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="2-3 cumle ozet..." value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kisa Ozet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={newsForm.summary_en} onChange={e => setNewsForm({...newsForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="adm-form-item">
                          <label>Detayli Icerik (TR)</label>
                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" modules={quillModules} value={newsForm.description || ''} onChange={val => setNewsForm({...newsForm, description: val})} />
                          </div>
                        </div>
                        <div className="adm-form-item">
                          <label>Detayli Icerik (EN)</label>
                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" modules={quillModules} value={newsForm.description_en || ''} onChange={val => setNewsForm({...newsForm, description_en: val})} />
                          </div>
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Degisiklikleri Kaydet' : '+ Haber Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Haberler ({news.length})</div>
                  {news.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-newspaper" />Haber bulunamadi.</div>
                  ) : news.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong>{item.title}</strong>
                        {item.date && <span><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date}</span>}
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'news')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Duzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('news', item.id, [item.image_url])}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Faaliyetler & <em>Etkinlikler</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Sayfa Ust Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="activities_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="activities_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="activities_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="activities_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="activities_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="activities_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="activities_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="activities_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="activities_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="activities_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="2" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="activities_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="activities_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="activities_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="activities_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Faaliyeti Duzenle' : ' Yeni Faaliyet Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'activities', activityForm, setActivityForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Faaliyet Basligi (TR) *</label>
                          <input className="adm-input-full" placeholder="Baslik..." value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Faaliyet Basligi (EN)</label>
                          <input className="adm-input-full" placeholder="Title..." value={activityForm.title_en} onChange={e => setActivityForm({...activityForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Turu (TR)</label>
                        <input className="adm-input-full" placeholder="Toplanti..." value={activityForm.type} onChange={e => setActivityForm({...activityForm, type: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Turu (EN)</label>
                        <input className="adm-input-full" placeholder="Meeting..." value={activityForm.type_en} onChange={e => setActivityForm({...activityForm, type_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid3">
                      <div className="adm-form-item">
                        <label>Konum (TR)</label>
                        <input className="adm-input-full" placeholder="Istanbul..." value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})} />
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
                      <label>Gorsel</label>
                      <FileInput value={activityForm.image_url} onChange={url => setActivityForm({...activityForm, image_url: url})} placeholder="Faaliyet gorseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kisa Ozet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kisa aciklama..." value={activityForm.summary} onChange={e => setActivityForm({...activityForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kisa Ozet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={activityForm.summary_en} onChange={e => setActivityForm({...activityForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="adm-form-item">
                          <label>Detayli Aciklama (TR)</label>
                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" modules={quillModules} value={activityForm.description || ''} onChange={val => setActivityForm({...activityForm, description: val})} />
                          </div>
                        </div>
                        <div className="adm-form-item">
                          <label>Detayli Aciklama (EN)</label>
                          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" modules={quillModules} value={activityForm.description_en || ''} onChange={val => setActivityForm({...activityForm, description_en: val})} />
                          </div>
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Degisiklikleri Kaydet' : '+ Faaliyet Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Faaliyetler ({activities.length})</div>
                  {activities.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-calendar" />Faaliyet bulunamadi.</div>
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
                          <i className="fas fa-pen" /> Duzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('activities', item.id, [item.image_url])}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ortaklar & <em>Kurumlar</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Sayfa Ust Bilgileri (Hero)" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Ust Ufak Baslik (TR)" settingKey="partners_hero_eyebrow" {...commonProps} />
                    <SettingInput label="Ust Ufak Baslik (EN)" settingKey="partners_hero_eyebrow_en" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (TR)" settingKey="partners_hero_title1" {...commonProps} />
                    <SettingInput label="Ana Baslik Satir 1 (EN)" settingKey="partners_hero_title1_en" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (TR)" settingKey="partners_hero_title2" {...commonProps} />
                    <SettingInput label="Vurgulu Baslik Satir 2 (EN)" settingKey="partners_hero_title2_en" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Giris Aciklamasi (TR)" settingKey="partners_page_desc" type="textarea" {...commonProps} />
                    <SettingInput label="Giris Aciklamasi (EN)" settingKey="partners_page_desc_en" type="textarea" {...commonProps} />
                  </div>
                  <div className="adm-form-grid2" style={{marginTop:'10px'}}>
                    <SettingInput label="Kaydirma Butonu (TR)" settingKey="partners_hero_scroll" {...commonProps} />
                    <SettingInput label="Kaydirma Butonu (EN)" settingKey="partners_hero_scroll_en" {...commonProps} />
                  </div>

                  <div className="adm-divider" style={{margin: '20px 0'}} />

                  <SectionHeader num="2" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="partners_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="partners_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="partners_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="partners_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Ortak Duzenle' : ' Yeni Ortak Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Kurum Adi (TR) *</label>
                        <input className="adm-input-full" placeholder="Kurum adi..." value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Kurum Adi (EN)</label>
                        <input className="adm-input-full" placeholder="Institution name..." value={partnerForm.name_en} onChange={e => setPartnerForm({...partnerForm, name_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Ulke (TR) *</label>
                        <input className="adm-input-full" placeholder="Turkiye..." value={partnerForm.country} onChange={e => setPartnerForm({...partnerForm, country: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Ulke (EN)</label>
                        <input className="adm-input-full" placeholder="Turkey..." value={partnerForm.country_en} onChange={e => setPartnerForm({...partnerForm, country_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Rol (TR)</label>
                          <select className="adm-select-full" value={partnerForm.role} onChange={e => setPartnerForm({...partnerForm, role: e.target.value})}>
                            <option value="Ortak">Ortak</option>
                            <option value="Koordinator">Koordinator</option>
                          </select>
                        </div>
                        <div className="adm-form-item">
                          <label>Rol (EN)</label>
                          <select className="adm-select-full" value={partnerForm.role_en} onChange={e => setPartnerForm({...partnerForm, role_en: e.target.value})}>
                            <option value="">(Ingilizce karsiligini girin...)</option>
                            <option value="Partner">Partner</option>
                            <option value="Coordinator">Coordinator</option>
                          </select>
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Aciklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kurum hakkinda..." value={partnerForm.description} onChange={e => setPartnerForm({...partnerForm, description: e.target.value})} rows={4} />
                        </div>
                        <div className="adm-form-item">
                          <label>Aciklama (EN)</label>
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
                          <label>Ulke Bayragi</label>
                          <FileInput value={partnerForm.flag_url} onChange={url => setPartnerForm({...partnerForm, flag_url: url})} placeholder="Bayrak URL..." uploadFile={uploadFile} showToast={showToast} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Ortak Bilgilerini Guncelle' : '+ Ortak Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Ortaklar ({partners.length})</div>
                  {partners.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-handshake" />Ortak bulunamadi.</div>
                  ) : partners.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        {item.image_url && <img src={item.image_url} style={{width:'40px', height:'28px', objectFit:'contain', borderRadius:'4px', border:'1px solid var(--border)', background:'white', padding:'2px'}} alt="" />}
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            <span className={`adm-badge ${item.role === 'Koordinator' ? 'adm-badge-yellow' : 'adm-badge-green'}`}>{item.role}</span>
                            {' '}&bull; {item.country}
                          </span>
                        </div>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'partners')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Duzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('partners', item.id, [item.image_url, item.flag_url])}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Proje <em>Dosyalari</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Sayfa Ust Bilgileri (Hero)" />
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

                  <SectionHeader num="2" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="results_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="results_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="results_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="results_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className="fas fa-plus" /> {isEditing ? ' Dosya Guncelle' : ' Yeni Dosya Ekle'}
                    </div>
                  </div>
                  <form onSubmit={e => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Dosya Basligi (TR) *</label>
                          <input className="adm-input-full" placeholder="Dosya basligi..." value={resultForm.title} onChange={e => setResultForm({...resultForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Dosya Basligi (EN)</label>
                          <input className="adm-input-full" placeholder="File title..." value={resultForm.title_en} onChange={e => setResultForm({...resultForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Aciklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Aciklama..." value={resultForm.description} onChange={e => setResultForm({...resultForm, description: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Aciklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Description..." value={resultForm.description_en} onChange={e => setResultForm({...resultForm, description_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Durum (TR)</label>
                          <select className="adm-select-full" value={resultForm.status} onChange={e => setResultForm({...resultForm, status: e.target.value})}>
                            <option value="Planlaniyor">Planlaniyor</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandi">Tamamlandi</option>
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
                      <FileInput value={resultForm.link} onChange={url => setResultForm({...resultForm, link: url})} placeholder="Dosya yukleyin veya URL girin..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Guncelle' : '+ Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  {results.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-file" />Dosya bulunamadi.</div>
                  ) : results.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong><i className="fas fa-file-circle-check" style={{color:'var(--accent)', marginRight:'8px'}} />{item.title}</strong>
                        <span>{item.status}</span>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'results')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Duzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('results', item.id, [item.link])}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Iletisim <em>Bilgileri</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Sayfa Ust Bilgileri (Hero)" />
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

                  <SectionHeader num="2" title="Icerik Bolumu Basliklari" />
                  <div className="adm-form-grid2">
                    <SettingInput label="Bolum Etiketi (TR)" settingKey="contact_sec_label" {...commonProps} />
                    <SettingInput label="Bolum Etiketi (EN)" settingKey="contact_sec_label_en" {...commonProps} />
                    <SettingInput label="Bolum Basligi (TR)" settingKey="contact_sec_title" {...commonProps} />
                    <SettingInput label="Bolum Basligi (EN)" settingKey="contact_sec_title_en" {...commonProps} />
                  </div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="3" title="Kurum Iletisim Bilgileri" />
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

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  <SectionHeader num="4" title="Iletisim Formu (Mesajlar) Ayarlari" />
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
            )}
            
            {activeTab === 'site' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Header / <em>Footer</em></div>
                </div>

                <div className="adm-section" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '14px', border: '1px dashed var(--border)', marginBottom: '30px' }}>
                  <SectionHeader num="1" title="Ust Menu & Sekme (Header)" />
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
                  <SectionHeader num="2" title="Alt Bilgi (Footer)" />
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
            
            {activeTab === 'users' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Sistem <em>Kullanicilari</em></div>
                  <div className="adm-page-desc">Panele erisim yetkisi olan admin hesaplari.</div>
                </div>
                <div className="adm-card" style={{padding: '0'}}>
                   <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                     <thead>
                       <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                         <th style={{padding: '16px 20px'}}>Kullanici (Email)</th>
                         <th style={{padding: '16px 20px'}}>ID (Benzersiz)</th>
                         <th style={{padding: '16px 20px'}}>Son Giris Tarihi</th>
                         <th style={{padding: '16px 20px'}}>Yetki Rolu</th>
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
                           <span className="adm-badge adm-badge-green">Super Admin</span>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Sistem <em>Loglari</em></div>
                  <div className="adm-page-desc">Admin paneli uzerinde gerceklestirilen son etkinlikler (Veritabaninda admin_logs tablosu olusturulmalidir).</div>
                </div>
                <div className="adm-card" style={{padding: '0'}}>
                 <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                     <thead>
                       <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                         <th style={{padding: '16px 20px'}}>Islem Tarihi</th>
                         <th style={{padding: '16px 20px'}}>Sayfa / Sekme</th>
                         <th style={{padding: '16px 20px'}}>Islem Tipi</th>
                         <th style={{padding: '16px 20px'}}>Kullanici & IP Adresi</th>
                       </tr>
                     </thead>
                     <tbody>
                       {logs.length === 0 ? (
                         <tr><td colSpan="4" style={{padding: '20px', textAlign: 'center', color: 'var(--text-muted)'}}>Henuz bir islem logu bulunmuyor.</td></tr>
                       ) : logs.map((log) => (
                         <tr key={log.id} style={{borderBottom: '1px solid var(--border)'}}>
                           <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                             {new Date(log.created_at).toLocaleString('tr-TR')}
                           </td>
                           <td style={{padding: '16px 20px'}}>
                             <span className="adm-badge adm-badge-blue" style={{textTransform:'uppercase'}}>{log.page_section || 'Genel'}</span>
                           </td>
                           <td style={{padding: '16px 20px', fontWeight: '500', color: 'var(--text-primary)'}}>
                              <i className="fas fa-check-circle" style={{marginRight:'8px', color:'var(--accent)'}}></i>
                              {log.action}
                           </td>
                           <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-muted)'}}>
                             <div style={{color:'var(--text-primary)', marginBottom:'4px'}}><i className="fas fa-user" style={{marginRight:'5px'}}></i>{log.user_email}</div>
                             <div style={{fontSize:'0.75rem', opacity:0.7}}><i className="fas fa-network-wired" style={{marginRight:'5px'}}></i>{log.ip_address || 'Bilinmiyor'}</div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Guvenlik & <em>Sifre</em></div>
                  <div className="adm-page-desc">Hesabinizin guvenligini saglayin ve yonetici sifrenizi guncelleyin.</div>
                </div>
                
                <div className="adm-form-card" style={{maxWidth: '500px'}}>
                  <div className="adm-form-card-title">
                    <div><i className="fas fa-key" style={{marginRight:'10px'}}/> Yeni Sifre Olustur</div>
                  </div>
                  <form onSubmit={handlePasswordChange} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    
                    <div className="adm-form-item">
                      <label>Giris Yapili Admin Hesabi</label>
                      <input className="adm-input-full" value={currentUser?.email || ''} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
                    </div>

                    <div className="adm-form-item">
                      <label>Guvenlik Icin Mevcut Sifreniz (Opsiyonel)</label>
                      <input type="password" placeholder="Mevcut sifre..." className="adm-input-full" />
                    </div>

                    <div className="adm-form-item">
                      <label>Yeni Sifre (En az 6 karakter)</label>
                      <input 
                        type="password" 
                        minLength={6} 
                        className="adm-input-full" 
                        placeholder="Yeni sifrenizi girin..." 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <button type="submit" className="adm-form-submit">
                      <i className="fas fa-lock" style={{marginRight:'5px'}}></i> Sifreyi Guncelle
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