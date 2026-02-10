'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// --- MODERN BİLEŞENLER ---

// 1. Toast Bildirim
const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? '#e74c3c' : '#27ae60';
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';

  return (
    <div className="toast-anim" style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        background: 'white', borderRadius: '8px', padding: '15px 20px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)', borderLeft: `5px solid ${bgColor}`,
        display: 'flex', alignItems: 'center', gap: '15px', minWidth: '300px'
    }}>
        <i className={`fas ${icon}`} style={{fontSize:'1.5rem', color: bgColor}}></i>
        <div style={{flex:1}}>
            <h5 style={{margin:0, fontSize:'0.95rem', color:'#333'}}>{type === 'error' ? 'Hata' : 'Başarılı'}</h5>
            <p style={{margin:0, fontSize:'0.85rem', color:'#666'}}>{message}</p>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', color:'#999', cursor:'pointer', fontSize:'1.2rem'}}>&times;</button>
    </div>
  );
};

// 2. Onay Modalı
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{
        position:'fixed', top:0, left:0, width:'100%', height:'100%',
        background:'rgba(0,0,0,0.5)', zIndex:10000,
        display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(3px)'
    }}>
        <div className="modal-anim" style={{background:'white', borderRadius:'12px', padding:'30px', width:'400px', maxWidth:'90%', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.3)'}}>
            <div style={{width:'60px', height:'60px', background:'#fef9e7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                <i className="fas fa-question" style={{fontSize:'1.8rem', color:'#f1c40f'}}></i>
            </div>
            <h3 style={{margin:'0 0 10px', color:'#333'}}>Emin misiniz?</h3>
            <p style={{color:'#666', marginBottom:'25px', lineHeight:'1.5'}}>{message}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                <button onClick={onCancel} className="btn" style={{background:'#f1f1f1', color:'#555', padding:'10px 25px', borderRadius:'30px', fontWeight:'600'}}>Vazgeç</button>
                <button onClick={onConfirm} className="btn" style={{background:'#e74c3c', color:'white', padding:'10px 25px', borderRadius:'30px', fontWeight:'600', boxShadow:'0 4px 10px rgba(231, 76, 60, 0.3)'}}>Evet, Sil</button>
            </div>
        </div>
    </div>
  );
};

// --- YARDIMCI BİLEŞEN: Çoklu Resim Yönetimi ---
const MultiImageSetting = ({ label, settingKey, showToast, showConfirm, uploadFile }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            const { data } = await supabase.from('settings').select('value').eq('key', settingKey).maybeSingle();
            if (data?.value) {
                try {
                    const parsed = JSON.parse(data.value);
                    setImages(Array.isArray(parsed) ? parsed : []);
                } catch (e) { setImages([]); }
            }
        };
        fetchImages();
    }, [settingKey]);

    const handleUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;
            const url = await uploadFile(file);
            if (url) {
                const newImages = [...images, url];
                setImages(newImages);
                const { error } = await supabase.from('settings').upsert(
                    { key: settingKey, value: JSON.stringify(newImages) }, 
                    { onConflict: 'key' }
                );
                if(error) throw error;
                showToast('Yeni slayt görseli eklendi.', 'success');
            }
        } catch (error) {
            showToast('Yükleme hatası: ' + error.message, 'error');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const removeImage = (indexToRemove) => {
        showConfirm('Bu görseli slayttan kaldırmak istediğinize emin misiniz?', async () => {
            const newImages = images.filter((_, index) => index !== indexToRemove);
            setImages(newImages);
            await supabase.from('settings').upsert(
                { key: settingKey, value: JSON.stringify(newImages) },
                { onConflict: 'key' }
            );
            showToast('Görsel slayttan kaldırıldı.', 'success');
        });
    };

    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'10px', color:'#333'}}>{label}</label>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'15px'}}>
                {images.map((img, idx) => (
                    <div key={idx} style={{position:'relative', width:'100px', height:'100px', border:'1px solid #ddd', borderRadius:'4px', overflow:'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
                        <img src={img} alt="slide" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        <button onClick={() => removeImage(idx)} style={{position:'absolute', top:0, right:0, background:'rgba(231, 76, 60, 0.9)', color:'white', border:'none', width:'24px', height:'24px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <i className="fas fa-trash"></i>
                        </button>
                        <span style={{position:'absolute', bottom:0, left:0, background:'rgba(0,0,0,0.6)', color:'white', fontSize:'10px', width:'100%', textAlign:'center', padding:'2px'}}>{idx + 1}</span>
                    </div>
                ))}
                {images.length === 0 && <span style={{color:'#999', fontSize:'0.9rem', fontStyle:'italic'}}>Henüz resim eklenmemiş.</span>}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <label className="btn btn-primary" style={{cursor:'pointer', padding:'8px 15px', marginBottom:0, display:'flex', alignItems:'center', gap:'8px'}}>
                    {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>} 
                    {uploading ? 'Yükleniyor...' : 'Yeni Slayt Ekle'}
                    <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{display:'none'}} />
                </label>
            </div>
        </div>
    );
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]); // Yeni: Mesajlar State

  // Forms
  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
  const [isEditing, setIsEditing] = useState(false);

  // Notification & Modal States
  const [toast, setToast] = useState(null); 
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // --- HELPERS ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleConfirmAction = () => {
    if (modal.onConfirm) modal.onConfirm();
    closeConfirm();
  };

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
    const m = await supabase.from('contact_messages').select('*').order('created_at', {ascending:false}); // Mesajları çek
    
    setSettings(s.data || []);
    setNews(n.data || []);
    setPartners(p.data || []);
    setResults(r.data || []);
    setMessages(m.data || []);
  }

  // --- DOSYA YÜKLEME ---
  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) { showToast('Yükleme Hatası: ' + error.message, 'error'); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    return publicUrl;
  }

  const FileInput = ({ value, onChange, placeholder }) => {
    const [uploading, setUploading] = useState(false);
    const handleFileChange = async (e) => {
      try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadFile(file);
        if (url) {
            onChange(url);
            showToast('Dosya başarıyla yüklendi.', 'success');
        }
      } catch (error) { showToast('Hata oluştu', 'error'); } finally { setUploading(false); }
    };
    return (
      <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
        <input className="form-control" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} style={{flex:1, marginBottom:0, padding:'8px'}}/>
        <div style={{position:'relative', overflow:'hidden', display:'inline-block'}}>
            <button type="button" className="btn" style={{background: uploading ? '#ccc' : '#eef2f7', color:'#333', padding:'8px 15px', border:'1px solid #ddd', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px'}}>
                {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                {uploading ? '...' : 'Seç'}
            </button>
            <input type="file" onChange={handleFileChange} disabled={uploading} style={{position:'absolute', left:0, top:0, opacity:0, width:'100%', height:'100%', cursor:'pointer'}} />
        </div>
      </div>
    );
  };

  // --- AYAR INPUTU ---
  const SettingInput = ({ label, settingKey, type="text" }) => {
    const setting = settings.find(s => s.key === settingKey);
    const val = setting ? setting.value : ''; 
    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px', boxShadow:'0 2px 5px rgba(0,0,0,0.02)'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>
                {label} {(!setting) && <span style={{color:'#e74c3c', fontSize:'0.7rem', background:'#fadbd8', padding:'2px 6px', borderRadius:'4px', marginLeft:'5px'}}>SQL Eksik</span>}
            </label>
            <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
                {type === 'textarea' ? (
                    <textarea className="form-control" defaultValue={val} id={`s-${settingKey}`} rows="3" style={{marginBottom:0, flex: 1}}></textarea>
                ) : type === 'image' ? (
                    <FileInput value={val} onChange={(newVal) => { 
                      const el = document.getElementById(`s-${settingKey}`);
                      if(el) el.value = newVal;
                      updateSetting(settingKey, newVal); 
                    }} placeholder="Resim URL veya Dosya Seç" />
                ) : (
                    <input type="text" className="form-control" defaultValue={val} id={`s-${settingKey}`} style={{marginBottom:0, flex: 1}} />
                )}
                {type !== 'image' && <button onClick={() => updateSetting(settingKey, document.getElementById(`s-${settingKey}`).value)} className="btn btn-primary" style={{padding:'10px 20px', height:'auto'}}>
                    <i className="fas fa-save"></i>
                </button>}
            </div>
            {type === 'image' && <input type="hidden" id={`s-${settingKey}`} defaultValue={val} />}
        </div>
    );
  };

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if(error) showToast('Hata: ' + error.message, 'error'); 
    else { 
        showToast('Ayar başarıyla güncellendi.', 'success'); 
        loadAllData(); 
    }
  }

  async function deleteItem(table, id) {
    showConfirm('Bu içeriği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', async () => {
        await supabase.from(table).delete().eq('id', id); 
        loadAllData();
        showToast('İçerik silindi.', 'success');
    });
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    if (id) await supabase.from(table).update(data).eq('id', id); else await supabase.from(table).insert([data]);
    setIsEditing(false);
    if(table==='news') setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' });
    if(table==='partners') setPartnerForm({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
    if(table==='results') setResultForm({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
    loadAllData();
    showToast(id ? 'Kayıt güncellendi.' : 'Yeni kayıt eklendi.', 'success');
  }

  function startEdit(item, type) {
    setIsEditing(true);
    if(type==='news') setNewsForm(item);
    if(type==='partners') setPartnerForm(item);
    if(type==='results') setResultForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return (
    <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#003399', fontSize:'1.2rem', gap:'10px'}}>
        <i className="fas fa-circle-notch fa-spin"></i> Yükleniyor...
    </div>
  );

  const TabButton = ({ id, label, icon, badge }) => (
    <button onClick={() => { setActiveTab(id); setIsEditing(false); }} 
        style={{
            padding:'12px 20px', cursor:'pointer', 
            background: activeTab === id ? '#003399' : 'white', 
            color: activeTab === id ? 'white' : '#555', 
            border: activeTab === id ? '1px solid #003399' : '1px solid #ddd', 
            borderRadius: '8px', textAlign:'left', fontWeight: '600', 
            display: 'flex', alignItems: 'center', gap: '10px', 
            transition: 'all 0.2s', boxShadow: activeTab === id ? '0 4px 10px rgba(0,51,153,0.2)' : 'none',
            position: 'relative'
        }}>
        <i className={icon} style={{width:'20px', textAlign:'center'}}></i> {label}
        {badge > 0 && <span style={{position:'absolute', right:'10px', background:'#e74c3c', color:'white', borderRadius:'50%', width:'20px', height:'20px', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center'}}>{badge}</span>}
    </button>
  );

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      
      {/* Toast Bildirim */}
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Onay Modalı */}
      <ConfirmModal 
        isOpen={modal.isOpen} 
        message={modal.message} 
        onConfirm={handleConfirmAction} 
        onCancel={closeConfirm} 
      />

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <div style={{width:'40px', height:'40px', background:'#003399', color:'white', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>
                <i className="fas fa-cog"></i>
            </div>
            <h1 style={{fontSize:'1.8rem', color:'#333', margin:0}}>Yönetim Paneli</h1>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn" style={{background:'#e74c3c', color:'white', display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', borderRadius:'30px'}}>
            <i className="fas fa-sign-out-alt"></i> Çıkış Yap
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:'30px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div style={{color:'#999', fontSize:'0.75rem', fontWeight:'bold', paddingLeft:'10px', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'1px'}}>Menü</div>
            {/* YENİ: Mesajlar Sekmesi */}
            <TabButton id="messages" label="Mesajlar" icon="fas fa-envelope-open-text" badge={messages.length} />
            <div style={{height:'10px'}}></div>
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim & Sosyal" icon="fas fa-envelope" />
        </div>

        <div style={{background:'#fcfcfc', padding:'40px', borderRadius:'12px', border:'1px solid #eee', boxShadow:'0 5px 20px rgba(0,0,0,0.03)'}}>
            
            {/* --- MESAJLAR (GELEN KUTUSU) --- */}
            {activeTab === 'messages' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Gelen Mesajlar</h2>
                    {messages.length === 0 ? (
                        <div style={{textAlign:'center', padding:'40px', color:'#999'}}>
                            <i className="fas fa-inbox" style={{fontSize:'3rem', marginBottom:'15px', opacity:0.3}}></i>
                            <p>Henüz hiç mesaj yok.</p>
                        </div>
                    ) : (
                        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{background:'white', padding:'20px', borderRadius:'10px', border:'1px solid #eee', boxShadow:'0 2px 10px rgba(0,0,0,0.03)'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                                        <div>
                                            <h4 style={{margin:0, color:'#333'}}>{msg.subject}</h4>
                                            <div style={{fontSize:'0.9rem', color:'#666', marginTop:'5px'}}>
                                                <strong>{msg.name}</strong> &lt;{msg.email}&gt;
                                            </div>
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                            <span style={{fontSize:'0.8rem', color:'#999'}}>{new Date(msg.created_at).toLocaleString('tr-TR')}</span>
                                            <button onClick={()=>deleteItem('contact_messages', msg.id)} style={{color:'#e74c3c', border:'none', background:'none', cursor:'pointer'}} title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{background:'#f9f9f9', padding:'15px', borderRadius:'5px', fontSize:'0.95rem', lineHeight:'1.5', color:'#444'}}>
                                        {msg.message}
                                    </div>
                                    <div style={{marginTop:'15px', textAlign:'right'}}>
                                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="btn" style={{background:'#003399', color:'white', padding:'8px 20px', borderRadius:'30px', fontSize:'0.9rem', textDecoration:'none', display:'inline-block'}}>
                                            <i className="fas fa-reply"></i> Yanıtla
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- ANA SAYFA --- */}
            {activeTab === 'home' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Ana Sayfa Düzenle</h2>
                    <SettingInput label="Hero Arka Plan Resmi" settingKey="hero_bg_image" type="image" />
                    <SettingInput label="Logo Metni" settingKey="header_logo_text" />
                    <SettingInput label="Büyük Başlık" settingKey="hero_title" />
                    <SettingInput label="Alt Açıklama" settingKey="hero_desc" type="textarea" />
                    
                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>Hedef Kutucukları</h4>
                    <SettingInput label="Hedef 1 Başlık" settingKey="home_goal_1_title" />
                    <SettingInput label="Hedef 1 Açıklama" settingKey="home_goal_1_desc" type="textarea" />
                    <SettingInput label="Hedef 2 Başlık" settingKey="home_goal_2_title" />
                    <SettingInput label="Hedef 2 Açıklama" settingKey="home_goal_2_desc" type="textarea" />
                </div>
            )}

             {/* --- HAKKINDA --- */}
             {activeTab === 'about' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Hakkında Sayfası Düzenle</h2>
                    
                    <h4 style={{marginBottom:'15px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>1. Proje Künyesi</h4>
                    <SettingInput label="Proje Adı" settingKey="about_project_name" />
                    <SettingInput label="Proje Kısaltması" settingKey="about_project_code" />
                    <SettingInput label="Program" settingKey="about_project_program" />
                    <SettingInput label="Süresi" settingKey="about_project_duration" />
                    <SettingInput label="Toplam Bütçe" settingKey="about_project_budget" />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>2. Strateji ve Vizyon</h4>
                    <SettingInput label="Vizyon Başlığı" settingKey="about_vision_title" />
                    <SettingInput label="Vizyon Metni" settingKey="about_vision_text" type="textarea" />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>3. Etki ve Sürdürülebilirlik</h4>
                    <SettingInput label="Etki Başlığı" settingKey="about_impact_title" />
                    <SettingInput label="Etki Metni" settingKey="about_impact_text" type="textarea" />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>4. Proje Planı</h4>
                    <SettingInput label="Plan Başlığı" settingKey="about_plan_title" />
                    <SettingInput label="Plan Alt Başlığı" settingKey="about_plan_text" type="textarea" />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>5. Proje Yol Haritası (Resim)</h4>
                    <SettingInput label="Yol Haritası Resmi" settingKey="about_roadmap_image" type="image" />

                    <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>6. Bütçe Planı (Çoklu Resim / Slider)</h4>
                    <MultiImageSetting 
                        label="Bütçe Sayfası Slaytları" 
                        settingKey="about_budget_images" 
                        showToast={showToast} 
                        showConfirm={showConfirm} 
                        uploadFile={uploadFile} 
                    />
                </div>
            )}

            {/* --- HABERLER --- */}
            {activeTab === 'news' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Haber Yönetimi</h2>
                    <SettingInput label="Haberler Sayfası Başlık Resmi" settingKey="news_header_bg" type="image" />
                    <div style={{background:'white', padding:'25px', borderRadius:'10px', marginBottom:'25px', border:'1px solid #ddd', boxShadow:'0 5px 15px rgba(0,0,0,0.03)'}}>
                        <h4 style={{margin:'0 0 15px', color:'#333', display:'flex', alignItems:'center', gap:'10px'}}>
                            <i className="fas fa-edit" style={{color:'#003399'}}></i> {isEditing ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
                        </h4>
                        <form onSubmit={(e) => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'15px'}}>
                            <input className="form-control" placeholder="Haber Başlığı" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required />
                            <FileInput value={newsForm.image_url} onChange={(url) => setNewsForm({...newsForm, image_url: url})} placeholder="Haber Görseli Seç" />
                            <textarea className="form-control" placeholder="Kısa Özet" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required></textarea>
                            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                                {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' })}} className="btn" style={{background:'#eee', color:'#555'}}>İptal</button>}
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Güncelle' : 'Yayınla'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {news.map(item => (
                        <div key={item.id} style={{background:'white', padding:'15px', marginBottom:'10px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #eee', boxShadow:'0 2px 5px rgba(0,0,0,0.02)'}}>
                            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                {item.image_url && <img src={item.image_url} style={{width:'50px', height:'50px', borderRadius:'5px', objectFit:'cover'}} />}
                                <div>
                                    <div style={{fontWeight:'bold', color:'#333'}}>{item.title}</div>
                                    <div style={{fontSize:'0.8rem', color:'#999'}}>{new Date(item.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={()=>startEdit(item, 'news')} style={{color:'#003399', border:'none', background:'none', cursor:'pointer'}}><i className="fas fa-pen"></i></button>
                                <button onClick={()=>deleteItem('news', item.id)} style={{color:'#e74c3c', border:'none', background:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ORTAKLAR --- */}
            {activeTab === 'partners' && (
                <div className="fade-in">
                     <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Ortaklar & Footer Logo</h2>
                     <SettingInput label="Footer Ortaklar Başlığı" settingKey="footer_partners_title" />
                     <div style={{background:'white', padding:'25px', borderRadius:'10px', marginBottom:'25px', border:'1px solid #ddd'}}>
                        <form onSubmit={(e) => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'15px'}}>
                            <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required />
                            <FileInput value={partnerForm.image_url} onChange={(url) => setPartnerForm({...partnerForm, image_url: url})} placeholder="Logo Seç" />
                            <button type="submit" className="btn btn-primary">Ekle</button>
                        </form>
                     </div>
                     {partners.map(item => (
                        <div key={item.id} style={{background:'white', padding:'15px', marginBottom:'10px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #eee'}}>
                            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                {item.image_url && <img src={item.image_url} style={{width:'40px', height:'auto', maxHeight:'40px'}} />}
                                <span style={{fontWeight:'bold'}}>{item.name}</span>
                            </div>
                            <button onClick={()=>deleteItem('partners', item.id)} style={{color:'#e74c3c', border:'none', background:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ÇIKTILAR --- */}
            {activeTab === 'results' && (
                <div className="fade-in">
                     <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>Çıktılar (Dosya İndirme)</h2>
                     <div style={{background:'white', padding:'25px', borderRadius:'10px', marginBottom:'25px', border:'1px solid #ddd'}}>
                        <form onSubmit={(e) => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'15px'}}>
                            <input className="form-control" placeholder="Dosya Başlığı" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required />
                            <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})}></textarea>
                            <FileInput value={resultForm.link} onChange={(url) => setResultForm({...resultForm, link: url})} placeholder="Dosya Seç (PDF/Doc)" />
                            <button type="submit" className="btn btn-primary">Dosya Ekle</button>
                        </form>
                     </div>
                     {results.map(item => (
                        <div key={item.id} style={{background:'white', padding:'15px', marginBottom:'10px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #eee'}}>
                            <div>
                                <div style={{fontWeight:'bold', color:'#333'}}><i className="fas fa-file-alt" style={{marginRight:'10px', color:'#003399'}}></i>{item.title}</div>
                            </div>
                            <button onClick={()=>deleteItem('results', item.id)} style={{color:'#e74c3c', border:'none', background:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- İLETİŞİM & SOSYAL --- */}
            {activeTab === 'contact' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399', borderBottom:'2px solid #eee', paddingBottom:'10px'}}>İletişim & Sosyal Medya</h2>
                    <SettingInput label="E-posta" settingKey="contact_email" />
                    <SettingInput label="Telefon" settingKey="contact_phone" />
                    <SettingInput label="Facebook Link" settingKey="social_facebook" />
                    <SettingInput label="Twitter Link" settingKey="social_twitter" />
                    <SettingInput label="Instagram Link" settingKey="social_instagram" />
                    <SettingInput label="Adres" settingKey="contact_address" type="textarea" />
                    <SettingInput label="Yasal Metin (Footer)" settingKey="footer_disclaimer" type="textarea" />
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
        .toast-anim {
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .modal-anim {
            animation: zoomIn 0.2s ease-out;
        }
        @keyframes zoomIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}