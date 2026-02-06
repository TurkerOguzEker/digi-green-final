'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home'); // Varsayılan: Ana Sayfa
  const [loading, setLoading] = useState(true);
  
  // Tüm Veriler
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);

  // Form State'leri
  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });

  // Düzenleme Modu
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkSessionAndLoad();
  }, []);

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

  // --- YARDIMCI: Belirli bir ayarı bul ve input olarak göster ---
  const SettingInput = ({ label, settingKey, type="text" }) => {
    const setting = settings.find(s => s.key === settingKey);
    // Eğer veritabanında bu ayar yoksa boş dönmesin, hata vermesin
    if (!setting) return null; 

    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>{label}</label>
            <div style={{display:'flex', gap:'10px'}}>
                {type === 'textarea' ? (
                    <textarea className="form-control" defaultValue={setting.value} id={`s-${settingKey}`} rows="3" style={{marginBottom:0}}></textarea>
                ) : (
                    <input type="text" className="form-control" defaultValue={setting.value} id={`s-${settingKey}`} style={{marginBottom:0}} />
                )}
                <button onClick={() => updateSetting(settingKey, document.getElementById(`s-${settingKey}`).value)} 
                        className="btn btn-primary" style={{padding:'0 20px', height:'auto'}}>
                    Kaydet
                </button>
            </div>
        </div>
    );
  };

  // --- CRUD İŞLEMLERİ ---
  async function updateSetting(key, value) {
    await supabase.from('settings').update({ value }).eq('key', key);
    alert('Güncellendi!');
    loadAllData(); // Verileri tazeleyelim ki state güncellensin
  }

  async function deleteItem(table, id) {
    if(!confirm('Silmek istediğine emin misin?')) return;
    await supabase.from(table).delete().eq('id', id);
    loadAllData();
  }

  // Ortak Kaydetme Fonksiyonu (Generic)
  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    if (id) await supabase.from(table).update(data).eq('id', id);
    else await supabase.from(table).insert([data]);
    
    setIsEditing(false);
    // Formu sıfırla (Basit yöntem)
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

  // --- TAB TASARIMI ---
  const TabButton = ({ id, label, icon }) => (
    <button onClick={() => { setActiveTab(id); setIsEditing(false); }} 
        style={{
            padding:'12px 20px', 
            cursor:'pointer', 
            background: activeTab === id ? '#003399' : 'white',
            color: activeTab === id ? 'white' : '#555',
            border: '1px solid #ddd',
            borderRadius: '8px',
            textAlign:'left',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
        }}>
        <i className={icon}></i> {label}
    </button>
  );

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      
      {/* ÜST BAR */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'1.8rem', color:'#333'}}>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
                className="btn" style={{background:'#e74c3c', color:'white', padding:'10px 20px'}}>
            <i className="fas fa-sign-out-alt"></i> Çıkış Yap
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'250px 1fr', gap:'30px'}}>
        
        {/* SOL MENÜ (SEKMELER) */}
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div style={{color:'#999', fontSize:'0.8rem', fontWeight:'bold', paddingLeft:'10px', marginBottom:'5px'}}>SAYFALAR</div>
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar & Dosyalar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim" icon="fas fa-envelope" />
        </div>

        {/* SAĞ İÇERİK ALANI */}
        <div style={{background:'#f8f9fa', padding:'30px', borderRadius:'10px', border:'1px solid #eee'}}>
            
            {/* --- 1. ANA SAYFA DÜZENLEME --- */}
            {activeTab === 'home' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Ana Sayfa İçerikleri</h2>
                    <SettingInput label="Büyük Başlık (Hero Title)" settingKey="hero_title" />
                    <SettingInput label="Alt Açıklama (Hero Description)" settingKey="hero_desc" type="textarea" />
                    <hr style={{margin:'30px 0', border:0, borderTop:'1px solid #ddd'}}/>
                    <h4 style={{marginBottom:'15px'}}>Hedefler Bölümü</h4>
                    <SettingInput label="Hedefler Başlığı" settingKey="home_goals_title" />
                    <SettingInput label="Hedefler Açıklaması" settingKey="home_goals_desc" type="textarea" />
                    <hr style={{margin:'30px 0', border:0, borderTop:'1px solid #ddd'}}/>
                    <h4 style={{marginBottom:'15px'}}>Etkiler Bölümü</h4>
                    <SettingInput label="Etkiler Başlığı" settingKey="home_impact_title" />
                    <SettingInput label="Etkiler Açıklaması" settingKey="home_impact_desc" type="textarea" />
                </div>
            )}

            {/* --- 2. HAKKINDA DÜZENLEME --- */}
            {activeTab === 'about' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Hakkında Sayfası</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="about_page_title" />
                    <SettingInput label="Alt Başlık" settingKey="about_page_desc" />
                    
                    <div style={{background:'#eef2f7', padding:'15px', borderRadius:'8px', marginTop:'20px'}}>
                        <p style={{fontSize:'0.9rem', color:'#555'}}>
                            <i className="fas fa-info-circle"></i> Not: Hakkında sayfasının ana metinleri ve görselleri şu an için sabit şablondan gelmektedir. Başlıkları buradan değiştirebilirsiniz.
                        </p>
                    </div>
                </div>
            )}

            {/* --- 3. HABERLER YÖNETİMİ --- */}
            {activeTab === 'news' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Haberler & Duyurular</h2>
                    
                    {/* Haber Ekleme Formu */}
                    <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'30px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                        <h4 style={{marginBottom:'15px'}}>{isEditing ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'news', newsForm, setNewsForm)}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <input className="form-control" placeholder="Başlık" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required />
                                <input className="form-control" type="date" value={newsForm.date} onChange={e=>setNewsForm({...newsForm, date:e.target.value})} required />
                            </div>
                            <input className="form-control" placeholder="Resim URL (https://...)" value={newsForm.image_url} onChange={e=>setNewsForm({...newsForm, image_url:e.target.value})} />
                            <textarea className="form-control" placeholder="Haber Özeti" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required></textarea>
                            
                            <div style={{display:'flex', gap:'10px'}}>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Güncelle' : 'Ekle'}</button>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' })}} className="btn" style={{background:'#ccc'}}>İptal</button>}
                            </div>
                        </form>
                    </div>

                    {/* Haber Listesi */}
                    <div style={{display:'grid', gap:'10px'}}>
                        {news.map(item => (
                            <div key={item.id} style={{background:'white', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'4px solid #003399'}}>
                                <div>
                                    <strong style={{fontSize:'1.1rem'}}>{item.title}</strong>
                                    <div style={{fontSize:'0.85rem', color:'#666'}}>{item.date}</div>
                                </div>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button onClick={()=>startEdit(item, 'news')} className="btn" style={{background:'#eef2f7', color:'#003399', padding:'5px 15px', fontSize:'0.9rem'}}>Düzenle</button>
                                    <button onClick={()=>deleteItem('news', item.id)} className="btn" style={{background:'#ffeaea', color:'#e74c3c', padding:'5px 15px', fontSize:'0.9rem'}}>Sil</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 4. ORTAKLAR YÖNETİMİ --- */}
            {activeTab === 'partners' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Proje Ortakları</h2>
                    
                    <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'30px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                        <h4 style={{marginBottom:'15px'}}>{isEditing ? 'Ortağı Düzenle' : 'Yeni Ortak Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'partners', partnerForm, setPartnerForm)}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required />
                                <select className="form-control" value={partnerForm.role} onChange={e=>setPartnerForm({...partnerForm, role:e.target.value})}>
                                    <option>Ortak</option>
                                    <option>Koordinatör</option>
                                </select>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <input className="form-control" placeholder="Ülke" value={partnerForm.country} onChange={e=>setPartnerForm({...partnerForm, country:e.target.value})} />
                                <input className="form-control" placeholder="Web Sitesi" value={partnerForm.website} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} />
                            </div>
                            <input className="form-control" placeholder="Logo URL" value={partnerForm.image_url} onChange={e=>setPartnerForm({...partnerForm, image_url:e.target.value})} />
                            
                            <div style={{display:'flex', gap:'10px'}}>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Güncelle' : 'Ekle'}</button>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setPartnerForm({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' })}} className="btn" style={{background:'#ccc'}}>İptal</button>}
                            </div>
                        </form>
                    </div>

                    <div style={{display:'grid', gap:'10px'}}>
                        {partners.map(item => (
                            <div key={item.id} style={{background:'white', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:`4px solid ${item.role === 'Koordinatör' ? '#27ae60' : '#ddd'}`}}>
                                <div>
                                    <strong style={{fontSize:'1.1rem'}}>{item.name}</strong> <span style={{fontSize:'0.8rem', background:'#eee', padding:'2px 8px', borderRadius:'4px'}}>{item.role}</span>
                                    <div style={{fontSize:'0.85rem', color:'#666'}}>{item.country}</div>
                                </div>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button onClick={()=>startEdit(item, 'partners')} className="btn" style={{background:'#eef2f7', color:'#003399', padding:'5px 15px', fontSize:'0.9rem'}}>Düzenle</button>
                                    <button onClick={()=>deleteItem('partners', item.id)} className="btn" style={{background:'#ffeaea', color:'#e74c3c', padding:'5px 15px', fontSize:'0.9rem'}}>Sil</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 5. ÇIKTILAR (DOSYALAR) --- */}
            {activeTab === 'results' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>Proje Çıktıları & Dosyalar</h2>
                    
                    <div style={{background:'white', padding:'20px', borderRadius:'8px', marginBottom:'30px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                        <h4 style={{marginBottom:'15px'}}>{isEditing ? 'Dosyayı Düzenle' : 'Yeni Dosya Ekle'}</h4>
                        <form onSubmit={(e) => saveItem(e, 'results', resultForm, setResultForm)}>
                            <input className="form-control" placeholder="Başlık" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required />
                            <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})}></textarea>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <select className="form-control" value={resultForm.status} onChange={e=>setResultForm({...resultForm, status:e.target.value})}>
                                    <option>Planlanıyor</option>
                                    <option>Devam Ediyor</option>
                                    <option>Tamamlandı</option>
                                </select>
                                <select className="form-control" value={resultForm.icon} onChange={e=>setResultForm({...resultForm, icon:e.target.value})}>
                                    <option value="file">Dosya İkonu</option>
                                    <option value="app">Mobil Uygulama İkonu</option>
                                    <option value="video">Video İkonu</option>
                                </select>
                            </div>
                            <input className="form-control" placeholder="Dosya Linki (Supabase Storage URL)" value={resultForm.link} onChange={e=>setResultForm({...resultForm, link:e.target.value})} />
                            
                            <div style={{display:'flex', gap:'10px'}}>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Güncelle' : 'Ekle'}</button>
                                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setResultForm({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' })}} className="btn" style={{background:'#ccc'}}>İptal</button>}
                            </div>
                        </form>
                    </div>

                    <div style={{display:'grid', gap:'10px'}}>
                        {results.map(item => (
                            <div key={item.id} style={{background:'white', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'4px solid #f1c40f'}}>
                                <div>
                                    <strong style={{fontSize:'1.1rem'}}>{item.title}</strong>
                                    <div style={{fontSize:'0.85rem', color:'#666'}}>{item.status}</div>
                                </div>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button onClick={()=>startEdit(item, 'results')} className="btn" style={{background:'#eef2f7', color:'#003399', padding:'5px 15px', fontSize:'0.9rem'}}>Düzenle</button>
                                    <button onClick={()=>deleteItem('results', item.id)} className="btn" style={{background:'#ffeaea', color:'#e74c3c', padding:'5px 15px', fontSize:'0.9rem'}}>Sil</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 6. İLETİŞİM --- */}
            {activeTab === 'contact' && (
                <div>
                    <h2 style={{marginBottom:'20px', color:'#003399'}}>İletişim Bilgileri</h2>
                    <SettingInput label="Sayfa Başlığı" settingKey="contact_page_title" />
                    <SettingInput label="Alt Başlık" settingKey="contact_page_desc" />
                    <hr style={{margin:'30px 0', border:0, borderTop:'1px solid #ddd'}}/>
                    <SettingInput label="İletişim E-posta Adresi" settingKey="contact_email" />
                    <SettingInput label="Telefon Numarası" settingKey="contact_phone" />
                    <SettingInput label="Açık Adres" settingKey="contact_address" type="textarea" />
                </div>
            )}

        </div>
      </div>
    </div>
  );
}