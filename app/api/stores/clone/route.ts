import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import { getBoutiqueTheme, toStoreColors, toStoreFonts, BOUTIQUE_THEMES } from '@/lib/store-builder/boutique-themes'
import { buildStorePage } from '@/lib/store-builder/boutique-themes'

function extractMeta(html: string, name: string): string | null {
  for (const p of [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]) { const m = html.match(p); if (m) return m[1] }
  return null
}

function extractHexColors(html: string): string[] {
  const found = new Set<string>()
  const re = /#([0-9a-fA-F]{6})\b/g
  let m
  while ((m = re.exec(html)) !== null) {
    const c = m[0].toLowerCase()
    if (c !== '#ffffff' && c !== '#000000') found.add(c)
  }
  return Array.from(found).slice(0, 15)
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>()
  const re = /font-family:\s*([^;}]+)/gi
  let m
  while ((m = re.exec(html)) !== null) {
    m[1].split(',').map(p => p.replace(/["']/g, '').trim()).forEach(p => {
      if (p && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(p)) fonts.add(p)
    })
  }
  return Array.from(fonts)
}

function extractLogoUrl(html: string, baseUrl: string): string | null {
  for (const p of [
    /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+id=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+logo[^"']+)["']/i,
  ]) { const m = html.match(p); if (m) try { return new URL(m[1], baseUrl).href } catch { return m[1] } }
  return null
}

function extractProductJsonLd(html: string): { title: string; price: number; currency: string; description: string; image_url: string; images: string[] } | null {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const s of scripts) {
    try {
      const data = JSON.parse(s[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'ProductGroup') {
          const imgs: string[] = []
          if (item.image) {
            const arr = Array.isArray(item.image) ? item.image : [item.image]
            arr.forEach((img: any) => { const u = typeof img === 'string' ? img : img?.url; if (u) imgs.push(u) })
          }
          return {
            title: item.name || '',
            price: item.offers?.price ? parseFloat(item.offers.price) : 0,
            currency: item.offers?.priceCurrency || 'FCFA',
            description: (item.description || '').slice(0, 2000),
            image_url: imgs[0] || '',
            images: imgs,
          }
        }
      }
    } catch {}
  }
  return null
}

function findClosestTheme(colors: string[]) {
  if (!BOUTIQUE_THEMES.length) return 'nature-vert'
  const scores = BOUTIQUE_THEMES.map(t => {
    let score = 0
    const ta = t.colors.accent.toLowerCase(), tb = t.colors.bg.toLowerCase()
    const tr = parseInt(ta.slice(1, 3), 16), tg = parseInt(ta.slice(3, 5), 16), tb2 = parseInt(ta.slice(5, 7), 16)
    for (const c of colors) {
      const cl = c.toLowerCase()
      if (cl === ta) score += 50
      if (cl === tb) score += 20
      const cr = parseInt(cl.slice(1, 3), 16), cg = parseInt(cl.slice(3, 5), 16), cb = parseInt(cl.slice(5, 7), 16)
      if (Math.sqrt((cr - tr) ** 2 + (cg - tg) ** 2 + (cb - tb2) ** 2) < 120) score += 10
    }
    return { id: t.id, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores[0].id
}

function sanitizeSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'boutique-clonee'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body.url === 'string' ? body.url.trim() : ''
    if (!url) return NextResponse.json({ error: 'URL requise.' }, { status: 400 })

    const normalizedUrl = url.startsWith('http') ? url : 'https://' + url

    const resp = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    if (!resp.ok) return NextResponse.json({ error: `Impossible d'accéder à l'URL (HTTP ${resp.status}).` }, { status: 400 })

    const html = await resp.text()
    const baseUrl = resp.url || normalizedUrl
    const domain = new URL(baseUrl).hostname.replace('www.', '')

    // ── Extraction ──
    const siteTitle = extractMeta(html, 'title') || extractMeta(html, 'og:title') || domain
    const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || ''
    const allColors = extractHexColors(html) // includes inline
    const fonts = extractFonts(html)
    const logoUrl = extractLogoUrl(html, baseUrl)
    const product = extractProductJsonLd(html)

    // ── Thème ──
    const bestThemeId = findClosestTheme(allColors)
    const theme = getBoutiqueTheme(bestThemeId)

    // ── Auth ──
    const supabase = createAdminSupabase()
    const supabaseAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    let userId: string | null = null

    if (token) {
      const { data: authData } = await supabaseAuth.auth.getUser(token)
      userId = authData?.user?.id ?? null
      if (userId) {
        const { data: existingUser } = await supabase.from('User').select('id').eq('id', userId).maybeSingle()
        if (!existingUser) {
          await supabase.from('User').insert({ id: userId, email: authData!.user!.email!, name: 'Utilisateur', role: 'CLOSER', commissionPerConfirm: 0, commissionPerDeliver: 0, earnings: 0 })
        }
      }
    }

    if (!userId) {
      const { data: guestUser } = await supabase.from('User').select('id').eq('email', 'guest@local').maybeSingle()
      if (guestUser?.id) {
        userId = guestUser.id
      } else {
        const { data: au, error: ae } = await supabase.auth.admin.createUser({ email: `guest-${Date.now()}@local.dev`, password: randomUUID(), email_confirm: true })
        if (au?.user) {
          const { data: nu } = await supabase.from('User').insert({ id: au.user.id, email: au.user.email!, name: 'Invité', role: 'CLOSER', commissionPerConfirm: 0, commissionPerDeliver: 0, earnings: 0 }).select('id').single()
          if (nu) userId = nu.id
        }
      }
    }

    // ── Création du produit cloné ──
    let clonedProductId: string | null = null
    if (product && product.title) {
      const { data: np } = await supabase.from('products').insert({
        title: product.title,
        price: String(product.price || 0),
        currency: product.currency || 'FCFA',
        description: product.description || '',
        image_url: product.image_url || '',
        images: JSON.stringify(product.images || []),
        status: 'active',
      }).select('id').single()
      if (np) clonedProductId = np.id
    }

    // ── Slug ──
    const baseName = siteTitle.replace(/[|‐]/g, '-').split('-')[0]?.trim() || domain
    const storeName = (baseName.length > 50 ? baseName.slice(0, 50) : baseName).trim() || 'Boutique clonée'
    let slug = sanitizeSlug(storeName)
    const { data: existingStore } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (existingStore) slug = `${slug}-${Date.now().toString(36)}`

    // ── Builder JSON (via buildStorePage du thème, fiable) ──
    const builderJson = buildStorePage(theme.id, storeName, clonedProductId)
    builderJson.themeSettings = {
      ...builderJson.themeSettings,
      logo_url: logoUrl || '',
      whatsapp_number: '',
      show_whatsapp: false,
    }
    if (clonedProductId) builderJson.selectedProductId = clonedProductId
    builderJson.template.forEach((b: any) => { if (!b.id) b.id = `${b.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
    builderJson.header.forEach((b: any) => { if (!b.id) b.id = `${b.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
    builderJson.footer.forEach((b: any) => { if (!b.id) b.id = `${b.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })

    // ── Insertion ──
    const { data: store, error: storeError } = await supabase
      .from('stores').insert({ name: storeName, slug, status: 'draft', user_id: userId })
      .select().single()
    if (storeError || !store) return NextResponse.json({ error: storeError?.message || 'Erreur création boutique.' }, { status: 500 })

    const { error: settingsError } = await supabase.from('store_settings').insert({
      store_id: store.id, theme_id: theme.id, colors: toStoreColors(theme), fonts: toStoreFonts(theme),
      pixels: { meta: '', tiktok: '', google: '' }, custom_css: '',
    })
    if (settingsError) { await supabase.from('stores').delete().eq('id', store.id); return NextResponse.json({ error: settingsError.message }, { status: 500 }) }

    const { error: pageError } = await supabase.from('store_pages').insert({
      store_id: store.id, slug: 'home', title: 'Accueil', builder_json: builderJson, is_published: false,
    })
    if (pageError) { await supabase.from('store_settings').delete().eq('store_id', store.id); await supabase.from('stores').delete().eq('id', store.id); return NextResponse.json({ error: pageError.message }, { status: 500 }) }

    return NextResponse.json({
      data: store,
      analysis: {
        title: storeName,
        description: description.slice(0, 300),
        colors_detected: allColors.slice(0, 8),
        fonts_detected: fonts.slice(0, 3),
        logo_detected: !!logoUrl,
        product_extracted: !!product,
        product_title: product?.title || null,
        product_price: product?.price || null,
        theme_used: theme.name,
      },
    })
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json({ error: 'La boutique met trop de temps à répondre.' }, { status: 408 })
    }
    console.error('Clone error:', err)
    return NextResponse.json({ error: `Erreur : ${err.message}` }, { status: 500 })
  }
}