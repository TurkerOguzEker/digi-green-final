import SettingInput from '../ui/SettingInput';
import { useState } from 'react';

export default function PartnersTab({ partners, settings, updateSetting, uploadFile, saveItem, deleteItem }) {
    const [form, setForm] = useState({ id: null, name: '', country: '', image_url: '', flag_url: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Kendi içindeki FileInput bileşeni (Basit versiyon)
    const SimpleFileInput = ({ value, onChange, placeholder }) => {
        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if(file) {
                const url = await uploadFile(file);
                if(url) onChange(url);
            }
        };
        return (
             <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                <input className="form-control" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{marginBottom:0}} />
                <label className="btn" style={{marginBottom:0, cursor:'pointer', background:'#eee'}}>Seç <input type="file" hidden onChange={handleFileChange}/></label>
             </div>
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveItem('partners', form);
        setForm({ id: null, name: '', country: '', image_url: '', flag_url: '' });
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setForm(item);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fade-in">
            <h2 style={{marginBottom:'25px', color:'#003399'}}>Ortaklar & Kurumlar</h2>
            
            <h4 style={{marginBottom:'15px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>Sayfa Ayarları</h4>
            <SettingInput label="Sayfa Başlığı" settingKey="partners_page_title" settings={settings} updateSetting={updateSetting} />
            <SettingInput label="Başlık Resmi" settingKey="partners_header_bg" type="image" settings={settings} updateSetting={updateSetting} uploadFile={uploadFile} />

            <div style={{background:'white', padding:'25px', borderRadius:'10px', margin:'25px 0', border:'1px solid #ddd'}}>
                <h4 style={{marginBottom:'15px'}}>{isEditing ? 'Ortağı Düzenle' : 'Yeni Ortak Ekle'}</h4>
                <form onSubmit={handleSave} style={{display:'grid', gap:'15px'}}>
                    <input className="form-control" placeholder="Kurum Adı" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <input className="form-control" placeholder="Ülke" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} required />
                        <SimpleFileInput value={form.flag_url} onChange={(url) => setForm({...form, flag_url: url})} placeholder="Bayrak Resmi" />
                    </div>
                    <SimpleFileInput value={form.image_url} onChange={(url) => setForm({...form, image_url: url})} placeholder="Logo Resmi" />
                    <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                        {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setForm({ id: null, name: '', country: '', image_url: '', flag_url: '' })}} className="btn" style={{background:'#eee', color:'#555'}}>İptal</button>}
                        <button type="submit" className="btn btn-primary">{isEditing ? 'Güncelle' : 'Ekle'}</button>
                    </div>
                </form>
            </div>

            {partners.map(item => (
                <div key={item.id} style={{background:'white', padding:'15px', marginBottom:'10px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #eee'}}>
                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                        {item.image_url && <img src={item.image_url} style={{width:'40px', height:'auto'}} />}
                        <div><div style={{fontWeight:'bold'}}>{item.name}</div><div style={{fontSize:'0.8rem', color:'#666'}}>{item.country}</div></div>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={()=>handleEdit(item)} style={{color:'#003399', border:'none', background:'none'}}><i className="fas fa-pen"></i></button>
                        <button onClick={()=>deleteItem('partners', item.id)} style={{color:'red', border:'none', background:'none'}}><i className="fas fa-trash"></i></button>
                    </div>
                </div>
            ))}
        </div>
    );
}