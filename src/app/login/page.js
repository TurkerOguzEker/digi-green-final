'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Hataları ekranda göstermek için state

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); 
    
    try {
      // 1. Supabase giriş isteği (data objesini de alıyoruz)
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
      });

      if (error) {
          setErrorMsg('Giriş başarısız: ' + error.message);
      } else {
          // 2. İŞTE SİHİRLİ DOKUNUŞ: Middleware'in bizi içeri alması için çerez (cookie) oluşturuyoruz!
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400;`;
          
          // 3. Başarılı olursa admin paneline yönlendir
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

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', padding: '20px'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px'}}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', background: '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '1.5rem' }}>
                    <i className="fas fa-lock"></i>
                </div>
                <h2 style={{color: '#111827', margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '1.5rem'}}>Yönetici Girişi</h2>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '5px' }}>Panele erişmek için oturum açın.</p>
            </div>

            {/* HATA MESAJI KUTUSU */}
            {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-circle-exclamation"></i>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div style={{marginBottom: '18px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}>E-posta Adresi</label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="admin@example.com"
                        style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                        onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
                <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}>Şifre</label>
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                        onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{
                        width: '100%', padding: '14px', background: loading ? '#86efac' : '#22c55e', 
                        color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', 
                        fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-circle-notch fa-spin"></i> Giriş Yapılıyor...
                        </>
                    ) : 'Giriş Yap'}
                </button>
            </form>

            <div style={{marginTop: '25px', textAlign: 'center'}}>
                <Link href="/" style={{color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = '#111827'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                    <i className="fas fa-arrow-left" style={{marginRight: '5px'}}></i> Siteye Dön
                </Link>
            </div>

        </div>
    </div>
  );
}