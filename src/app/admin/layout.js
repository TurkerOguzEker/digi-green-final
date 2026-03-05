'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Yolun projene göre doğru olduğundan emin ol

export default function AdminLayout({ children }) {
  const router = useRouter();
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    let channel;
    let timeoutMs = 30 * 60 * 1000; // Varsayılan 30 dakika

    // Ortak Çıkış Yapma Fonksiyonu
    const logoutUser = async (reason) => {
      alert(reason);
      // Localdeki çerezleri ve oturumu temizle
      await supabase.auth.signOut();
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      // Hard-redirect (Sayfayı tamamen yenileyerek logine at)
      window.location.href = '/login';
    };

    // Farenin/klavyenin hareket ettiğini anlayan ve sayacı sıfırlayan fonksiyon
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        logoutUser('Uzun süre işlem yapmadığınız için güvenliğiniz gereği oturumunuz kapatıldı.');
      }, timeoutMs);
    };

    async function initSecurityAndListen() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/login');
        return;
      }

      // 1. Sayfa ilk açıldığında kontrol et (Belki biz yokken engellenmiştir)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_blocked')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_blocked) {
        await logoutUser('Hesabınız yönetici tarafından engellendi. Oturumunuz kapatılıyor.');
        return;
      }

      // 2. Veritabanından Adminin belirlediği zaman aşımı (timeout) ayarını çek
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('id', 'session_timeout')
        .single();
        
      if (settings?.value?.minutes) {
        timeoutMs = settings.value.minutes * 60 * 1000;
      }

      // 3. Sayacı Başlat ve Kullanıcı Hareketlerini Dinle
      resetInactivityTimer();
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
      window.addEventListener('scroll', resetInactivityTimer);

      // 4. KULLANICI İÇERİDEYKEN ENGELLENİRSE VEYA ATILIRSA CANLI DİNLEYİCİ (REALTIME)
      channel = supabase
        .channel('security-watcher')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_profiles',
            filter: `id=eq.${session.user.id}` // Sadece bu kullanıcının profilini dinle
          },
          (payload) => {
            // A Durumu: Eğer veritabanında is_blocked değeri true'ya çekildiyse
            if (payload.new.is_blocked === true && payload.old.is_blocked === false) {
              logoutUser('Hesabınız yönetici tarafından engellendi. Oturumunuz kapatılıyor.');
            }
            // B Durumu: Admin şifreyi değiştirdiyse veya "Tüm Oturumları Sonlandır"a bastıysa
            else if (payload.new.force_logout_at && payload.new.force_logout_at !== payload.old.force_logout_at) {
              logoutUser('Güvenlik nedeniyle (şifre değişimi veya sistem güncellemesi) oturumunuz sonlandırıldı.');
            }
          }
        )
        .subscribe();
    }

    initSecurityAndListen();

    // Komponent ekrandan ayrıldığında (unmount) dinleyicileri ve sayacı temizle
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
    };
  }, [router]);

  // Eğer engelli değilse normal Admin sayfalarını göster
  return <>{children}</>;
}