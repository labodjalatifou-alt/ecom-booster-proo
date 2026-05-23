import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { token, userId, platform } = await req.json();

    if (!token || !userId) {
      return NextResponse.json({ error: "Missing token or userId" }, { status: 400 });
    }

    // Insert or update the native push subscription
    // We reuse the `push_subscriptions` table, but store the FCM token in the `endpoint` field
    // or create a new row with a marker to differentiate native vs web push.
    // For simplicity, we can store it with a unique flag or just endpoint = 'FCM://' + token
    
    const endpoint = `fcm://${token}`;

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        p256dh: platform || 'android',
        auth: 'native',
        created_at: new Date().toISOString()
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Supabase error inserting native subscription:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscribe Native API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
