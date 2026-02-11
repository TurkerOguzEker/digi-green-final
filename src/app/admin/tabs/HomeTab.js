import SettingInput from '../ui/SettingInput';

export default function HomeTab({ settings, updateSetting, uploadFile }) {
  return (
    <div className="fade-in">
        <h2 style={{marginBottom:'25px', color:'#003399'}}>Ana Sayfa Düzenle</h2>
        
        <h4 style={{margin:'20px 0', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>1. Hero (Kapak) Alanı</h4>
        <SettingInput label="Ana Sayfa Kapak Resmi" settingKey="hero_bg_image" type="image" settings={settings} updateSetting={updateSetting} uploadFile={uploadFile} />
        <SettingInput label="Logo Metni" settingKey="header_logo_text" settings={settings} updateSetting={updateSetting} />
        <SettingInput label="Büyük Başlık" settingKey="hero_title" settings={settings} updateSetting={updateSetting} />
        <SettingInput label="Açıklama" settingKey="hero_desc" type="textarea" settings={settings} updateSetting={updateSetting} />

        <h4 style={{margin:'40px 0 20px', color:'#555', borderLeft:'4px solid #003399', paddingLeft:'10px'}}>2. Özet Kartlar</h4>
        <SettingInput label="Kart 1 Değer" settingKey="home_summary_1_val" settings={settings} updateSetting={updateSetting} />
        <SettingInput label="Kart 1 Etiket" settingKey="home_summary_1_label" settings={settings} updateSetting={updateSetting} />
        {/* Diğer kart inputları buraya... */}
    </div>
  );
}