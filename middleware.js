import { NextResponse } from 'next/server';

export function middleware(request) {
  // Eğer ziyaretçi /admin ile başlayan bir adrese girmeye çalışıyorsa:
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Tarayıcıdaki çerezlerde (cookies) Supabase giriş token'ı var mı bakıyoruz
    const hasSupabaseCookie = request.cookies.getAll().some(cookie => 
      cookie.name.includes('supabase') || cookie.name.includes('sb-')
    );
    
    // Eğer giriş yapmamışsa (çerez yoksa), sayfa daha yüklenmeden /login'e fırlat!
    if (!hasSupabaseCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Sorun yoksa veya admin sayfasına girmiyorsa normal devam et
  return NextResponse.next();
}

// Bu kuralın sadece hangi sayfalarda çalışacağını belirliyoruz
export const config = {
  matcher: ['/admin/:path*'],
};