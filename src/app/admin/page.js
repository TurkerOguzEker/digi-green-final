'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);
  
  // Veriler
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);

  // Form State'leri
  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });

  // Düzenleme Modu Kontrolü
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

  // --- GENEL SİLME ---
  async function deleteItem(table, id) {
    if(!confirm('Silmek istediğine emin misin?')) return;
    await supabase.from(table).delete().eq('id', id);
    loadAllData();
  }

  // --- DÜZENLEME BAŞLATMA ---
  function startEdit(type, item) {
    setIsEditing(true);
    if(type === 'news') setNewsForm(item);
    if(type === 'partner') setPartnerForm(item);
    if(type === 'result') setResultForm(item);
    // İlgili sekmeye git (gerekirse)
    if(type === 'news' && activeTab !== 'news') setActiveTab('news');
  }

  // --- İPTAL ETME ---
  function cancelEdit() {
    setIsEditing(false);
    setNewsForm({ id: null, title: '', summary: '', image_url: '', date: '' });
    setPartnerForm({ id: null, name: '', role: 'Ortak', country: '', image_url: '', website: '' });
    setResultForm({ id: null, title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
  }

  // --- KAYDETME (EKLE veya GÜNCELLE) ---
  
  // 1. AYARLAR
  async function updateSetting(key, value) {
    await supabase.from('settings').update({ value }).eq('key', key);
    alert('Ayar güncellendi!');
  }

  // 2. HABERLER
  async function saveNews(e) {
    e.preventDefault();
    const { id, ...data } = newsForm;
    if (id) {
        await supabase.from('news').update(data).eq('id', id); // Güncelle
    } else {
        await supabase.from('news').insert([data]); // Ekle
    }
    cancelEdit();
    loadAllData();
  }

  // 3. ORTAKLAR
  async function savePartner(e) {
    e.preventDefault();
    const { id, ...data } = partnerForm;
    if (id) {
        await supabase.from('partners').update(data).eq('id', id);
    } else {
        await supabase.from('partners').insert([data]);
    }
    cancelEdit();
    loadAllData();
  }

  // 4. SONUÇLAR
  async function saveResult(e) {
    e.preventDefault();
    const { id, ...data } = resultForm;
    if (id) {
        await supabase.from('results').update(data).eq('id', id);
    } else {
        await supabase.from('results').insert([data]);
    }
    cancelEdit();
    loadAllData();
  }

  if (loading) return <div className="container section-padding">Yükleniyor...</div>;

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid #eee', paddingBottom:'20px'}}>
        <h1>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn" style={{background:'#e74c3c', color:'white'}}>Çıkış Yap</button>
      </div>

      <div style={{display:'flex', gap:'10px', marginBottom:'30px', borderBottom:'1px solid #ddd', flexWrap:'wrap'}}>
        {['settings', 'news', 'partners', 'results'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); cancelEdit(); }} 
                style={{
                    padding:'10px 20px', 
                    cursor:'pointer', 
                    background: activeTab === tab ? '#003399' : '#f8f9fa',
                    color: activeTab === tab ? 'white' : '#333',
                    border: '1px solid #ddd', borderBottom: 'none', borderRadius: '5px 5px 0 0'
                }}>
                {tab === 'settings' ? 'Tüm Site Yazıları' : tab === 'news' ? 'Haberler' : tab === 'partners' ? 'Ortaklar' : 'Projeler/Dosyalar'}
            </button>
        ))}
      </div>

      {/* --- TAB 1: SİTE AYARLARI --- */}
      {activeTab === 'settings' && (
        <div>
            <h3>Tüm Sayfa Başlıkları ve Metinleri</h3>
            <p style={{color:'#666', marginBottom:'20px'}}>Buradan sadece ana sayfayı değil, "Hakkında", "İletişim" gibi tüm sayfaların başlıklarını düzenleyebilirsiniz.</p>
            <div style={{display:'grid', gap:'15px', maxWidth:'900px'}}>
                {settings.map(s => (
                    <div key={s.id} style={{background:'#f9f9f9', padding:'15px', borderRadius:'5px', border:'1px solid #eee'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px', color:'#003399'}}>{s.description} <small style={{color:'#999', fontWeight:'normal'}}>({s.key})</small></label>
                        <div style={{display:'flex', gap:'10px'}}>
                            <input type="text" className="form-control" defaultValue={s.value} id={`s-${s.key}`} style={{marginBottom:0}} />
                            <button onClick={() => updateSetting(s.key, document.getElementById(`s-${s.key}`).value)} className="btn btn-primary" style={{padding:'8px 20px'}}>Kaydet</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TAB 2: HABERLER --- */}
      {activeTab === 'news' && (
        <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
            <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px', height:'fit-content'}}>
                <h3>{isEditing ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h3>
                <form onSubmit={saveNews}>
                    <input className="form-control" placeholder="Başlık" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required />
                    <input className="form-control" type="date" value={newsForm.date} onChange={e=>setNewsForm({...newsForm, date:e.target.value})} required />
                    <input className="form-control" placeholder="Resim URL" value={newsForm.image_url} onChange={e=>setNewsForm({...newsForm, image_url:e.target.value})} />
                    <textarea className="form-control" placeholder="Özet" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required></textarea>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex:1}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                        {isEditing && <button type="button" onClick={cancelEdit} className="btn" style={{background:'#ccc', color:'#333'}}>İptal</button>}
                    </div>
                </form>
            </div>
            <div>
                <h3>Haber Listesi</h3>
                {news.map(n => (
                    <div key={n.id} style={{padding:'15px', background:'white', border:'1px solid #eee', marginBottom:'10px', borderRadius:'5px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div><strong>{n.title}</strong> <br/><small>{n.date}</small></div>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button onClick={()=>startEdit('news', n)} style={{color:'blue', border:'1px solid blue', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Düzenle</button>
                            <button onClick={()=>deleteItem('news', n.id)} style={{color:'red', border:'1px solid red', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Sil</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TAB 3: ORTAKLAR --- */}
      {activeTab === 'partners' && (
        <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
            <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px', height:'fit-content'}}>
                <h3>{isEditing ? 'Ortağı Düzenle' : 'Yeni Ortak Ekle'}</h3>
                <form onSubmit={savePartner}>
                    <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required />
                    <select className="form-control" value={partnerForm.role} onChange={e=>setPartnerForm({...partnerForm, role:e.target.value})}>
                        <option>Ortak</option>
                        <option>Koordinatör</option>
                    </select>
                    <input className="form-control" placeholder="Ülke" value={partnerForm.country} onChange={e=>setPartnerForm({...partnerForm, country:e.target.value})} />
                    <input className="form-control" placeholder="Logo URL" value={partnerForm.image_url} onChange={e=>setPartnerForm({...partnerForm, image_url:e.target.value})} />
                    <input className="form-control" placeholder="Web Sitesi" value={partnerForm.website} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} />
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex:1}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                        {isEditing && <button type="button" onClick={cancelEdit} className="btn" style={{background:'#ccc', color:'#333'}}>İptal</button>}
                    </div>
                </form>
            </div>
            <div>
                <h3>Ortak Listesi</h3>
                {partners.map(p => (
                    <div key={p.id} style={{padding:'15px', background:'white', border:'1px solid #eee', marginBottom:'10px', borderRadius:'5px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div><strong>{p.name}</strong> <small>({p.country})</small></div>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button onClick={()=>startEdit('partner', p)} style={{color:'blue', border:'1px solid blue', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Düzenle</button>
                            <button onClick={()=>deleteItem('partners', p.id)} style={{color:'red', border:'1px solid red', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Sil</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TAB 4: SONUÇLAR --- */}
      {activeTab === 'results' && (
        <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
             <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px', height:'fit-content'}}>
                <h3>{isEditing ? 'Çıktıyı Düzenle' : 'Yeni Dosya/Çıktı Ekle'}</h3>
                <form onSubmit={saveResult}>
                    <input className="form-control" placeholder="Başlık" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required />
                    <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})}></textarea>
                    <select className="form-control" value={resultForm.status} onChange={e=>setResultForm({...resultForm, status:e.target.value})}>
                        <option>Planlanıyor</option>
                        <option>Devam Ediyor</option>
                        <option>Tamamlandı</option>
                    </select>
                    <input className="form-control" placeholder="Dosya Linki" value={resultForm.link} onChange={e=>setResultForm({...resultForm, link:e.target.value})} />
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <button type="submit" className="btn btn-primary" style={{flex:1}}>{isEditing ? 'Güncelle' : 'Ekle'}</button>
                        {isEditing && <button type="button" onClick={cancelEdit} className="btn" style={{background:'#ccc', color:'#333'}}>İptal</button>}
                    </div>
                </form>
            </div>
            <div>
                <h3>Çıktı Listesi</h3>
                {results.map(r => (
                    <div key={r.id} style={{padding:'15px', background:'white', border:'1px solid #eee', marginBottom:'10px', borderRadius:'5px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div><strong>{r.title}</strong> <small>({r.status})</small></div>
                        <div style={{display:'flex', gap:'5px'}}>
                            <button onClick={()=>startEdit('result', r)} style={{color:'blue', border:'1px solid blue', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Düzenle</button>
                            <button onClick={()=>deleteItem('results', r.id)} style={{color:'red', border:'1px solid red', background:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Sil</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}