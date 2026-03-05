import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, email, newPassword, timeoutMinutes } = body;

    // 1. BAŞKA BİR KULLANICININ ŞİFRESİNİ GÜNCELLEME
    if (action === 'UPDATE_PASSWORD') {
      // Önce e-postadan kullanıcının ID'sini bulalım
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('user_profiles')
        .select('id, role')
        .eq('email', email)
        .single();

      if (!profile || profileErr) {
        return NextResponse.json({ error: 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.' }, { status: 404 });
      }

      // Şifreyi Admin API ile güncelle
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        { password: newPassword }
      );

      if (updateErr) throw updateErr;

      // Şifresi değişen kullanıcının mevcut oturumunu anında düşürmek için force_logout_at güncellenir
      await supabaseAdmin.from('user_profiles').update({ force_logout_at: new Date().toISOString() }).eq('id', profile.id);

      return NextResponse.json({ success: true, message: 'Şifre başarıyla güncellendi ve kullanıcının açık oturumları sonlandırıldı.' });
    }

    // 2. TÜM OTURUMLARI SONLANDIRMA (HERKESİ AT)
    if (action === 'KICK_ALL') {
      // Herkesin force_logout_at değerini şu anki zamana çekiyoruz. 
      // Layout.js'deki realtime dinleyici bunu algılayıp herkesi dışarı atacak.
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ force_logout_at: new Date().toISOString() })
        .neq('role', 'Bilinmeyen'); // Sadece geçerli bir sorgu olsun diye yapıyoruz, herkesi kapsar

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Tüm kullanıcılara çıkış sinyali gönderildi.' });
    }

    // 3. ZAMAN AŞIMI (TIMEOUT) SÜRESİNİ GÜNCELLEME
    if (action === 'UPDATE_TIMEOUT') {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .update({ value: { minutes: parseInt(timeoutMinutes) } })
        .eq('id', 'session_timeout');

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Zaman aşımı süresi güncellendi.' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}