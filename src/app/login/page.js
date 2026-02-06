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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert('Giriş Hatası: ' + error.message);
    } else {
        router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div style={{height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'}}>
            <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#003399'}}>Yönetici Girişi</h2>
            <form onSubmit={handleLogin}>
                <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>E-posta</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                           style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>Şifre</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                           style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
                </div>
                <button type="submit" disabled={loading} style={{width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
            <div style={{marginTop: '20px', textAlign: 'center'}}>
                <Link href="/" style={{color: '#666', fontSize: '0.9rem'}}>← Siteye Dön</Link>
            </div>
        </div>
    </div>
  );
}