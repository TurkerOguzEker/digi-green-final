// Yeni Kullanıcı veya Güncelleme İşlemi
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: userModal.mode === 'add' ? 'CREATE' : 'UPDATE',
          ...userModal.data
        })
      });

      // Gelen yanıtın JSON olup olmadığını kontrol et
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Bilinmeyen bir hata olustu.');
      } else {
        throw new Error('API Baglantisi kurulamadi. Lütfen "src/app/api/admin/users/route.js" dosyasini kontrol edin ve sunucuyu yeniden baslatin.');
      }
      
      showToast(userModal.mode === 'add' ? 'Kullanici basariyla olusturuldu.' : 'Kullanici guncellendi.', 'success');
      setUserModal({ ...userModal, isOpen: false });
      fetchPageData();
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Silme İşlemi
  const handleDeleteUser = (id) => {
    showConfirm('Bu kullaniciyi ve tum yetkilerini kalici olarak silmek istediginize emin misiniz?', async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE', id })
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await res.json();
          if (!res.ok) throw new Error(result.error);
        } else {
          throw new Error('API Baglantisi kurulamadi.');
        }
        
        showToast('Kullanici silindi.', 'success');
        setUsersList(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
      }
      closeConfirm();
    });
  };