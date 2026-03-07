'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Cihaz ve Tarayıcı bilgisini ayrıştıran yardımcı fonksiyon
const parseUserAgent = (ua) => {
  let browser = "Tarayıcı";
  let os = "İşletim Sistemi";
  
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} — ${os}`;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  const [successMsg, setSuccessMsg] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); 
    setSuccessMsg('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
      });

      if (error) {
          setErrorMsg('Giriş başarısız: ' + error.message);
          let userIp = 'Bilinmiyor';
          try {
            const res = await fetch('https://api.ipify.org?format=json');
            const ipData = await res.json();
            userIp = ipData.ip;
          } catch(e) {}
          const userAgent = typeof window !== 'undefined' ? parseUserAgent(navigator.userAgent) : 'Bilinmeyen Cihaz';
          
          await supabase.from('login_logs').insert([{
            user_email: email, device: userAgent, location: 'Bilinmiyor', ip_address: userIp, status: 'error'
          }]);
      } else {
          let userIp = 'Bilinmiyor';
          try {
            const res = await fetch('https://api.ipify.org?format=json');
            const ipData = await res.json();
            userIp = ipData.ip;
          } catch(e) {}

          const userAgent = typeof window !== 'undefined' ? parseUserAgent(navigator.userAgent) : 'Bilinmeyen Cihaz';

          await supabase.from('admin_logs').insert([{ action: 'Sisteme başarılı giriş yapıldı.', user_email: email, page_section: 'Giriş', ip_address: userIp }]);
          await supabase.from('login_logs').insert([{ user_email: email, device: userAgent, location: 'Türkiye', ip_address: userIp, status: 'success' }]);

          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400;`;
          router.push('/admin');
          router.refresh(); 
      }
    } catch (err) {
      console.error("Giriş esnasında kritik hata:", err);
      setErrorMsg('Sunucuyla iletişim kurulamadı. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // ✨ Yönlendirmeyi admin paneli DEĞİL, şifre belirleme sayfasına yapıyoruz! ✨
        redirectTo: `${window.location.origin}/update-password`, 
      });

      if (error) {
        setErrorMsg('Sıfırlama bağlantısı gönderilemedi: ' + error.message);
      } else {
        setSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.');
        setTimeout(() => { setIsResetMode(false); setSuccessMsg(''); }, 5000);
      }
    } catch (err) {
      setErrorMsg('Sunucuyla iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', padding: '20px'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px'}}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', background: isResetMode ? '#3b82f6' : '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '1.5rem', transition: 'background 0.3s' }}>
                    <i className={isResetMode ? "fas fa-envelope-open-text" : "fas fa-lock"}></i>
                </div>
                <h2 style={{color: '#111827', margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '1.5rem'}}>
                  {isResetMode ? 'Şifremi Unuttum' : 'Yönetici Girişi'}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '5px' }}>
                  {isResetMode ? "Kayıtlı e-posta adresinize bir sıfırlama bağlantısı göndereceğiz." : "Panele erişmek için oturum açın."}
                </p>
            </div>

            {successMsg && (
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #22c55e', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-check-circle"></i> {successMsg}
                </div>
            )}

            {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-circle-exclamation"></i> {errorMsg}
                </div>
            )}

            <form onSubmit={isResetMode ? handleResetPassword : handleLogin}>
                <div style={{marginBottom: '18px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}>E-posta Adresi</label>
                    <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com"
                        style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                        onFocus={(e) => e.target.style.borderColor = isResetMode ? '#3b82f6' : '#22c55e'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
                
                {!isResetMode && (
                  <div style={{marginBottom: '25px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0}}>Şifre</label>
                        <button type="button" onClick={() => { setIsResetMode(true); setErrorMsg(''); setSuccessMsg(''); }} style={{background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0}}>
                          Şifremi Unuttum?
                        </button>
                      </div>
                      <input 
                          type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                          style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                          onFocus={(e) => e.target.style.borderColor = '#22c55e'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                  </div>
                )}

                <button type="submit" disabled={loading} style={{width: '100%', padding: '14px', background: loading ? '#d1d5db' : (isResetMode ? '#3b82f6' : '#22c55e'), color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                    {loading ? ( <><i className="fas fa-circle-notch fa-spin"></i> {isResetMode ? 'Gönderiliyor...' : 'Giriş Yapılıyor...'}</> ) : (isResetMode ? 'Sıfırlama Bağlantısı Gönder' : 'Giriş Yap')}
                </button>
            </form>

            <div style={{marginTop: '25px', textAlign: 'center'}}>
                {isResetMode ? (
                  <button onClick={() => { setIsResetMode(false); setErrorMsg(''); setSuccessMsg(''); }} style={{background: 'none', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 500}} onMouseEnter={(e) => e.target.style.color = '#111827'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                    <i className="fas fa-arrow-left"></i> Giriş Ekranına Dön
                  </button>
                ) : (
                  <Link href="/" style={{color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = '#111827'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                      <i className="fas fa-arrow-left" style={{marginRight: '5px'}}></i> Siteye Dön
                  </Link>
                )}
            </div>

        </div>
    </div>
  );
}