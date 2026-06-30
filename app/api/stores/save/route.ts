import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { storeId, builderJson, isPublished, status } = body

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    // 1) Sauvegarde ou mise à jour de la page de la boutique
    if (builderJson) {
      const updateData: any = {
        builder_json: builderJson,
        updated_at: new Date().toISOString(),
      }
      
      if (typeof isPublished === 'boolean') {
        updateData.is_published = isPublished
      }

      const { error: pageError } = await supabase
        .from('store_pages')
        .update(updateData)
        .eq('store_id', storeId)
        .eq('slug', 'home')

      if (pageError) {
        console.error('[API Save] Error saving store page:', pageError)
        return NextResponse.json({ error: `Erreur lors de la sauvegarde de la page : ${pageError.message}` }, { status: 500 })
      }
    }

    // 2) Mise à jour du statut de la boutique
    if (status) {
      const { error: storeError } = await supabase
        .from('stores')
        .update({ status })
        .eq('id', storeId)

      if (storeError) {
        console.error('[API Save] Error saving store status:', storeError)
        return NextResponse.json({ error: `Erreur lors de la mise à jour du statut : ${storeError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API Save] Unexpected error:', error)
    return NextResponse.json({ error: `Erreur serveur inattendue : ${error.message}` }, { status: 500 })
  }
}
