'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function BudgetPage() {
  const [content, setContent] = useState({});

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map = {};
      data?.forEach(item => map[item.key] = item.value);
      setContent(map);
    });
  }, []);

  return (
    <div className="container section-padding">
        <h1 style={{color:'#003399', marginBottom:'30px', textAlign:'center'}}>Bütçe ve Proje Künyesi</h1>
        
        <div style={{maxWidth:'800px', margin:'0 auto', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderRadius:'15px', overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <tbody>
                    {[
                        { label: 'Proje Adı', key: 'about_project_name' },
                        { label: 'Proje Kısaltması', key: 'about_project_code' },
                        { label: 'Program', key: 'about_project_program' },
                        { label: 'Süresi', key: 'about_project_duration' },
                        { label: 'Toplam Bütçe', key: 'about_project_budget' }
                    ].map((item, index) => (
                        <tr key={index} style={{borderBottom:'1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                            <td style={{padding:'20px', fontWeight:'bold', color:'#333', width:'35%'}}>{item.label}</td>
                            <td style={{padding:'20px', color:'#555'}}>{content[item.key] || '...'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}