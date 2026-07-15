import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createAdminSupabase()

    // Fetch orders from the last 60 seconds
    const since = new Date(Date.now() - 60000).toISOString()

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, store_id, customer, total, status, cash_received, created_at, updated_at')
      .gte('updated_at', since)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Orders Realtime] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}