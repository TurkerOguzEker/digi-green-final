import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl.clone();

  // Sadece /admin ile başlayan adreslerde çalışır
  if (url.pathname.startsWith('/admin')) {
    
    // 1. Tarayıcıda bizim atadığımız erişim token'ı var mı?
    const tokenCookie = request.cookies.get('sb-access-token');
    
    // Token yoksa (giriş yapmamışsa) direkt login'e fırlat
    if (!tokenCookie || !tokenCookie.value) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const token = tokenCookie.value;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // 2. Token'ı kullanarak Supabase'den kullanıcının kim olduğunu (ID'sini) güvenli bir şekilde soruyoruz
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey
        }
      });
      
      if (!userRes.ok) throw new Error('Geçersiz oturum');
      const userData = await userRes.json();

      // 3. Kullanıcının ID'si ile veritabanından Rolünü (Admin/Editor) çekiyoruz
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userData.id}&select=role`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey
        }
      });

      let role = 'Editor'; // Bir hata olursa güvenliği en üstte tutmak için varsayılanı en düşük yetki (Editör) yapıyoruz
      
      if (profileRes.ok) {
        const profiles = await profileRes.json();
        if (profiles && profiles.length > 0) {
          role = profiles[0].role;
        }
      }

      // ✨ EDİTÖRLERİN URL ÇUBUĞUNDAN BİLE GİREMEYECEĞİ YASAKLI SAYFALAR ✨
      const restrictedPaths = [
        '/admin/users',
        '/admin/logs',
        '/admin/site',
        '/admin/homepage',
        '/admin/about',
        '/admin/contact',
        '/admin/partners'
      ];

      // Ziyaretçinin gitmek istediği URL yasaklı listede var mı?
      const isRestricted = restrictedPaths.some(path => url.pathname.startsWith(path));

      // 4. Eğer rolü 'Editor' ise ve yasaklı bir sayfaya adres çubuğundan elle girmeye çalışıyorsa:
      if (role === 'Editor' && isRestricted) {
        url.pathname = '/admin'; // Onu anında ana Dashboard'a geri fırlat!
        return NextResponse.redirect(url);
      }

    } catch (error) {
      // Eğer token süresi dolmuş veya bozulmuşsa güvenliğe al ve login'e at
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('sb-access-token');
      return response;
    }
  }
  
  // Sorun yoksa veya admin sayfasına girmiyorsa normal devam et
  return NextResponse.next();
}

// Bu kuralın sadece hangi sayfalarda çalışacağını belirliyoruz
export const config = {
  matcher: ['/admin/:path*'],
};