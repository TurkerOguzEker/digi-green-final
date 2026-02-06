'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings'); // Varsayılan sekme
  const [loading, setLoading] = useState(true);
  
  // Veriler
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);

  // Form State'leri (Yeni ekleme için)
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', image_url: '', date: '' });
  const [partnerForm, setPartnerForm] = useState({ name: '', role: 'Ortak', country: '', image_url: '', website: '' });
  const [resultForm, setResultForm] = useState({ title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });

  useEffect(() => {
    checkSessionAndLoad();
  }, []);

  async function checkSessionAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }
    
    await Promise.all([loadSettings(), loadNews(), loadPartners(), loadResults()]);
    setLoading(false);
  }

  // --- VERİ ÇEKME FONKSİYONLARI ---
  const loadSettings = async () => { const { data } = await supabase.from('settings').select('*').order('id'); setSettings(data || []); };
  const loadNews = async () => { const { data } = await supabase.from('news').select('*').order('date', {ascending:false}); setNews(data || []); };
  const loadPartners = async () => { const { data } = await supabase.from('partners').select('*').order('id'); setPartners(data || []); };
  const loadResults = async () => { const { data } = await supabase.from('results').select('*').order('id'); setResults(data || []); };

  // --- GENEL SİLME ---
  async function deleteItem(table, id, reloadFunc) {
    if(!confirm('Silmek istediğine emin misin?')) return;
    await supabase.from(table).delete().eq('id', id);
    reloadFunc();
  }

  // --- EKLEME / GÜNCELLEME İŞLEMLERİ ---
  async function updateSetting(key, value) {
    await supabase.from('settings').update({ value }).eq('key', key);
    alert('Ayar güncellendi!');
  }

  async function addNews(e) {
    e.preventDefault();
    await supabase.from('news').insert([newsForm]);
    setNewsForm({ title: '', summary: '', image_url: '', date: '' });
    loadNews();
  }

  async function addPartner(e) {
    e.preventDefault();
    await supabase.from('partners').insert([partnerForm]);
    setPartnerForm({ name: '', role: 'Ortak', country: '', image_url: '', website: '' });
    loadPartners();
  }

  async function addResult(e) {
    e.preventDefault();
    await supabase.from('results').insert([resultForm]);
    setResultForm({ title: '', description: '', status: 'Planlanıyor', link: '', icon: 'file' });
    loadResults();
  }

  if (loading) return <div className="container section-padding">Yükleniyor...</div>;

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      
      {/* BAŞLIK & ÇIKIŞ */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid #eee', paddingBottom:'20px'}}>
        <h1>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn" style={{background:'#e74c3c', color:'white'}}>Çıkış Yap</button>
      </div>

      {/* SEKMELER */}
      <div style={{display:'flex', gap:'10px', marginBottom:'30px', borderBottom:'1px solid #ddd'}}>
        {['settings', 'news', 'partners', 'results'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
                style={{
                    padding:'10px 20px', 
                    cursor:'pointer', 
                    background: activeTab === tab ? '#003399' : '#f8f9fa',
                    color: activeTab === tab ? 'white' : '#333',
                    border: '1px solid #ddd',
                    borderBottom: 'none',
                    borderRadius: '5px 5px 0 0'
                }}>
                {tab === 'settings' ? 'Site Ayarları' : 
                 tab === 'news' ? 'Haberler' : 
                 tab === 'partners' ? 'Ortaklar' : 'Projeler/Dosyalar'}
            </button>
        ))}
      </div>

      {/* --- TAB 1: SİTE AYARLARI --- */}
      {activeTab === 'settings' && (
        <div>
            <h3>Genel Metinler</h3>
            <div style={{display:'grid', gap:'15px', maxWidth:'800px'}}>
                {settings.map(s => (
                    <div key={s.id} style={{background:'#f9f9f9', padding:'15px', borderRadius:'5px'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>{s.description}</label>
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
            <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px'}}>
                <h3>Haber Ekle</h3>
                <form onSubmit={addNews}>
                    <input className="form-control" placeholder="Başlık" value={newsForm.title} onChange={e=>setNewsForm({...newsForm, title:e.target.value})} required />
                    <input className="form-control" type="date" value={newsForm.date} onChange={e=>setNewsForm({...newsForm, date:e.target.value})} required />
                    <input className="form-control" placeholder="Resim URL" value={newsForm.image_url} onChange={e=>setNewsForm({...newsForm, image_url:e.target.value})} />
                    <textarea className="form-control" placeholder="Özet" rows="3" value={newsForm.summary} onChange={e=>setNewsForm({...newsForm, summary:e.target.value})} required></textarea>
                    <button type="submit" className="btn btn-primary">Yayınla</button>
                </form>
            </div>
            <div>
                <h3>Yayındaki Haberler</h3>
                {news.map(n => (
                    <div key={n.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                        <span>{n.title}</span>
                        <button onClick={()=>deleteItem('news', n.id, loadNews)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TAB 3: ORTAKLAR --- */}
      {activeTab === 'partners' && (
        <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
            <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px'}}>
                <h3>Ortak Ekle</h3>
                <form onSubmit={addPartner}>
                    <input className="form-control" placeholder="Kurum Adı" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} required />
                    <select className="form-control" value={partnerForm.role} onChange={e=>setPartnerForm({...partnerForm, role:e.target.value})}>
                        <option>Ortak</option>
                        <option>Koordinatör</option>
                    </select>
                    <input className="form-control" placeholder="Ülke" value={partnerForm.country} onChange={e=>setPartnerForm({...partnerForm, country:e.target.value})} />
                    <input className="form-control" placeholder="Logo URL" value={partnerForm.image_url} onChange={e=>setPartnerForm({...partnerForm, image_url:e.target.value})} />
                    <input className="form-control" placeholder="Web Sitesi" value={partnerForm.website} onChange={e=>setPartnerForm({...partnerForm, website:e.target.value})} />
                    <button type="submit" className="btn btn-primary">Ekle</button>
                </form>
            </div>
            <div>
                <h3>Mevcut Ortaklar</h3>
                {partners.map(p => (
                    <div key={p.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                        <span>{p.name} ({p.country})</span>
                        <button onClick={()=>deleteItem('partners', p.id, loadPartners)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- TAB 4: SONUÇLAR / DOSYALAR --- */}
      {activeTab === 'results' && (
        <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
             <div style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px'}}>
                <h3>Çıktı / Dosya Ekle</h3>
                <form onSubmit={addResult}>
                    <input className="form-control" placeholder="Başlık (Örn: Analiz Raporu)" value={resultForm.title} onChange={e=>setResultForm({...resultForm, title:e.target.value})} required />
                    <textarea className="form-control" placeholder="Açıklama" value={resultForm.description} onChange={e=>setResultForm({...resultForm, description:e.target.value})}></textarea>
                    <select className="form-control" value={resultForm.status} onChange={e=>setResultForm({...resultForm, status:e.target.value})}>
                        <option>Planlanıyor</option>
                        <option>Devam Ediyor</option>
                        <option>Tamamlandı</option>
                    </select>
                    <input className="form-control" placeholder="Dosya/Link URL" value={resultForm.link} onChange={e=>setResultForm({...resultForm, link:e.target.value})} />
                    <button type="submit" className="btn btn-primary">Ekle</button>
                </form>
            </div>
            <div>
                <h3>Proje Çıktıları</h3>
                {results.map(r => (
                    <div key={r.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                        <span>{r.title} ({r.status})</span>
                        <button onClick={()=>deleteItem('results', r.id, loadResults)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}