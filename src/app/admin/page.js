'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Bileşenleri İçe Aktar
import Toast from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/Modal';
import HomeTab from '@/components/admin/tabs/HomeTab';
import PartnersTab from '@/components/admin/tabs/PartnersTab';
// ... Diğer tabları da buraya import edin (NewsTab, AboutTab, vb.)

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  
  // Veri State'leri
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]); 

  // UI State'leri
  const [toast, setToast] = useState(null); 
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // Yardımcı Fonksiyonlar
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
    
    setSettings(s.data || []);
    setNews(n.data || []);
    setPartners(p.data || []);
    setResults(r.data || []);
    setMessages(m.data || []);
  }

  async function uploadFile(file) {
    if (!file) return null;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { showToast('Hata: ' + error.message, 'error'); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  }

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if(error) showToast('Hata', 'error'); else { showToast('Güncellendi'); loadAllData(); }
  }

  async function deleteItem(table, id) {
    showConfirm('Silmek istediğinize emin misiniz?', async () => {
        await supabase.from(table).delete().eq('id', id); 
        loadAllData();
        showToast('Silindi');
    });
  }

  async function saveItem(table, data) {
    const { id, ...rest } = data;
    if (id) await supabase.from(table).update(rest).eq('id', id);
    else await supabase.from(table).insert([rest]);
    loadAllData();
    showToast('Kaydedildi');
  }

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#003399'}}>Yükleniyor...</div>;

  const TabButton = ({ id, label, icon, badge }) => (
    <button onClick={() => setActiveTab(id)} style={{
        padding:'12px 20px', cursor:'pointer', 
        background: activeTab === id ? '#003399' : 'white', 
        color: activeTab === id ? 'white' : '#555', 
        border: activeTab === id ? '1px solid #003399' : '1px solid #ddd', 
        borderRadius: '8px', textAlign:'left', fontWeight: '600', 
        display: 'flex', alignItems: 'center', gap: '10px', width:'100%', marginBottom:'5px'
    }}>
        <i className={icon} style={{width:'20px', textAlign:'center'}}></i> {label}
        {badge > 0 && <span style={{marginLeft:'auto', background:'#e74c3c', color:'white', borderRadius:'50%', width:'20px', height:'20px', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center'}}>{badge}</span>}
    </button>
  );

  return (
    <div className="container" style={{marginTop:'40px', marginBottom:'100px'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'1.8rem', color:'#333'}}>Yönetim Paneli</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn" style={{background:'#e74c3c', color:'white'}}>Çıkış Yap</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:'30px'}}>
        <div>
            <div style={{color:'#999', fontSize:'0.75rem', fontWeight:'bold', paddingLeft:'10px', marginBottom:'5px'}}>MENÜ</div>
            <TabButton id="messages" label="Mesajlar" icon="fas fa-envelope" badge={messages.length} />
            <TabButton id="home" label="Ana Sayfa" icon="fas fa-home" />
            <TabButton id="about" label="Hakkında" icon="fas fa-info-circle" />
            <TabButton id="news" label="Haberler" icon="fas fa-newspaper" />
            <TabButton id="partners" label="Ortaklar" icon="fas fa-handshake" />
            <TabButton id="results" label="Çıktılar" icon="fas fa-file-alt" />
            <TabButton id="contact" label="İletişim" icon="fas fa-phone" />
        </div>

        <div style={{background:'#fcfcfc', padding:'40px', borderRadius:'12px', border:'1px solid #eee', boxShadow:'0 5px 20px rgba(0,0,0,0.03)'}}>
            
            {activeTab === 'home' && <HomeTab settings={settings} updateSetting={updateSetting} uploadFile={uploadFile} />}
            
            {activeTab === 'partners' && <PartnersTab partners={partners} settings={settings} updateSetting={updateSetting} uploadFile={uploadFile} saveItem={saveItem} deleteItem={deleteItem} />}
            
            {/* Diğer sekmeleri de buraya bileşen olarak ekleyin (NewsTab, ResultsTab vb.) */}
            
            {activeTab === 'messages' && (
                <div className="fade-in">
                    <h2 style={{marginBottom:'25px', color:'#003399'}}>Gelen Mesajlar</h2>
                    {messages.map(msg => (
                        <div key={msg.id} style={{background:'white', padding:'20px', borderRadius:'10px', marginBottom:'15px', border:'1px solid #eee'}}>
                            <div style={{display:'flex', justifyContent:'space-between'}}><strong>{msg.name}</strong><button onClick={()=>deleteItem('contact_messages', msg.id)} style={{color:'red'}}><i className="fas fa-trash"></i></button></div>
                            <p style={{marginTop:'5px', color:'#555'}}>{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}

        </div>
      </div>
    </div>
  );
}