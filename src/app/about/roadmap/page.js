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

  return (
    <div className="container-fluid" style={{ padding: '40px 20px', backgroundColor: '#fdfdfd' }}>
        
        {/* SAYFA BAŞLIĞI */}
        <div className="section-title text-center" style={{marginBottom:'40px'}}>
            <h1 style={{color:'#003399', marginBottom:'10px', fontSize:'2rem'}}>III. Proje Yol Haritası</h1>
            <p style={{fontSize:'1.1rem', color:'#666', fontWeight:'300'}}>24 Aylık Faaliyet Zaman Çizelgesi</p>
            <div style={{width:'60px', height:'4px', background:'#27ae60', margin:'15px auto', borderRadius:'2px'}}></div>
        </div>

        {/* TABLO ALANI */}
        <div className="table-responsive">
            <table className="plan-table">
                <thead>
                    <tr>
                        <th className="task-header">FAALİYET / AY</th>
                        {/* Sütun Başlıkları 1-24 */}
                        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                        <th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th>
                        <th>13</th><th>14</th><th>15</th><th>16</th><th>17</th><th>18</th>
                        <th>19</th><th>20</th><th>21</th><th>22</th><th>23</th><th>24</th>
                    </tr>
                </thead>
                <tbody>
                    
                    {/* 1. Satır: Proje Planlama */}
                    <tr>
                        <td className="task-name">1. Proje Planlama ve Hazırlık Çalışmaları</td>
                        <td className="active"></td> {/* 1. Ay */}
                        <td ></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 2. Satır: Başlangıç Toplantısı */}
                    <tr>
                        <td className="task-name">2. Proje Başlangıç Toplantısı</td>
                        <td></td> {/* 1. Ay */}
                        <td className="active"></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 3. Satır: Liepaja Ziyaret */}
                    <tr>
                        <td className="task-name">3. Liepaja'ya Teknik Ziyaret</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td ></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 4. Satır: Cascais Ziyaret */}
                    <tr>
                        <td className="task-name">4. Cascais'e Teknik Ziyaret</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td  className="active"></td> {/* 8. Ay */}
                        <td  className="active"></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 5. Satır: İyi Uygulama Raporları */}
                    <tr>
                        <td className="task-name">5. İyi Uygulama Raporlarının Hazırlanması</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td ></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 6. Satır: Ara Raporlar */}
                    <tr>
                        <td className="task-name">6. Ara Raporların Hazırlanması ve Değerlendirme Toplantıları</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td className="active"  ></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 7. Satır: SECAP Atölye */}
                    <tr>
                        <td className="task-name">7. Kapaklı Belediyesi SECAP Atölye Çalışması ve Hazırlık</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                       <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 8. Satır: SECAP Bilgilendirme */}
                    <tr>
                        <td className="task-name">8. Kapaklı Belediyesi SECAP Bilgilendirme Toplantıları</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td ></td> {/* 11. Ay */}
                        <td ></td> {/* 12. Ay */}
                        <td ></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 9. Satır: NKÜ Hava Cihazı */}
                    <tr>
                        <td className="task-name">9. NKÜ Hava Kirliliği Cihazı Temini, Montajı ve Ölçümü</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td className="active"></td> {/* 3. Ay */}
                        <td className="active"></td> {/* 4. Ay */}
                        <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 10. Satır: Veri İnceleme & E-Öğrenme */}
                    <tr>
                        <td className="task-name">10. İyi Uygulama Verilerinin İncelenmesi ve E-Öğrenme Modülü</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 11. Satır: Kapaklı Mobil Uygulama */}
                    <tr>
                        <td className="task-name">11. Kapaklı Mobil Uygulamasının Hazırlanması ve Entegrasyonu</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td className="active"></td> {/* 3. Ay */}
                        <td className="active"></td> {/* 4. Ay */}
                        <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 12. Satır: Liepaja Akıllı Kutu */}
                    <tr>
                        <td className="task-name">12. Liepaja Belediyesi Akıllı Atık Kutuları Temini</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                         <td className="active"></td> {/* 4. Ay */}
                        <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 13. Satır: Liepaja Mobil Modül */}
                    <tr>
                        <td className="task-name">13. Liepaja Mobil Uygulama Modülü Geliştirme</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                       <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 14. Satır: Geri Dönüşüm Makineleri */}
                    <tr>
                        <td className="task-name">14. Kapaklı Belediyesi Geri Dönüşüm İade Makineleri Kurulumu</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                       <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 15. Satır: E-Öğrenme Kursu */}
                    <tr>
                        <td className="task-name">15. Liepaja Belediyesi E-Öğrenme Kursunun Oluşturulması</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                       <td className="active"></td> {/* 5. Ay */}
                        <td className="active"></td> {/* 6. Ay */}
                        <td className="active"></td> {/* 7. Ay */}
                        <td className="active"></td> {/* 8. Ay */}
                        <td className="active"></td> {/* 9. Ay */}
                        <td className="active"></td> {/* 10. Ay */}
                        <td className="active"></td> {/* 11. Ay */}
                        <td className="active"></td> {/* 12. Ay */}
                        <td className="active"></td> {/* 13. Ay */}
                        <td className="active"></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td></td> {/* 24. Ay */}
                    </tr>

                    {/* 16. Satır: Vatandaş Farkındalık */}
                    <tr>
                        <td className="task-name">16. Vatandaşlara Yönelik Farkındalık Artırma Çalışmaları</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td className="active"></td> {/* 15. Ay */}
                        <td className="active"></td> {/* 16. Ay */}
                        <td className="active"></td> {/* 17. Ay */}
                        <td className="active"></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 17. Satır: Personel Farkındalık */}
                    <tr>
                        <td className="task-name">17. Belediye Personeline Yönelik Farkındalık Artırma (Türkiye)</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                         <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 18. Satır: Materyal Hazırlama */}
                    <tr>
                        <td className="task-name">18. Bilgilendirici Materyallerin Hazırlanması</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td ></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td ></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td ></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td ></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td ></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td ></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                         <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 19. Satır: Saha Personeli Eğitim */}
                    <tr>
                        <td className="task-name">19. Belediye Saha Personeli İçin Eğitim Seminerleri</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 20. Satır: Teşvik Faaliyetleri */}
                    <tr>
                        <td className="task-name">20. Vatandaş Etkinlikleri ve Uygulama Teşviki</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                         <td className="active"></td> {/* 19. Ay */}
                        <td className="active"></td> {/* 20. Ay */}
                        <td className="active"></td> {/* 21. Ay */}
                        <td className="active"></td> {/* 22. Ay */}
                        <td className="active"></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

                    {/* 21. Satır: Kapanış */}
                    <tr>
                        <td className="task-name">21. Son Değerlendirme ve Kapanış Toplantısı</td>
                        <td></td> {/* 1. Ay */}
                        <td></td> {/* 2. Ay */}
                        <td></td> {/* 3. Ay */}
                        <td></td> {/* 4. Ay */}
                        <td></td> {/* 5. Ay */}
                        <td></td> {/* 6. Ay */}
                        <td></td> {/* 7. Ay */}
                        <td></td> {/* 8. Ay */}
                        <td></td> {/* 9. Ay */}
                        <td></td> {/* 10. Ay */}
                        <td></td> {/* 11. Ay */}
                        <td></td> {/* 12. Ay */}
                        <td></td> {/* 13. Ay */}
                        <td></td> {/* 14. Ay */}
                        <td></td> {/* 15. Ay */}
                        <td></td> {/* 16. Ay */}
                        <td></td> {/* 17. Ay */}
                        <td></td> {/* 18. Ay */}
                        <td></td> {/* 19. Ay */}
                        <td></td> {/* 20. Ay */}
                        <td></td> {/* 21. Ay */}
                        <td></td> {/* 22. Ay */}
                        <td></td> {/* 23. Ay */}
                        <td className="active"></td> {/* 24. Ay */}
                    </tr>

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

            /* Aktif kutucukların içine check işareti (isteğe bağlı, şıklık katar) */
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