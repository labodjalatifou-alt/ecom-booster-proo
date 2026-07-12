import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import { getBoutiqueTheme, toStoreColors, toStoreFonts, BOUTIQUE_THEMES } from '@/lib/store-builder/boutique-themes'
import { buildStorePage } from '@/lib/store-builder/boutique-themes'
import * as cheerio from 'cheerio'

// ── Extractors ──────────────────────────────────────────────────────────────

function extractMeta($: cheerio.CheerioAPI, name: string): string | null {
  return $(`meta[name="${name}"]`).attr('content')
    ?? $(`meta[property="og:${name}"]`).attr('content')
    ?? $(`meta[name="twitter:${name}"]`).attr('content')
    ?? null
}

function extractHexColors($: cheerio.CheerioAPI): string[] {
  const found = new Set<string>()
  const html = $.html()
  const re = /#([0-9a-fA-F]{6})\b/g
  let m
  while ((m = re.exec(html)) !== null) {
    const c = m[0].toLowerCase()
    if (c !== '#ffffff' && c !== '#000000' && c !== '#000000') found.add(c)
  }
  return Array.from(found).slice(0, 15)
}

function extractFonts($: cheerio.CheerioAPI): string[] {
  const fonts = new Set<string>()
  const re = /font-family:\s*([^;}]+)/gi
  let m
  while ((m = re.exec($.html())) !== null) {
    m[1].split(',').map((p: string) => p.replace(/["']/g, '').trim()).forEach((p: string) => {
      if (p && !['sans-serif', 'serif', 'monospace', 'inherit', 'arial', 'helvetica'].includes(p.toLowerCase())) fonts.add(p)
    })
  }
  return Array.from(fonts)
}

function extractLogoUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
  const selectors = [
    'img[src*="logo"]', 'img[class*="logo"]', 'img[id*="logo"]',
    'img[alt*="logo"]', 'header img:first', '.logo img', '#logo img',
    'a:has(img[alt*="logo"]) img', 'header a img',
  ]
  for (const sel of selectors) {
    const src = $(sel).first().attr('src')
    if (src) try { return new URL(src, baseUrl).href } catch { return src }
  }
  return null
}

function extractProductJsonLd($: cheerio.CheerioAPI): { title: string; price: number; currency: string; description: string; image_url: string; images: string[] } | null {
  const results: any[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'ProductGroup') {
          const imgs: string[] = []
          if (item.image) {
            const arr = Array.isArray(item.image) ? item.image : [item.image]
            arr.forEach((img: any) => { const u = typeof img === 'string' ? img : img?.url; if (u) imgs.push(u) })
          }
          results.push({
            title: item.name || '',
            price: item.offers?.price ? parseFloat(item.offers.price) : 0,
            currency: item.offers?.priceCurrency || 'FCFA',
            description: (item.description || '').slice(0, 2000),
            image_url: imgs[0] || '',
            images: imgs,
          })
        }
      }
    } catch {}
  })
  return results[0] || null
}

function extractAllImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const urls = new Set<string>()
  // OG image
  const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')
  if (ogImg) urls.add(new URL(ogImg, baseUrl).href)

  // All img tags
  $('img').each((_, el) => {
    const src = $(el).attr('src')
    if (src && !src.startsWith('data:') && !src.includes('placeholder') && !src.includes('pixel') && !src.includes('spacer')) {
      try { urls.add(new URL(src, baseUrl).href) } catch {}
    }
  })

  // Background images from style attributes
  const bgRe = /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/gi
  let m
  while ((m = bgRe.exec($.html())) !== null) {
    if (m[1] && !m[1].startsWith('data:')) {
      try { urls.add(new URL(m[1], baseUrl).href) } catch {}
    }
  }

  // JSON-LD images
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' && item.image) {
          const arr = Array.isArray(item.image) ? item.image : [item.image]
          arr.forEach((img: any) => {
            const u = typeof img === 'string' ? img : img?.url
            if (u) urls.add(u)
          })
        }
      }
    } catch {}
  })

  return Array.from(urls).slice(0, 15)
}

function extractTextBlock($: cheerio.CheerioAPI): { title: string; description: string } {
  const h1 = $('h1').first().text().trim()
  const h2 = $('h2').first().text().trim()
  const firstP = $('p').first().text().trim().slice(0, 300)
  const desc = $('meta[name="description"]').attr('content') || ''
  return {
    title: h1 || h2 || '',
    description: desc || firstP || '',
  }
}

function extractTestimonials($: cheerio.CheerioAPI): { name: string; text: string; rating: number }[] {
  const items: { name: string; text: string; rating: number }[] = []
  // Try JSON-LD reviews
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const list = Array.isArray(data) ? data : [data]
      for (const item of list) {
        if (item['@type'] === 'Product' && item.review) {
          const reviews = Array.isArray(item.review) ? item.review : [item.review]
          reviews.forEach((r: any) => {
            if (r.reviewBody) {
              items.push({
                name: r.author?.name || 'Client',
                text: r.reviewBody.slice(0, 200),
                rating: r.reviewRating?.ratingValue ? parseInt(r.reviewRating.ratingValue) : 5,
              })
            }
          })
        }
      }
    } catch {}
  })

  // Try HTML blockquotes / review-like elements
  if (items.length < 3) {
    $('blockquote, .review, .testimonial, [class*="review"], [class*="testimonial"]').each((_, el) => {
      const text = $(el).text().trim().slice(0, 200)
      if (text.length > 20 && text.length < 500) {
        const nameEl = $(el).find('.author, .name, [class*="author"], [class*="name"]').first().text().trim()
        items.push({ name: nameEl || 'Client', text, rating: 5 })
      }
    })
  }
  return items.slice(0, 6)
}

function extractFaq($: cheerio.CheerioAPI): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = []

  // Try JSON-LD FAQPage
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const list = Array.isArray(data) ? data : [data]
      for (const item of list) {
        if (item['@type'] === 'FAQPage' && item.mainEntity) {
          const qs = Array.isArray(item.mainEntity) ? item.mainEntity : [item.mainEntity]
          qs.forEach((q: any) => {
            if (q.name && q.acceptedAnswer?.text) {
              items.push({ question: q.name, answer: q.acceptedAnswer.text.slice(0, 300) })
            }
          })
        }
      }
    } catch {}
  })

  // Try HTML accordion/faq patterns
  if (items.length === 0) {
    $('.faq, [class*="faq"], .accordion, [class*="accordion"]').each((_, el) => {
      $(el).find('h3, h4, .question, [class*="question"], dt').each((i, qEl) => {
        const qText = $(qEl).text().trim()
        const aEl = $(qEl).next('p, .answer, [class*="answer"], dd').first()
        const aText = aEl.text().trim().slice(0, 300)
        if (qText && aText && qText.length > 5 && aText.length > 5) {
          items.push({ question: qText.slice(0, 150), answer: aText.slice(0, 300) })
        }
      })
    })
  }
  return items.slice(0, 5)
}

function extractFeatures($: cheerio.CheerioAPI): string[] {
  const features: string[] = []
  $('li, .feature, [class*="feature"], .benefit, [class*="benefit"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 10 && text.length < 120 && !text.includes('©')) {
      features.push(text)
    }
  })
  return features.slice(0, 6)
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

// ── Inject extracted content into builder JSON sections ─────────────────────

function injectContent(
  builder: any,
  images: string[],
  product: { title: string; price: number; currency?: string; description: string; images: string[] } | null,
  textBlock: { title: string; description: string },
  testimonials: { name: string; text: string; rating: number }[],
  faq: { question: string; answer: string }[],
  features: string[],
) {
  const productTitle = product?.title || textBlock.title || 'Produit'
  const productDesc = product?.description || textBlock.description
  const productImages = product?.images?.length ? product.images : images
  const allImages = [...new Set([...productImages, ...images])]

  // ── Galerie section ────────────────────────────────────────────────────
  const galerie = builder.template.find((b: any) => b.type === 'Galerie')
  if (galerie && allImages.length) {
    galerie.settings.images = allImages.slice(0, 10)
    galerie.settings.title = `Galerie ${productTitle}`
  }

  // ── Titre ──────────────────────────────────────────────────────────────
  const titre = builder.template.find((b: any) => b.type === 'Titre')
  if (titre) {
    titre.settings.title = productTitle
  }

  // ── Prix ───────────────────────────────────────────────────────────────
  const prix = builder.template.find((b: any) => b.type === 'Prix')
  if (prix && product?.price) {
    const fmt = new Intl.NumberFormat('fr-FR').format(product.price)
    prix.settings.price = `${fmt} ${product.currency || 'FCFA'}`
  }

  // ── Description ────────────────────────────────────────────────────────
  const desc = builder.template.find((b: any) => b.type === 'Description')
  if (desc && productDesc) {
    desc.settings.content = productDesc
  }

  // ── Hero / Image+Texte first one ───────────────────────────────────────
  const hero = builder.template.find((b: any) => b.type === 'hero')
  if (hero && allImages.length) {
    hero.settings.image_url = allImages[0]
    hero.settings.headline = productTitle
    hero.settings.subheadline = productDesc.slice(0, 200)
  }
  const imgText = builder.template.find((b: any) => b.type === 'image_text')
  if (imgText) {
    if (!imgText.settings.image_url && allImages.length > 1) {
      imgText.settings.image_url = allImages[1]
    }
    if (!imgText.settings.title) imgText.settings.title = `Pourquoi choisir ${productTitle} ?`
  }

  // ── Témoignages ────────────────────────────────────────────────────────
  const testimonialBlocks = builder.template.filter((b: any) => b.type === 'testimonials')
  if (testimonialBlocks.length && testimonials.length) {
    testimonialBlocks[0].settings.items = testimonials.map((t, i) => ({
      id: `clone-t${i + 1}`,
      name: t.name,
      rating: t.rating,
      text: t.text,
      verified: true,
    }))
  }

  // ── FAQ ────────────────────────────────────────────────────────────────
  const faqBlock = builder.template.find((b: any) => b.type === 'faq')
  if (faqBlock && faq.length) {
    faqBlock.settings.items = faq.map((q, i) => ({
      id: `clone-f${i + 1}`,
      question: q.question,
      answer: q.answer,
    }))
    if (faqBlock.settings.title === 'Questions fréquentes' || faqBlock.settings.title === 'Vos questions, nos réponses') {
      faqBlock.settings.title = faq.length > 1 ? 'Questions fréquentes' : 'FAQ'
    }
  }

  // ── Avantages / Features ──────────────────────────────────────────────
  const benefits = builder.template.find((b: any) => b.type === 'benefits')
  if (benefits && features.length) {
    benefits.settings.items = features.slice(0, 4).map((f, i) => ({
      id: `clone-feat${i + 1}`,
      icon: '✓',
      title: f.length > 50 ? f.slice(0, 50) + '...' : f,
    }))
    benefits.settings.layout = 'checklist'
  }

  // ── Hero section settings background image ─────────────────────────────
  const themeSettings = builder.themeSettings
  if (!themeSettings.hero_background && allImages[0]) {
    themeSettings.hero_background = allImages[0]
  }
  if (product?.title) {
    themeSettings.store_title = product.title
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body.url === 'string' ? body.url.trim() : ''
    if (!url) return NextResponse.json({ error: 'URL requise.' }, { status: 400 })

    const normalizedUrl = url.startsWith('http') ? url : 'https://' + url

    const resp = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!resp.ok) return NextResponse.json({ error: `Impossible d'accéder à l'URL (HTTP ${resp.status}).` }, { status: 400 })

    const html = await resp.text()
    const baseUrl = resp.url || normalizedUrl
    const domain = new URL(baseUrl).hostname.replace('www.', '')
    const $ = cheerio.load(html)

    // ── Extraction complète ──
    const siteTitle = extractMeta($, 'title') || $('title').text().trim() || domain
    const description = extractMeta($, 'description') || ''
    const allColors = extractHexColors($)
    const fonts = extractFonts($)
    const logoUrl = extractLogoUrl($, baseUrl)
    const product = extractProductJsonLd($)
    const allImages = extractAllImages($, baseUrl)
    const textBlock = extractTextBlock($)
    const testimonials = extractTestimonials($)
    const faq = extractFaq($)
    const features = extractFeatures($)

    // ── Thème le plus proche ──
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
        const { data: au } = await supabase.auth.admin.createUser({ email: `guest-${Date.now()}@local.dev`, password: randomUUID(), email_confirm: true })
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
        image_url: product.image_url || allImages[0] || '',
        images: product.images.length ? product.images : allImages.slice(0, 5),
        status: 'active',
      }).select('id').single()
      if (np) clonedProductId = np.id
    }

    // ── Slug ──
    const baseName = (product?.title || siteTitle).replace(/[|‐]/g, '-').split('-')[0]?.trim() || domain
    const storeName = (baseName.length > 50 ? baseName.slice(0, 50) : baseName).trim() || 'Boutique clonée'
    let slug = sanitizeSlug(storeName)
    const { data: existingStore } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (existingStore) slug = `${slug}-${Date.now().toString(36)}`

    // ── Builder JSON avec buildStorePage ──
    const builderJson = buildStorePage(theme.id, storeName, clonedProductId)

    // ── Injecter le contenu extrait dans les sections ──
    injectContent(builderJson, allImages, product, textBlock, testimonials, faq, features)

    // ── Thème settings ──
    builderJson.themeSettings = {
      ...builderJson.themeSettings,
      logo_url: logoUrl || '',
      whatsapp_number: '',
      show_whatsapp: logoUrl ? true : false,
    }
    if (clonedProductId) builderJson.selectedProductId = clonedProductId

    // ── Garantir les IDs de blocs ──
    for (const group of ['template', 'header', 'footer'] as const) {
      builderJson[group].forEach((b: any) => {
        if (!b.id) b.id = `${b.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      })
    }

    // ── Insertion boutique ──
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
        images_extracted: allImages.length,
        testimonials_extracted: testimonials.length,
        faq_extracted: faq.length,
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
