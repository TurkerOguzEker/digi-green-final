
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// NOT: Supabase yetkilendirme (Auth) ve profil güncelleme işlemleri için 
// standart KEY değil, SERVICE_ROLE_KEY kullanmanız gerekir (RLS'i aşmak için).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // .env.local dosyanızda tanımlı olmalı
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, id, email, password, role, is_blocked } = body;

    // --- YENİ KULLANICI EKLEME ---
    if (action === 'CREATE') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });
      
      if (authError) throw authError;

      const { error: profileError } = await supabaseAdmin.from('user_profiles').insert([{
        id: authData.user.id,
        email: email,
        role: role,
        is_blocked: false
      }]);

      if (profileError) throw profileError;

      return NextResponse.json({ success: true, message: 'Kullanıcı başarıyla oluşturuldu' }, { status: 200 });
    }

    // --- KULLANICI GÜNCELLEME ---
    if (action === 'UPDATE') {
      // 1. Önce güncellenmek istenen kullanıcının mevcut rolüne bakalım
      const { data: targetUser } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', id)
        .single();

      // 2. GÜVENLİK: Eğer kullanıcı Super Admin ise işlemi reddet!
      if (targetUser && targetUser.role === 'Super Admin') {
        return NextResponse.json({ error: 'Güvenlik: Super Admin hesabı düzenlenemez veya engellenemez.' }, { status: 403 });
      }

      // 3. Güncellemeyi yap
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ role: role, is_blocked: is_blocked })
        .eq('id', id);

      if (profileError) throw profileError;

      // 4. Supabase Auth üzerinden de hesabı kilitle veya aç
      if (is_blocked) {
        await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' }); // Yaklaşık 100 yıl ban
      } else {
        await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' }); // Banı kaldır
      }

      return NextResponse.json({ success: true, message: 'Kullanıcı güncellendi' }, { status: 200 });
    }

    // --- KULLANICI SİLME ---
    if (action === 'DELETE') {
      // 1. GÜVENLİK: Silinmek istenen kullanıcı Super Admin mi kontrol et
      const { data: targetUser } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', id)
        .single();
      
      if (targetUser && targetUser.role === 'Super Admin') {
        return NextResponse.json({ error: 'Güvenlik: Super Admin hesabı silinemez.' }, { status: 403 });
      }

      // 2. Değilse sil (Bu işlem user_profiles tablosundan da silecektir eğer veritabanında cascade ayarlıysa)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (deleteError) throw deleteError;

      return NextResponse.json({ success: true, message: 'Kullanıcı silindi' }, { status: 200 });
    }

    // Bilinmeyen Action
    return NextResponse.json({ error: 'Geçersiz işlem türü (action)' }, { status: 400 });

  } catch (error) {
    console.error("API Hatası:", error);
    // HATA DURUMUNDA BİLE KESİNLİKLE JSON DÖNDÜRÜYORUZ
    return NextResponse.json({ error: error.message || 'Sunucu hatası oluştu' }, { status: 500 });
  }
}
