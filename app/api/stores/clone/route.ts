import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import { getBoutiqueTheme, toStoreColors, toStoreFonts, BOUTIQUE_THEMES, buildStorePage } from '@/lib/store-builder/boutique-themes'
import * as cheerio from 'cheerio'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  return Array.from(fonts).slice(0, 5)
}

function extractLogoUrl($: cheerio.CheerioAPI, baseUrl: string): string | null {
  const selectors = [
    'img[src*="logo"]', 'img[class*="logo"]', 'img[id*="logo"]',
    'img[alt*="logo"]', '.logo img', '#logo img', 'header a img', '[class*="brand"] img',
  ]
  for (const sel of selectors) {
    const src = $(sel).first().attr('src')
    if (src) return absoluteUrl(src, baseUrl) || src
  }
  return null
}

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
        const jsonMatch = text.match(/(?:window\.)?(?:product|Product|shopify|Shopify|meta|__INITIAL_STATE__|__STORE__)\s*(?:=|:)\s*(\{[\s\S]*?\})(?:\s*;|\s*,\s*function|\s*\))/
        )
        if (jsonMatch) {
          try { results.push(JSON.parse(jsonMatch[1])) } catch {}
        }
      }
    } catch {}
  })
  return results
}

// ── Extract ALL images (deduped) ─────────────────────────────────────────────

function extractAllImages($: cheerio.CheerioAPI, baseUrl: string, jsonScripts: any[]): string[] {
  const urls = new Set<string>()

  // OG image
  const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')
  if (ogImg) { const a = absoluteUrl(ogImg, baseUrl); if (a) urls.add(a) }

  // All img tags
  $('img').each((_, el) => {
    const attrs = ['src', 'data-src', 'data-image', 'data-zoom', 'data-original', 'data-lazy']
    for (const attr of attrs) {
      const val = $(el).attr(attr)
      if (val && !val.startsWith('data:') && !val.includes('placeholder') && !val.includes('1x1') && !val.includes('pixel')) {
        const a = absoluteUrl(val, baseUrl)
        if (a) urls.add(a)
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

  // Background images
  const bgRe = /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/gi
  let m
  while ((m = bgRe.exec($.html())) !== null) {
    if (m[1] && !m[1].startsWith('data:')) {
      const a = absoluteUrl(m[1], baseUrl)
      if (a) urls.add(a)
    }
  }

  // JSON-LD + Shopify scripts
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

  for (const data of jsonScripts) {
    const p = data?.product || data
    if (p?.images) {
      p.images.forEach((img: any) => {
        const u = typeof img === 'string' ? img : img?.src || img?.originalSrc
        if (u) { const a = absoluteUrl(u, baseUrl); if (a) urls.add(a) }
      })
    }
  }

  // Deduplicate by normalizing Shopify size variants
  const normalized = new Map<string, string>()
  for (const url of urls) {
    const key = url.replace(/_[a-z]+\.(jpg|jpeg|png|webp)/i, '.$1').replace(/\?.*/, '')
    if (!normalized.has(key)) normalized.set(key, url)
  }

  return Array.from(normalized.values())
    .filter(u => /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(u) || u.includes('cdn'))
    .slice(0, 30)
}

// ── Extract product data ─────────────────────────────────────────────────────

interface ExtractedProduct {
  title: string
  price: number
  comparePrice: number | null
  currency: string
  description: string
  descriptionHtml: string
  image_url: string
  images: string[]
  variants: { name: string; price: number }[]
  bundles: { name: string; items: number; price: number; comparePrice: number | null }[]
  headings: { h1: string; h2s: string[]; h3s: string[] }
}

function extractProduct($: cheerio.CheerioAPI, jsonScripts: any[], baseUrl: string): ExtractedProduct {
  let title = ''
  let price = 0
  let comparePrice: number | null = null
  let currency = 'FCFA'
  let description = ''
  let descriptionHtml = ''
  let images: string[] = []
  let variants: { name: string; price: number }[] = []
  let bundles: { name: string; items: number; price: number; comparePrice: number | null }[] = []

  // JSON-LD Product
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if ((item['@type'] === 'Product' || item['@type'] === 'ProductGroup') && !title) {
          title = item.name || ''
          if (item.offers) {
            const offers = Array.isArray(item.offers) ? item.offers : [item.offers]
            price = parseFloat(offers[0]?.price || '0')
            currency = offers[0]?.priceCurrency || 'FCFA'
          }
          const descHtml = item.description || ''
          descriptionHtml = descHtml
          description = descHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 3000)
          if (item.image) {
            const arr = Array.isArray(item.image) ? item.image : [item.image]
            arr.forEach((img: any) => {
              const u = typeof img === 'string' ? img : img?.url
              if (u) images.push(u)
            })
          }
          // Reviews as bundles won't mix — keep clean
        }
      }
    } catch {}
  })

  // Shopify JSON fallback
  if (!title) {
    for (const data of jsonScripts) {
      const p = data?.product || data
      if (p?.title && (p?.variants || p?.price)) {
        title = p.title
        price = parseFloat(p?.variants?.[0]?.price || p?.price || '0')
        currency = p?.variants?.[0]?.currency || 'FCFA'
        const descHtml = p.body_html || p.description || ''
        descriptionHtml = descHtml
        description = descHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 3000)
        if (p.images) {
          p.images.forEach((img: any) => {
            const u = typeof img === 'string' ? img : img?.src || img?.originalSrc
            if (u) images.push(absoluteUrl(u, baseUrl) || u)
          })
        }
        // Extract variants
        if (p.variants && Array.isArray(p.variants)) {
          variants = p.variants.slice(0, 10).map((v: any) => ({
            name: v.title || v.name || '',
            price: parseFloat(v.price || '0'),
          })).filter((v: { name: string; price: number }) => v.name && v.name !== 'Default Title')
        }
        break
      }
    }
  }

  // Compare price from HTML (crossed-out price)
  if (!comparePrice) {
    const compareEl = $('[class*="compare"], [class*="original-price"], [class*="was-price"], s, del').first()
    if (compareEl.length) {
      const txt = compareEl.text().replace(/[^0-9.,]/g, '').replace(',', '.')
      const n = parseFloat(txt)
      if (!isNaN(n) && n > price) comparePrice = n
    }
  }

  // HTML fallback for title
  if (!title) {
    title = $('h1').first().text().trim() || extractMeta($, 'title') || ''
  }

  // ALways try to get rich HTML description from DOM first (JSON-LD is usually plain text)
  const descSel = $('.product-description, .description, [class*="description"], [class*="product-details"], .product__description, #product-description')
  if (descSel.length) {
    // Find the most likely container (the one with the most text/elements)
    let bestDesc = descSel.first()
    let maxLength = 0
    descSel.each((_, el) => {
      const html = $(el).html() || ''
      if (html.length > maxLength) {
        maxLength = html.length
        bestDesc = $(el)
      }
    })
    
    const domHtml = bestDesc.html() || ''
    const domText = bestDesc.text().replace(/\s+/g, ' ').trim().slice(0, 3000)
    
    // If DOM description is richer than what we found in JSON, use it
    if (domHtml.length > descriptionHtml.length || domHtml.includes('<img')) {
      descriptionHtml = domHtml
      description = domText
    }
  }

  if (!description) {
    description = descriptionHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 3000)
  }

  // Extract bundles from page (common pattern: "Pack X + Y = price")
  $('[class*="bundle"], [class*="pack"], [class*="lot"], [class*="offre"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length < 10 || text.length > 500) return
    const priceMatch = text.match(/(\d[\d\s,\.]+)\s*(FCFA|XOF|€|\$|CFA)?/i)
    const qtyMatch = text.match(/(\d+)\s*(article|pièce|produit|x)/i)
    if (priceMatch && qtyMatch) {
      const bPrice = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'))
      const qty = parseInt(qtyMatch[1])
      if (bPrice > 0 && qty > 1) {
        bundles.push({ name: text.slice(0, 60), items: qty, price: bPrice, comparePrice: null })
      }
    }
  })

  // Extract headings
  const h1 = $('h1').first().text().trim()
  const h2s: string[] = []
  const h3s: string[] = []
  $('h2').each((_, el) => { const t = $(el).text().trim(); if (t && t.length < 120) h2s.push(t) })
  $('h3').each((_, el) => { const t = $(el).text().trim(); if (t && t.length < 120) h3s.push(t) })

  return {
    title,
    price,
    comparePrice,
    currency,
    description,
    descriptionHtml,
    image_url: images[0] || '',
    images: [...new Set(images)],
    variants,
    bundles: bundles.slice(0, 3),
    headings: { h1, h2s: h2s.slice(0, 6), h3s: h3s.slice(0, 6) },
  }
}

// ── Extract testimonials ─────────────────────────────────────────────────────

function extractTestimonials($: cheerio.CheerioAPI): { name: string; text: string; rating: number }[] {
  const items: { name: string; text: string; rating: number }[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      const list = Array.isArray(data) ? data : [data]
      for (const item of list) {
        if (item['@type'] === 'Product' && item.review) {
          const reviews = Array.isArray(item.review) ? item.review : [item.review]
          reviews.forEach((r: any) => {
            if (r.reviewBody) {
              items.push({ name: r.author?.name || 'Client', text: r.reviewBody.slice(0, 250), rating: r.reviewRating?.ratingValue ? parseInt(r.reviewRating.ratingValue) : 5 })
            }
          })
        }
      }
    } catch {}
  })

  if (items.length < 2) {
    $('blockquote, .review, .testimonial, [class*="review"], [class*="testimonial"], [class*="avis"], [class*="temoignage"]').each((_, el) => {
      const text = $(el).text().trim().slice(0, 250)
      if (text.length > 20) {
        const nameEl = $(el).find('.author, .name, [class*="author"], [class*="name"]').first().text().trim()
        items.push({ name: nameEl || 'Client satisfait', text, rating: 5 })
      }
    })
  }
  return items.slice(0, 6)
}

// ── Extract FAQ ──────────────────────────────────────────────────────────────

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
    // Look for explicit FAQ containers
    $('.faq, [class*="faq"], .accordion, [class*="accordion"], [class*="questions"]').each((_, el) => {
      $(el).find('h3, h4, .question, [class*="question"], dt').each((_, qEl) => {
        const qText = $(qEl).text().trim()
        const aEl = $(qEl).next('p, .answer, [class*="answer"], dd').first()
        const aText = aEl.text().trim().slice(0, 300)
        if (qText && aText && qText.length > 5) {
          items.push({ question: qText.slice(0, 150), answer: aText })
        }
      })
    })

    // Fallback: look for ANY h3/h4/strong that ends with a question mark and is followed by a paragraph
    if (items.length === 0) {
      $('h2, h3, h4, strong, b').each((_, el) => {
        const qText = $(el).text().trim()
        if (qText.endsWith('?') && qText.length > 10) {
          const aEl = $(el).next('p, div').first()
          const aText = aEl.text().trim().slice(0, 300)
          if (aText && aText.length > 10 && !aText.endsWith('?')) {
            items.push({ question: qText.slice(0, 150), answer: aText })
          }
        }
      })
    }
  }
  return items.slice(0, 5)
}

// ── Detect page sections from DOM ────────────────────────────────────────────

interface PageAnalysis {
  hasHero: boolean
  hasGallery: boolean
  hasDescription: boolean
  hasFeatures: boolean
  hasTestimonials: boolean
  hasFaq: boolean
  hasBundles: boolean
  hasCountdown: boolean
  hasTrustBadges: boolean
  hasGuarantee: boolean
  descriptionImages: string[]
  sectionOrder: string[]
  detectedLayout: 'hero-split' | 'single-column'
}

function resolveDescriptionImages(html: string, baseUrl: string): string {
  // Replace data-src with src so lazy-loaded images render properly
  let resolved = html
  // data-src → src (keep src if already exists)
  resolved = resolved.replace(/<img([^>]*)\sdata-src=["']([^"']+)["']([^>]*)>/gi, (match, before, dataSrc, after) => {
    const absUrl = absoluteUrl(dataSrc, baseUrl) || dataSrc
    // If no src attr, inject it
    if (!before.includes(' src=') && !after.includes(' src=')) {
      return `<img${before} src="${absUrl}" data-src="${absUrl}"${after}>`
    }
    return match
  })
  // Make all relative src absolute
  resolved = resolved.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match
    const absUrl = absoluteUrl(src, baseUrl)
    if (!absUrl) return match
    return `<img${before} src="${absUrl}"${after}>`
  })
  return resolved
}

function analyzePageStructure(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  product: ExtractedProduct,
  testimonials: any[],
  faq: any[]
): PageAnalysis {
  // ── Extract & resolve images from description HTML ──
  const descriptionImages: string[] = []
  let resolvedDescHtml = product.descriptionHtml

  if (product.descriptionHtml) {
    // Collect all img src + data-src from description
    const srcRe = /<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi
    let m
    while ((m = srcRe.exec(product.descriptionHtml)) !== null) {
      if (!m[1].startsWith('data:')) {
        const abs = absoluteUrl(m[1], baseUrl)
        if (abs && !descriptionImages.includes(abs)) descriptionImages.push(abs)
      }
    }
    // Rewrite lazy-load images in HTML so they render
    resolvedDescHtml = resolveDescriptionImages(product.descriptionHtml, baseUrl)
    // Update the product's descriptionHtml so the Description block gets resolved images
    product.descriptionHtml = resolvedDescHtml
  }

  // ── Strict section detection (DOM-based, not keyword matching) ──
  const hasGallery = product.images.length > 1 ||
    !!($('[class*="gallery"], [class*="slider"], [class*="carousel"], .swiper, .splide, .glide').length)

  // Features: must have actual feature/benefit containers with multiple children
  const featureContainers = $('[class*="feature"], [class*="benefit"], [class*="icon-box"], [class*="avantage"], ul.features, .benefits')
  const hasFeatures = featureContainers.length > 0 && featureContainers.children().length >= 2

  // Countdown: only if explicit countdown widget found
  const hasCountdown = !!($('[class*="countdown"], [data-countdown], [class*="timer-block"]').length)

  // Trust badges: only if explicit trust/badge section with multiple items (not just words)
  const trustEl = $('[class*="trust-badge"], [class*="trust_badge"], [class*="badge-bar"], .trust-bar, [class*="iconsBar"], [class*="guarantee-bar"]')
  const hasTrustBadges = trustEl.length > 0 && trustEl.children().length >= 2

  // Guarantee section: must be a dedicated guarantee block (not just a word in description)
  const guaranteeEl = $('[class*="guarantee"]:not([class*="description"]):not([class*="text"]), [class*="satisfaction"], .money-back, [class*="policy-bar"]')
  const hasGuarantee = guaranteeEl.length > 0

  // Bundles: must have explicit bundle/pack containers
  const hasBundles = product.bundles.length > 0 ||
    !!($('[class*="bundle"], [class*="pack-select"], [class*="lot-select"], [class*="quantity-break"]').length)

  // ── Build section order matching the real page flow ──
  const sectionOrder: string[] = []

  // Product hero is always first if product detected
  if (product.title) sectionOrder.push('product_hero')

  // Trust badges
  if (hasTrustBadges) sectionOrder.push('trust_badges')

  // Description
  if (product.description || resolvedDescHtml) sectionOrder.push('description')

  // Features/benefits section
  if (hasFeatures) sectionOrder.push('features')

  // Bundles/offers
  if (hasBundles) sectionOrder.push('bundles')

  // Testimonials/reviews
  if (testimonials.length > 0) sectionOrder.push('testimonials')

  // Guarantee (only if trust_badges wasn't added to avoid duplicates)
  if (hasGuarantee && !hasTrustBadges) sectionOrder.push('guarantee')

  // FAQ
  if (faq.length > 0) sectionOrder.push('faq')

  // ── Layout heuristic ──
  // Assume single-column (funnel style) by default
  let detectedLayout: 'hero-split' | 'single-column' = 'single-column'
  // If it's a standard e-commerce store (Shopify, standard cart forms), it's likely a split layout
  if ($('form[action*="/cart/add"]').length > 0 || $('script:contains("Shopify")').length > 0 || $('link[href*="cdn.shopify.com"]').length > 0) {
    detectedLayout = 'hero-split'
  }

  return {
    hasHero: !!product.title,
    hasGallery: false, // We don't use the duplicate gallery section
    hasDescription: !!(product.description || resolvedDescHtml),
    hasFeatures,
    hasTestimonials: testimonials.length > 0,
    hasFaq: faq.length > 0,
    hasBundles,
    hasCountdown,
    hasTrustBadges,
    hasGuarantee: hasGuarantee && !hasTrustBadges,
    descriptionImages,
    sectionOrder,
    detectedLayout,
  }
}

// ── Generate faithful builder_json sections ──────────────────────────────────

function generateBuilderJson(
  themeId: string,
  storeName: string,
  productId: string | null,
  product: ExtractedProduct,
  allImages: string[],
  testimonials: { name: string; text: string; rating: number }[],
  faq: { question: string; answer: string }[],
  analysis: PageAnalysis,
  logoUrl: string | null,
  colors: string[],
  fonts: string[],
): any {
  const theme = getBoutiqueTheme(themeId)
  const baseBuilder = buildStorePage(themeId, storeName, productId)

  const allProductImages = [...new Set([
    ...product.images,
    ...analysis.descriptionImages,
    ...allImages,
  ])].filter(Boolean).slice(0, 25)

  const uid = () => `clone-${Math.random().toString(36).slice(2, 9)}`
  const fmtPrice = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  // Primary color from extracted page colors
  const primaryColor = colors.find(c => {
    const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16)
    return Math.max(r, g, b) - Math.min(r, g, b) > 50
  }) || theme.colors.accent

  const sections: any[] = []

  for (const sectionType of analysis.sectionOrder) {
    switch (sectionType) {

      // ── Product hero → Galerie (images) + Titre + Prix ──
      case 'product_hero': {
        // The Galerie block auto-reads images from the selected product
        // We push Titre + Prix as separate blocks (that's how the builder works)
        sections.push({
          id: uid(), type: 'Galerie', title: 'Galerie', hidden: false,
          settings: { images: allProductImages.slice(0, 12) }
        })
        sections.push({
          id: uid(), type: 'Titre', title: 'Titre', hidden: false,
          settings: {}
        })
        sections.push({
          id: uid(), type: 'Prix', title: 'Prix', hidden: false,
          settings: {}
        })
        break
      }

      // ── Trust badges → guarantees ──
      case 'trust_badges': {
        sections.push({
          id: uid(), type: 'guarantees', title: 'Garanties', hidden: false,
          settings: {
            title: 'Achetez en toute confiance',
            items: [
              { id: uid(), icon: '🚚', title: 'Livraison rapide', text: 'Recevez votre commande rapidement' },
              { id: uid(), icon: '✅', title: 'Satisfait ou remboursé', text: 'Retour sous 30 jours' },
              { id: uid(), icon: '🔒', title: 'Paiement sécurisé', text: 'Transaction 100% sécurisée' },
              { id: uid(), icon: '📞', title: 'Support client 7j/7', text: 'Nous sommes là pour vous' },
            ],
            layout: 'row',
            bg_color: '#f9fafb',
            icon_color: primaryColor,
            style: 'cards',
          }
        })
        break
      }

      // ── Description → Description block (reads from product) ──
      case 'description': {
        sections.push({
          id: uid(), type: 'Description', title: 'Description', hidden: false,
          settings: {}
        })
        break
      }

      // ── Description images → image_text + gallery ──
      case 'description_images': {
        if (analysis.descriptionImages.length > 0) {
          // Show the first desc image alongside text
          sections.push({
            id: uid(), type: 'image_text', title: 'Image + Texte', hidden: false,
            settings: {
              title: product.headings.h2s[1] || `Pourquoi choisir ${product.title} ?`,
              subtitle: '',
              text: product.description.slice(200, 600) || product.description.slice(0, 400),
              image_url: analysis.descriptionImages[0],
              image_position: 'right',
              image_fit: 'cover',
              cta_text: 'Commander',
              cta_link: '#order-form',
              bg_color: '#ffffff',
              text_color: '#111827',
              image_style: 'rounded',
            }
          })
          // Additional description images as a gallery
          if (analysis.descriptionImages.length > 2) {
            sections.push({
              id: uid(), type: 'gallery', title: 'Galerie détails', hidden: false,
              settings: {
                title: 'Plus de détails',
                images: analysis.descriptionImages.slice(0, 10),
                layout: 'grid',
                columns: 2,
                gap: 12,
                border_radius: 12,
                show_lightbox: true,
              }
            })
          }
        }
        break
      }

      // ── Features → benefits ──
      case 'features': {
        const items = product.headings.h3s.slice(0, 4).map((h, i) => ({
          id: uid(),
          icon: ['🚚', '✅', '🔒', '💬', '⭐', '✨'][i] || '✓',
          title: h,
          text: '',
          color: primaryColor,
        }))
        if (items.length === 0) {
          items.push(
            { id: uid(), icon: '🚀', title: 'Résultats rapides', text: 'Efficacité prouvée', color: primaryColor },
            { id: uid(), icon: '💎', title: 'Qualité premium', text: 'Matériaux haut de gamme', color: primaryColor },
            { id: uid(), icon: '🛡️', title: 'Garanti 30 jours', text: 'Satisfait ou remboursé', color: primaryColor },
            { id: uid(), icon: '📦', title: 'Livraison offerte', text: 'Partout en Afrique', color: primaryColor },
          )
        }
        sections.push({
          id: uid(), type: 'benefits', title: 'Avantages', hidden: false,
          settings: {
            title: product.headings.h2s[2] || `Pourquoi choisir ${product.title} ?`,
            subtitle: 'Des avantages pensés pour vous',
            items,
            layout: 'grid',
            bg_color: '#f9fafb',
            icon_style: 'circle',
          }
        })
        break
      }

      // ── Bundles/Variants → text_block with formatted HTML ──
      case 'bundles': {
        if (product.bundles.length > 0) {
          const bundleHtml = product.bundles.map(b =>
            `<div style="padding:16px;border:2px solid ${primaryColor};border-radius:12px;margin-bottom:12px;background:#f9fafb">
              <strong>${b.name}</strong><br/>
              <span style="font-size:1.3em;font-weight:bold;color:${primaryColor}">${fmtPrice(b.price)} ${product.currency}</span>
              ${b.comparePrice ? `<span style="text-decoration:line-through;color:#999;margin-left:8px">${fmtPrice(b.comparePrice)} ${product.currency}</span>` : ''}
              <br/><small>Pack x${b.items}</small>
            </div>`
          ).join('')
          sections.push({
            id: uid(), type: 'text_block', title: 'Offres', hidden: false,
            settings: {
              title: 'Choisissez votre offre',
              content: bundleHtml,
              text_align: 'center',
              bg_color: '#ffffff',
              text_color: '#374151',
              max_width: 720,
              show_divider: false,
            }
          })
        }
        break
      }

      // ── Testimonials → testimonials ──
      case 'testimonials': {
        if (testimonials.length > 0) {
          sections.push({
            id: uid(), type: 'testimonials', title: 'Témoignages', hidden: false,
            settings: {
              title: `Ce que nos clients disent`,
              subtitle: `Plus de ${testimonials.length * 100}+ clients satisfaits`,
              items: testimonials.map(t => ({
                id: uid(),
                name: t.name,
                text: t.text,
                avatar_url: '',
                rating: t.rating,
                location: '',
                date: '',
                verified: true,
              })),
              layout: 'grid',
              bg_color: '#ffffff',
              show_stars: true,
              show_verified: true,
              show_photos: true,
            }
          })
        }
        break
      }

      // ── Gallery → gallery ──
      case 'gallery': {
        const galleryImages = [...new Set([...product.images, ...allProductImages])].slice(0, 15)
        if (galleryImages.length > 1) {
          sections.push({
            id: uid(), type: 'gallery', title: 'Galerie photos', hidden: false,
            settings: {
              title: `Galerie ${product.title}`,
              images: galleryImages,
              layout: 'grid',
              columns: 3,
              gap: 12,
              border_radius: 12,
              show_lightbox: true,
            }
          })
        }
        break
      }

      // ── Guarantee → guarantees ──
      case 'guarantee': {
        sections.push({
          id: uid(), type: 'guarantees', title: 'Nos garanties', hidden: false,
          settings: {
            title: 'Nos garanties',
            items: [
              { id: uid(), icon: '🛡️', title: 'Paiement sécurisé', text: 'Transaction 100% sécurisée' },
              { id: uid(), icon: '📦', title: 'Livraison garantie', text: 'Suivi en temps réel' },
              { id: uid(), icon: '↩️', title: 'Retour facile', text: '30 jours pour changer d\'avis' },
              { id: uid(), icon: '⭐', title: 'Satisfaction client', text: '98% de clients satisfaits' },
            ],
            layout: 'row',
            bg_color: '#f9fafb',
            icon_color: primaryColor,
            style: 'cards',
          }
        })
        break
      }

      // ── FAQ → faq ──
      case 'faq': {
        if (faq.length > 0) {
          sections.push({
            id: uid(), type: 'faq', title: 'FAQ', hidden: false,
            settings: {
              title: 'Questions fréquentes',
              subtitle: 'Tout ce que vous devez savoir',
              items: faq.map(q => ({
                id: uid(),
                question: q.question,
                answer: q.answer,
              })),
              bg_color: '#ffffff',
              accent_color: primaryColor,
              style: 'bordered',
            }
          })
        }
        break
      }
    }
  }

  // ── Always end with order form ──
  sections.push({
    id: uid(), type: 'order_form', title: 'Formulaire commande', hidden: false,
    settings: {
      title: `Commander ${product.title}`,
      subtitle: 'Remplissez le formulaire, nous vous appelons dans les 24h',
      fields: [
        { id: 'field-name', type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true },
        { id: 'field-phone', type: 'tel', label: 'Téléphone', placeholder: 'Ex: +224 620 000 000', required: true },
        { id: 'field-address', type: 'text', label: 'Adresse de livraison', placeholder: 'Quartier, ville', required: true },
      ],
      submit_text: 'Confirmer ma commande',
      submit_color: primaryColor,
      submit_text_color: '#ffffff',
      success_message: 'Merci ! Votre commande a été reçue.',
      bg_color: '#f9fafb',
      border_radius: 12,
      show_product_summary: true,
      show_quantity: true,
      show_variants: false,
      layout: 'standard',
    }
  })

  const bodyFont = fonts.find(f => !f.includes('Icon') && !f.includes('Font Awesome')) || 'Inter'
  const headingFont = fonts.length > 1 ? fonts.find(f => f !== bodyFont) || fonts[0] : bodyFont

  return {
    header: baseBuilder.header,
    template: sections,
    footer: baseBuilder.footer,
    selectedProductId: productId,
    themeSettings: {
      ...baseBuilder.themeSettings,
      layout: analysis.detectedLayout,
      logo_url: logoUrl || '',
      store_title: product.title || storeName,
      store_description: product.description.slice(0, 160),
    },
  }
}

// ── Theme matching ────────────────────────────────────────────────────────────

function findClosestTheme(colors: string[]) {
  if (!BOUTIQUE_THEMES.length) return 'nature-vert'
  const scores = BOUTIQUE_THEMES.map(t => {
    let score = 0
    const ta = t.colors.accent.toLowerCase()
    const tr = parseInt(ta.slice(1, 3), 16), tg = parseInt(ta.slice(3, 5), 16), tb2 = parseInt(ta.slice(5, 7), 16)
    for (const c of colors) {
      const cl = c.toLowerCase()
      if (cl === ta) score += 50
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

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body.url === 'string' ? body.url.trim() : ''
    if (!url) return NextResponse.json({ error: 'URL requise.' }, { status: 400 })

    const normalizedUrl = url.startsWith('http') ? url : 'https://' + url

    // ── Fetch the page ──
    const resp = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(25000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    })
    if (!resp.ok) return NextResponse.json({ error: `Impossible d'accéder à l'URL (HTTP ${resp.status}).` }, { status: 400 })

    const html = await resp.text()
    const baseUrl = resp.url || normalizedUrl
    const domain = new URL(baseUrl).hostname.replace('www.', '')
    const $ = cheerio.load(html)

    // ── Extract everything ──
    const jsonScripts = findAllJsonScripts($)
    const siteTitle = extractMeta($, 'title') || $('title').text().trim() || domain
    const metaDescription = extractMeta($, 'description') || ''
    const allColors = extractHexColors($)
    const fonts = extractFonts($)
    const logoUrl = extractLogoUrl($, baseUrl)
    const product = extractProduct($, jsonScripts, baseUrl)
    const allImages = extractAllImages($, baseUrl, jsonScripts)
    const testimonials = extractTestimonials($)
    const faq = extractFaq($)

    // ── Analyze page structure ──
    const analysis = analyzePageStructure($, baseUrl, product, testimonials, faq)

    // ── Find best matching theme ──
    const bestThemeId = findClosestTheme(allColors)
    const theme = getBoutiqueTheme(bestThemeId)

    // ── Supabase auth ──
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
    }

    if (!userId) {
      const { data: guestUser } = await supabase.from('User').select('id').eq('email', 'guest@local').maybeSingle()
      if (guestUser?.id) {
        userId = guestUser.id
      } else {
        const { data: au } = await supabase.auth.admin.createUser({
          email: `guest-${Date.now()}@local.dev`, password: randomUUID(), email_confirm: true
        })
        if (au?.user) {
          const { data: nu } = await supabase.from('User').insert({
            id: au.user.id, email: au.user.email!, name: 'Invité',
            role: 'CLOSER', commissionPerConfirm: 0, commissionPerDeliver: 0, earnings: 0
          }).select('id').single()
          if (nu) userId = nu.id
        }
      }
    }

    // ── Create cloned product ──
    let clonedProductId: string | null = null
    if (product.title) {
      const mergedProdImages = [...new Set([
        ...product.images,
        ...analysis.descriptionImages,
        ...allImages,
      ])].filter(Boolean).slice(0, 20)

      const { data: np } = await supabase.from('products').insert({
        title: product.title,
        price: String(product.price || 0),
        compare_price: product.comparePrice ? String(product.comparePrice) : null,
        currency: product.currency || 'FCFA',
        description: product.descriptionHtml || product.description || '',
        image_url: product.image_url || mergedProdImages[0] || '',
        images: mergedProdImages,
        status: 'active',
        tags: ['cloné'],
      }).select('id').single()
      if (np) clonedProductId = np.id
    }

    // ── Store name & slug ──
    const baseName = (product?.title || siteTitle).replace(/[|‐]/g, '-').split('-')[0]?.trim() || domain
    const storeName = (baseName.length > 50 ? baseName.slice(0, 50) : baseName).trim() || 'Boutique clonée'
    let slug = sanitizeSlug(storeName)
    const { data: existingStore } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (existingStore) slug = `${slug}-${Date.now().toString(36)}`

    // ── Generate faithful builder_json ──
    const builderJson = generateBuilderJson(
      bestThemeId,
      storeName,
      clonedProductId,
      product,
      allImages,
      testimonials,
      faq,
      analysis,
      logoUrl,
      allColors,
      fonts,
    )

    // Ensure all blocks have IDs
    for (const group of ['template', 'header', 'footer'] as const) {
      if (Array.isArray(builderJson[group])) {
        builderJson[group].forEach((b: any) => {
          if (!b.id) b.id = `${b.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        })
      }
    }

    // ── Insert into DB ──
    const { data: store, error: storeError } = await supabase
      .from('stores').insert({ name: storeName, slug, status: 'draft', user_id: userId })
      .select().single()
    if (storeError || !store) return NextResponse.json({ error: storeError?.message || 'Erreur création boutique.' }, { status: 500 })

    const { error: settingsError } = await supabase.from('store_settings').insert({
      store_id: store.id, theme_id: theme.id,
      colors: toStoreColors(theme), fonts: toStoreFonts(theme),
      pixels: { meta: '', tiktok: '', google: '' }, custom_css: '',
    })
    if (settingsError) {
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    const { error: pageError } = await supabase.from('store_pages').insert({
      store_id: store.id, slug: 'home', title: 'Accueil',
      builder_json: builderJson, is_published: false,
    })
    if (pageError) {
      await supabase.from('store_settings').delete().eq('store_id', store.id)
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: pageError.message }, { status: 500 })
    }

    return NextResponse.json({
      data: store,
      analysis: {
        title: storeName,
        description: metaDescription.slice(0, 300),
        colors_detected: allColors.slice(0, 8),
        fonts_detected: fonts.slice(0, 3),
        logo_detected: !!logoUrl,
        product_extracted: !!product.title,
        product_title: product.title || null,
        product_price: product.price || null,
        images_extracted: allImages.length,
        product_images: product.images.length,
        description_images: analysis.descriptionImages.length,
        headings_detected: product.headings.h1 ? 1 + product.headings.h2s.length : 0,
        testimonials_extracted: testimonials.length,
        faq_extracted: faq.length,
        bundles_extracted: product.bundles.length,
        sections_generated: builderJson.template.length,
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