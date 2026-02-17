'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function RoadmapPage() {
  const [content, setContent] = useState({});

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {};
      data?.forEach(item => map[item.key] = item.value);
      setContent(map);
    });
  }, []);

  // ✨ YENİ: Yüzlerce satırlık HTML karmaşası ve yorum hatası (Hydration Error) yerine, 
  // tüm veriyi modern bir Array (Dizi) yapısına çevirdik. 
  const roadmapData = [
    { id: 1, name: "1. Proje Planlama ve Hazırlık Çalışmaları", active: [1] },
    { id: 2, name: "2. Proje Başlangıç Toplantısı", active: [2] },
    { id: 3, name: "3. Liepaja'ya Teknik Ziyaret", active: [5, 6] },
    { id: 4, name: "4. Cascais'e Teknik Ziyaret", active: [8, 9] },
    { id: 5, name: "5. İyi Uygulama Raporlarının Hazırlanması", active: [7, 10] },
    { id: 6, name: "6. Ara Raporların Hazırlanması ve Değerlendirme Toplantıları", active: [6, 9, 12, 15, 18, 21] },
    { id: 7, name: "7. Kapaklı Belediyesi SECAP Atölye Çalışması ve Hazırlık", active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
    { id: 8, name: "8. Kapaklı Belediyesi SECAP Bilgilendirme Toplantıları", active: [17, 24] },
    { id: 9, name: "9. NKÜ Hava Kirliliği Cihazı Temini, Montajı ve Ölçümü", active: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 10, name: "10. İyi Uygulama Verilerinin İncelenmesi ve E-Öğrenme Modülü", active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 11, name: "11. Kapaklı Mobil Uygulamasının Hazırlanması ve Entegrasyonu", active: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 12, name: "12. Liepaja Belediyesi Akıllı Atık Kutuları Temini", active: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 13, name: "13. Liepaja Mobil Uygulama Modülü Geliştirme", active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 14, name: "14. Kapaklı Belediyesi Geri Dönüşüm İade Makineleri Kurulumu", active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 15, name: "15. Liepaja Belediyesi E-Öğrenme Kursunun Oluşturulması", active: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { id: 16, name: "16. Vatandaşlara Yönelik Farkındalık Artırma Çalışmaları", active: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
    { id: 17, name: "17. Belediye Personeline Yönelik Farkındalık Artırma (Türkiye)", active: [19, 20, 21, 22, 23, 24] },
    { id: 18, name: "18. Bilgilendirici Materyallerin Hazırlanması", active: [19, 20, 21, 22, 23, 24] },
    { id: 19, name: "19. Belediye Saha Personeli İçin Eğitim Seminerleri", active: [19, 20, 21, 22, 23, 24] },
    { id: 20, name: "20. Vatandaş Etkinlikleri ve Uygulama Teşviki", active: [19, 20, 21, 22, 23, 24] },
    { id: 21, name: "21. Son Değerlendirme ve Kapanış Toplantısı", active: [24] }
  ];

  return (
    <div className="container-fluid" style={{ padding: '40px 20px', backgroundColor: '#fdfdfd' }}>
        
        {/* SAYFA BAŞLIĞI */}
        <div className="section-title text-center" style={{marginBottom:'40px'}}>
            <h1 style={{color:'#003399', marginBottom:'10px', fontSize:'2rem'}}>Proje Yol Haritası</h1>
            <p style={{fontSize:'1.1rem', color:'#666', fontWeight:'300'}}>24 Aylık Faaliyet Zaman Çizelgesi</p>
            <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'15px auto', borderRadius:'2px'}}></div>
        </div>

        {/* TABLO ALANI */}
        <div className="table-responsive">
            <table className="plan-table">
                <thead>
                    <tr>
                        <th className="task-header">FAALİYET / AY</th>
                        {/* 1'den 24'e kadar otomatik sütun başlığı oluşturur */}
                        {[...Array(24)].map((_, i) => (
                            <th key={i + 1}>{i + 1}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Verileri otomatik olarak satırlara döküyoruz */}
                    {roadmapData.map((task) => (
                        <tr key={task.id}>
                            <td className="task-name">{task.name}</td>
                            
                            {/* 24 ayı kontrol edip, aktif ay ise yeşil sınıfı veriyor */}
                            {[...Array(24)].map((_, i) => {
                                const month = i + 1;
                                const isActive = task.active.includes(month);
                                return (
                                    <td key={month} className={isActive ? "active" : ""}></td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* CSS STİLLERİ */}
        <style jsx>{`
            .table-responsive {
                width: 100%;
                overflow-x: auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                padding-bottom: 5px;
            }

            .plan-table {
                width: 100%;
                min-width: 900px; /* Mobilde kaydırma için min genişlik */
                border-collapse: collapse;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 0.8rem;
            }

            .plan-table th, .plan-table td {
                border: 1px solid #ddd;
                padding: 6px;
                text-align: center;
                vertical-align: middle;
            }

            /* Başlık Satırı */
            .plan-table thead th {
                background-color: #003399;
                color: white;
                font-weight: 600;
                padding: 10px 5px;
            }

            .plan-table .task-header {
                text-align: left;
                padding-left: 15px;
                width: 35%;
            }

            /* Faaliyet İsimleri */
            .plan-table .task-name {
                text-align: left;
                padding: 8px 15px;
                font-weight: 500;
                color: #333;
                background-color: #f9f9f9;
                width: 35%;
                line-height: 1.3;
            }

            /* Ay Sütunları */
            .plan-table td:not(.task-name) {
                width: 2.7%; /* Kalan %65'i 24'e bölerek yaklaşık değer */
                height: 30px;
            }

            /* Aktif Kutucuklar */
            .plan-table td.active {
                background-color: #27ae60; /* Proje rengi yeşil/mavi */
                border-color: #1e8449;
                position: relative;
            }

            /* Aktif kutucukların içine check işareti */
            .plan-table td.active::after {
                content: '';
                display: block;
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                margin: 0 auto;
                opacity: 0.5;
            }

            /* Satır Hover Efekti */
            .plan-table tr:hover .task-name {
                background-color: #eef2f7;
                color: #003399;
            }
        `}</style>
    </div>
  );
}