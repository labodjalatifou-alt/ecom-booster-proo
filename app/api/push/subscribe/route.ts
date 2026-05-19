import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: "Missing subscription or userId" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: "Invalid subscription details" }, { status: 400 });
    }

    const { p256dh, auth } = keys;

    // Save subscription in push_subscriptions table
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint,
        p256dh,
        auth,
      }, { onConflict: 'endpoint' })
      .select()
      .single();

    if (error) {
      console.error('Error saving subscription in database:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Push Subscribe API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
