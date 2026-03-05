import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl.clone();

  if (url.pathname.startsWith('/admin')) {
    
    const tokenCookie = request.cookies.get('sb-access-token');
    
    if (!tokenCookie || !tokenCookie.value) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    try {
      const token = tokenCookie.value;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const userId = payload.sub;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

      const profileRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=role,is_blocked`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store' 
      });

      let role = 'Editor'; 
      let isBlocked = false;

      if (profileRes.ok) {
        const profiles = await profileRes.json();
        if (profiles && profiles.length > 0) {
          role = profiles[0].role;
          isBlocked = profiles[0].is_blocked;
        }
      }

      if (isBlocked) {
        url.pathname = '/login';
        const response = NextResponse.redirect(url);
        response.cookies.delete('sb-access-token');
        return response;
      }

      // ✨ EDİTÖRLERİN YASAKLI OLDUĞU SAYFALAR (Loglar buradan çıkarıldı) ✨
      const restrictedPaths = [
        '/admin/users',
        '/admin/site',
        '/admin/homepage',
        '/admin/about',
        '/admin/contact',
        '/admin/partners'
      ];

      const isRestricted = restrictedPaths.some(path => url.pathname.startsWith(path));

      if (role !== 'Super Admin' && role !== 'Admin' && isRestricted) {
        url.pathname = '/admin'; 
        return NextResponse.redirect(url);
      }

    } catch (error) {
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('sb-access-token');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};