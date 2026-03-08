'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

/* ─── TOAST (BİLDİRİM) BİLEŞENİ ─── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <div className={`adm-toast-icon ${type}`}>
        <i className={type === 'error' ? 'fas fa-xmark' : 'fas fa-check'} />
      </div>
      <div className="adm-toast-text">
        <strong>{type === 'error' ? 'Hata' : 'Basarili'}</strong>
        <span>{message}</span>
      </div>
      <button className="adm-toast-close" onClick={onClose}>
        <i className="fas fa-xmark" />
      </button>
    </div>
  );
};

/* ─── CONFIRM MODAL ─── */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal">
        <div className="adm-modal-icon"><i className="fas fa-exclamation-triangle" style={{color:'var(--red)'}} /></div>
        <h3>Emin misiniz?</h3>
        <p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgec</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>Evet, Onayla</button>
        </div>
      </div>
    </div>
  );
};

const PAGE_SIZE = 15;

export default function MessagesPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  const [messages, setMessages] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('all'); 
  const [expandedId, setExpandedId] = useState(null);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [readInSession, setReadInSession] = useState([]);

  const sentinelRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  const changeView = (view) => {
    setCurrentView(view);
    setExpandedId(null);
    setReplyingTo(null);
    setReadInSession([]);
  };

  const fetchInitialData = useCallback(async () => {
    const { data: bData } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
    if (bData) setBlockedEmails(bData);

    const { data: msgData, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);
      
    if (!error && msgData) {
      setMessages(msgData);
      setHasMore(msgData.length === PAGE_SIZE); 
      setPageIndex(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let channel;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      if (isMounted) {
        await fetchInitialData();
      }

      supabase.realtime.setAuth(session.access_token);

      const channelName = `messages-channel-${Date.now()}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'contact_messages' },
          (payload) => {
            showToast('Yeni bir iletisim mesaji aldiniz!', 'success');
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        )
        .subscribe();
    }

    loadSession();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [router, fetchInitialData, showToast]);

  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPageIndex = pageIndex + 1;
    const from = nextPageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data && data.length > 0) {
      setMessages(prev => {
        const newData = data.filter(d => !prev.some(p => p.id === d.id));
        return [...prev, ...newData];
      });
      setPageIndex(nextPageIndex);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [pageIndex, loadingMore, hasMore]);

  useEffect(() => {
    if (loading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !searchQuery) {
        loadMoreMessages();
      }
    }, { rootMargin: '200px' }); 

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, loadingMore, loadMoreMessages, searchQuery]);


  function deleteMessage(id, e) {
    e.stopPropagation();
    showConfirm('Bu mesaji kalici olarak silmek istediginize emin misiniz?', async () => {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) showToast('Hata: ' + error.message, 'error');
      else showToast('Mesaj silindi.', 'success');
    });
  }

  async function markAsRead(msg) {
    if (msg.is_read) return; 
    setReadInSession(prev => [...prev, msg.id]); 
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
  }

  async function toggleStarStatus(msg, e) {
    e.stopPropagation();
    const newStatus = !msg.is_starred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_starred: newStatus } : m));
    await supabase.from('contact_messages').update({ is_starred: newStatus }).eq('id', msg.id);
  }

  async function handleSendReply(msg) {
    if (!replyText.trim()) {
      showToast('Lütfen bir yanıt yazın.', 'error');
      return;
    }
    
    setIsSendingReply(true);
    
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: msg.email,
          subject: `RE: ${msg.subject || 'Mesajınız Hakkında'}`,
          text: replyText
        })
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'API bir hata döndürdü.');
        } else {
          throw new Error('API Bulunamadı. Lütfen /api/send-email/route.js dosyasını kontrol edin.');
        }
      }

      await supabase.from('contact_messages').update({ is_replied: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_replied: true } : m));

      showToast('E-posta başarıyla gönderildi!', 'success');
      setReplyingTo(null);
      setReplyText(''); 
      
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setIsSendingReply(false);
    }
  }

  function handleBlockEmail(email, e) {
    e.stopPropagation();
    showConfirm(`${email} adresini SPAM olarak engellemek istiyor musunuz? Bu e-postadan gelen mevcut tum mesajlar da silinecektir.`, async () => {
      const { error } = await supabase.from('blocked_emails').insert([{ email }]);
      if (error && error.code !== '23505') { showToast('Hata: ' + error.message, 'error'); return; }
      
      setMessages(prev => prev.filter(m => m.email !== email));
      if (expandedId && messages.find(m => m.id === expandedId)?.email === email) setExpandedId(null);
      await supabase.from('contact_messages').delete().eq('email', email);
      showToast(`${email} engellendi!`, 'success');
      
      const { data } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
      if (data) setBlockedEmails(data);
    });
  }

  async function handleUnblockEmail(email) {
    const { error } = await supabase.from('blocked_emails').delete().eq('email', email);
    if (!error) {
      showToast(`${email} engeli kaldirildi.`, 'success');
      setBlockedEmails(prev => prev.filter(b => b.email !== email));
    }
  }

  const copyToClipboard = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id.toString());
    showToast(`ID Kopyalandi: ${id}`, 'success');
  }

  const unreadCount = messages.filter(m => !m.is_read).length;
  const starredCount = messages.filter(m => m.is_starred).length; 
  const repliedCount = messages.filter(m => m.is_replied).length; 
  
  const filteredMessages = messages.filter(msg => {
    const searchVal = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      msg.name?.toLowerCase().includes(searchVal) ||
      msg.email?.toLowerCase().includes(searchVal) ||
      msg.subject?.toLowerCase().includes(searchVal) ||
      msg.message?.toLowerCase().includes(searchVal) ||
      msg.id.toString().includes(searchQuery.replace(/[^0-9]/g, ''));
    
    if (currentView === 'all') return matchSearch;
    if (currentView === 'unread') return matchSearch && (!msg.is_read || readInSession.includes(msg.id));
    if (currentView === 'read') return matchSearch && msg.is_read;
    if (currentView === 'starred') return matchSearch && msg.is_starred; 
    if (currentView === 'replied') return matchSearch && msg.is_replied;
    return false;
  });

  const filteredBlocked = blockedEmails.filter(b => 
    !searchQuery || b.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatShortDate(dateStr) {
    const d = new Date(dateStr); const now = new Date(); const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Az once'; if (diff < 3600) return `${Math.floor(diff / 60)} dk once`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa once`; if (diff < 604800) return `${Math.floor(diff / 86400)} gun once`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatFullDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('tr-TR', options);
  }

  const avatarColors = ['#2ecc71','#3498db','#9b59b6','#e67e22','#e74c3c','#1abc9c','#f39c12'];
  function getAvatarColor(name = '') {
    let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return avatarColors[Math.abs(h) % avatarColors.length];
  }
  function getInitials(name = '') { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'; }

  if (loading) return <div className="adm-loading"><div className="adm-loading-spinner" /></div>;

  return (
    <div className="msg-layout">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      {/* ✨ SOL İÇ MENÜ (DAHA DAR - 220px) ✨ */}
      <div style={{ 
        width: '220px', 
        minWidth: '220px',
        background: 'var(--surface)', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 10px',
        overflowY: 'auto',
        flexShrink: 0
      }}>
        <Link href="/admin" style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
          background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px',
          color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
          marginBottom: '20px', transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-secondary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}>
          <i className="fas fa-arrow-left" style={{color: 'var(--text-muted)'}} /> Ana Panele Dön
        </Link>

        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', padding: '0 8px' }}>
          Gelen Kutusu
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button onClick={() => changeView('all')} className={`msg-nav-btn ${currentView === 'all' ? 'active' : ''}`}>
            <i className="fas fa-inbox msg-nav-icon" /> Tümü
            <span className="msg-nav-badge">{messages.length}</span>
          </button>
          
          <button onClick={() => changeView('unread')} className={`msg-nav-btn ${currentView === 'unread' ? 'active' : ''}`}>
            <i className="fas fa-envelope msg-nav-icon" /> Okunmamış
            {unreadCount > 0 && <span className="msg-nav-badge">{unreadCount}</span>}
          </button>
          
          <button onClick={() => changeView('read')} className={`msg-nav-btn ${currentView === 'read' ? 'active' : ''}`}>
            <i className="fas fa-envelope-open msg-nav-icon" /> Okunanlar
          </button>
          
          <button onClick={() => changeView('starred')} className={`msg-nav-btn ${currentView === 'starred' ? 'active' : ''}`} style={{ color: currentView === 'starred' ? '#eab308' : '' }}>
            <i className="fas fa-star msg-nav-icon" /> Yıldızlılar
            {starredCount > 0 && <span className="msg-nav-badge" style={{background: '#eab308', color: '#000'}}>{starredCount}</span>}
          </button>

          <button onClick={() => changeView('replied')} className={`msg-nav-btn ${currentView === 'replied' ? 'active' : ''}`} style={{ color: currentView === 'replied' ? '#3b82f6' : '' }}>
            <i className="fas fa-reply-all msg-nav-icon" /> Cevaplananlar
            {repliedCount > 0 && <span className="msg-nav-badge" style={{background: '#3b82f6', color: '#fff'}}>{repliedCount}</span>}
          </button>
        </div>

        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '24px', marginBottom: '8px', padding: '0 8px' }}>
          Güvenlik & Sistem
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button onClick={() => changeView('blocked')} className={`msg-nav-btn ${currentView === 'blocked' ? 'active' : ''}`} style={{ color: currentView === 'blocked' ? '#ef4444' : '' }}>
            <i className="fas fa-ban msg-nav-icon" /> Engellenenler
            {blockedEmails.length > 0 && <span className="msg-nav-badge" style={{background: '#ef4444', color: '#fff'}}>{blockedEmails.length}</span>}
          </button>
        </div>
      </div>

      {/* ✨ SAĞ İÇERİK ALANI (MESAJ LİSTESİ VE KARTLAR) ✨ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        
        {/* SABİT ÖZET KARTLARI (HER ZAMAN GÖRÜNÜR) */}
        <div style={{ padding: '24px 32px 0 32px', flexShrink: 0 }}>
          <div className="msg-stats">
            <div className="msg-stat-card">
              <div className="msg-stat-icon" style={{background:'rgba(34,197,94,0.12)', color:'#22c55e'}}>
                <i className="fas fa-inbox" />
              </div>
              <div>
                <div className="msg-stat-val">{messages.length}</div>
                <div className="msg-stat-lbl">Toplam Mesaj</div>
              </div>
            </div>
            <div className="msg-stat-card">
              <div className="msg-stat-icon" style={{background:'rgba(251,191,36,0.12)', color:'#fbbf24'}}>
                <i className="fas fa-envelope" />
              </div>
              <div>
                <div className="msg-stat-val">{unreadCount}</div>
                <div className="msg-stat-lbl">Okunmamis</div>
              </div>
            </div>
            <div className="msg-stat-card">
              <div className="msg-stat-icon" style={{background:'rgba(59, 130, 246, 0.12)', color:'#3b82f6'}}>
                <i className="fas fa-reply-all" />
              </div>
              <div>
                <div className="msg-stat-val">{repliedCount}</div>
                <div className="msg-stat-lbl">Cevaplanan</div>
              </div>
            </div>
            <div className="msg-stat-card">
              <div className="msg-stat-icon" style={{background:'rgba(245,158,11,0.12)', color:'#f59e0b'}}>
                <i className="fas fa-ban" />
              </div>
              <div>
                <div className="msg-stat-val">{blockedEmails.length}</div>
                <div className="msg-stat-lbl">Engellenen</div>
              </div>
            </div>
          </div>
        </div>

        {/* LİSTE BAŞLIĞI VE ARAMA KUTUSU */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px 16px 32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className={`fas ${
              currentView === 'blocked' ? 'fa-ban' : 
              currentView === 'starred' ? 'fa-star' : 
              currentView === 'replied' ? 'fa-reply-all' : 
              currentView === 'unread' ? 'fa-envelope' : 'fa-inbox'
            }`} style={{
              color: 
                currentView === 'blocked' ? '#ef4444' : 
                currentView === 'starred' ? '#eab308' : 
                currentView === 'replied' ? '#3b82f6' : 
                'var(--accent)'
            }} />
            {
              currentView === 'all' ? 'Tüm Mesajlar' : 
              currentView === 'unread' ? 'Okunmamış Mesajlar' : 
              currentView === 'read' ? 'Okunan Mesajlar' : 
              currentView === 'starred' ? 'Yıldızlı Mesajlar' : 
              currentView === 'replied' ? 'Cevaplanan Mesajlar' : 
              'Engellenen E-postalar'
            }
          </div>

          <div className="adm-search-wrap" style={{ width: '280px', margin: 0 }}>
            <i className="fas fa-search" />
            <input
              className="adm-search-input"
              placeholder={currentView === 'blocked' ? "E-posta ara..." : "İsim, konu veya mesaj..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="adm-search-clear" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>

        {/* MESAJLARIN LİSTESİ (KAYDIRILABİLİR ALAN) */}
        <div className="adm-fade-in" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 32px' }}>
          
          {searchQuery && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {currentView === 'blocked' ? filteredBlocked.length : filteredMessages.length} sonuç bulundu
            </div>
          )}

          {currentView === 'blocked' ? (
            filteredBlocked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <i className="fas fa-shield-check" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                <p>Engellenmiş bir adres bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredBlocked.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        <i className="fas fa-ban"></i>
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Engellenme Tarihi: {formatFullDate(b.created_at)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUnblockEmail(b.email)} 
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                    >
                      <i className="fas fa-unlock" style={{ marginRight: '6px' }} /> Engeli Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <i className="fas fa-envelope-open" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                <p>{searchQuery ? 'Arama sonucu bulunamadı.' : 'Bu kategoride hiç mesajınız yok.'}</p>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {filteredMessages.map(msg => {
                  const isExpanded = expandedId === msg.id;
                  const isReplying = replyingTo === msg.id;
                  const avatarColor = getAvatarColor(msg.name);
                  
                  return (
                    <div
                      key={msg.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderLeft: !msg.is_read ? '3px solid var(--accent)' : '3px solid transparent',
                        cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onClick={() => {
                        if (!isReplying) setExpandedId(isExpanded ? null : msg.id);
                        markAsRead(msg);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(msg.name)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{msg.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>&lt;{msg.email}&gt;</span>
                            {!msg.is_read && <span style={{ background: 'var(--accent)', color: '#000', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', flexShrink: 0 }}>Yeni</span>}
                            {msg.is_replied && <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', flexShrink: 0 }}><i className="fas fa-check" style={{marginRight:'3px'}}/>Cevaplandı</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: isExpanded ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <strong style={{marginRight: '6px'}}>{msg.subject}</strong> 
                            {!isExpanded && <span style={{opacity: 0.6}}>— {msg.message}</span>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '10px', whiteSpace: 'nowrap' }}>
                            {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                          
                          <button
                            title={msg.is_starred ? 'Yıldızı Kaldır' : 'Yıldızla'}
                            onClick={e => toggleStarStatus(msg, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: msg.is_starred ? '#eab308' : 'var(--text-muted)', transition: 'color 0.2s', padding: '4px' }}
                          >
                            <i className={msg.is_starred ? 'fas fa-star' : 'far fa-star'} />
                          </button>

                          <button
                            title="Bu mail adresini engelle"
                            onClick={e => handleBlockEmail(msg.email, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', padding: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <i className="fas fa-ban" />
                          </button>

                          <button
                            title="Mesajı Sil"
                            onClick={e => deleteMessage(msg.id, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', padding: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 24px 24px 82px', animation: 'fadeUp 0.2s ease' }} onClick={e => e.stopPropagation()}>
                          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                              <span>Tarih: {formatFullDate(msg.created_at)}</span>
                              <span style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }} onClick={(e) => copyToClipboard(msg.id, e)} title="ID Kopyala">ID: {msg.id}</span>
                            </div>
                            
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, wordBreak: 'break-word' }}>
                              {msg.message}
                            </p>

                            {!isReplying ? (
                              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setReplyingTo(msg.id); setReplyText(''); }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                  <i className="fas fa-reply" /> Müşteriye Yanıt Yaz
                                </button>
                              </div>
                            ) : (
                              <div style={{ marginTop: '20px', background: 'var(--surface)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  <span><strong>{msg.email}</strong> adresine e-posta gönderilecek:</span>
                                  <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-times" /> İptal</button>
                                </div>
                                <textarea 
                                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '12px', fontSize: '0.85rem', resize: 'vertical', minHeight: '120px', outline: 'none' }}
                                  placeholder="E-posta içeriğinizi yazın..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  disabled={isSendingReply}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                  <button 
                                    onClick={() => handleSendReply(msg)} 
                                    disabled={isSendingReply}
                                    style={{ background: '#22c55e', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    {isSendingReply ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-paper-plane" /> Gönder</>}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* INFINITE SCROLL LOADER */}
          {currentView !== 'blocked' && hasMore && !searchQuery && (
            <div ref={sentinelRef} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {loadingMore ? <span><i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i> Daha fazla mesaj yükleniyor...</span> : ''}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .msg-layout { 
          display: flex; 
          width: 100vw; 
          max-width: 100%;
          height: 100vh; 
          background: var(--bg); 
          overflow: hidden; 
        }
        .msg-nav-btn {
          display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px;
          border-radius: 8px; border: none; background: transparent; color: var(--text-secondary);
          font-family: var(--font); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
          text-align: left; margin-bottom: 2px;
        }
        .msg-nav-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .msg-nav-btn.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
        .msg-nav-btn.active-star { background: rgba(234,179,8,0.15); color: #eab308; font-weight: 600; }
        .msg-nav-btn.active-replied { background: rgba(59,130,246,0.15); color: #3b82f6; font-weight: 600; }
        .msg-nav-icon { width: 20px; display: flex; justify-content: center; font-size: 0.9rem; }
        .msg-nav-badge { margin-left: auto; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }

        .msg-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        @media(max-width: 1100px) { .msg-stats { grid-template-columns: repeat(2, 1fr); } }
        .msg-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .msg-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .msg-stat-val { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
        .msg-stat-lbl { font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; }
        
        .adm-search-wrap { position: relative; display: flex; align-items: center; }
        .adm-search-wrap i.fa-search { position: absolute; left: 14px; color: var(--text-muted); font-size: 0.85rem; }
        .adm-search-input { width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px 10px 38px; color: var(--text-primary); font-family: var(--font); font-size: 0.875rem; transition: all 0.2s; outline: none; }
        .adm-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .adm-search-clear { position: absolute; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: color 0.2s; }
        .adm-search-clear:hover { color: var(--text-primary); }
      `}</style>
    </div>
  );
}