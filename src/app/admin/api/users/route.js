import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { action, id, email, password, role, is_blocked } = await request.json();

    if (action === 'CREATE') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });
      if (error) throw error;
      
      await supabaseAdmin.from('user_profiles').update({ role: role }).eq('id', data.user.id);
      return NextResponse.json({ success: true });
    } 
    
    if (action === 'UPDATE') {
      const banDuration = is_blocked ? '876000h' : 'none'; 
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: banDuration });
      
      const { error } = await supabaseAdmin.from('user_profiles').update({ role, is_blocked }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'DELETE') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}