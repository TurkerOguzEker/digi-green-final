import { useState } from 'react';

const FileInput = ({ value, onChange, placeholder, uploadFile }) => {
    const [uploading, setUploading] = useState(false);
    
    const handleFileChange = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;
            const url = await uploadFile(file);
            if (url) onChange(url);
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{display:'flex', gap:'10px', alignItems:'center', width:'100%'}}>
            <div style={{flex:1, display:'flex', alignItems:'center', background:'white', border:'1px solid #ddd', borderRadius:'5px', padding:'5px 10px', gap:'10px'}}>
                {value ? <img src={value} style={{width:'30px', height:'30px', objectFit:'cover', borderRadius:'4px'}} /> : <i className="fas fa-image" style={{color:'#ccc'}}></i>}
                <input className="form-control" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} style={{flex:1, marginBottom:0, border:'none', padding:0}}/>
            </div>
            <div style={{position:'relative', overflow:'hidden', display:'inline-block'}}>
                <button type="button" className="btn" style={{background: uploading ? '#ccc' : '#eef2f7', color:'#333', padding:'8px 15px', border:'1px solid #ddd'}}>{uploading ? '...' : 'Seç'}</button>
                <input type="file" onChange={handleFileChange} disabled={uploading} style={{position:'absolute', left:0, top:0, opacity:0, width:'100%', height:'100%', cursor:'pointer'}} />
            </div>
        </div>
    );
};

export default function SettingInput({ label, settingKey, type="text", defaultValueProp="", settings, updateSetting, uploadFile }) {
    const setting = settings.find(s => s.key === settingKey);
    const val = setting ? setting.value : defaultValueProp; 
    
    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'15px'}}>
            <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#333', fontSize:'0.9rem'}}>{label}</label>
            <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
                {type === 'textarea' ? (
                    <textarea className="form-control" defaultValue={val} id={`s-${settingKey}`} rows="4" style={{marginBottom:0, flex: 1, fontSize:'0.9rem', lineHeight:'1.5'}} onBlur={(e) => updateSetting(settingKey, e.target.value)}></textarea>
                ) : type === 'image' ? (
                    <FileInput value={val} onChange={(newVal) => updateSetting(settingKey, newVal)} placeholder="Resim URL" uploadFile={uploadFile} />
                ) : (
                    <input type="text" className="form-control" defaultValue={val} id={`s-${settingKey}`} style={{marginBottom:0, flex: 1}} onBlur={(e) => updateSetting(settingKey, e.target.value)} />
                )}
                
                {/* Text ve Textarea için kaydet butonu (onBlur zaten yapıyor ama manuel de olsun) */}
                {type !== 'image' && (
                    <button onClick={() => updateSetting(settingKey, document.getElementById(`s-${settingKey}`).value)} className="btn btn-primary" style={{padding:'10px 20px', height:'auto'}}>
                        <i className="fas fa-save"></i>
                    </button>
                )}
            </div>
        </div>
    );
}