import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import { getBoutiqueTheme, toStoreColors, toStoreFonts, BOUTIQUE_THEMES } from '@/lib/store-builder/boutique-themes'
import { buildStorePage } from '@/lib/store-builder/boutique-themes'
import * as cheerio from 'cheerio'

// ── Helpers ─────────────────────────────────────────────────────────────────

function absoluteUrl(href: string, base: string): string | null {
  if (!href || href.startsWith('data:')) return null
  try { return new URL(href, base).href } catch { return null }
}

function extractMeta($: cheerio.CheerioAPI, name: string): string | null {
  return $(`meta[name="${name}"]`).attr('content')
    ?? $(`meta[property="og:${name}"]`).attr('content')
    ?? $(`meta[name="twitter:${name}"]`).attr('content')
    ?? null
}

function extractHexColors($: cheerio.CheerioAPI): string[] {
  const found = new Set<string>()
  const re = /#([0-9a-fA-F]{6})\b/g
  let m
  while ((m = re.exec($.html())) !== null) {
    const c = m[0].toLowerCase()
    if (c !== '#ffffff' && c !== '#000000') found.add(c)
  }
  return Array.from(found).slice(0, 15)
}

function extractFonts($: cheerio.CheerioAPI): string[] {
  const fonts = new Set<string>()
  const re = /font-family:\s*([^;}]+)/gi
  let m
  while ((m = re.exec($.html())) !== null) {
    m[1].split(',').map((p: string) => p.replace(/["']/g, '').trim()).forEach((p: string) => {
      if (p && !['sans-serif', 'serif', 'monospace', 'inherit', 'arial', 'helvetica', 'sans'].includes(p.toLowerCase())) fonts.add(p)
    })
  }
  return Array.from(fonts)
}

function extractLogoUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
  const selectors = [
    'img[src*="logo"]', 'img[class*="logo"]', 'img[id*="logo"]',
    'img[alt*="logo"]', 'header img:first', '.logo img', '#logo img',
    'a:has(img[alt*="logo"]) img', 'header a img',
    '.header img[src*="logo"]', '[class*="brand"] img', '[class*="site-logo"] img',
  ]
  for (const sel of selectors) {
    const src = $(sel).first().attr('src')
    if (src) return absoluteUrl(src, baseUrl) || src
  }
  return null
}

// ── Try to parse any <script> as JSON (Shopify often uses untyped scripts) ──

function findAllJsonScripts($: cheerio.CheerioAPI): any[] {
  const results: any[] = []
  $('script').each((_, el) => {
    const type = $(el).attr('type')
    if (type && type !== 'application/ld+json' && !type.includes('json')) return
    const src = $(el).attr('src')
    if (src) return
    try {
      const text = $(el).text().trim()
      try {
        const data = JSON.parse(text)
        results.push(data)
      } catch {
        const jsonMatch = text.match(/(?:window\.)?(?:product|Product|shopify|Shopify|meta|__INITIAL_STATE__|__STORE__)\s*(?:=|:)\s*(\{[\s\S]*?\})(?:\s*;|\s*,\s*function|\s*\))/)
        if (jsonMatch) {
          try { results.push(JSON.parse(jsonMatch[1])) } catch {}
        }
      }
    } catch {}
  })
  return results
}

// ── Extract images from Shopify product JSON embedded in scripts ───────────

function extractImagesFromShopifyJson(scripts: any[], baseUrl: string): string[] {
  const urls = new Set<string>()
  for (const data of scripts) {
    const sources = [
      data?.product?.images,
      data?.product?.media,
      data?.images,
      data?.media,
      data?.variants?.map((v: any) => v.image?.src || v.featured_image?.src).filter(Boolean),
      data?.product?.variants?.map((v: any) => v.image?.src || v.featured_image?.src).filter(Boolean),
    ]
    for (const srcArray of sources) {
      if (Array.isArray(srcArray)) {
        for (const item of srcArray) {
          const url = typeof item === 'string' ? item : item?.src || item?.url || item?.originalSrc || item?.srcset
          if (url) {
            const abs = absoluteUrl(url, baseUrl)
            if (abs) urls.add(abs)
          }
        }
      }
    }
  }
  return Array.from(urls)
}

// ── Extract images from HTML description text (body_html from JSON-LD) ──────

function extractImagesFromHtml(html: string, baseUrl: string): string[] {
  const urls = new Set<string>()
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = imgRe.exec(html)) !== null) {
    const abs = absoluteUrl(m[1], baseUrl)
    if (abs) urls.add(abs)
  }
  return Array.from(urls)
}

// ── Main image extraction: ALL sources ──────────────────────────────────────

function extractAllImages($: cheerio.CheerioAPI, baseUrl: string, jsonScripts: any[]): string[] {
  const urls = new Set<string>()

  // 1. OG / Twitter images
  const ogImg = $('meta[property="og:image"]').attr('content')
    || $('meta[property="og:image:secure_url"]').attr('content')
    || $('meta[name="twitter:image"]').attr('content')
  if (ogImg) { const a = absoluteUrl(ogImg, baseUrl); if (a) urls.add(a) }

  // 2. <link rel="image_src">
  const linkImg = $('link[rel="image_src"]').attr('href')
  if (linkImg) { const a = absoluteUrl(linkImg, baseUrl); if (a) urls.add(a) }

  // 3. All <img> tags — src, data-src, data-image, data-media, data-zoom
  $('img').each((_, el) => {
    const attrs = ['src', 'data-src', 'data-image', 'data-media', 'data-zoom', 'data-original', 'data-lazy', 'data-srcset']
    for (const attr of attrs) {
      const val = $(el).attr(attr)
      if (val && !val.startsWith('data:') && !val.includes('placeholder') && !val.includes('pixel') && !val.includes('spacer') && !val.includes('1x1')) {
        if (attr === 'data-srcset' || attr === 'srcset') {
          val.split(',').forEach(part => {
            const u = part.trim().split(/\s+/)[0]
            const a = absoluteUrl(u, baseUrl)
            if (a) urls.add(a)
          })
        } else {
          const a = absoluteUrl(val, baseUrl)
          if (a) urls.add(a)
        }
      }
    }
    const srcset = $(el).attr('srcset')
    if (srcset) {
      srcset.split(',').forEach(part => {
        const u = part.trim().split(/\s+/)[0]
        const a = absoluteUrl(u, baseUrl)
        if (a) urls.add(a)
      })
    }
  })

  // 4. Background images from style attributes
  const bgRe = /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/gi
  let m
  while ((m = bgRe.exec($.html())) !== null) {
    if (m[1] && !m[1].startsWith('data:')) {
      const a = absoluteUrl(m[1], baseUrl)
      if (a) urls.add(a)
    }
  }

  // 5. JSON-LD images
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' && item.image) {
          const arr = Array.isArray(item.image) ? item.image : [item.image]
          arr.forEach((img: any) => {
            const u = typeof img === 'string' ? img : img?.url || img?.['@id']
            if (u) urls.add(u)
          })
        }
      }
    } catch {}
  })

  // 6. Shopify embedded JSON (window.__INITIAL_STATE__, window.Shopify, etc.)
  const shopifyImages = extractImagesFromShopifyJson(jsonScripts, baseUrl)
  shopifyImages.forEach(u => urls.add(u))

  // 7. JSON-LD description HTML images
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' && item.description) {
          const descImages = extractImagesFromHtml(item.description, baseUrl)
          descImages.forEach(u => urls.add(u))
        }
      }
    } catch {}
  })

  // 8. Product page specific selectors - common patterns
  $('.product-gallery img, .product-images img, .product-media img, .gallery img, .thumbnails img, [data-gallery] img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-large') || $(el).attr('data-zoom')
    if (src) { const a = absoluteUrl(src, baseUrl); if (a) urls.add(a) }
  })

  // De-duplicate by normalizing common Shopify image size variants
  const normalized = new Map<string, string>()
  for (const url of urls) {
    const key = url.replace(/_[a-z]+\.(jpg|jpeg|png|webp)/i, '.$1').replace(/\?.*/, '')
    if (!normalized.has(key)) {
      normalized.set(key, url)
    }
  }

  return Array.from(normalized.values()).slice(0, 20)
}

// ── Extended product extraction ────────────────────────────────────────────

interface ExtractedProduct {
  title: string
  price: number
  currency: string
  description: string        // plain text description
  descriptionHtml: string    // HTML description with <img> tags preserved
  image_url: string
  images: string[]
  headingHtml: string        // full HTML of h1 (for preserving heading hierarchy)
  subheadings: string[]      // h2 texts for section headings
}

function extractProductJsonLd($: cheerio.CheerioAPI, jsonScripts: any[], baseUrl: string): ExtractedProduct | null {
  // Try JSON-LD first
  let result: ExtractedProduct | null = null
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'ProductGroup') {
          const imgs: string[] = []
          if (item.image) {
            const arr = Array.isArray(item.image) ? item.image : [item.image]
            arr.forEach((img: any) => {
              const u = typeof img === 'string' ? img : img?.url || img?.['@id']
              if (u) imgs.push(u)
            })
          }
          const descHtml = item.description || ''
          const plainDesc = descHtml.replace(/<[^>]*>/g, '').slice(0, 2000)
          const descImages = extractImagesFromHtml(descHtml, baseUrl)
          result = {
            title: item.name || '',
            price: item.offers?.price ? parseFloat(item.offers.price) : 0,
            currency: item.offers?.priceCurrency || 'FCFA',
            description: plainDesc,
            descriptionHtml: descHtml,
            image_url: imgs[0] || '',
            images: imgs,
            headingHtml: '',
            subheadings: [],
          }
          if (descImages.length) {
            result.images = [...new Set([...result.images, ...descImages])]
          }
        }
      }
    } catch {}
  })

  // Fallback: try Shopify JSON scripts for product data
  if (!result) {
    for (const data of jsonScripts) {
      const p = data?.product || data
      if (p?.title && p?.variants?.[0]?.price) {
        const imgs: string[] = []
        if (p.images) {
          p.images.forEach((img: any) => {
            const u = typeof img === 'string' ? img : img?.src || img?.originalSrc || img?.url
            if (u) imgs.push(u)
          })
        }
        if (p.media) {
          p.media.forEach((m: any) => {
            if (m?.src || m?.url) imgs.push(m.src || m.url)
          })
        }
        const descHtml = p.body_html || p.description || ''
        const plainDesc = descHtml.replace(/<[^>]*>/g, '').slice(0, 2000)
        result = {
          title: p.title,
          price: parseFloat(p.variants[0].price),
          currency: p.variants[0].currency || 'FCFA',
          description: plainDesc,
          descriptionHtml: descHtml,
          image_url: imgs[0] || p.featured_image?.src || p.image?.src || '',
          images: imgs,
          headingHtml: '',
          subheadings: [],
        }
        break
      }
    }
  }

  // Add page headings if product found
  if (result) {
    const h1 = $('h1').first()
    result.headingHtml = h1.html() || h1.text() || ''
    $('h2').each((_, el) => {
      const t = $(el).text().trim()
      if (t && t.length < 100) result!.subheadings.push(t)
    })
  }

  return result
}

// ── Extract text blocks with heading preservation ──────────────────────────

function extractHeadings($: cheerio.CheerioAPI): { h1: string; h2s: string[]; h3s: string[] } {
  const h1 = $('h1').first().text().trim()
  const h2s: string[] = []
  const h3s: string[] = []
  $('h2').each((_, el) => {
    const t = $(el).text().trim()
    if (t && t.length < 100) h2s.push(t)
  })
  $('h3').each((_, el) => {
    const t = $(el).text().trim()
    if (t && t.length < 100) h3s.push(t)
  })
  return { h1, h2s, h3s }
}

function extractTestimonials($: cheerio.CheerioAPI): { name: string; text: string; rating: number }[] {
  const items: { name: string; text: string; rating: number }[] = []
  // JSON-LD reviews
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

  // HTML blockquotes / review elements
  if (items.length < 3) {
    $('blockquote, .review, .testimonial, [class*="review"], [class*="testimonial"], [class*="avis"]').each((_, el) => {
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

  if (items.length === 0) {
    $('.faq, [class*="faq"], .accordion, [class*="accordion"], [class*="questions"]').each((_, el) => {
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
  $('li, .feature, [class*="feature"], .benefit, [class*="benefit"], [class*="point"], [class*="bullet"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 10 && text.length < 120 && !text.includes('©') && !text.includes('$')) {
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

// ── Inject extracted content into builder JSON sections ────────────────────

function injectContent(
  builder: any,
  allImages: string[],
  product: ExtractedProduct | null,
  headings: { h1: string; h2s: string[]; h3s: string[] },
  testimonials: { name: string; text: string; rating: number }[],
  faq: { question: string; answer: string }[],
  features: string[],
) {
  const productTitle = product?.title || headings.h1 || 'Produit'
  const productDesc = product?.description || ''
  const productDescHtml = product?.descriptionHtml || ''
  const productImages = product?.images?.length ? product.images : []

  // Merge product images + page images, product images first
  const mergedImages = [...new Set([...productImages, ...allImages])]

  // ── Galerie section ────────────────────────────────────────────────────
  const galerie = builder.template.find((b: any) => b.type === 'Galerie')
  if (galerie && mergedImages.length) {
    galerie.settings.images = mergedImages.slice(0, 15)
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

  // ── Description (with HTML preserved) ──────────────────────────────────
  const desc = builder.template.find((b: any) => b.type === 'Description')
  if (desc) {
    desc.settings.content = productDescHtml || productDesc
    desc.settings.html_content = productDescHtml ? true : false
  }

  // ── text_block first one → use heading hierarchy ───────────────────────
  const textBlock = builder.template.find((b: any) => b.type === 'text_block')
  if (textBlock && headings.h2s.length) {
    textBlock.settings.title = headings.h2s[0]
  }

  // ── Hero / Image+Texte ─────────────────────────────────────────────────
  const hero = builder.template.find((b: any) => b.type === 'hero')
  if (hero && mergedImages.length) {
    hero.settings.image_url = mergedImages[0]
    hero.settings.headline = productTitle
    hero.settings.subheadline = productDesc.slice(0, 200)
  }
  const imgText = builder.template.find((b: any) => b.type === 'image_text')
  if (imgText) {
    if (!imgText.settings.image_url && mergedImages.length > 1) {
      imgText.settings.image_url = mergedImages[1]
    }
    if (!imgText.settings.title || imgText.settings.title.startsWith('Pourquoi choisir')) {
      imgText.settings.title = headings.h2s.length > 1 ? headings.h2s[1] : `Pourquoi choisir ${productTitle} ?`
    }
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

  // ── Theme settings ─────────────────────────────────────────────────────
  const themeSettings = builder.themeSettings
  if (!themeSettings.hero_background && mergedImages[0]) {
    themeSettings.hero_background = mergedImages[0]
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
      signal: AbortSignal.timeout(25000),
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

    // ── Step 1: Find all JSON scripts first (used by multiple extractors) ──
    const jsonScripts = findAllJsonScripts($)

    // ── Step 2: Extraction complète ──
    const siteTitle = extractMeta($, 'title') || $('title').text().trim() || domain
    const description = extractMeta($, 'description') || ''
    const allColors = extractHexColors($)
    const fonts = extractFonts($)
    const logoUrl = extractLogoUrl($, baseUrl)
    const product = extractProductJsonLd($, jsonScripts, baseUrl)
    const allImages = extractAllImages($, baseUrl, jsonScripts)
    const headings = extractHeadings($)
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
      // Merge product images + all images found on page
      const mergedProdImages = [...new Set([...product.images, ...allImages])]
      const { data: np } = await supabase.from('products').insert({
        title: product.title,
        price: String(product.price || 0),
        currency: product.currency || 'FCFA',
        description: product.descriptionHtml || product.description || '',
        image_url: product.image_url || allImages[0] || '',
        images: mergedProdImages.length ? mergedProdImages : allImages.slice(0, 5),
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
    injectContent(builderJson, allImages, product, headings, testimonials, faq, features)

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
        product_images: product?.images?.length || 0,
        headings_detected: headings.h1 ? 1 + headings.h2s.length : 0,
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