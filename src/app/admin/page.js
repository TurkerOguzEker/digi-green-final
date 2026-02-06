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

  // --- DOSYA YÜKLEME FONKSİYONU ---
  async function uploadFile(file) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 'images' bucket'ına yüklüyoruz
    const { error } = await supabase.storage.from('images').upload(filePath, file);

    if (error) {
      alert('Yükleme Hatası: ' + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    return publicUrl;
  }

  // --- DOSYA YÜKLEME BİLEŞENİ (INPUT + BUTON) ---
  const FileInput = ({ value, onChange, placeholder }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
      try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;
        
        const url = await uploadFile(file);
        if (url) onChange(url);
      } catch (error) {
        alert('Hata oluştu');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
        <input 
            className="form-control" 
            placeholder={placeholder} 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            style={{flex:1, marginBottom:0, padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}}
        />
        <div style={{position:'relative', overflow:'hidden', display:'inline-block'}}>
            <button type="button" className="btn" style={{background: uploading ? '#ccc' : '#eef2f7', color:'#333', border:'1px solid #ddd', padding:'8px 15px', borderRadius:'4px', cursor:'pointer', whiteSpace:'nowrap'}}>
                {uploading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-upload"></i> Seç</>}
            </button>
            <input 
                type="file" 
                onChange={handleFileChange} 
                disabled={uploading}
                style={{position:'absolute', left:0, top:0, opacity:0, width:'100%', height:'100%', cursor:'pointer'}} 
            />
        </div>
      </div>
    );
  };

  // --- AYAR INPUT BİLEŞENİ ---
  const SettingInput = ({ label, settingKey, type="text" }) => {
    const setting = settings.find(s => s.key === settingKey);
    const val = setting ? setting.value : ''; 

    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>
                {label} {(!setting) && <span style={{color:'red', fontSize:'0.7rem'}}>(SQL Çalıştırın)</span>}
            </label>
            <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
                {type === 'textarea' ? (
                    <textarea className="form-control" defaultValue={val} id={`s-${settingKey}`} rows="3" style={{marginBottom:0, flex: 1, padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}}></textarea>
                ) : type === 'image' ? (
                    // Resim türündeyse yeni FileInput bileşenini kullanıyoruz
                    <FileInput 
                        value={val} 
                        onChange={(newVal) => {
                            // Değeri doğrudan inputa yansıtmak için DOM manipülasyonu (State olmadığı için)
                            // Ancak kaydet butonu ID'den okuduğu için sorun yok.
                            const el = document.getElementById(`s-${settingKey}`);
                            if(el) el.value = newVal;
                            // React renderını tetiklemek için settings state'ini geçici güncellemek gerekebilir ama
                            // burada basitçe input value'sunu ve görseli güncelleyeceğiz.
                            updateSetting(settingKey, newVal); // Otomatik kaydetme opsiyonu veya manuel
                        }} 
                        placeholder="Resim URL veya Dosya Seç"
                    />
                ) : (
                    <input type="text" className="form-control" defaultValue={val} id={`s-${settingKey}`} style={{marginBottom:0, flex: 1, padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}} />
                )}
                
                {/* Image tipinde FileInput kendi içinde handle ediyor ama text tipleri için kaydet butonu */}
                {type !== 'image' && (
                    <button onClick={() => updateSetting(settingKey, document.getElementById(`s-${settingKey}`).value)} 
                            className="btn btn-primary" style={{padding:'10px 20px', height:'auto', whiteSpace: 'nowrap'}}>
                        Kaydet
                    </button>
                )}
            </div>
            {/* Image tipinde manuel input için gizli bir text field tutuyoruz ki FileInput'un onChange'i çalışsın */}
            {type === 'image' && <input type="hidden" id={`s-${settingKey}`} defaultValue={val} />}
        </div>
    );
  };

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if(error) alert('Hata: ' + error.message);
    else { alert('Güncellendi!'); loadAllData(); }
  }

  async function deleteItem(table, id) {
    if(!confirm('Silmek istediğine emin misin?')) return;
    await supabase.from(table).delete().eq('id', id);
    loadAllData();
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    if (id) await supabase.from(table).update(data).eq('id', id);
    else await supabase.from(table).insert([data]);
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
        style={{
            padding:'12px 20px', cursor:'pointer', background: activeTab === id ? '#003399' : 'white',
            color: activeTab === id ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '8px',
            textAlign:'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
        }}>
        <i className={icon}></i> {label}
    </button>
  );

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'1.8rem', color:'#333'}}>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
                className="btn" style={{background:'#e74c3c', color:'white', padding:'10px 20px'}}>
            <i className="fas fa-sign-out-alt"></i> Çıkış Yap
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'250px 1fr', gap:'30px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div style={{color:'#999', fontSize:'0.8rem', fontWeight:'bold', paddingLeft:'10px', marginBottom:'5px'}}>SAYFALAR</div>
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar & Dosyalar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim" icon="fas fa-envelope" />
        </div>

        <div style={{background:'#f8f9fa', padding:'30px', borderRadius:'10px', border:'1px solid #eee'}}>
            
            {activeTab === 'home' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Ana Sayfa Düzenle</h2>
                    
                    <h4 style={{marginBottom:'10px', borderBottom:'2px solid #ddd', paddingBottom:'5px'}}>1. Manşet (Hero)</h4>
                    <SettingInput label="Büyük Başlık" settingKey="hero_title" />
                    <SettingInput label="Alt Açıklama" settingKey="hero_desc" type="textarea" />
                    
                    <h4 style={{margin:'30px 0 10px', borderBottom:'2px solid #ddd', paddingBottom:'5px'}}>2. Proje Özeti</h4>
                    <SettingInput label="Özet Başlığı" settingKey="home_overview_title" />
                    <SettingInput label="Özet Metni 1" settingKey="home_overview_text" type="textarea" />
                    <SettingInput label="Özet Metni 2" settingKey="home_overview_text_2" type="textarea" />

                    <h4 style={{margin:'30px 0 10px', borderBottom:'2px solid #ddd', paddingBottom:'5px'}}>3. Hedef Kutucukları</h4>
                    <div style={{background:'#eafaf1', padding:'15px', borderRadius:'8px', marginBottom:'15px'}}>
                        <h5 style={{color:'#27ae60'}}>Kutucuk 1 (Yeşil)</h5>
                        <SettingInput label="Başlık" settingKey="home_goal_1_title" />
                        <SettingInput label="Açıklama" settingKey="home_goal_1_desc" type="textarea" />
                    </div>
                    <div style={{background:'#eaeffa', padding:'15px', borderRadius:'8px', marginBottom:'15px'}}>
                        <h5 style={{color:'#003399'}}>Kutucuk 2 (Mavi)</h5>
                        <SettingInput label="Başlık" settingKey="home_goal_2_title" />
                        <SettingInput label="Açıklama" settingKey="home_goal_2_desc" type="textarea" />
                    </div>
                    <div style={{background:'#fffbe6', padding:'15px', borderRadius:'8px', marginBottom:'15px'}}>
                        <h5 style={{color:'#f1c40f'}}>Kutucuk 3 (Sarı)</h5>
                        <SettingInput label="Başlık" settingKey="home_goal_3_title" />
                        <SettingInput label="Açıklama" settingKey="home_goal_3_desc" type="textarea" />
                    </div>

                    <h4 style={{margin:'30px 0 10px', borderBottom:'2px solid #ddd', paddingBottom:'5px'}}>4. Etkiler</h4>
                    <SettingInput label="Etkiler Ana Başlığı" settingKey="home_impact_title" />
                    <SettingInput label="Etkiler Açıklaması" settingKey="home_impact_desc" type="textarea" />
                    <SettingInput label="Yan Taraftaki Resim" settingKey="home_impact_image" type="image" />
                    
                    <div style={{background:'white', padding:'15px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'15px'}}>
                        <h5 style={{marginBottom:'10px'}}>Etki Maddeleri</h5>
                        <SettingInput label="Madde 1" settingKey="home_impact_list_1" />
                        <SettingInput label="Madde 2" settingKey="home_impact_list_2" />
                        <SettingInput label="Madde 3" settingKey="home_impact_list_3" />
                        <SettingInput label="Madde 4" settingKey="home_impact_list_4" />
                    </div>

                    <h4 style={{margin:'30px 0 10px', borderBottom:'2px solid #ddd', paddingBottom:'5px'}}>5. Çağrı / Butonlar (CTA)</h4>
                    <div style={{background:'#eef2f7', padding:'15px', borderRadius:'8px'}}>
                        <SettingInput label="Bölüm Başlığı" settingKey="home_cta_title" />
                        <SettingInput label="Bölüm Açıklaması" settingKey="home_cta_desc" type="textarea" />
                        <hr style={{margin:'15px 0'}}/>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                            <div>
                                <h5 style={{color:'#27ae60', marginBottom:'5px'}}>Buton 1 (Yeşil)</h5>
                                <SettingInput label="Yazı" settingKey="home_cta_btn1_text" />
                                <SettingInput label="Link" settingKey="home_cta_btn1_link" />
                            </div>
                            <div>
                                <h5 style={{color:'#003399', marginBottom:'5px'}}>Buton 2 (Şeffaf)</h5>
                                <SettingInput label="Yazı" settingKey="home_cta_btn2_text" />
                                <SettingInput label="Link" settingKey="home_cta_btn2_link" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Hakkında Sayfası</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="about_page_title" />
                    <SettingInput label="Alt Başlık" settingKey="about_page_desc" />
                    <hr style={{margin:'30px 0'}}/>
                    <SettingInput label="Vizyon Başlığı" settingKey="about_vision_title" />
                    <SettingInput label="Vizyon Metni" settingKey="about_vision_text" type="textarea" />
                    <hr style={{margin:'30px 0'}}/>
                    <SettingInput label="Hedef Kitle Başlığı" settingKey="about_target_title" />
                    <SettingInput label="Etkiler Başlığı" settingKey="about_impact_title" />
                    <SettingInput label="Etkiler Metni" settingKey="about_impact_text" type="textarea" />
                </div>
            )}

            {activeTab === 'contact' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>İletişim</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="contact_page_title" />
                    <SettingInput label="Alt Başlık" settingKey="contact_page_desc" />
                    <hr style={{margin:'30px 0'}}/>
                    <SettingInput label="E-posta" settingKey="contact_email" />
                    <SettingInput label="Telefon" settingKey="contact_phone" />
                    <SettingInput label="Adres" settingKey="contact_address" type="textarea" />
                </div>
            )}

            {activeTab === 'news' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Haberler</h2>
                    <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <h4>{isEditing ? 'Düzenle' : 'Yeni Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'10px', marginTop:'10px'}}>
                            <input className="form-control" placeholder="Başlık" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required style={{padding:'8px', width:'100%'}}/>
                            <input className="form-control" type="date" value={newsForm.date} onChange={e=>setNewsForm({...newsForm, date:e.target.value})} required style={{padding:'8px', width:'100%'}}/>
                            
                            {/* YENİ DOSYA YÜKLEME ALANI */}
                            <FileInput 
                                value={newsForm.image_url} 
                                onChange={(url) => setNewsForm({...newsForm, image_url: url})} 
                                placeholder="Resim URL veya Dosya Seç" 
                            />
                            
                            <textarea className="form-control" placeholder="Özet" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required style={{padding:'8px', width:'100%'}}></textarea>
                            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' })}} style={{background:'#ccc', padding:'8px 20px', border:'none', cursor:'pointer'}}>İptal</button>}
                                <button type="submit" className="btn" style={{background:'#27ae60', color:'white', padding:'8px 20px', border:'none', cursor:'pointer'}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                            </div>
                        </form>
                    </div>
                    {news.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between', border:'1px solid #eee'}}>
                            <span><strong>{item.title}</strong> ({item.date})</span>
                            <div>
                                <button onClick={()=>startEdit(item, 'news')} style={{color:'blue', marginRight:'10px', cursor:'pointer', border:'none', background:'none'}}>Düzenle</button>
                                <button onClick={()=>deleteItem('news', item.id)} style={{color:'red', cursor:'pointer', border:'none', background:'none'}}>Sil</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'partners' && (
                <div>
                     <h2 style={{marginBottom:'20px', color:'#003399'}}>Ortaklar</h2>
                     <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <h4>{isEditing ? 'Düzenle' : 'Yeni Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'10px', marginTop:'10px'}}>
                            <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required style={{padding:'8px'}}/>
                            <select className="form-control" value={partnerForm.role} onChange={e=>setPartnerForm({...partnerForm, role:e.target.value})} style={{padding:'8px'}}>
                                <option>Ortak</option>
                                <option>Koordinatör</option>
                            </select>
                            <input className="form-control" placeholder="Ülke" value={partnerForm.country} onChange={e=>setPartnerForm({...partnerForm, country:e.target.value})} style={{padding:'8px'}}/>
                            
                            {/* YENİ DOSYA YÜKLEME ALANI */}
                            <FileInput 
                                value={partnerForm.image_url} 
                                onChange={(url) => setPartnerForm({...partnerForm, image_url: url})} 
                                placeholder="Logo URL veya Dosya Seç" 
                            />

                            <input className="form-control" placeholder="Web Sitesi" value={partnerForm.website} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} style={{padding:'8px'}}/>
                            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setPartnerForm({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' })}} style={{background:'#ccc', padding:'8px 20px', border:'none', cursor:'pointer'}}>İptal</button>}
                                <button type="submit" className="btn" style={{background:'#27ae60', color:'white', padding:'8px 20px', border:'none', cursor:'pointer'}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                            </div>
                        </form>
                     </div>
                     {partners.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between', border:'1px solid #eee'}}>
                            <span><strong>{item.name}</strong> ({item.country})</span>
                            <div>
                                <button onClick={()=>startEdit(item, 'partners')} style={{color:'blue', marginRight:'10px', cursor:'pointer', border:'none', background:'none'}}>Düzenle</button>
                                <button onClick={()=>deleteItem('partners', item.id)} style={{color:'red', cursor:'pointer', border:'none', background:'none'}}>Sil</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'results' && (
                <div>
                     <h2 style={{marginBottom:'20px', color:'#003399'}}>Çıktılar & Dosyalar</h2>
                     <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ddd'}}>
                        <h4>{isEditing ? 'Düzenle' : 'Yeni Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'10px', marginTop:'10px'}}>
                            <input className="form-control" placeholder="Başlık" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required style={{padding:'8px'}}/>
                            <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})} style={{padding:'8px'}}></textarea>
                            <select className="form-control" value={resultForm.status} onChange={e=>setResultForm({...resultForm, status:e.target.value})} style={{padding:'8px'}}>
                                <option>Planlanıyor</option>
                                <option>Devam Ediyor</option>
                                <option>Tamamlandı</option>
                            </select>
                            <select className="form-control" value={resultForm.icon} onChange={e=>setResultForm({...resultForm, icon:e.target.value})} style={{padding:'8px'}}>
                                <option value="file">Dosya İkonu</option>
                                <option value="app">Mobil Uygulama İkonu</option>
                                <option value="video">Video İkonu</option>
                            </select>
                            
                            {/* YENİ DOSYA YÜKLEME ALANI */}
                            <FileInput 
                                value={resultForm.link} 
                                onChange={(url) => setResultForm({...resultForm, link: url})} 
                                placeholder="Dosya URL veya Dosya Seç (PDF, vb.)" 
                            />

                            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setResultForm({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' })}} style={{background:'#ccc', padding:'8px 20px', border:'none', cursor:'pointer'}}>İptal</button>}
                                <button type="submit" className="btn" style={{background:'#27ae60', color:'white', padding:'8px 20px', border:'none', cursor:'pointer'}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                            </div>
                        </form>
                     </div>
                     {results.map(item => (
                        <div key={item.id} style={{background:'white', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between', border:'1px solid #eee'}}>
                            <span><strong>{item.title}</strong> ({item.status})</span>
                            <div>
                                <button onClick={()=>startEdit(item, 'results')} style={{color:'blue', marginRight:'10px', cursor:'pointer', border:'none', background:'none'}}>Düzenle</button>
                                <button onClick={()=>deleteItem('results', item.id)} style={{color:'red', cursor:'pointer', border:'none', background:'none'}}>Sil</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}