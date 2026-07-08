import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import {
  buildStorePage,
  getBoutiqueTheme,
  toStoreColors,
  toStoreFonts,
} from '@/lib/store-builder/boutique-themes'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const themeId = typeof body.theme_id === 'string' ? body.theme_id : 'nature-vert'
    const productId = typeof body.product_id === 'string' ? body.product_id : null

    if (!name || !slug) {
      return NextResponse.json({ error: 'Le nom et le slug sont requis.' }, { status: 400 })
    }

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const supabaseAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false }
      }
    )

    let userId = null

    if (token) {
      const { data: authData } = await supabaseAuth.auth.getUser(token)
      userId = authData?.user?.id ?? null
    }

    const supabase = createAdminSupabase()

    async function ensureUserProfile(id: string, email: string | null, name: string | null) {
      const { data: existingUser, error: existingError } = await supabase
        .from('User')
        .select('id')
        .eq('id', id)
        .maybeSingle()

      if (existingError) {
        return { error: existingError }
      }

      if (existingUser?.id) {
        return { id: existingUser.id }
      }

      const { data: newUser, error: createUserError } = await supabase
        .from('User')
        .insert({
          id,
          email: email ?? `guest-${Date.now()}@local`,
          name: name ?? 'Utilisateur',
          role: 'CLOSER',
          commissionPerConfirm: 0,
          commissionPerDeliver: 0,
          earnings: 0,
        })
        .select('id')
        .single()

      return { id: newUser?.id ?? null, error: createUserError }
    }

    if (userId) {
      const { data: authData } = await supabaseAuth.auth.getUser(token!)
      const { id: ensuredId, error: profileError } = await ensureUserProfile(
        userId,
        authData?.user?.email ?? null,
        authData?.user?.user_metadata?.name ?? authData?.user?.email ?? null
      )

      if (profileError) {
        return NextResponse.json({ error: profileError.message ?? 'Erreur lors de la validation du profil utilisateur.' }, { status: 500 })
      }

      userId = ensuredId
    }

    if (!userId) {
      const { data: guestUser, error: guestError } = await supabase
        .from('User')
        .select('id')
        .eq('email', 'guest@local')
        .maybeSingle()

      if (guestError) {
        return NextResponse.json({ error: guestError.message ?? "Erreur lors de la recherche de l'utilisateur invité." }, { status: 500 })
      }

      if (guestUser?.id) {
        userId = guestUser.id
      } else {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: `guest-${Date.now()}@local.dev`,
          password: randomUUID(),
          email_confirm: true,
          user_metadata: { name: 'Invité' }
        })
        
        if (authError || !authUser?.user) {
          return NextResponse.json({ error: authError?.message ?? "Impossible de créer l'utilisateur invité." }, { status: 500 })
        }

        const newGuestId = authUser.user.id

        const { data: newUser, error: createUserError } = await supabase
          .from('User')
          .insert({
            id: newGuestId,
            email: authUser.user.email,
            name: 'Invité',
            role: 'CLOSER',
            commissionPerConfirm: 0,
            commissionPerDeliver: 0,
            earnings: 0,
          })
          .select('id')
          .single()

        if (createUserError || !newUser?.id) {
          return NextResponse.json({ error: createUserError?.message ?? "Impossible d'initialiser le profil invité." }, { status: 500 })
        }

        userId = newUser.id
      }
    }

    const theme = getBoutiqueTheme(themeId)
    const builderJson = buildStorePage(theme.id, name, productId)

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ name, slug, status: 'draft', user_id: userId })
      .select()
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        {
          error: storeError?.message?.includes('duplicate') || storeError?.message?.includes('unique')
            ? 'Ce slug est déjà utilisé. Choisissez-en un autre.'
            : storeError?.message ?? 'Impossible de créer la boutique.',
        },
        { status: 500 }
      )
    }

    const { error: settingsError } = await supabase.from('store_settings').insert({
      store_id: store.id,
      theme_id: theme.id,
      colors: toStoreColors(theme),
      fonts: toStoreFonts(theme),
      pixels: { meta: '', tiktok: '', google: '' },
      custom_css: '',
    })

    if (settingsError) {
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: settingsError.message ?? 'Impossible de créer les paramètres de la boutique.' }, { status: 500 })
    }

    const { error: pageError } = await supabase.from('store_pages').insert({
      store_id: store.id,
      slug: 'home',
      title: 'Accueil',
      builder_json: builderJson,
      is_published: false,
    })

    if (pageError) {
      await supabase.from('store_settings').delete().eq('store_id', store.id)
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: pageError.message ?? 'Impossible de créer la page d'accueil.' }, { status: 500 })
    }

    return NextResponse.json({ data: store })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la boutique.' }, { status: 500 })
  }
}
