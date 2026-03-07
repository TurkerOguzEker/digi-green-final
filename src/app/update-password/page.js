'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Sayfa açıldığında oturumun olup olmadığını kontrol eder. 
    // Supabase şifre sıfırlama linkine tıklanınca geçici bir session oluşturur.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg('Yetkisiz erişim veya süresi dolmuş bağlantı. Lütfen tekrar şifre sıfırlama isteği gönderin.');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Şifreler birbiriyle eşleşmiyor!');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setErrorMsg('Şifre güncellenemedi: ' + error.message);
      } else {
        setSuccessMsg('Şifreniz başarıyla güncellendi! Lütfen yeni şifrenizle giriş yapın.');
        
        // İşlem bitince güvenlik için kullanıcıyı dışarı atıp login sayfasına yönlendiriyoruz
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setErrorMsg('Sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', padding: '20px'}}>
      <div style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px'}}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '50px', height: '50px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '1.5rem' }}>
            <i className="fas fa-key"></i>
          </div>
          <h2 style={{color: '#111827', margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '1.5rem'}}>Yeni Şifre Belirle</h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '5px' }}>Lütfen yeni şifrenizi girin.</p>
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

        {!successMsg && (
          <form onSubmit={handleUpdatePassword}>
            <div style={{marginBottom: '18px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}>Yeni Şifre</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div style={{marginBottom: '25px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}>Şifreyi Onayla</label>
              <input 
                type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                style={{width: '100%', padding: '12px 15px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem'}}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button 
              type="submit" disabled={loading} 
              style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Güncelleniyor...</> : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}