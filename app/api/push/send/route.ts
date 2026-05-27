import { NextRequest, NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'
import { createAdminSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { title, body, url, userId } = await req.json()
    
    const supabase = createAdminSupabase()
    
    // Récupérer tous les tokens (ou ceux d'un user spécifique)
    const query = supabase.from('fcm_tokens').select('token')
    if (userId) query.eq('user_id', userId)
    
    const { data: tokens, error } = await query
    
    if (error) {
      console.error('Error fetching tokens:', error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ sent: 0 })
    }
    
    // Envoyer à tous les appareils
    const results = await Promise.allSettled(
      tokens.map(({ token }) =>
        admin.messaging().send({
          token,
          notification: { title, body },
          data: { url: url || '/commandes' },
          android: {
            priority: 'high',
            notification: {
              channelId: 'ecom_booster_orders',
              sound: 'default',
              priority: 'max',
              defaultVibrateTimings: true,
            },
          },
        })
      )
    )
    
    const sent = results.filter(r => r.status === 'fulfilled').length
    
    // Optional: Log errors for the failed ones
    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        console.error(`Failed to send to token ${tokens[idx].token}:`, r.reason);
      }
    });

    return NextResponse.json({ sent, total: tokens.length })
  } catch (err: any) {
    console.error('push/send error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
