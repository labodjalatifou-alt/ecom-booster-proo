import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'

/**
 * API liste des commandes (admin panel).
 * Utilise le client admin pour bypass RLS.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')
    const storeIds = searchParams.get('store_ids')
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('page_size') || '30', 10)

    const supabase = createAdminSupabase()

    // Count
    let countQuery = supabase.from('orders').select('*', { count: 'exact', head: true })
    if (storeId) {
      countQuery = countQuery.eq('store_id', storeId)
    } else if (storeIds) {
      const ids = storeIds.split(',').filter(Boolean)
      if (ids.length > 0) countQuery = countQuery.in('store_id', ids)
    }
    if (status && status !== 'ALL') countQuery = countQuery.eq('status', status)
    if (from) countQuery = countQuery.gte('created_at', from)
    if (to) countQuery = countQuery.lte('created_at', to)

    const { count } = await countQuery

    // Data
    const rangeFrom = (page - 1) * pageSize
    const rangeTo = rangeFrom + pageSize - 1
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(rangeFrom, rangeTo)

    if (storeId) {
      query = query.eq('store_id', storeId)
    } else if (storeIds) {
      const ids = storeIds.split(',').filter(Boolean)
      if (ids.length > 0) query = query.in('store_id', ids)
    }
    if (status && status !== 'ALL') query = query.eq('status', status)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: data || [], total: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
