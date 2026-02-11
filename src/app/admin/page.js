'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// --- VARSAYILAN DEĞERLER (Kutucuklar boş kalmasın diye) ---
const DEFAULTS = {
    // Hedef Kitle
    home_target_1_title: "Vatandaşlar",
    home_target_1_desc: "Mobil uygulamalar ile geri dönüşüme katılın, puan kazanın ve şehrinizi güzelleştirin.",
    home_target_2_title: "Yerel Yönetimler",
    home_target_2_desc: "Veriye dayalı kararlar alarak, kaynakları verimli kullanın ve operasyonel maliyetleri düşürün.",
    home_target_3_title: "STK ve Akademik",
    home_target_3_desc: "Araştırma, eğitim ve toplumsal farkındalık çalışmalarında aktif rol alın.",
    
    // Ağaç Yapısı (Dijital Ekosistem)
    home_eco_1_title: "Mobil Entegrasyon",
    home_eco_1_desc: "Vatandaşların belediye hizmetlerine tek tıkla ulaşmasını sağlayan entegre mobil çözüm.",
    home_eco_2_title: "Yapay Zeka & Atık",
    home_eco_2_desc: "Yapay zeka destekli sensörler ile atık konteynerlerini izleyerek optimize edilmiş rotalar.",
    home_eco_3_title: "E-Öğrenme Platformu",
    home_eco_3_desc: "İklim değişikliği ve dijital okuryazarlık üzerine modüler çevrimiçi eğitimler.",
    home_eco_4_title: "Sürdürülebilir Etki",
    home_eco_4_desc: "Karbon ayak izini azaltan ve kopyalanabilir dijital modeller.",

    // Sayaçlar
    home_counter_1_val: "250000",
    home_counter_1_label: "Toplam Hibe (€)",
    home_counter_2_val: "3",
    home_counter_2_label: "Ortak Ülke",
    home_counter_3_val: "5",
    home_counter_3_label: "Proje Ortağı",
    home_counter_4_val: "24",
    home_counter_4_label: "Ay Süre",

    // Hero & Hakkında
    header_logo_text: "DIGI-GREEN FUTURE",
    hero_title: "Yerel Yeşil Gelecek İçin Dijital Dönüşüm",
    hero_desc: "Erasmus+ KA220-ADU kapsamında, iklim değişikliği ile mücadelede dijital araçları kullanmayı hedefleyen öncü proje.",
    home_about_title: "Teknoloji ve Doğanın Mükemmel Uyumu",
    home_about_text: "Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur.",
    
    // Özet Kartlar
    home_summary_1_val: "24 Ay",
    home_summary_1_label: "Proje Süresi",
    home_summary_2_val: "250.000€",
    home_summary_2_label: "Toplam Hibe",
    home_summary_3_val: "KA220-ADU",
    home_summary_3_label: "Program",
    home_summary_4_val: "3 Ülke",
    home_summary_4_label: "Kapsam",

    // CTA
    home_cta_title: "Geleceği Birlikte Tasarlayalım",
    home_cta_text: "DIGI-GREEN FUTURE projesi hakkında daha fazla bilgi almak için bize ulaşın."
};

// --- YARDIMCI BİLEŞENLER ---

const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? '#e74c3c' : '#27ae60';
  return (
    <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: 'white', borderRadius: '8px', padding: '15px 20px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', borderLeft: `5px solid ${bgColor}`, display: 'flex', alignItems: 'center', gap: '15px', minWidth: '300px'}}>
        <div style={{flex:1}}>
            <h5 style={{margin:0, fontSize:'0.95rem', color:'#333'}}>{type === 'error' ? 'Hata' : 'Başarılı'}</h5>
            <p style={{margin:0, fontSize:'0.85rem', color:'#666'}}>{message}</p>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', color:'#999', cursor:'pointer', fontSize:'1.2rem'}}>&times;</button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(3px)'}}>
        <div style={{background:'white', borderRadius:'12px', padding:'30px', width:'400px', maxWidth:'90%', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.3)'}}>
            <h3 style={{margin:'0 0 10px', color:'#333'}}>Emin misiniz?</h3>
            <p style={{color:'#666', marginBottom:'25px', lineHeight:'1.5'}}>{message}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                <button onClick={onCancel} className="btn" style={{background:'#f1f1f1', color:'#555', padding:'10px 25px', borderRadius:'30px', fontWeight:'600', border:'none', cursor:'pointer'}}>Vazgeç</button>
                <button onClick={onConfirm} className="btn" style={{background:'#e74c3c', color:'white', padding:'10px 25px', borderRadius:'30px', fontWeight:'600', border:'none', cursor:'pointer'}}>Evet, Sil</button>
            </div>
        </div>
    </div>
  );
};

// --- AYAR GİRİŞ BİLEŞENİ ---
const SettingInput = ({ label, settingKey, type="text", placeholder="", settings, handleSettingChange, updateSetting, uploadFile }) => {
    // Veritabanından değeri bul
    const settingItem = settings.find(s => s.key === settingKey);
    // Eğer veritabanında yoksa DEFAULTS listesinden al, o da yoksa boş string
    const val = settingItem ? settingItem.value : (DEFAULTS[settingKey] || ''); 

    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>
                {label} <span style={{color:'#ccc', fontWeight:'normal', fontSize:'0.75rem', float:'right'}}>{settingKey}</span>
            </label>
            <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
                {type === 'textarea' ? (
                    <textarea 
                        className="form-control" 
                        value={val} 
                        onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                        placeholder={placeholder}
                        rows="3" 
                        style={{marginBottom:0, flex: 1, padding:'10px', border:'1px solid #ddd', borderRadius:'5px', width:'100%'}}
                    ></textarea>
                ) : type === 'image' ? (
                    <div style={{flex:1, display:'flex', gap:'10px', alignItems:'center'}}>
                        {val && <img src={val} style={{height:'40px', borderRadius:'4px', border:'1px solid #ddd'}} />}
                        <input 
                            className="form-control" 
                            value={val} 
                            onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                            placeholder="Resim URL'si veya Yükle" 
                            style={{flex:1, marginBottom:0, padding:'10px', border:'1px solid #ddd', borderRadius:'5px'}} 
                        />
                        <label style={{background:'#eee', padding:'10px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.9rem', whiteSpace:'nowrap'}}>
                            Yükle <input type="file" hidden onChange={async (e) => {
                                const url = await uploadFile(e.target.files[0]);
                                if(url) {
                                    handleSettingChange(settingKey, url);
                                    updateSetting(settingKey, url);
                                }
                            }} />
                        </label>
                    </div>
                ) : (
                    <input 
                        type="text" 
                        className="form-control" 
                        value={val} 
                        onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                        placeholder={placeholder}
                        style={{marginBottom:0, flex: 1, padding:'10px', border:'1px solid #ddd', borderRadius:'5px', width:'100%'}} 
                    />
                )}
                
                {/* Kaydet Butonu */}
                {type !== 'image' && (
                    <button 
                        onClick={() => updateSetting(settingKey, val)} 
                        style={{padding:'10px 20px', height:'auto', background:'#003399', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}
                    >
                        Kaydet
                    </button>
                )}
            </div>
        </div>
    );
};

const FileInput = ({ value, onChange, placeholder, uploadFile, showToast }) => {
    const [uploading, setUploading] = useState(false);
    const handleFileChange = async (e) => {
      try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadFile(file);
        if (url) { onChange(url); if(showToast) showToast('Dosya yüklendi.', 'success'); }
      } catch (error) { if(showToast) showToast('Hata oluştu', 'error'); } finally { setUploading(false); }
    };
    return (
      <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
        <div style={{flex:1, display:'flex', alignItems:'center', background:'white', border:'1px solid #ddd', borderRadius:'5px', padding:'5px 10px', gap:'10px'}}>
            {value ? <img src={value} alt="preview" style={{width:'30px', height:'30px', objectFit:'cover', borderRadius:'4px'}} /> : <i className="fas fa-image" style={{color:'#ccc'}}></i>}
            <input className="form-control" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} style={{flex:1, marginBottom:0, border:'none', padding:0}}/>
        </div>
        <div style={{position:'relative', overflow:'hidden', display:'inline-block'}}>
            <button type="button" className="btn" style={{background: uploading ? '#ccc' : '#eef2f7', color:'#333', padding:'8px 15px', border:'1px solid #ddd', cursor:'pointer'}}>{uploading ? '...' : 'Seç'}</button>
            <input type="file" onChange={handleFileChange} disabled={uploading} style={{position:'absolute', left:0, top:0, opacity:0, width:'100%', height:'100%', cursor:'pointer'}} />
        </div>
      </div>
    );
};

// --- ANA COMPONENT ---
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setAboutSubTab] = useState('general');
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]); 

  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', country: '', image_url: '', flag_url: '' }); 
  const [resultForm, setResultForm] = useState({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState(null); 
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const showConfirm = (message, onConfirm) => { setModal({ isOpen: true, message, onConfirm }); };
  const closeConfirm = () => { setModal({ ...modal, isOpen: false }); };
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  useEffect(() => { checkSessionAndLoad(); }, []);

  async function checkSessionAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }
    await loadAllData();
    setLoading(false);
  }

  async function loadAllData() {
    const s = await supabase.from('settings').select('*').order('id');
    const n = await supabase.from('news').select('*').order('date', {ascending:false});
    const p = await supabase.from('partners').select('*').order('id');
    const r = await supabase.from('results').select('*').order('id');
    const m = await supabase.from('contact_messages').select('*').order('created_at', {ascending:false}); 
    setSettings(s.data || []); setNews(n.data || []); setPartners(p.data || []); setResults(r.data || []); setMessages(m.data || []);
  }

  async function uploadFile(file) {
    if (!file) return null;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { showToast('Yükleme Hatası: ' + error.message, 'error'); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  }

  // Local State Update
  const handleSettingChange = (key, newValue) => {
    setSettings(prev => {
        const exists = prev.find(item => item.key === key);
        if (exists) {
            return prev.map(item => item.key === key ? { ...item, value: newValue } : item);
        } else {
            return [...prev, { key: key, value: newValue }];
        }
    });
  };

  // DB Update
  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if(error) showToast('Hata: ' + error.message, 'error'); 
    else showToast('Güncellendi.', 'success');
  }

  async function deleteItem(table, id) {
    showConfirm('Silmek istediğinize emin misiniz?', async () => {
        await supabase.from(table).delete().eq('id', id); loadAllData(); showToast('Silindi.', 'success');
    });
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    if (id) await supabase.from(table).update(data).eq('id', id); else await supabase.from(table).insert([data]);
    setIsEditing(false); loadAllData(); showToast('Kaydedildi.', 'success');
    if(table==='news') setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' });
    if(table==='partners') setPartnerForm({ id: null, name: '', country: '', image_url: '', flag_url: '' });
    if(table==='results') setResultForm({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
  }

  function startEdit(item, type) {
    setIsEditing(true);
    if(type==='news') setNewsForm(item);
    if(type==='partners') setPartnerForm(item);
    if(type==='results') setResultForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const TabButton = ({ id, label, icon }) => (
    <button onClick={() => { setActiveTab(id); setIsEditing(false); }} 
        style={{padding:'12px 20px', cursor:'pointer', background: activeTab === id ? '#003399' : 'white', color: activeTab === id ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '8px', textAlign:'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', width:'100%', marginBottom:'5px'}}>
        <i className={icon} style={{width:'20px', textAlign:'center'}}></i> {label}
    </button>
  );

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#003399'}}>Yükleniyor...</div>;

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px', maxWidth:'1200px', margin:'40px auto', padding:'0 20px'}}>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'1.8rem', color:'#333', margin:0}}>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{background:'#e74c3c', color:'white', padding:'10px 20px', border:'none', borderRadius:'30px', cursor:'pointer'}}>Çıkış Yap</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:'30px'}}>
        
        {/* SOL MENÜ */}
        <div>
            <TabButton id="messages" label={`Mesajlar (${messages.length})`} icon="fas fa-envelope" />
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim" icon="fas fa-phone" />
            <TabButton id="site" label="Site Ayarları (Header/Footer)" icon="fas fa-desktop" />
            
        </div>
        

        {/* SAĞ İÇERİK ALANI */}
        <div style={{background:'#fcfcfc', padding:'40px', borderRadius:'12px', border:'1px solid #eee'}}>
            
            {/* --- ANA SAYFA DÜZENLEME --- */}
            {activeTab === 'home' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Ana Sayfa Düzenle</h2>
                    
                    <h4 style={{margin:'20px 0', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>1. Hero (Kapak) Alanı</h4>
                    <SettingInput label="Kapak Resmi" settingKey="hero_bg_image" type="image" {...commonProps} />
                    <SettingInput label="Logo Metni" settingKey="header_logo_text" {...commonProps} />
                    <SettingInput label="Büyük Başlık" settingKey="hero_title" {...commonProps} />
                    <SettingInput label="Açıklama Metni" settingKey="hero_desc" type="textarea" {...commonProps} />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>2. Özet Kartlar (4 Adet)</h4>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'8px', background:'white'}}>
                            <strong style={{color:'#003399'}}>Kart 1 (Süre)</strong>
                            <SettingInput label="Değer" settingKey="home_summary_1_val" {...commonProps} />
                            <SettingInput label="Etiket" settingKey="home_summary_1_label" {...commonProps} />
                        </div>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'8px', background:'white'}}>
                            <strong style={{color:'#003399'}}>Kart 2 (Bütçe)</strong>
                            <SettingInput label="Değer" settingKey="home_summary_2_val" {...commonProps} />
                            <SettingInput label="Etiket" settingKey="home_summary_2_label" {...commonProps} />
                        </div>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'8px', background:'white'}}>
                            <strong style={{color:'#003399'}}>Kart 3 (Program)</strong>
                            <SettingInput label="Değer" settingKey="home_summary_3_val" {...commonProps} />
                            <SettingInput label="Etiket" settingKey="home_summary_3_label" {...commonProps} />
                        </div>
                        <div style={{border:'1px solid #ddd', padding:'15px', borderRadius:'8px', background:'white'}}>
                            <strong style={{color:'#003399'}}>Kart 4 (Kapsam)</strong>
                            <SettingInput label="Değer" settingKey="home_summary_4_val" {...commonProps} />
                            <SettingInput label="Etiket" settingKey="home_summary_4_label" {...commonProps} />
                        </div>
                    </div>

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>3. Hakkında Bölümü</h4>
                    <SettingInput label="Sol Taraf Görseli" settingKey="home_about_image" type="image" {...commonProps} />
                    <SettingInput label="Bölüm Başlığı" settingKey="home_about_title" {...commonProps} />
                    <SettingInput label="Bölüm Metni" settingKey="home_about_text" type="textarea" {...commonProps} />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>4. Hedef Kitle Kartları</h4>
                    <SettingInput label="Kart 1 Başlık" settingKey="home_target_1_title" {...commonProps} />
                    <SettingInput label="Kart 1 Açıklama" settingKey="home_target_1_desc" type="textarea" {...commonProps} />
                    <hr style={{margin:'15px 0', borderTop:'1px dashed #ddd'}}/>
                    <SettingInput label="Kart 2 Başlık" settingKey="home_target_2_title" {...commonProps} />
                    <SettingInput label="Kart 2 Açıklama" settingKey="home_target_2_desc" type="textarea" {...commonProps} />
                    <hr style={{margin:'15px 0', borderTop:'1px dashed #ddd'}}/>
                    <SettingInput label="Kart 3 Başlık" settingKey="home_target_3_title" {...commonProps} />
                    <SettingInput label="Kart 3 Açıklama" settingKey="home_target_3_desc" type="textarea" {...commonProps} />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>5. Dijital Ekosistem (Ağaç Yapısı)</h4>
                    <SettingInput label="Dal 1 Başlık (Mobil)" settingKey="home_eco_1_title" {...commonProps} />
                    <SettingInput label="Dal 1 Açıklama" settingKey="home_eco_1_desc" type="textarea" {...commonProps} />
                    <hr style={{margin:'15px 0', borderTop:'1px dashed #ddd'}}/>
                    <SettingInput label="Dal 2 Başlık (Yapay Zeka)" settingKey="home_eco_2_title" {...commonProps} />
                    <SettingInput label="Dal 2 Açıklama" settingKey="home_eco_2_desc" type="textarea" {...commonProps} />
                    <hr style={{margin:'15px 0', borderTop:'1px dashed #ddd'}}/>
                    <SettingInput label="Dal 3 Başlık (E-Öğrenme)" settingKey="home_eco_3_title" {...commonProps} />
                    <SettingInput label="Dal 3 Açıklama" settingKey="home_eco_3_desc" type="textarea" {...commonProps} />
                    <hr style={{margin:'15px 0', borderTop:'1px dashed #ddd'}}/>
                    <SettingInput label="Dal 4 Başlık (Etki)" settingKey="home_eco_4_title" {...commonProps} />
                    <SettingInput label="Dal 4 Açıklama" settingKey="home_eco_4_desc" type="textarea" {...commonProps} />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>6. Etki Sayaçları</h4>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <div>
                            <SettingInput label="Sayaç 1 Değer" settingKey="home_counter_1_val" {...commonProps} />
                            <SettingInput label="Sayaç 1 Etiket" settingKey="home_counter_1_label" {...commonProps} />
                        </div>
                        <div>
                            <SettingInput label="Sayaç 2 Değer" settingKey="home_counter_2_val" {...commonProps} />
                            <SettingInput label="Sayaç 2 Etiket" settingKey="home_counter_2_label" {...commonProps} />
                        </div>
                        <div>
                            <SettingInput label="Sayaç 3 Değer" settingKey="home_counter_3_val" {...commonProps} />
                            <SettingInput label="Sayaç 3 Etiket" settingKey="home_counter_3_label" {...commonProps} />
                        </div>
                        <div>
                            <SettingInput label="Sayaç 4 Değer" settingKey="home_counter_4_val" {...commonProps} />
                            <SettingInput label="Sayaç 4 Etiket" settingKey="home_counter_4_label" {...commonProps} />
                        </div>
                    </div>

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>7. Alt Kapanış (CTA)</h4>
                    <SettingInput label="Kapanış Başlığı" settingKey="home_cta_title" {...commonProps} />
                    <SettingInput label="Kapanış Metni" settingKey="home_cta_text" type="textarea" {...commonProps} />
                </div>
            )}

            {/* --- DİĞER SEKMELER --- */}
            {activeTab === 'about' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Hakkında Sayfası</h2>
                    {/* ... (Hakkında sekmesi içeriği aynı kalır) ... */}
                    <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                        <button onClick={()=>setAboutSubTab('general')} style={{padding:'5px 15px', borderRadius:'15px', border:'none', background:subTab==='general'?'#003399':'#eee', color:subTab==='general'?'white':'#555', cursor:'pointer'}}>Genel</button>
                        <button onClick={()=>setAboutSubTab('strategy')} style={{padding:'5px 15px', borderRadius:'15px', border:'none', background:subTab==='strategy'?'#003399':'#eee', color:subTab==='strategy'?'white':'#555', cursor:'pointer'}}>Strateji</button>
                    </div>
                    {subTab === 'general' && (
                        <>
                            <SettingInput label="Proje Adı" settingKey="about_project_name" {...commonProps} />
                            <SettingInput label="Proje Kısaltması" settingKey="about_project_code" {...commonProps} />
                            <SettingInput label="Program" settingKey="about_project_program" {...commonProps} />
                            <SettingInput label="Süresi" settingKey="about_project_duration" {...commonProps} />
                            <SettingInput label="Bütçe" settingKey="about_project_budget" {...commonProps} />
                        </>
                    )}
                    {subTab === 'strategy' && (
                        <>
                            <SettingInput label="Sayfa Başlığı" settingKey="about_strategy_title" {...commonProps} />
                            <SettingInput label="Alt Başlık" settingKey="about_strategy_desc" type="textarea" {...commonProps} />
                            <SettingInput label="Bölüm A Metni" settingKey="strategy_text_a_1" type="textarea" {...commonProps} />
                            <SettingInput label="Bölüm B Metni" settingKey="strategy_text_b" type="textarea" {...commonProps} />
                        </>
                    )}
                </div>
            )}

            {/* ... Diğer sekmeler (Partners, News, Results, Contact, Messages) önceki kodla aynı kalır ... */}
            {/* Ortaklar */}
            {activeTab === 'partners' && (
                <div className="fade-in">
                     <h2 style={{marginBottom:'25px', color:'#003399'}}>Ortaklar & Kurumlar</h2>
                     <SettingInput label="Sayfa Başlığı" settingKey="partners_page_title" {...commonProps} />
                     <SettingInput label="Başlık Resmi" settingKey="partners_header_bg" type="image" {...commonProps} />
                     <div style={{background:'white', padding:'25px', marginBottom:'20px', border:'1px solid #ddd', borderRadius:'8px'}}>
                        <h4>{isEditing ? 'Düzenle' : 'Yeni Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'10px'}}>
                            <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required style={{padding:'10px', width:'100%', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'5px'}} />
                            <input className="form-control" placeholder="Ülke" value={partnerForm.country} onChange={e=>setPartnerForm({...partnerForm, country:e.target.value})} required style={{padding:'10px', width:'100%', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'5px'}} />
                            <FileInput value={partnerForm.image_url} onChange={(url) => setPartnerForm({...partnerForm, image_url: url})} placeholder="Logo URL" uploadFile={uploadFile} showToast={showToast} />
                            <FileInput value={partnerForm.flag_url} onChange={(url) => setPartnerForm({...partnerForm, flag_url: url})} placeholder="Bayrak URL" uploadFile={uploadFile} showToast={showToast} />
                            <button type="submit" style={{background:'#003399', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                        </form>
                     </div>
                     {partners.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', margin:'5px 0', border:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                            {item.name}
                            <div>
                                <button onClick={()=>startEdit(item, 'partners')} style={{marginRight:'10px', border:'none', background:'none', color:'blue', cursor:'pointer'}}>Düzenle</button>
                                <button onClick={()=>deleteItem('partners', item.id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>Sil</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Haberler */}
            {activeTab === 'news' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Haberler</h2>
                    <SettingInput label="Başlık Resmi" settingKey="news_header_bg" type="image" {...commonProps} />
                    <div style={{background:'white', padding:'25px', margin:'20px 0', border:'1px solid #ddd', borderRadius:'8px'}}>
                        <form onSubmit={(e) => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'10px'}}>
                            <input placeholder="Başlık" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required style={{padding:'10px', width:'100%', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'5px'}} />
                            <FileInput value={newsForm.image_url} onChange={url=>setNewsForm({...newsForm, image_url:url})} placeholder="Resim" uploadFile={uploadFile} showToast={showToast} />
                            <textarea placeholder="Özet" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} style={{padding:'10px', width:'100%', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'5px'}} />
                            <button type="submit" style={{background:'#003399', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>{isEditing?'Güncelle':'Ekle'}</button>
                        </form>
                    </div>
                    {news.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', margin:'5px 0', border:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                            {item.title}
                            <button onClick={()=>deleteItem('news', item.id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>Sil</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Çıktılar */}
            {activeTab === 'results' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Çıktılar</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="results_page_title" {...commonProps} />
                    <SettingInput label="Başlık Resmi" settingKey="results_header_bg" type="image" {...commonProps} />
                    <div style={{background:'white', padding:'25px', margin:'20px 0', border:'1px solid #ddd', borderRadius:'8px'}}>
                        <form onSubmit={(e) => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'10px'}}>
                            <input className="form-control" placeholder="Başlık" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required style={{padding:'10px', width:'100%', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:'5px'}} />
                            <FileInput value={resultForm.link} onChange={(url) => setResultForm({...resultForm, link: url})} placeholder="Dosya URL" uploadFile={uploadFile} showToast={showToast} />
                            <button type="submit" style={{background:'#003399', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                        </form>
                    </div>
                    {results.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', margin:'5px 0', border:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                            {item.title}
                            <button onClick={()=>deleteItem('results', item.id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>Sil</button>
                        </div>
                    ))}
                </div>
            )}

            {/* İletişim */}
            {activeTab === 'contact' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>İletişim</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="contact_page_title" {...commonProps} />
                    <SettingInput label="Başlık Resmi" settingKey="contact_header_bg" type="image" {...commonProps} />
                    <div style={{height:'20px'}}></div>
                    <SettingInput label="E-posta" settingKey="contact_email" {...commonProps} />
                    <SettingInput label="Telefon" settingKey="contact_phone" {...commonProps} />
                    <SettingInput label="Adres" settingKey="contact_address" type="textarea" {...commonProps} />
                    <SettingInput label="Facebook" settingKey="social_facebook" {...commonProps} />
                    <SettingInput label="Twitter" settingKey="social_twitter" {...commonProps} />
                    <SettingInput label="Instagram" settingKey="social_instagram" {...commonProps} />
                </div>
            )}

            {/* Mesajlar */}
            {activeTab === 'messages' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Mesajlar</h2>
                    {messages.length === 0 ? <p style={{color:'#999'}}>Mesaj yok.</p> : messages.map(msg => (
                        <div key={msg.id} style={{background:'white', padding:'15px', marginBottom:'10px', border:'1px solid #eee', borderRadius:'8px'}}>
                            <div style={{fontWeight:'bold'}}>{msg.name} ({msg.email})</div>
                            <div style={{margin:'5px 0', color:'#555'}}>{msg.message}</div>
                            <button onClick={()=>deleteItem('contact_messages', msg.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontSize:'0.9rem'}}>Sil</button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'site' && (
    <div className="fade-in">
        <h2 style={{marginBottom:'25px', color:'#003399'}}>Genel Site Ayarları</h2>
        
        <h4 style={{margin:'20px 0', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>Üst Menü (Header)</h4>
        <SettingInput label="Logo Yazısı" settingKey="header_logo_text" {...commonProps} />

        <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>Alt Bilgi (Footer)</h4>
        <SettingInput label="Footer Hakkında Metni" settingKey="footer_about_text" type="textarea" {...commonProps} />
        <SettingInput label="Adres Bilgisi" settingKey="footer_address" {...commonProps} />
        <SettingInput label="Telefon Bilgisi" settingKey="footer_phone" {...commonProps} />
        <SettingInput label="Telif Hakkı (Copyright)" settingKey="footer_copyright" {...commonProps} />
    </div>
)}

        </div>
      </div>
    </div>
  );
}