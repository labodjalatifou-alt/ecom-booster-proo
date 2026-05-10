import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, message, target_role, target_user_id, order_id, store_id } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "type, title, message sont requis" }, { status: 400 });
    }

    const { data, error } = await supabase.from('notifications').insert({
      type,
      title,
      message,
      target_role: target_role || 'ADMIN',
      target_user_id: target_user_id || null,
      order_id: order_id || null,
      store_id: store_id || null,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, read } = await req.json();
    
    if (id === 'all') {
      // Marquer toutes comme lues
      const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const { error } = await supabase.from('notifications').update({ read: read ?? true }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
