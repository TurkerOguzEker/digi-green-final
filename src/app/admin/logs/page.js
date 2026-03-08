'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function LogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Editor'); 
  
  // ✨ LOG VE SAYFALAMA (PAGINATION) STATE'LERİ ✨
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef(null);
  const LOGS_PER_PAGE = 30; // Her kaydırmada yüklenecek log sayısı
  
  // ✨ ARAMA KUTUSU STATE'İ ✨
  const [searchQuery, setSearchQuery] = useState('');

  // ✨ LOGLARI SUPABASE'DEN SAYFA SAYFA ÇEKEN FONKSİYON ✨
  const fetchLogs = useCallback(async (pageNumber) => {
    setIsFetchingMore(true);
    const from = pageNumber * LOGS_PER_PAGE;
    const to = from + LOGS_PER_PAGE - 1;

    const { data: logData, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && logData) {
      // Eğer gelen veri limitimizden azsa, demek ki veritabanında daha fazla log kalmadı
      if (logData.length < LOGS_PER_PAGE) {
        setHasMore(false);
      }
      
      setLogs(prevLogs => {
        // Eğer ilk sayfaysa direkt datayı koy, değilse eski listenin sonuna ekle
        if (pageNumber === 0) return logData;
        return [...prevLogs, ...logData];
      });
    } else {
      setHasMore(false);
    }
    setIsFetchingMore(false);
  }, []);

  // ✨ İLK YÜKLEME ✨
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      if (isMounted) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session.user.id).single();
        if (profile) {
          setUserRole(profile.role);
          // Editörlerin bu sayfaya erişimi yoktur, yönlendirilirler.
          if (profile.role === 'Editor') {
            router.replace('/admin');
            return;
          }
        }
      }

      // İlk sayfa logları çek
      await fetchLogs(0);

      if (isMounted) {
        setLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [router, fetchLogs]);

  // ✨ SCROLL TAKİBİ (SAYFANIN ALTINA GELDİĞİNİ ANLAMA) ✨
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      // Kullanıcı loader div'ini gördüyse, yüklenecek veri varsa, şu an yüklenmiyorsa ve ARAMA YAPILMIYORSA sayfa sayısını artır
      if (target.isIntersecting && hasMore && !isFetchingMore && !loading && !searchQuery) {
        setPage((prevPage) => prevPage + 1);
      }
    }, {
      root: null,
      rootMargin: '20px', // Div'e 20px kala tetikle
      threshold: 1.0
    });

    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, isFetchingMore, loading, searchQuery]);

  // Sayfa sayısı arttıkça yeni logları çek
  useEffect(() => {
    if (page > 0) {
      fetchLogs(page);
    }
  }, [page, fetchLogs]);

  // ✨ LOGLARI FİLTRELEME İŞLEMİ ✨
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user_email?.toLowerCase().includes(q) ||
      log.page_section?.toLowerCase().includes(q) ||
      log.ip_address?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  return (
    <div className="adm-content">
      <div className="adm-fade-in">
        
        {/* ✨ GÜNCELLENMİŞ BAŞLIK VE ARAMA ALANI ✨ */}
        <div className="adm-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div className="adm-page-title">Sistem <em>Loglari</em></div>
            <div className="adm-page-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Admin paneli uzerinde gerceklestirilen etkinlikler.</div>
          </div>
          
          {/* ARAMA KUTUSU */}
          <div className="adm-search-wrap" style={{ width: '300px', marginBottom: 0 }}>
            <i className="fas fa-search" />
            <input 
              type="text" 
              className="adm-search-input" 
              placeholder="İşlem, e-posta veya ip ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="adm-search-clear" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>
        
        <div className="adm-card" style={{padding: '0'}}>
          <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                <th style={{padding: '16px 20px'}}>Islem Tarihi</th>
                <th style={{padding: '16px 20px'}}>Sayfa / Sekme</th>
                <th style={{padding: '16px 20px'}}>Islem Tipi</th>
                <th style={{padding: '16px 20px'}}>Kullanici & IP Adresi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                    {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henuz bir islem logu bulunmuyor.'}
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                    {new Date(log.created_at).toLocaleString('tr-TR')}
                  </td>
                  <td style={{padding: '16px 20px'}}>
                    <span className="adm-badge adm-badge-blue" style={{textTransform:'uppercase'}}>{log.page_section || 'Genel'}</span>
                  </td>
                  <td style={{padding: '16px 20px', fontWeight: '500', color: 'var(--text-primary)'}}>
                    <i className="fas fa-check-circle" style={{marginRight:'8px', color:'var(--accent)'}}></i>
                    {log.action}
                  </td>
                  <td style={{padding: '16px 20px', fontSize:'0.85rem', color:'var(--text-muted)'}}>
                    <div style={{color:'var(--text-primary)', marginBottom:'4px'}}><i className="fas fa-user" style={{marginRight:'5px'}}></i>{log.user_email}</div>
                    <div style={{fontSize:'0.75rem', opacity:0.7}}><i className="fas fa-network-wired" style={{marginRight:'5px'}}></i>{log.ip_address || 'Bilinmiyor'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* ✨ İNFINITE SCROLL YÜKLEME GÖSTERGESİ ✨ */}
          {hasMore && !searchQuery && (
            <div ref={loaderRef} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {isFetchingMore ? (
                <span><i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i> Daha fazla log yükleniyor...</span>
              ) : (
                <span>Aşağı kaydırarak devam edin...</span>
              )}
            </div>
          )}
          
          {/* ✨ TÜM VERİ BİTTİĞİNDE ÇIKAN UYARI ✨ */}
          {!hasMore && logs.length > 0 && !searchQuery && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>
              Mevcut tüm logların sonuna ulaştınız.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}