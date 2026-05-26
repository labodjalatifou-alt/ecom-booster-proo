import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token, platform, userId } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    
    const supabase = createAdminSupabase()
    
    // OnConflict doit matcher l'unique constraint sur la table fcm_tokens (la colonne "token")
    const { error } = await supabase.from('fcm_tokens').upsert({
      token,
      platform: platform || 'android',
      user_id: userId || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'token' })
    
    if (error) {
      console.error('Error inserting fcm_token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('register-token error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
