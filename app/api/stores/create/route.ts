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
        header: [
          {
            id: `announcement-${Date.now()}`,
            type: 'AnnouncementBar',
            title: "Barre d'annonce",
            hidden: false,
            settings: {
              text: '🚚 Livraison Gratuite & Paiement À La Livraison',
              bg_color: theme.default_colors.primary,
              text_color: '#ffffff',
            },
          },
          {
            id: `header-${Date.now() + 99}`,
            type: 'Header',
            title: 'En-tête',
            hidden: false,
            settings: {
              logo_text: name,
              logo_position: 'center',
              show_search: false,
              show_cart: false,
              bg_color: '#ffffff',
              text_color: theme.default_colors.primary,
            },
          },
        ],
        template: [
          {
            id: `Galerie-${Date.now() + 0}`,
            type: 'Galerie',
            title: "Galerie d'images",
            hidden: false,
            settings: {},
          },
          {
            id: `countdown_top_bar-${Date.now() + 1}`,
            type: 'countdown_top_bar',
            title: 'Compte à rebours',
            hidden: false,
            settings: {
              label: 'Offre',
              discount_text: '-50%',
              suffix: 'se termine dans',
              bg_color: '#1f2937',
              text_color: '#f9fafb',
              accent_color: '#fbbf24',
            },
          },
          {
            id: `Titre-${Date.now() + 2}`,
            type: 'Titre',
            title: 'Titre produit',
            hidden: false,
            settings: {},
          },
          {
            id: `Note-${Date.now() + 3}`,
            type: 'Note de produit',
            title: 'Note',
            hidden: false,
            settings: { rating: 5, reviews_count: '128 avis' },
          },
          {
            id: `Prix-${Date.now() + 4}`,
            type: 'Prix',
            title: 'Prix',
            hidden: false,
            settings: { show_badge: true, badge_text: 'Promo', badge_bg: theme.default_colors.primary },
          },
          {
            id: `trust_bar-${Date.now() + 41}`,
            type: 'trust_bar',
            title: 'Barre de confiance',
            hidden: false,
            settings: {
              show_score: true,
              score: '4.8',
              score_label: '1 247 avis vérifiés',
              bg_color: '#ffffff',
              text_color: '#1a1a1a',
              icon_color: '#00b67a',
              items: [
                { icon: 'truck', label: 'Livraison rapide' },
                { icon: 'lock', label: 'Paiement à la livraison' },
                { icon: 'shield', label: 'Satisfait ou remboursé' },
              ],
            },
          },
          {
            id: `stock_urgency-${Date.now() + 5}`,
            type: 'stock_urgency',
            title: 'Urgence stock',
            hidden: false,
            settings: {
              message: 'Il ne reste que 6 articles en stock',
              show_sold_count: true,
              sold_text: '32 vendus aujourd\'hui',
              bar_color: theme.default_colors.primary,
            },
          },
          {
            id: `OrderForm-${Date.now() + 6}`,
            type: 'OrderForm',
            title: 'Formulaire commande',
            hidden: false,
            settings: {
              title: 'Finaliser ma commande',
              btn_text: '🛒 COMMANDER MAINTENANT',
              btn_color: theme.default_colors.primary,
              bundles_enabled: true,
              bundle_layout: 'premium',
              bundles: [
                { id: 'b1', qty: 1, label: '1 article', sublabel: 'Prix standard', badge: '', discount_pct: 0, discount_fixed: 0, popular: false, hidden: false },
                { id: 'b2', qty: 2, label: '2 articles', sublabel: 'Économisez 15%', badge: '🔥 LE PLUS POPULAIRE', discount_pct: 15, discount_fixed: 0, popular: true, hidden: false },
                { id: 'b3', qty: 3, label: '3 articles', sublabel: 'Meilleure offre — 25% OFF', badge: '⭐ MEILLEURE OFFRE', discount_pct: 25, discount_fixed: 0, popular: false, hidden: false },
              ],
            },
          },
          {
            id: `Description-${Date.now() + 7}`,
            type: 'Description',
            title: 'Description',
            hidden: false,
            settings: {},
          },
          {
            id: `icon_grid-${Date.now() + 8}`,
            type: 'icon_grid',
            title: 'Avantages',
            hidden: false,
            settings: {
              items: [
                { id: '1', icon: '🚚', title: 'Livraison Rapide', description: 'Chez vous en 48h' },
                { id: '2', icon: '🔒', title: 'Paiement Sécurisé', description: 'À la livraison' },
                { id: '3', icon: '⭐', title: 'Qualité Premium', description: 'Matériaux certifiés' },
                { id: '4', icon: '↩️', title: 'Retours Faciles', description: "30 jours pour changer d'avis" },
              ],
            },
          },
          {
            id: `testimonials_floating-${Date.now() + 9}`,
            type: 'testimonials_floating',
            title: 'Témoignages',
            hidden: false,
            settings: {
              title: 'Ils nous font confiance',
              items: [
                { id: '1', name: 'Fatoumata C.', rating: 5, text: 'Produit incroyable, il a changé mon quotidien !' },
                { id: '2', name: 'Mamadou D.', rating: 5, text: 'La qualité est au rendez-vous. Je recommande.' },
                { id: '3', name: 'Aissatou B.', rating: 4, text: 'Très satisfaite, livraison rapide.' },
              ],
            },
          },
          {
            id: `faq-${Date.now() + 10}`,
            type: 'faq',
            title: 'FAQ',
            hidden: false,
            settings: {
              title: 'Questions Fréquentes',
              items: [
                { id: '1', question: '💳 Paiement à la livraison', answer: 'Vous payez uniquement à la réception. Aucun paiement en ligne requis.' },
                { id: '2', question: '📦 Expédition', answer: 'Livraison gratuite, 1 à 2 jours ouvrables.' },
                { id: '3', question: '🔄 Retours', answer: 'Retour possible sous 7 jours après réception.' },
                { id: '4', question: '🛡️ Garantie 30 jours', answer: 'Garantie contre les défauts de fabrication.' },
              ],
            },
          },
        ],
        footer: [
          {
            id: `footer-${Date.now() + 11}`,
            type: 'Footer',
            title: 'Pied de page',
            hidden: false,
            settings: {
              logo_text: name,
              copyright: `© ${new Date().getFullYear()} ${name}. Tous droits réservés.`,
              bg_color: '#111827',
              text_color: '#9ca3af',
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
