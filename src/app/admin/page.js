'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);

  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });

  const [isEditing, setIsEditing] = useState(false);

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
    setSettings(s.data || []);
    setNews(n.data || []);
    setPartners(p.data || []);
    setResults(r.data || []);
  }

  // --- DOSYA YÜKLEME ---
  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) { alert('Yükleme Hatası: ' + error.message); return null; }
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
        if (url) onChange(url);
      } catch (error) { alert('Hata oluştu'); } finally { setUploading(false); }
    };
    return (
      <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
        <input className="form-control" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} style={{flex:1, marginBottom:0, padding:'8px'}}/>
        <div style={{position:'relative', overflow:'hidden', display:'inline-block'}}>
            <button type="button" className="btn" style={{background: uploading ? '#ccc' : '#eef2f7', color:'#333', padding:'8px 15px', border:'1px solid #ddd', whiteSpace:'nowrap'}}>{uploading ? '...' : 'Dosya Seç'}</button>
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
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>
                {label} {(!setting) && <span style={{color:'red', fontSize:'0.7rem'}}>(SQL Eksik)</span>}
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
                {type !== 'image' && <button onClick={() => updateSetting(settingKey, document.getElementById(`s-${settingKey}`).value)} className="btn btn-primary" style={{padding:'10px 20px', height:'auto'}}>Kaydet</button>}
            </div>
            {type === 'image' && <input type="hidden" id={`s-${settingKey}`} defaultValue={val} />}
        </div>
    );
  };

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if(error) alert('Hata: ' + error.message); else { alert('Güncellendi!'); loadAllData(); }
  }

  async function deleteItem(table, id) {
    if(!confirm('Silmek istiyor musunuz?')) return;
    await supabase.from(table).delete().eq('id', id); loadAllData();
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
  }

  function startEdit(item, type) {
    setIsEditing(true);
    if(type==='news') setNewsForm(item);
    if(type==='partners') setPartnerForm(item);
    if(type==='results') setResultForm(item);
  }

  if (loading) return <div className="container section-padding">Yükleniyor...</div>;

  const TabButton = ({ id, label, icon }) => (
    <button onClick={() => { setActiveTab(id); setIsEditing(false); }} 
        style={{padding:'12px 20px', cursor:'pointer', background: activeTab === id ? '#003399' : 'white', color: activeTab === id ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '8px', textAlign:'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'}}>
        <i className={icon}></i> {label}
    </button>
  );

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'1.8rem', color:'#333'}}>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn" style={{background:'#e74c3c', color:'white'}}>Çıkış Yap</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'250px 1fr', gap:'30px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div style={{color:'#999', fontSize:'0.8rem', fontWeight:'bold', paddingLeft:'10px', marginBottom:'5px'}}>SAYFALAR</div>
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim & Sosyal" icon="fas fa-envelope" />
        </div>

        <div style={{background:'#f8f9fa', padding:'30px', borderRadius:'10px', border:'1px solid #eee'}}>
            
            {/* --- ANA SAYFA --- */}
            {activeTab === 'home' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Ana Sayfa Düzenle</h2>
                    <SettingInput label="Hero Arka Plan Resmi" settingKey="hero_bg_image" type="image" />
                    <SettingInput label="Logo Metni" settingKey="header_logo_text" />
                    <SettingInput label="Büyük Başlık" settingKey="hero_title" />
                    <SettingInput label="Alt Açıklama" settingKey="hero_desc" type="textarea" />
                    
                    <h4 style={{margin:'30px 0 10px', borderBottom:'2px solid #ddd'}}>Hedef Kutucukları</h4>
                    <SettingInput label="Hedef 1 Başlık" settingKey="home_goal_1_title" />
                    <SettingInput label="Hedef 1 Açıklama" settingKey="home_goal_1_desc" type="textarea" />
                    <SettingInput label="Hedef 2 Başlık" settingKey="home_goal_2_title" />
                    <SettingInput label="Hedef 2 Açıklama" settingKey="home_goal_2_desc" type="textarea" />
                </div>
            )}

             {/* --- HAKKINDA --- */}
             {activeTab === 'about' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Hakkında Sayfası Düzenle</h2>
                    
                    <h4 style={{marginBottom:'10px', borderBottom:'1px solid #ddd'}}>1. Proje Künyesi</h4>
                    <SettingInput label="Proje Adı" settingKey="about_project_name" />
                    <SettingInput label="Proje Kısaltması" settingKey="about_project_code" />
                    <SettingInput label="Program" settingKey="about_project_program" />
                    <SettingInput label="Süresi" settingKey="about_project_duration" />
                    <SettingInput label="Toplam Bütçe" settingKey="about_project_budget" />

                    <h4 style={{margin:'30px 0 10px', borderBottom:'1px solid #ddd'}}>2. Strateji ve Vizyon</h4>
                    <SettingInput label="Vizyon Başlığı" settingKey="about_vision_title" />
                    <SettingInput label="Vizyon Metni" settingKey="about_vision_text" type="textarea" />

                    <h4 style={{margin:'30px 0 10px', borderBottom:'1px solid #ddd'}}>3. Etki ve Sürdürülebilirlik</h4>
                    <SettingInput label="Etki Başlığı" settingKey="about_impact_title" />
                    <SettingInput label="Etki Metni" settingKey="about_impact_text" type="textarea" />

                    {/* YENİ EKLENEN KISIM: PROJE PLANI */}
                    <h4 style={{margin:'30px 0 10px', borderBottom:'1px solid #ddd'}}>4. Proje Planı</h4>
                    <SettingInput label="Plan Başlığı" settingKey="about_plan_title" />
                    <SettingInput label="Plan Alt Başlığı" settingKey="about_plan_text" type="textarea" />
                </div>
            )}

            {/* --- HABERLER --- */}
            {activeTab === 'news' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Haber Yönetimi</h2>
                    <SettingInput label="Haberler Sayfası Başlık Resmi" settingKey="news_header_bg" type="image" />
                    <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <h4>{isEditing ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'10px', marginTop:'10px'}}>
                            <input className="form-control" placeholder="Haber Başlığı" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required />
                            <FileInput value={newsForm.image_url} onChange={(url) => setNewsForm({...newsForm, image_url: url})} placeholder="Haber Görseli Seç" />
                            <textarea className="form-control" placeholder="Kısa Özet" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required></textarea>
                            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Güncelle' : 'Yayınla'}</button>
                            </div>
                        </form>
                    </div>
                    {news.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between', border:'1px solid #eee'}}>
                            <span><strong>{item.title}</strong></span>
                            <button onClick={()=>deleteItem('news', item.id)} style={{color:'red', border:'none', background:'none'}}>Sil</button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ORTAKLAR --- */}
            {activeTab === 'partners' && (
                <div>
                     <h2 style={{marginBottom:'20px', color:'#003399'}}>Ortaklar & Footer Logo</h2>
                     <SettingInput label="Footer Ortaklar Başlığı" settingKey="footer_partners_title" />
                     <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <form onSubmit={(e) => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'10px'}}>
                            <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required />
                            <FileInput value={partnerForm.image_url} onChange={(url) => setPartnerForm({...partnerForm, image_url: url})} placeholder="Logo Seç" />
                            <button type="submit" className="btn btn-primary">Ekle</button>
                        </form>
                     </div>
                     {partners.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between'}}>
                            <span>{item.name}</span>
                            <button onClick={()=>deleteItem('partners', item.id)} style={{color:'red', border:'none', background:'none'}}>Sil</button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ÇIKTILAR --- */}
            {activeTab === 'results' && (
                <div>
                     <h2 style={{marginBottom:'20px', color:'#003399'}}>Çıktılar (Dosya İndirme)</h2>
                     <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <form onSubmit={(e) => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'10px'}}>
                            <input className="form-control" placeholder="Dosya Başlığı" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required />
                            <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})}></textarea>
                            <FileInput value={resultForm.link} onChange={(url) => setResultForm({...resultForm, link: url})} placeholder="Dosya Seç (PDF/Doc)" />
                            <button type="submit" className="btn btn-primary">Dosya Ekle</button>
                        </form>
                     </div>
                </div>
            )}

            {/* --- İLETİŞİM & SOSYAL --- */}
            {activeTab === 'contact' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>İletişim & Sosyal Medya</h2>
                    <SettingInput label="E-posta" settingKey="contact_email" />
                    <SettingInput label="Telefon" settingKey="contact_phone" />
                    <SettingInput label="Facebook Link" settingKey="social_facebook" />
                    <SettingInput label="Twitter Link" settingKey="social_twitter" />
                    <SettingInput label="Instagram Link" settingKey="social_instagram" />
                    <SettingInput label="Yasal Metin (Footer)" settingKey="footer_disclaimer" type="textarea" />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}