// src/app/admin/messages/page.js
'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import '../../globals.css';

/* ─── TOAST (BİLDİRİM) BİLEŞENİ ─── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <div className={`adm-toast-icon ${type}`}>
        <i className={type === 'error' ? 'fas fa-xmark' : 'fas fa-check'} />
      </div>
      <div className="adm-toast-text">
        <strong>{type === 'error' ? 'Hata' : 'Başarılı'}</strong>
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
        <div className="adm-modal-icon"><i className="fas fa-exclamation-triangle" style={{color:'#ef4444'}} /></div>
        <h3>Emin misiniz?</h3>
        <p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgeç</button>
          <button className="adm-btn adm-btn-danger" style={{background:'#ef4444', color:'white', border:'none'}} onClick={onConfirm}>Evet, Onayla</button>
        </div>
      </div>
    </div>
  );
};

// Sonsuz kaydırma için sayfa başı çekilecek mesaj sayısı
const PAGE_SIZE = 15;

export default function MessagesPage() {
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  const [messages, setMessages] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('all'); 
  const [expandedId, setExpandedId] = useState(null);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  // Observer referansı
  const sentinelRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };
useEffect(() => {
    async function checkSessionAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setCurrentUser(session.user);
      await fetchInitialData();
    }
    checkSessionAndLoad();

    // ✨ ADIM 6: CANLI MESAJ BİLDİRİMLERİ (REALTIME) ✨
    const messageChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          console.log("🚨 SİSTEME YENİ MESAJ DÜŞTÜ:", payload.new); // Gizli kontrol noktası
          showToast('🔔 Yeni bir iletişim mesajı aldınız!', 'success');
          
          // Yeni mesajı listenin en başına ekle (Tüm listeyi koruyarak)
          setMessages(prev => {
            // Eğer mesaj zaten listedeyse (çift tetiklenmeyi önlemek için) ekleme
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [router]);

  async function fetchInitialData() {
    setLoading(true);
    
    // 1. Engellenen emailleri çek
    const { data: blockedData } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
    if (blockedData) setBlockedEmails(blockedData);

    // 2. Mesajların ilk sayfasını çek (0 - 14)
    const { data: msgData, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);
      
    if (!error && msgData) {
      setMessages(msgData);
      setHasMore(msgData.length === PAGE_SIZE); 
    }
    
    setLoading(false);
  }

  // ✨ YENİ: Sonsuz Kaydırma Fonksiyonu
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
      setMessages(prev => [...prev, ...data]);
      setPageIndex(nextPageIndex);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    
    setLoadingMore(false);
  }, [pageIndex, loadingMore, hasMore]);

  // Observer Kurulumu (Sayfanın altına geldiğini anlamak için)
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


  // EYLEM FONKSİYONLARI
  function deleteMessage(id, e) {
    e.stopPropagation();
    showConfirm('Bu mesajı kalıcı olarak silmek istediğinize emin misiniz?', async () => {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) showToast('Hata: ' + error.message, 'error');
      else showToast('Mesaj silindi.', 'success');
    });
  }

  async function toggleReadStatus(msg, e) {
    e.stopPropagation();
    const newStatus = !msg.is_read;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: newStatus } : m));
    await supabase.from('contact_messages').update({ is_read: newStatus }).eq('id', msg.id);
  }

  async function toggleStarStatus(msg, e) {
    e.stopPropagation();
    const newStatus = !msg.is_starred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_starred: newStatus } : m));
    await supabase.from('contact_messages').update({ is_starred: newStatus }).eq('id', msg.id);
  }

  async function toggleReplyStatus(msg, e) {
    e.stopPropagation();
    const newStatus = !msg.is_replied;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_replied: newStatus } : m));
    const { error } = await supabase.from('contact_messages').update({ is_replied: newStatus }).eq('id', msg.id);
    if (!error) showToast(newStatus ? 'Yanıtlandı olarak işaretlendi.' : 'Yanıt durumu kaldırıldı.', 'success');
  }

  async function markAllRead() {
    const unread = messages.filter(m => !m.is_read);
    if (!unread.length) return showToast('Okunmamış mesaj yok.', 'success');
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
    await supabase.from('contact_messages').update({ is_read: true }).in('id', unread.map(m => m.id));
    showToast('Tüm mesajlar okundu olarak işaretlendi.', 'success');
  }

  function handleBlockEmail(email, e) {
    e.stopPropagation();
    showConfirm(`${email} adresini SPAM olarak engellemek istiyor musunuz? Bu e-postadan gelen mevcut tüm mesajlar da silinecektir.`, async () => {
      const { error } = await supabase.from('blocked_emails').insert([{ email }]);
      if (error && error.code !== '23505') {
        showToast('Hata: ' + error.message, 'error');
        return;
      }
      setMessages(prev => prev.filter(m => m.email !== email));
      if (expandedId && messages.find(m => m.id === expandedId)?.email === email) setExpandedId(null);
      await supabase.from('contact_messages').delete().eq('email', email);
      showToast(`${email} engellendi ve mesajları silindi!`, 'success');
      
      const { data } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
      if (data) setBlockedEmails(data);
    });
  }

  async function handleUnblockEmail(email) {
    const { error } = await supabase.from('blocked_emails').delete().eq('email', email);
    if (!error) {
      showToast(`${email} engeli kaldırıldı.`, 'success');
      setBlockedEmails(prev => prev.filter(b => b.email !== email));
    }
  }

  // ✨ YENİ: ID Kopyalama Fonksiyonu (Sadece Sayıyı Kopyalar)
  const copyToClipboard = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id.toString());
    showToast(`ID Kopyalandı: ${id}`, 'success');
  }

  // SAYAÇLAR
  const unreadCount = messages.filter(m => !m.is_read).length;
  const starredCount = messages.filter(m => m.is_starred).length; 
  const repliedCount = messages.filter(m => m.is_replied).length; 
  
  // FİLTRELEME
  const filteredMessages = messages.filter(msg => {
    const searchVal = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      msg.name?.toLowerCase().includes(searchVal) ||
      msg.email?.toLowerCase().includes(searchVal) ||
      msg.subject?.toLowerCase().includes(searchVal) ||
      msg.message?.toLowerCase().includes(searchVal) ||
      msg.id.toString().includes(searchQuery.replace(/[^0-9]/g, '')); // Arama kısmına sayı yazılırsa ID'lerde arar
    
    if (currentView === 'all') return matchSearch;
    if (currentView === 'unread') return matchSearch && !msg.is_read;
    if (currentView === 'read') return matchSearch && msg.is_read;
    if (currentView === 'starred') return matchSearch && msg.is_starred; 
    if (currentView === 'replied') return matchSearch && msg.is_replied;
    return false;
  });

  const filteredBlocked = blockedEmails.filter(b => 
    !searchQuery || b.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // TARİH FORMATLARI
  function formatShortDate(dateStr) {
    const d = new Date(dateStr); const now = new Date(); const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Az önce'; if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`; if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatFullDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateStr).toLocaleDateString('tr-TR', options);
  }

  const avatarColors = ['#2ecc71','#3498db','#9b59b6','#e67e22','#e74c3c','#1abc9c','#f39c12'];
  function getAvatarColor(name = '') {
    let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return avatarColors[Math.abs(h) % avatarColors.length];
  }
  function getInitials(name = '') { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'; }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');

        .msg-layout { display: flex; min-height: 100vh; background: #0d0f14; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }

        .msg-sidebar { width: 260px; flex-shrink: 0; background: #111318; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh; }
        .msg-brand { padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .msg-brand-logo { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.3rem; letter-spacing: 1px; color: #fff; display: flex; align-items: center; gap: 10px; }
        .msg-brand-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; }
        .msg-brand-logo span { color: #22c55e; }
        .msg-brand-sub { margin-top: 6px; font-size: 0.72rem; color: #4b5563; letter-spacing: 2px; text-transform: uppercase; }
        .msg-nav { padding: 24px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .msg-nav-label { font-size: 0.65rem; letter-spacing: 2.5px; color: #6b7280; font-weight: 600; text-transform: uppercase; padding: 0 12px; margin-bottom: 8px; margin-top: 8px; }
        .msg-nav-btn { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; color: #9ca3af; cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; background: none; width: 100%; text-align: left; }
        .msg-nav-btn:hover { background: rgba(255,255,255,0.05); color: #f9fafb; }
        
        .msg-nav-btn.active { background: rgba(34,197,94,0.12); color: #22c55e; }
        .msg-nav-btn.active-warning { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
        .msg-nav-btn.active-star { background: rgba(234, 179, 8, 0.12); color: #eab308; }
        .msg-nav-btn.active-replied { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        
        .msg-logout-btn { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; color: #ef4444; cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; background: none; width: 100%; text-align: left; }
        .msg-logout-btn:hover { background: rgba(239,68,68,0.1); }
        .msg-nav-icon { width: 18px; text-align: center; }
        .msg-nav-badge { margin-left: auto; background: #22c55e; color: #000; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

        .msg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .msg-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 36px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(17,19,24,0.7); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
        .msg-topbar-left { display: flex; align-items: center; gap: 16px; }
        .msg-topbar-title { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 700; color: #f9fafb; display: flex; align-items: center; }
        .msg-topbar-pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); padding: 7px 14px; border-radius: 20px; font-size: 0.8rem; color: #9ca3af; }
        .msg-topbar-pill .dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; display: inline-block; }

        .msg-content { padding: 36px; flex: 1; overflow-y: auto; }
        
        .msg-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        @media(max-width: 1100px) { .msg-stats { grid-template-columns: repeat(2, 1fr); } }
        .msg-stat-card { background: #111318; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; gap: 16px; }
        .msg-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .msg-stat-val { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #f9fafb; line-height: 1; }
        .msg-stat-lbl { font-size: 0.78rem; color: #6b7280; margin-top: 4px; }

        .msg-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .msg-search-wrap { flex: 1; min-width: 200px; position: relative; }
        .msg-search-wrap i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #4b5563; font-size: 0.85rem; }
        .msg-search-input { width: 100%; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px 10px 38px; color: #e2e8f0; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .msg-search-input:focus { border-color: rgba(34,197,94,0.4); }

        .msg-mark-all-btn { background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 16px; color: #6b7280; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 7px; margin-left: auto; }
        .msg-mark-all-btn:hover { color: #d1d5db; border-color: rgba(255,255,255,0.15); }

        .msg-list { background: #111318; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .msg-item { border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; }
        .msg-item:last-child { border-bottom: none; }
        .msg-item:hover { background: rgba(255,255,255,0.02); }
        .msg-item.unread { border-left: 3px solid #22c55e; }
        .msg-item.read { border-left: 3px solid transparent; }

        .msg-item-header { display: flex; align-items: center; gap: 16px; padding: 18px 22px; }
        .msg-avatar { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 600; color: #000; flex-shrink: 0; letter-spacing: 0.5px; }
        .msg-meta { flex: 1; min-width: 0; }
        .msg-sender-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
        .msg-sender-name { font-size: 0.925rem; font-weight: 600; color: #f1f5f9; }
        .msg-new-badge { background: #22c55e; color: #000; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.5px; padding: 2px 7px; border-radius: 6px; text-transform: uppercase; }
        .msg-replied-badge { background: rgba(59, 130, 246, 0.15); color: #3b82f6; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.5px; padding: 2px 7px; border-radius: 6px; text-transform: uppercase; border: 1px solid rgba(59, 130, 246, 0.3); }
        
        /* ✨ YENİ: Ticket ID CSS */
        .msg-ticket-id { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #9ca3af; background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; cursor: pointer; display: inline-block; }
        .msg-ticket-id:hover { color: #f9fafb; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }

        .msg-subject { font-size: 0.82rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
        .msg-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .msg-time { font-size: 0.75rem; color: #4b5563; white-space: nowrap; }
        
        .msg-action-btn { width: 32px; height: 32px; border-radius: 8px; background: none; border: 1px solid transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563; transition: all 0.2s; font-size: 0.8rem; }
        .msg-action-btn:hover { background: rgba(255,255,255,0.07); color: #9ca3af; border-color: rgba(255,255,255,0.1); }
        .msg-action-btn.delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
        .msg-action-btn.block:hover { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
        .msg-action-btn.starred:hover { background: rgba(234, 179, 8, 0.1); color: #eab308 !important; border-color: rgba(234, 179, 8, 0.2); }
        
        .msg-body { padding: 0 22px 20px 80px; animation: fadeDown 0.2s ease; }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .msg-body-inner { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px 20px; }
        .msg-body-subject { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .msg-body-subject span { color: #9ca3af; font-weight: 500; }
        .msg-full-date { font-size: 0.75rem; color: #4b5563; font-style: italic; font-weight: normal; text-transform: none; letter-spacing: 0; }
        
        .msg-body-text { font-size: 0.875rem; color: #d1d5db; line-height: 1.8; white-space: pre-wrap; margin: 0; }
        .msg-body-footer { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.05); }
        .msg-reply-link { display: inline-flex; align-items: center; gap: 7px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #22c55e; text-decoration: none; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; }
        .msg-reply-link:hover { background: rgba(34,197,94,0.18); }
        .msg-mark-replied { display: inline-flex; align-items: center; gap: 7px; background: transparent; border: 1px solid rgba(59,130,246,0.3); color: #3b82f6; cursor: pointer; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; }
        .msg-mark-replied:hover { background: rgba(59,130,246,0.1); }

        .msg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 14px; color: #4b5563; }
        .msg-empty-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #374151; }
        .msg-empty p { margin: 0; font-size: 0.875rem; }

        .msg-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 16px; background: #0d0f14; color: #6b7280; font-family: 'DM Sans', sans-serif; }
        .msg-spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid rgba(34,197,94,0.15); border-top-color: #22c55e; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .msg-result-count { font-size: 0.78rem; color: #4b5563; padding: 0 2px; margin-bottom: 10px; }
        
        .adm-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; background: #1f2937; border: 1px solid #374151; color: #f9fafb; padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2); }
        .adm-toast-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; }
        .adm-toast-icon.success { background: rgba(34,197,94,0.2); color: #22c55e; }
        .adm-toast-icon.error { background: rgba(239,68,68,0.2); color: #ef4444; }
        .adm-toast-text { display: flex; flex-direction: column; }
        .adm-toast-text strong { font-size: 0.9rem; margin-bottom: 2px; }
        .adm-toast-text span { font-size: 0.8rem; color: #9ca3af; }
        .adm-toast-close { background: none; border: none; color: #6b7280; cursor: pointer; padding: 5px; font-size: 1rem; }
        .adm-toast-close:hover { color: #f9fafb; }
        
        .adm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .adm-modal { background: #111318; border: 1px solid #374151; padding: 30px; border-radius: 20px; max-width: 400px; width: 90%; text-align: center; color: #f9fafb; box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2); }
        .adm-modal-icon { width: 50px; height: 50px; border-radius: 50%; background: rgba(239,68,68,0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 20px; }
        .adm-modal h3 { margin: 0 0 10px; font-size: 1.2rem; }
        .adm-modal p { color: #9ca3af; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5; }
        .adm-modal-btns { display: flex; gap: 10px; justify-content: center; }
        .adm-btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .adm-btn-ghost { background: transparent; border: 1px solid #374151; color: #d1d5db; }
        .adm-btn-ghost:hover { background: rgba(255,255,255,0.05); }

        /* Loader Ring for Infinite Scroll */
        .loader-ring { display: inline-block; position: relative; width: 30px; height: 30px; }
        .loader-ring div { box-sizing: border-box; display: block; position: absolute; width: 24px; height: 24px; margin: 3px; border: 2px solid #22c55e; border-radius: 50%; animation: loader-spin 1.2s cubic-bezier(0.5,0,0.5,1) infinite; border-color: #22c55e transparent transparent transparent; }
        .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
        .loader-ring div:nth-child(2) { animation-delay: -0.3s; }
        .loader-ring div:nth-child(3) { animation-delay: -0.15s; }
        
        .load-more-indicator { display: flex; flex-direction: column; align-items: center; padding: 20px 0; color: #6b7280; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; }

        @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {loading ? (
        <div className="msg-loading">
          <div className="msg-spinner" />
          <p>Sistem yükleniyor…</p>
        </div>
      ) : (
        <div className="msg-layout">

          <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
          <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

          {/* ── SIDEBAR ── */}
          <aside className="msg-sidebar">
            <div className="msg-brand">
              <div className="msg-brand-logo">
                <div className="msg-brand-icon"><i className="fas fa-leaf" /></div>
                DIGI-<span>GREEN</span>
              </div>
              <div className="msg-brand-sub">Yönetim Paneli</div>
            </div>
            
            <nav className="msg-nav">
              <div className="msg-nav-label">Ana Menü</div>
              
              <Link href="/admin" className="msg-nav-btn" style={{textDecoration:'none', color:'inherit', marginBottom:'10px', background:'rgba(255,255,255,0.03)'}}>
                <span className="msg-nav-icon"><i className="fas fa-arrow-left" /></span> Ana Panele Dön
              </Link>
              
              <div className="msg-nav-label" style={{marginTop:'10px'}}>Gelen Kutusu</div>

              <button 
                className={`msg-nav-btn ${currentView === 'all' ? 'active' : ''}`} 
                onClick={() => {setCurrentView('all'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-inbox" /></span> Tümü
                <span className="msg-nav-badge" style={{background: 'rgba(255,255,255,0.1)', color: '#d1d5db'}}>{messages.length}</span>
              </button>

              <button 
                className={`msg-nav-btn ${currentView === 'unread' ? 'active' : ''}`} 
                onClick={() => {setCurrentView('unread'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-envelope" /></span> Okunmamış
                {unreadCount > 0 && <span className="msg-nav-badge">{unreadCount}</span>}
              </button>

              <button 
                className={`msg-nav-btn ${currentView === 'read' ? 'active' : ''}`} 
                onClick={() => {setCurrentView('read'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-envelope-open" /></span> Okunanlar
              </button>
              
              <button 
                className={`msg-nav-btn ${currentView === 'starred' ? 'active-star' : ''}`} 
                onClick={() => {setCurrentView('starred'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-star" /></span> Yıldızlılar
                {starredCount > 0 && <span className="msg-nav-badge" style={{background: '#eab308', color: '#fff'}}>{starredCount}</span>}
              </button>

              <button 
                className={`msg-nav-btn ${currentView === 'replied' ? 'active-replied' : ''}`} 
                onClick={() => {setCurrentView('replied'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-reply-all" /></span> Cevaplananlar
                {repliedCount > 0 && <span className="msg-nav-badge" style={{background: '#3b82f6', color: '#fff'}}>{repliedCount}</span>}
              </button>

              <div className="msg-nav-label" style={{marginTop:'20px'}}>Güvenlik & Sistem</div>
              
              <button 
                className={`msg-nav-btn ${currentView === 'blocked' ? 'active-warning' : ''}`} 
                onClick={() => {setCurrentView('blocked'); setExpandedId(null);}}
              >
                <span className="msg-nav-icon"><i className="fas fa-ban" /></span> Engellenenler
                {blockedEmails.length > 0 && <span className="msg-nav-badge" style={{background: '#f59e0b', color: '#fff'}}>{blockedEmails.length}</span>}
              </button>

            </nav>

            <div style={{ padding: '0 12px', marginTop: 'auto' }}>
              <button className="msg-logout-btn" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>
                <span className="msg-nav-icon"><i className="fas fa-arrow-right-from-bracket" /></span>
                Çıkış Yap
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="msg-main">

            {/* TOPBAR */}
            <div className="msg-topbar">
              <div className="msg-topbar-left">
                <div className="msg-topbar-title">
                  <i className={`fas ${
                    currentView === 'blocked' ? 'fa-ban' : 
                    currentView === 'starred' ? 'fa-star' : 
                    currentView === 'replied' ? 'fa-reply-all' : 
                    'fa-inbox'
                  }`} style={{
                    color: 
                      currentView === 'blocked' ? '#f59e0b' : 
                      currentView === 'starred' ? '#eab308' : 
                      currentView === 'replied' ? '#3b82f6' : 
                      '#22c55e', 
                    marginRight:'10px'
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
              </div>
              <div className="msg-topbar-pill">
                <span className="dot" />
                {currentUser?.email || 'Admin'}
              </div>
            </div>

            <div className="msg-content">

              {/* STATS */}
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
                    <div className="msg-stat-lbl">Okunmamış</div>
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

              {/* TOOLBAR */}
              <div className="msg-toolbar">
                <div className="msg-search-wrap">
                  <i className="fas fa-search" />
                  <input
                    className="msg-search-input"
                    placeholder={currentView === 'blocked' ? "Engellenen e-posta ara..." : "İsim, e-posta, ID veya konu ara…"}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* RESULT COUNT */}
              {searchQuery && (
                <div className="msg-result-count">
                  {currentView === 'blocked' ? filteredBlocked.length : filteredMessages.length} sonuç bulundu
                </div>
              )}

              {/* ── İÇERİK LİSTESİ ── */}
              <div className="msg-list">
                
                {/* ENGELLENENLER SEKME GÖRÜNÜMÜ */}
                {currentView === 'blocked' ? (
                  filteredBlocked.length === 0 ? (
                    <div className="msg-empty">
                      <div className="msg-empty-icon" style={{color:'#f59e0b', background:'rgba(245,158,11,0.05)', borderColor:'rgba(245,158,11,0.1)'}}>
                        <i className="fas fa-shield-alt" />
                      </div>
                      <p>{searchQuery ? 'Arama sonucu bulunamadı.' : 'Engellenmiş bir e-posta adresi bulunmuyor.'}</p>
                    </div>
                  ) : (
                    filteredBlocked.map(b => (
                      <div key={b.id} className="msg-item read" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                          <div className="msg-avatar" style={{background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b'}}>
                            <i className="fas fa-ban"></i>
                          </div>
                          <div>
                            <div style={{fontWeight: 600, color: '#f1f5f9'}}>{b.email}</div>
                            <div style={{fontSize: '0.8rem', color: '#6b7280', marginTop: '4px'}}>
                              Engellenme Tarihi: {formatFullDate(b.created_at)}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="msg-action-btn"
                          title="Engeli Kaldır"
                          onClick={() => handleUnblockEmail(b.email)} 
                          style={{background: 'rgba(34,197,94,0.1)', color: '#22c55e', width: 'auto', padding: '0 15px', fontWeight:'500'}}
                        >
                          <i className="fas fa-unlock" style={{marginRight: '8px'}} /> Engeli Kaldır
                        </button>
                      </div>
                    ))
                  )

                ) : (
                  
                  /* MESAJLAR SEKME GÖRÜNÜMÜ */
                  filteredMessages.length === 0 ? (
                    <div className="msg-empty">
                      <div className="msg-empty-icon">
                        <i className={currentView === 'starred' ? 'fas fa-star' : currentView === 'replied' ? 'fas fa-reply-all' : 'fas fa-envelope-open-text'} />
                      </div>
                      <p>{searchQuery ? 'Arama sonucu bulunamadı.' : 'Bu kategoride hiç mesajınız yok.'}</p>
                    </div>
                  ) : (
                    filteredMessages.map(msg => {
                      const isExpanded = expandedId === msg.id;
                      const avatarColor = getAvatarColor(msg.name);
                      return (
                        <div
                          key={msg.id}
                          className={`msg-item ${msg.is_read ? 'read' : 'unread'}`}
                          onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                        >
                          <div className="msg-item-header">
                            {/* Avatar */}
                            <div className="msg-avatar" style={{background: avatarColor}}>
                              {getInitials(msg.name)}
                            </div>

                            {/* Meta */}
                            <div className="msg-meta">
                              <div className="msg-sender-row">
                                <span className="msg-sender-name">{msg.name}</span>
                                {!msg.is_read && <span className="msg-new-badge">Yeni</span>}
                                {msg.is_replied && <span className="msg-replied-badge"><i className="fas fa-check" style={{marginRight:'3px'}}/>Cevaplandı</span>}
                              </div>
                              <div className="msg-subject">
                                <span style={{color:'#9ca3af'}}>{msg.subject}</span>
                                <span style={{color:'#374151', margin:'0 6px'}}>—</span>
                                <span>{msg.message?.slice(0, 60)}{msg.message?.length > 60 ? '…' : ''}</span>
                              </div>
                            </div>

                            {/* Right controls */}
                            <div className="msg-item-right" onClick={e => e.stopPropagation()}>
                              
                              {/* ✨ YENİ: ID BURAYA ALINDI */}
                              <span 
                                className="msg-ticket-id" 
                                title="ID'yi Kopyala"
                                onClick={(e) => copyToClipboard(msg.id, e)}
                                style={{ marginRight: '10px' }}
                              >
                                ID: {msg.id}
                              </span>

                              <span className="msg-time" style={{marginRight: '10px'}}>{formatShortDate(msg.created_at)}</span>
                              
                              <button
                                className={`msg-action-btn starred`}
                                title={msg.is_starred ? 'Yıldızı Kaldır' : 'Yıldızla'}
                                onClick={e => toggleStarStatus(msg, e)}
                                style={{ color: msg.is_starred ? '#eab308' : 'var(--text-muted)' }}
                              >
                                <i className={msg.is_starred ? 'fas fa-star' : 'far fa-star'} />
                              </button>

                              <button
                                className="msg-action-btn block"
                                title="Bu mail adresini engelle (Spam)"
                                onClick={e => handleBlockEmail(msg.email, e)}
                              >
                                <i className="fas fa-ban" />
                              </button>

                              <button
                                className="msg-action-btn"
                                title={msg.is_read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                                onClick={e => toggleReadStatus(msg, e)}
                              >
                                <i className={`fas ${msg.is_read ? 'fa-envelope-open' : 'fa-envelope'}`} />
                              </button>
                              
                              <button
                                className="msg-action-btn delete"
                                title="Mesajı Sil"
                                onClick={e => deleteMessage(msg.id, e)}
                              >
                                <i className="fas fa-trash" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Body */}
                          {isExpanded && (
                            <div className="msg-body">
                              <div className="msg-body-inner">
                                <div className="msg-body-subject">
                                  <span>Konu: <span style={{color:'#f9fafb'}}>{msg.subject}</span></span>
                                  <span className="msg-full-date">{formatFullDate(msg.created_at)}</span>
                                </div>
                                <p className="msg-body-text">{msg.message}</p>
                                <div className="msg-body-footer">
                                  <a href={`mailto:${msg.email}`} className="msg-reply-link">
                                    <i className="fas fa-reply" />
                                    {msg.email} adresine yanıtla
                                  </a>
                                  
                                  <button 
                                    className="msg-mark-replied"
                                    onClick={e => toggleReplyStatus(msg, e)}
                                    style={{
                                      background: msg.is_replied ? 'rgba(34,197,94,0.1)' : 'transparent',
                                      color: msg.is_replied ? '#22c55e' : '#3b82f6',
                                      borderColor: msg.is_replied ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'
                                    }}
                                  >
                                    <i className={`fas ${msg.is_replied ? 'fa-check-double' : 'fa-check'}`} />
                                    {msg.is_replied ? 'Cevaplandı İşaretini Kaldır' : 'Cevaplandı Olarak İşaretle'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                )}

                {/* SONSUZ KAYDIRMA İÇİN TETİKLEYİCİ GÖSTERGE */}
                {currentView !== 'blocked' && hasMore && !searchQuery && (
                  <div ref={sentinelRef} className="load-more-indicator">
                    {loadingMore ? (
                      <>
                        <div className="loader-ring">
                          <div></div><div></div><div></div><div></div>
                        </div>
                        <div style={{marginTop:'8px'}}>Yükleniyor...</div>
                      </>
                    ) : (
                       <div style={{height: '20px'}}></div>
                    )}
                  </div>
                )}
                
              </div>

            </div>
          </main>
        </div>
      )}
    </>
  );
}