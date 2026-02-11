'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ContactPage() {
  const [info, setInfo] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setInfo(map);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setStatus(null);

      try {
          const { error } = await supabase.from('contact_messages').insert([formData]);
          if (error) throw error;
          setStatus('success');
          setFormData({ name: '', email: '', subject: '', message: '' }); // Formu temizle
      } catch (error) {
          console.error('Hata:', error);
          setStatus('error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <>
      <section className="page-header" style={{background: '#003399', color:'white', padding:'60px 0', textAlign:'center'}}>
          <div className="container">
              <h1>Bize Ulaşın</h1>
              <p>Sorularınız ve İşbirliği İçin</p>
          </div>
      </section>

      <section className="section-padding">
          <div className="container">
              <div className="contact-grid">
                  
                  {/* SOL TARAF: İLETİŞİM BİLGİLERİ */}
                  <div className="contact-info-card">
                      <h3 style={{marginBottom:'25px', borderBottom:'1px solid #eee', paddingBottom:'15px', color:'#003399'}}>İletişim Bilgileri</h3>
                      
                      <ul style={{fontSize:'1.1rem', listStyle:'none', padding:0}}>
                          <li className="info-item">
                              <div className="icon-box"><i className="fas fa-map-marker-alt"></i></div>
                              <div>
                                  <strong>Adres:</strong><br/>
                                  <span style={{color:'#555'}}>{info.contact_address || 'Yükleniyor...'}</span>
                              </div>
                          </li>
                          <li className="info-item">
                              <div className="icon-box"><i className="fas fa-envelope"></i></div>
                              <div>
                                  <strong>E-posta:</strong><br/>
                                  <a href={`mailto:${info.contact_email}`} style={{color:'#555'}}>{info.contact_email || 'Yükleniyor...'}</a>
                              </div>
                          </li>
                          <li className="info-item">
                              <div className="icon-box"><i className="fas fa-phone"></i></div>
                              <div>
                                  <strong>Telefon:</strong><br/>
                                  <span style={{color:'#555'}}>{info.contact_phone || 'Yükleniyor...'}</span>
                              </div>
                          </li>
                      </ul>

                      {/* SOSYAL MEDYA LOGOLARI */}
                      <div style={{marginTop:'40px', paddingTop:'20px', borderTop:'1px solid #eee'}}>
                          <h5 style={{marginBottom:'20px', color:'#333'}}>Bizi Takip Edin</h5>
                          <div style={{display:'flex', gap:'15px'}}>
                              
                              {/* Facebook */}
                              {info.social_facebook && (
                                <a href={info.social_facebook} target="_blank" className="social-icon" title="Facebook">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                              )}

                              {/* Twitter / X */}
                              {info.social_twitter && (
                                <a href={info.social_twitter} target="_blank" className="social-icon" title="Twitter / X">
                                    <i className="fab fa-twitter"></i>
                                </a>
                              )}

                              {/* Instagram */}
                              {info.social_instagram && (
                                <a href={info.social_instagram} target="_blank" className="social-icon" title="Instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                              )}

                              {/* Eğer hiç link girilmemişse */}
                              {(!info.social_facebook && !info.social_twitter && !info.social_instagram) && (
                                <span style={{color:'#999', fontSize:'0.9rem', fontStyle:'italic'}}>Sosyal medya hesapları henüz eklenmemiş.</span>
                              )}

                          </div>
                      </div>
                  </div>

                  {/* SAĞ TARAF: İLETİŞİM FORMU */}
                  <div className="contact-form-card">
                      <h3 style={{marginBottom:'25px', color:'#333'}}>Mesaj Gönderin</h3>
                      
                      {status === 'success' && (
                          <div style={{background:'#d4edda', color:'#155724', padding:'15px', borderRadius:'5px', marginBottom:'20px', border:'1px solid #c3e6cb'}}>
                              <i className="fas fa-check-circle"></i> Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.
                          </div>
                      )}
                      
                      {status === 'error' && (
                          <div style={{background:'#f8d7da', color:'#721c24', padding:'15px', borderRadius:'5px', marginBottom:'20px', border:'1px solid #f5c6cb'}}>
                              <i className="fas fa-exclamation-circle"></i> Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
                          </div>
                      )}

                      <form onSubmit={handleSubmit}>
                          <div className="form-group">
                              <label>Adınız Soyadınız</label>
                              <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} placeholder="Adınız" />
                          </div>
                          <div className="form-group">
                              <label>E-posta Adresiniz</label>
                              <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} placeholder="ornek@email.com" />
                          </div>
                          <div className="form-group">
                              <label>Konu</label>
                              <input type="text" name="subject" className="form-control" required value={formData.subject} onChange={handleChange} placeholder="Mesajınızın konusu" />
                          </div>
                          <div className="form-group">
                              <label>Mesajınız</label>
                              <textarea name="message" className="form-control" rows="5" required value={formData.message} onChange={handleChange} placeholder="Mesajınızı buraya yazın..."></textarea>
                          </div>
                          <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%', padding:'12px', fontWeight:'bold'}}>
                              {loading ? 'Gönderiliyor...' : 'MESAJI GÖNDER'}
                          </button>
                      </form>
                  </div>

              </div>
          </div>

          <style jsx>{`
              .contact-grid {
                  display: grid;
                  grid-template-columns: 1fr 1.5fr;
                  gap: 30px;
                  max-width: 1100px;
                  margin: 0 auto;
              }
              .contact-info-card, .contact-form-card {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
                  border: 1px solid #eee;
              }
              .info-item {
                  margin-bottom: 25px;
                  display: flex;
                  gap: 15px;
                  align-items: flex-start;
              }
              .icon-box {
                  width: 40px;
                  height: 40px;
                  background: #eef2f7;
                  color: #003399;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 1.2rem;
                  flex-shrink: 0;
              }
              .form-group { margin-bottom: 20px; }
              .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #555; }
              .form-control {
                  width: 100%;
                  padding: 12px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  font-size: 1rem;
                  transition: border-color 0.3s;
              }
              .form-control:focus {
                  outline: none;
                  border-color: #003399;
              }
              
              /* SOSYAL MEDYA BUTONLARI - GÜNCELLENDİ */
              .social-icon {
                  width: 45px;
                  height: 45px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 1.2rem;
                  transition: all 0.3s;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                  text-decoration: none;
                  background: #155724; /* İstenilen Renk */
              }
              .social-icon:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 6px 15px rgba(21, 87, 36, 0.3);
                  background: #1e7e34; /* Hover durumunda hafif açılma */
              }

              @media (max-width: 768px) {
                  .contact-grid { grid-template-columns: 1fr; }
              }
          `}</style>
      </section>
    </>
  );
}