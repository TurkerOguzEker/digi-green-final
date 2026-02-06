'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      {/* --- SAYFA BAŞLIĞI --- */}
      <section className="page-header" style={{background: '#003399', color:'white', padding:'80px 0', textAlign:'center'}}>
          <div className="container">
              <h1 style={{fontSize:'2.5rem', fontWeight:'700', marginBottom:'15px'}}>Proje Detayları</h1>
              <p style={{fontSize:'1.2rem', opacity:'0.9'}}>Vatandaş Odaklı Yerel Yeşil Gelecek İçin Dijital Dönüşüm</p>
          </div>
      </section>

      {/* --- VİZYON VE GEREKÇE --- */}
      <section className="section-padding">
          <div className="container">
              <div className="about-content-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'50px', alignItems:'center'}}>
                  
                  {/* Sol: Metin */}
                  <div className="about-text">
                      <span style={{color:'#27ae60', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px', fontSize:'0.9rem'}}>Stratejik Bakış</span>
                      <h2 style={{fontSize:'2rem', margin:'10px 0 20px 0', color:'#003399'}}>Vizyon ve Gerekçe</h2>
                      <p style={{marginBottom:'15px', lineHeight:'1.7', color:'#555'}}>
                          <strong>DIGI-GREEN FUTURE</strong>, Kapaklı Belediyesi liderliğinde yürütülen ve Erasmus+ KA220-ADU programı kapsamında desteklenen stratejik bir projedir. 
                          Projemiz, iklim değişikliği ile mücadele ve dijital dönüşüm gerekliliklerini tek bir potada eritmeyi hedefler.
                      </p>
                      <p style={{marginBottom:'20px', lineHeight:'1.7', color:'#555'}}>
                          Yerel yönetimlerin dijital dönüşümünü çevresel sürdürülebilirlik hedefleriyle birleştirerek, vatandaşların karar alma süreçlerine katılımını artırmayı ve "Yeşil Yetkinliklerini" geliştirmeyi amaçlıyoruz.
                      </p>
                      
                      <div style={{marginTop:'30px'}}>
                          <Link href="/contact" className="btn btn-primary">Bize Katılın</Link>
                      </div>
                  </div>

                  {/* Sağ: Resim */}
                  <div className="about-image">
                      <img 
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80" 
                        alt="Yeşil Şehir" 
                        style={{width:'100%', borderRadius:'15px', boxShadow:'0 15px 40px rgba(0,0,0,0.15)'}} 
                      />
                  </div>
              </div>
          </div>
      </section>

      {/* --- HEDEF KİTLE (YENİ EKLENDİ) --- */}
      <section className="section-padding bg-light">
          <div className="container">
              <div className="section-title text-center" style={{marginBottom:'50px'}}>
                  <span className="sub-title" style={{color:'#27ae60', fontWeight:'bold'}}>Hedef Kitle</span>
                  <h2 style={{fontSize:'2.2rem', color:'#003399'}}>Kimler İçin Çalışıyoruz?</h2>
                  <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'15px auto', borderRadius:'2px'}}></div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'30px'}}>
                  {/* Kart 1 */}
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', textAlign:'center'}}>
                      <div style={{width:'70px', height:'70px', background:'rgba(39, 174, 96, 0.1)', color:'#27ae60', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 20px'}}>
                          <i className="fas fa-users"></i>
                      </div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Yerel Halk & Yetişkinler</h3>
                      <p style={{color:'#666'}}>Dijital okuryazarlık ve çevre bilincini artırmak isteyen tüm vatandaşlar.</p>
                  </div>

                  {/* Kart 2 */}
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', textAlign:'center'}}>
                      <div style={{width:'70px', height:'70px', background:'rgba(0, 51, 153, 0.1)', color:'#003399', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 20px'}}>
                          <i className="fas fa-building"></i>
                      </div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Belediye Personeli</h3>
                      <p style={{color:'#666'}}>Yeşil dönüşüm süreçlerini yönetecek ve dijital araçları kullanacak kamu çalışanları.</p>
                  </div>

                  {/* Kart 3 */}
                  <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', textAlign:'center'}}>
                      <div style={{width:'70px', height:'70px', background:'rgba(255, 204, 0, 0.1)', color:'#f1c40f', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 20px'}}>
                          <i className="fas fa-chalkboard-teacher"></i>
                      </div>
                      <h3 style={{fontSize:'1.3rem', marginBottom:'15px'}}>Eğitimciler & STK'lar</h3>
                      <p style={{color:'#666'}}>Çevre ve dijitalleşme alanında farkındalık yaratmayı hedefleyen kurumlar.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- BEKLENEN ETKİLER (YENİ EKLENDİ) --- */}
      <section className="section-padding">
          <div className="container">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'50px', alignItems:'center'}}>
                  <div style={{order:2}}>
                      <span style={{color:'#27ae60', fontWeight:'bold'}}>Sonuç Odaklı Yaklaşım</span>
                      <h2 style={{fontSize:'2.2rem', color:'#003399', margin:'10px 0 20px'}}>Projeden Beklenen Etkiler</h2>
                      <p style={{color:'#555', marginBottom:'20px'}}>
                          DIGI-GREEN FUTURE, sadece teorik bir çalışma değil, sahada somut değişiklikler yaratmayı hedefleyen bir eylem planıdır.
                      </p>
                      <ul style={{listStyle:'none', padding:0}}>
                          <li style={{marginBottom:'15px', display:'flex', gap:'15px', alignItems:'start'}}>
                              <i className="fas fa-check-circle" style={{color:'#27ae60', marginTop:'5px', fontSize:'1.2rem'}}></i>
                              <div><strong>Dijital Beceriler:</strong> Yetişkinlerin dijital araçları kullanarak çevresel sorunlara çözüm üretme kapasitesinin artırılması.</div>
                          </li>
                          <li style={{marginBottom:'15px', display:'flex', gap:'15px', alignItems:'start'}}>
                              <i className="fas fa-check-circle" style={{color:'#27ae60', marginTop:'5px', fontSize:'1.2rem'}}></i>
                              <div><strong>Karbon Ayak İzi:</strong> Mobil uygulamalar sayesinde bireysel karbon ayak izinin takibi ve azaltılması.</div>
                          </li>
                          <li style={{marginBottom:'15px', display:'flex', gap:'15px', alignItems:'start'}}>
                              <i className="fas fa-check-circle" style={{color:'#27ae60', marginTop:'5px', fontSize:'1.2rem'}}></i>
                              <div><strong>Katılımcı Yönetişim:</strong> Vatandaşların belediye ile dijital kanallar üzerinden daha aktif iletişim kurması.</div>
                          </li>
                      </ul>
                  </div>
                  <div style={{order:1}}>
                       {/* Buraya bir infografik veya istatistik kutusu gelebilir */}
                       <div style={{background:'#0a1f44', padding:'40px', borderRadius:'15px', color:'white'}}>
                           <h3 style={{borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'15px', marginBottom:'20px'}}>Proje Takvimi</h3>
                           <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                               <div style={{fontSize:'2rem', fontWeight:'bold', color:'#FFCC00'}}>24</div>
                               <div>
                                   <div style={{fontWeight:'bold'}}>Ay Süre</div>
                                   <div style={{fontSize:'0.9rem', opacity:0.8}}>1 Kasım 2025 - 31 Ekim 2027</div>
                               </div>
                           </div>
                           <div style={{display:'flex', gap:'20px'}}>
                               <div style={{fontSize:'2rem', fontWeight:'bold', color:'#27ae60'}}>€250K</div>
                               <div>
                                   <div style={{fontWeight:'bold'}}>Toplam Bütçe</div>
                                   <div style={{fontSize:'0.9rem', opacity:0.8}}>Erasmus+ Hibe Desteği</div>
                               </div>
                           </div>
                       </div>
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}