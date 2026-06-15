import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import { THEMES } from '@/lib/store-builder/defaults'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const themeId = typeof body.theme_id === 'string' ? body.theme_id : THEMES[0].id

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
        return NextResponse.json({ error: guestError.message ?? 'Erreur lors de la recherche de l’utilisateur invité.' }, { status: 500 })
      }

      if (guestUser?.id) {
        userId = guestUser.id
      } else {
        // Create the guest in auth.users to satisfy foreign key constraints
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: `guest-${Date.now()}@local.dev`,
          password: randomUUID(),
          email_confirm: true,
          user_metadata: { name: 'Invité' }
        })
        
        if (authError || !authUser?.user) {
          return NextResponse.json({ error: authError?.message ?? 'Impossible de créer l’utilisateur invité.' }, { status: 500 })
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
          return NextResponse.json({ error: createUserError?.message ?? 'Impossible d’initialiser le profil invité.' }, { status: 500 })
        }

        userId = newUser.id
      }
    }

    const theme = THEMES.find(theme => theme.id === themeId) ?? THEMES[0]

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
      colors: theme.default_colors,
      fonts: theme.default_fonts,
      pixels: { meta: '', tiktok: '', google: '' },
      custom_css: '',
    })

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message ?? 'Impossible de créer les paramètres de la boutique.' }, { status: 500 })
    }

    const { error: pageError } = await supabase.from('store_pages').insert({
      store_id: store.id,
      slug: 'home',
      title: 'Accueil',
      builder_json: {
        sections: [
          {
            id: `hero-${Date.now()}`,
            type: 'hero',
            visible: true,
            props: {
              headline: `Bienvenue sur ${name}`,
              subheadline: 'Décrivez votre offre en une phrase percutante',
              cta_text: 'Commander maintenant',
              cta_link: '#order-form',
              image_url: '',
              image_position: 'right',
              overlay_opacity: 0.4,
              text_align: 'left',
              bg_color: '#ffffff',
              text_color: '#111827',
              animation: 'fadeIn',
            },
          },
          {
            id: `countdown-${Date.now() + 1}`,
            type: 'countdown',
            visible: true,
            props: {
              target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              title: 'Offre limitée — Se termine dans :',
              show_days: true,
              show_hours: true,
              show_minutes: true,
              show_seconds: true,
              bg_color: '#1e1b4b',
              text_color: '#ffffff',
              timer_bg: '#312e81',
              on_expire: 'reset',
              expire_message: "L'offre est terminée",
            },
          },
          {
            id: `order_form-${Date.now() + 2}`,
            type: 'order_form',
            visible: true,
            props: {
              title: 'Passer votre commande',
              fields: [
                { id: 'field-name', type: 'text', label: 'Nom complet', placeholder: 'Votre nom', required: true },
                { id: 'field-phone', type: 'tel', label: 'Téléphone', placeholder: '+224 620 000 000', required: true },
                { id: 'field-address', type: 'text', label: 'Adresse', placeholder: 'Quartier, ville', required: true },
              ],
              submit_text: 'Confirmer ma commande',
              submit_color: theme.default_colors.primary,
              submit_text_color: '#ffffff',
              success_message: 'Merci ! Votre commande a été reçue.',
              bg_color: '#f9fafb',
              border_radius: 12,
              show_product_summary: true,
            },
          },
          {
            id: `footer-${Date.now() + 3}`,
            type: 'footer',
            visible: true,
            props: {
              text: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
              links: [],
              bg_color: '#111827',
              text_color: '#9ca3af',
              show_whatsapp: false,
              whatsapp_number: '',
            },
          },
        ],
      },
      is_published: false,
    })

    if (pageError) {
      return NextResponse.json({ error: pageError.message ?? 'Impossible de créer la page d’accueil.' }, { status: 500 })
    }

    return NextResponse.json({ data: store })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la boutique.' }, { status: 500 })
  }
}
