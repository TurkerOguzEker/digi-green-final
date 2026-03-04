// src/app/api/analytics/route.js
export const dynamic = 'force-dynamic'; 

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    // 1. Anlık Kullanıcı
    const [realtime] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });
    const activeUsers = realtime.rows?.[0]?.metricValues?.[0]?.value || '0';

    // 2. Bugün & Toplam & Yeni Kullanıcılar
    const [generalStats] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' }, 
        { name: 'totalUsers' },      
        { name: 'newUsers' }         
      ],
    });
    const totalViews = generalStats.rows?.[0]?.metricValues?.[0]?.value || '0';
    const totalUsers = generalStats.rows?.[0]?.metricValues?.[1]?.value || '0';
    const newUsers = generalStats.rows?.[0]?.metricValues?.[2]?.value || '0';

    // 3. Son 7 Günlük Trafik Trendi
    const [trend] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '6daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'dayOfWeek' }, { name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
    });

    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const sortedTrend = trend.rows?.sort((a, b) => a.dimensionValues[1].value.localeCompare(b.dimensionValues[1].value)) || [];
    const trendData = sortedTrend.map(row => ({
        gun: dayNames[parseInt(row.dimensionValues[0].value, 10)],
        mesaj: parseInt(row.metricValues[0].value, 10)
    }));

    // 4. Cihaz Dağılımı
    const [devices] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    });
    
    const deviceData = devices.rows?.map(row => {
      let name = row.dimensionValues[0].value;
      let color = '#3b82f6'; 
      if(name.toLowerCase() === 'mobile') { name = 'Mobil'; color = '#22c55e'; }
      if(name.toLowerCase() === 'desktop') { name = 'Masaüstü'; color = '#3b82f6'; }
      if(name.toLowerCase() === 'tablet') { name = 'Tablet'; color = '#f59e0b'; }
      
      return {
        name: name,
        value: parseInt(row.metricValues[0].value, 10),
        color: color
      };
    }) || [];

    // 5. En Çok Ziyaret Edilen Sayfalar (SADECE HABER VE FAALİYET İÇERİKLERİ)
    const [pages] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        orGroup: {
          expressions: [
            // Sadece /news/ ve /activities/ ile BAŞLAYAN (içerik barındıran) linkleri getir
            { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/news/' } } },
            { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/activities/' } } }
          ]
        }
      },
      limit: 25 // Süzme işleminden sonra sayı düşmesin diye fazla çekiyoruz
    });

    const topPages = pages.rows
      ?.filter(row => {
        const path = row.dimensionValues[0].value;
        // KESİN KONTROL: Ana sayfaları listeye sokma, sadece içeriği olanları al
        if (path === '/news' || path === '/news/' || path === '/activities' || path === '/activities/') {
            return false;
        }
        return true;
      })
      .slice(0, 5) // En popüler 5 tanesini seç
      .map(row => {
        return {
          path: row.dimensionValues[0].value,
          title: row.dimensionValues[1].value, // Google Analytics'teki gerçek sayfa başlığı
          views: parseInt(row.metricValues[0].value, 10)
        };
      }) || [];

    return NextResponse.json({
      activeUsers: parseInt(activeUsers, 10),
      totalViews: parseInt(totalViews, 10),
      totalUsers: parseInt(totalUsers, 10),
      newUsers: parseInt(newUsers, 10),
      trendData,
      deviceData,
      topPages
    });

  } catch (error) {
    console.error('GA API Hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
