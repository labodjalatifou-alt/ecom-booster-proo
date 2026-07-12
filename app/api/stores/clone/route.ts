import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase'
import {
  getBoutiqueTheme,
  toStoreColors,
  toStoreFonts,
  BOUTIQUE_THEMES,
} from '@/lib/store-builder/boutique-themes'
import { generateSectionId } from '@/lib/store-builder/defaults'

// ── Helpers HTML ──

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) return m[1]
  }
  return null
}

function extractAllImages(html: string, baseUrl: string): string[] {
  const urls = new Set<string>()
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const src = m[1]
    if (/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(src) && !src.includes('data:')) {
      try {
        urls.add(new URL(src, baseUrl).href)
      } catch { urls.add(src) }
    }
  }
  return Array.from(urls).slice(0, 20)
}

function extractAllVideos(html: string, baseUrl: string): string[] {
  const urls = new Set<string>()
  const re = /<video[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const src = m[1]
    if (!src.includes('data:')) {
      try { urls.add(new URL(src, baseUrl).href) } catch { urls.add(src) }
    }
  }
  const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi
  while ((m = iframeRe.exec(html)) !== null) {
    if (m[1].includes('youtube') || m[1].includes('youtu.be')) {
      try { urls.add(new URL(m[1], baseUrl).href) } catch { urls.add(m[1]) }
    }
  }
  return Array.from(urls).slice(0, 10)
}

function extractHexColors(html: string): string[] {
  const found = new Set<string>()
  const hexRe = /#([0-9a-fA-F]{3,8})\b/g
  let match
  while ((match = hexRe.exec(html)) !== null) {
    const c = match[0].toLowerCase()
    if (c !== '#ffffff' && c !== '#000000' && c !== '#fff' && c !== '#000' && c !== '#fff' && c !== '#fff') {
      found.add(c)
    }
  }
  return Array.from(found).slice(0, 20)
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>()
  const re = /font-family:\s*([^;}]+)/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const parts = m[1].split(',').map(p => p.replace(/["']/g, '').trim())
    parts.forEach(p => {
      if (p && p !== 'sans-serif' && p !== 'serif' && p !== 'monospace' && !p.includes('inherit')) fonts.add(p)
    })
  }
  return Array.from(fonts)
}

function extractLogoUrl(html: string, baseUrl: string): string | null {
  const patterns = [
    /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+id=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+logo[^"']+)["']/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      try { return new URL(m[1], baseUrl).href } catch { return m[1] }
    }
  }
  return null
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function parseInlineCssColors(html: string): string[] {
  const colors: string[] = []
  const rgbRe = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi
  let m
  while ((m = rgbRe.exec(html)) !== null) {
    colors.push(rgbToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])))
  }
  return colors
}

// ── Extraction de la structure de la page ──

interface ScrapedSection {
  type: string
  title?: string
  subtitle?: string
  text?: string
  images: string[]
  items: any[]
  bgColor?: string
  textColor?: string
}

function extractHeroSection(html: string, baseUrl: string): ScrapedSection | null {
  const heroEl = html.match(/<section[^>]*(?:hero|banner|header-hero)[^>]*>([\s\S]*?)<\/section>/gi)
    || html.match(/<div[^>]*(?:hero|banner|hero-section)[^>]*>([\s\S]*?)<\/div>/gi)
  const inner = heroEl?.[1] || ''
  if (!inner) return null

  const title = inner.match(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
  const subtitle = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
  const images = extractAllImages(inner, baseUrl).slice(0, 3)

  return { type: 'hero', title, subtitle: subtitle.length > 200 ? '' : subtitle, images, items: [] }
}

function extractTestimonials(html: string, baseUrl: string): ScrapedSection | null {
  const blocks = html.matchAll(/<div[^>]*(?:testimonial|review|temoignage|avis|customer-say)[^>]*>[\s\S]*?<\/div>/gi)
  const items: any[] = []
  for (const block of blocks) {
    const text = block[0].match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || block[0].match(/<p[^>]*class=["'][^"']*(?:text|review-text)[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || block[0].replace(/<[^>]+>/g, '').trim().slice(0, 200)
    const name = block[0].match(/<[^>]+class=["'][^"']*(?:author|name|customer-name)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const img = block[0].match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    const images = img ? [img.startsWith('http') ? img : new URL(img, baseUrl).href] : []
    if (text && text.length > 10) {
      items.push({ name, text: text.slice(0, 300), image: images[0] || '', rating: 5, verified: true })
    }
  }
  if (items.length === 0) {
    const textBlocks = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    for (const p of textBlocks) {
      const t = p[1].replace(/<[^>]+>/g, '').trim()
      if (t.includes('★') || t.includes('émoignage') || t.includes('client') || t.includes('recommande')) {
        items.push({ name: '', text: t.slice(0, 200), image: '', rating: 5, verified: true })
      }
      if (items.length >= 4) break
    }
  }
  if (items.length === 0) return null
  const sectionTitle = html.match(/<h[1-3][^>]*>([\s\S]*?(?:émoignage|avis|client|review|dit)[\s\S]*?)<\/h[1-3]>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Témoignages'
  return { type: 'testimonials_floating', title: sectionTitle, images: [], items: items.slice(0, 6) }
}

function extractFaq(html: string): ScrapedSection | null {
  const qaPairs = [...html.matchAll(/<div[^>]*(?:faq|question|accordion)[^>]*>([\s\S]*?)<\/div>/gi)]
  const items: any[] = []
  for (const pair of qaPairs) {
    const q = pair[1].match(/<[^>]+class=["'][^"']*(?:question|faq-q|accordion-header)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || pair[1].match(/<h[3-4][^>]*>([\s\S]*?)<\/h[3-4]>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const a = pair[1].match(/<[^>]+class=["'][^"']*(?:answer|faq-a|accordion-body)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || pair[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    if (q && a) items.push({ id: `f${items.length + 1}`, question: q.slice(0, 150), answer: a.slice(0, 500) })
  }
  if (items.length === 0) return null
  return { type: 'faq', title: 'FAQ', images: [], items }
}

function extractBenefits(html: string): ScrapedSection | null {
  const features = [...html.matchAll(/<div[^>]*(?:feature|benefit|advantage|icon-box|service)[^>]*>[\s\S]*?<\/div>/gi)]
  const items: any[] = []
  for (const f of features) {
    const title = f[0].match(/<h[3-4][^>]*>([\s\S]*?)<\/h[3-4]>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const text = f[0].match(/<p[^>]*>([\s\S]*?)<\/p>/gi)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const icon = f[0].match(/<i[^>]*class=["'][^"']*(?:icon|fa-)[^"']*["'][^>]*>/i) ? '✅' : ''
    if (title || text) items.push({ icon: icon || '✅', title: title, text: text.slice(0, 150), description: '' })
  }
  if (items.length === 0) return null
  return { type: 'benefits', title: 'Nos avantages', images: [], items: items.slice(0, 6) }
}

// ── Extraction produit (Shopify / e-commerce) ──

interface ScrapedProduct {
  title: string
  price: number
  currency: string
  description: string
  image_url: string
  images: string[]
}

function extractProductFromJsonLd(html: string): ScrapedProduct | null {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const s of scripts) {
    try {
      const data = JSON.parse(s[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'ProductGroup') {
          const images = []
          if (item.image) {
            const imgArr = Array.isArray(item.image) ? item.image : [item.image]
            for (const img of imgArr) {
              if (typeof img === 'string') images.push(img)
              else if (img?.url) images.push(img.url)
            }
          }
          return {
            title: item.name || '',
            price: item.offers?.price ? parseFloat(item.offers.price) : 0,
            currency: item.offers?.priceCurrency || 'FCFA',
            description: item.description || '',
            image_url: images[0] || '',
            images,
          }
        }
      }
    } catch {}
  }
  return null
}

function extractProductFromMeta(html: string, baseUrl: string): Partial<ScrapedProduct> {
  const p: Partial<ScrapedProduct> = {}
  const title = extractMeta(html, 'og:title') || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
  if (title) p.title = title
  const ogPrice = extractMeta(html, 'product:price:amount') || extractMeta(html, 'og:price:amount')
  if (ogPrice) p.price = parseFloat(ogPrice) || 0
  const ogCurrency = extractMeta(html, 'product:price:currency') || extractMeta(html, 'og:price:currency')
  if (ogCurrency) p.currency = ogCurrency
  const ogImage = extractMeta(html, 'og:image')
  if (ogImage) {
    try { p.image_url = new URL(ogImage, baseUrl).href } catch { p.image_url = ogImage }
  }
  const desc = extractMeta(html, 'description') || extractMeta(html, 'og:description')
  if (desc) p.description = desc
  return p
}

function extractProductFromHtml(html: string, baseUrl: string): ScrapedProduct | null {
  // 1. Try JSON-LD first (richest data)
  const ld = extractProductFromJsonLd(html)
  if (ld && ld.title && ld.price > 0) return ld

  // 2. Fallback: meta tags + HTML
  const meta = extractProductFromMeta(html, baseUrl)
  const images = extractAllImages(html, baseUrl)

  if (meta.title) {
    return {
      title: meta.title,
      price: meta.price || 0,
      currency: meta.currency || 'FCFA',
      description: meta.description || '',
      image_url: meta.image_url || images[0] || '',
      images: meta.image_url ? [meta.image_url, ...images.slice(0, 4)] : images.slice(0, 5),
    }
  }

  return null
}

function extractFooterInfo(html: string): { copyright?: string; whatsapp?: string } {
  const info: { copyright?: string; whatsapp?: string } = {}
  const c = html.match(/©\s*\d{4}[^<]*/i)?.[0]?.trim()
  if (c) info.copyright = c
  const w = html.match(/whatsapp|wa\.me|wa\/send|224|225|221|237|\+?\d{9,}/gi)
  if (w) info.whatsapp = w[0]
  return info
}

function findClosestTheme(colors: string[], fonts: string[]) {
  if (BOUTIQUE_THEMES.length === 0) return 'nature-vert'
  const themeScores = BOUTIQUE_THEMES.map(theme => {
    let score = 0
    const tAccent = theme.colors.accent.toLowerCase()
    const tBg = theme.colors.bg.toLowerCase()
    for (const c of colors) {
      const cl = c.toLowerCase()
      if (cl === tAccent) score += 50
      if (cl === tBg) score += 20
      const cRgb = parseInt(cl.slice(1, 3), 16); const cG = parseInt(cl.slice(3, 5), 16); const cB = parseInt(cl.slice(5, 7), 16)
      const tR = parseInt(tAccent.slice(1, 3), 16); const tG = parseInt(tAccent.slice(3, 5), 16); const tB = parseInt(tAccent.slice(5, 7), 16)
      if (Math.sqrt((cRgb - tR) ** 2 + (cG - tG) ** 2 + (cB - tB) ** 2) < 100) score += 10
    }
    for (const f of fonts) {
      if (theme.fonts.display.toLowerCase().includes(f.toLowerCase()) || theme.fonts.body.toLowerCase().includes(f.toLowerCase())) score += 15
    }
    return { id: theme.id, score }
  })
  themeScores.sort((a, b) => b.score - a.score)
  return themeScores[0].id
}

function sanitizeSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'boutique-clonee'
}

// ── Reconstruction d'une page builder à partir des sections scrapées ──

function sectionToBlock(scraped: ScrapedSection, themeId: string) {
  const accent = BOUTIQUE_THEMES.find(t => t.id === themeId)?.colors.accent || '#6366f1'

  switch (scraped.type) {
    case 'hero':
      return {
        id: generateSectionId('hero'),
        type: 'hero',
        title: 'Hero / Bannière',
        settings: {
          title: scraped.title || 'Bienvenue',
          subtitle: scraped.subtitle || 'Découvrez nos produits',
          bg_color: scraped.bgColor || '#FFFFFF',
          text_color: scraped.textColor || '#1f2937',
          image_url: scraped.images[0] || '',
          images: scraped.images,
          overlay: false,
          accent_color: accent,
        },
        hidden: false,
      }
    case 'testimonials_floating':
      return {
        id: generateSectionId('testimonials_floating'),
        type: 'testimonials_floating',
        title: 'Témoignages flottants',
        settings: {
          title: scraped.title || 'Ils parlent de nous',
          bg_color: scraped.bgColor || '#FFFFFF',
          items: scraped.items.filter(it => it.text),
        },
        hidden: false,
      }
    case 'faq':
      return {
        id: generateSectionId('faq'),
        type: 'faq',
        title: 'FAQ',
        settings: {
          title: 'Questions fréquentes',
          text_size: 14,
          bg_color: '#FFFFFF',
          accent_color: accent,
          items: scraped.items.slice(0, 8),
        },
        hidden: false,
      }
    case 'benefits':
      return {
        id: generateSectionId('benefits'),
        type: 'benefits',
        title: 'Avantages',
        settings: {
          title: scraped.title || 'Nos avantages',
          show_cta: false,
          columns: 2,
          bg_color: '#FFFFFF',
          items: scraped.items.slice(0, 6),
        },
        hidden: false,
      }
    default:
      return null
  }
}

// ── Route API ──

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body.url === 'string' ? body.url.trim() : ''

    if (!url) {
      return NextResponse.json({ error: 'L\'URL de la boutique à cloner est requise.' }, { status: 400 })
    }

    let normalizedUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url
    }

    const resp = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!resp.ok) {
      return NextResponse.json({
        error: `Impossible d'accéder à l'URL (HTTP ${resp.status}). Vérifiez que la boutique est accessible en ligne.`,
      }, { status: 400 })
    }

    const html = await resp.text()
    const baseUrl = resp.url || normalizedUrl
    const domain = new URL(baseUrl).hostname.replace('www.', '')

    // ── Extraction données ──
    const title = extractMeta(html, 'title') || extractMeta(html, 'og:title') || domain
    const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || ''
    const hexColors = extractHexColors(html)
    const inlineColors = parseInlineCssColors(html)
    const allColors = [...new Set([...hexColors, ...inlineColors])]
    const fonts = extractFonts(html)
    const logoUrl = extractLogoUrl(html, baseUrl)
    const allImages = extractAllImages(html, baseUrl)
    const allVideos = extractAllVideos(html, baseUrl)
    const footerInfo = extractFooterInfo(html)

    // ── Extraction produit ──
    const scrapedProduct = extractProductFromHtml(html, baseUrl)

    // ── Extraction structure ──
    const hero = extractHeroSection(html, baseUrl)
    const testimonials = extractTestimonials(html, baseUrl)
    const faqSection = extractFaq(html)
    const benefitsSection = extractBenefits(html)

    const bestThemeId = findClosestTheme(allColors, fonts)
    const theme = getBoutiqueTheme(bestThemeId)

    // ── Construction de la page ──
    const baseName = title.replace(/[|‐]/g, '-').split('-')[0]?.trim() || domain
    const storeName = baseName.length > 40 ? baseName.slice(0, 40) : baseName
    const slug = sanitizeSlug(storeName)

    // Construire les blocs : header + sections scrapées + footer
    const scrapedBlocks = [hero, testimonials, benefitsSection, faqSection]
      .map(s => s ? sectionToBlock(s, bestThemeId) : null)
      .filter(Boolean) as any[]

    // Prendre les images du hero ou du produit pour la galerie
    const productImages = scrapedProduct?.images || []
    const galleryImages = hero?.images.length ? hero.images : (productImages.length ? productImages : allImages.slice(0, 4))

    // Blocs de base
    const headerBlock = {
      id: generateSectionId('Header'),
      type: 'Header',
      title: 'En-tête',
      settings: {
        logo_url: logoUrl || '',
        logo_height: 40,
        bg_color: theme.colors.bg,
        text_color: theme.colors.text,
        accent_color: theme.colors.accent,
      },
      hidden: false,
    }

    const footerBlock = {
      id: generateSectionId('Footer'),
      type: 'Footer',
      title: 'Footer',
      settings: {
        copyright: footerInfo.copyright || `© ${new Date().getFullYear()} ${storeName}. Tous droits réservés.`,
        whatsapp_number: footerInfo.whatsapp || '',
        show_whatsapp: !!footerInfo.whatsapp,
        bg_color: theme.colors.text,
        text_color: '#ffffff',
      },
      hidden: false,
    }

    const supabase = createAdminSupabase()

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const supabaseAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )

    let userId = null
    if (token) {
      const { data: authData } = await supabaseAuth.auth.getUser(token)
      userId = authData?.user?.id ?? null
      if (userId) {
        const { data: existingUser } = await supabase.from('User').select('id').eq('id', userId).maybeSingle()
        if (!existingUser) {
          await supabase.from('User').insert({ id: userId, email: authData!.user!.email!, name: authData!.user!.user_metadata?.name || 'Utilisateur', role: 'CLOSER', commissionPerConfirm: 0, commissionPerDeliver: 0, earnings: 0 })
        }
      }
    }

    if (!userId) {
      const { data: guestUser } = await supabase.from('User').select('id').eq('email', 'guest@local').maybeSingle()
      if (guestUser?.id) {
        userId = guestUser.id
      } else {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({ email: `guest-${Date.now()}@local.dev`, password: randomUUID(), email_confirm: true, user_metadata: { name: 'Invité' } })
        if (authUser?.user) {
          const { data: newUser } = await supabase.from('User').insert({ id: authUser.user.id, email: authUser.user.email!, name: 'Invité', role: 'CLOSER', commissionPerConfirm: 0, commissionPerDeliver: 0, earnings: 0 }).select('id').single()
          if (newUser) userId = newUser.id
        }
      }
    }

    const { data: existing } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

    const storeNameDisplay = extractMeta(html, 'og:site_name') || domain.split('.')[0] || storeName

    // ── Création du produit cloné ──
    let clonedProductId: string | null = null
    if (scrapedProduct && scrapedProduct.title) {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          title: scrapedProduct.title,
          price: String(scrapedProduct.price || 0),
          currency: scrapedProduct.currency || 'FCFA',
          description: scrapedProduct.description?.slice(0, 2000) || '',
          image_url: scrapedProduct.image_url || '',
          images: JSON.stringify(scrapedProduct.images || []),
          status: 'active',
        })
        .select('id')
        .single()

      if (!productError && newProduct) {
        clonedProductId = newProduct.id
      }
    }

    // Construire builder_json
    const builderJson = {
      header: [headerBlock],
      template: [
        // Hero
        ...(scrapedBlocks.length > 0 ? scrapedBlocks : []),
        // Galerie avec images extraites
        ...(galleryImages.length >= 2 ? [{
          id: generateSectionId('gallery'),
          type: 'gallery',
          title: 'Galerie photos',
          settings: {
            images: galleryImages.map((url: string, i: number) => ({
              url,
              alt: `Photo ${i + 1}`,
            })),
            columns: Math.min(galleryImages.length, 4),
          },
          hidden: false,
        }] : []),
        // Vidéos
        ...(allVideos.length >= 1 ? [{
          id: generateSectionId('video'),
          type: 'video',
          title: 'Vidéo',
          settings: {
            video_url: allVideos[0],
            title: 'Découvrez en vidéo',
            autoplay: false,
          },
          hidden: false,
        }] : []),
        // Order form
        ...(allImages.length > 0 ? [{
          id: generateSectionId('order_form'),
          type: 'order_form',
          title: 'Formulaire commande',
          settings: {
            store_id: null,
            title: scrapedProduct?.title ? `Finaliser : ${scrapedProduct.title.slice(0, 40)}` : 'Finaliser ma commande',
            btn_text: 'COMMANDER MAINTENANT',
            bg_color: theme.colors.surface,
            border_color: theme.colors.border,
            title_color: theme.colors.text,
            btn_color: theme.colors.accent,
            accent_color: theme.colors.gold,
            bundles_enabled: scrapedProduct && scrapedProduct.price > 0,
            bundles: scrapedProduct && scrapedProduct.price > 0 ? [
              { id: 'b1', qty: 1, label: '1 unité', sublabel: '', badge: '', discount_pct: 0, popular: false, hidden: false },
              { id: 'b2', qty: 2, label: '2 unités', sublabel: 'Économisez 15%', badge: 'POPULAIRE', discount_pct: 15, popular: true, hidden: false },
              { id: 'b3', qty: 3, label: '3 unités', sublabel: 'Meilleur prix', badge: 'MEILLEURE OFFRE', discount_pct: 25, popular: false, hidden: false },
            ] : [],
          },
          hidden: false,
        }] : []),
        // Marquee avec des produits
        ...(allImages.length > 0 ? [{
          id: generateSectionId('marquee'),
          type: 'marquee',
          title: 'Marquee défilant',
          settings: {
            text: `✨ ${storeNameDisplay} — Livraison rapide • Paiement à la livraison • Qualité garantie ✨`,
            speed: 30,
            bg_color: theme.colors.accent,
            text_color: '#ffffff',
          },
          hidden: false,
        }] : []),
      ],
      footer: [footerBlock],
      themeSettings: {
        primaryColor: theme.colors.accent,
        secondaryColor: theme.colors.bg,
        backgroundColor: theme.colors.bg,
        textColor: theme.colors.text,
        textSoftColor: theme.colors.text_soft,
        accentDeep: theme.colors.accent_deep,
        gold: theme.colors.gold,
        border: theme.colors.border,
        surface: theme.colors.surface,
        fontFamily: theme.fonts.body,
        logo_url: logoUrl || '',
        logo_height: 40,
        cardBorderRadius: 0,
        cardBorderWidth: 0,
        cardMaxWidth: 1100,
        meta_pixel_id: extractMeta(html, 'fb:app_id') || '',
        whatsapp_number: footerInfo.whatsapp || '',
        show_whatsapp: !!footerInfo.whatsapp,
      },
      selectedProductId: clonedProductId,
    }

    // ── Création en base ──
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ name: storeNameDisplay, slug: finalSlug, status: 'draft', user_id: userId })
      .select()
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: storeError?.message || 'Erreur création boutique.' }, { status: 500 })
    }

    const { error: settingsError } = await supabase.from('store_settings').insert({
      store_id: store.id,
      theme_id: theme.id,
      colors: toStoreColors(theme),
      fonts: toStoreFonts(theme),
      pixels: { meta: extractMeta(html, 'fb:app_id') || '', tiktok: '', google: '' },
      custom_css: '',
    })

    if (settingsError) {
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
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
      return NextResponse.json({ error: pageError.message }, { status: 500 })
    }

    const scrapedSections = [hero, testimonials, benefitsSection, faqSection].filter(Boolean).length

    return NextResponse.json({
      data: store,
      analysis: {
        title: storeNameDisplay,
        description: description.slice(0, 300),
        colors_detected: allColors.slice(0, 8),
        fonts_detected: fonts.slice(0, 4),
        logo_detected: !!logoUrl,
        images_extracted: allImages.length,
        videos_extracted: allVideos.length,
        sections_rebuilt: scrapedSections,
        product_extracted: !!scrapedProduct,
        product_title: scrapedProduct?.title || null,
        product_price: scrapedProduct?.price || null,
        product_images: scrapedProduct?.images?.length || 0,
        theme_used: theme.name,
        theme_id: theme.id,
      },
    })
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json({ error: 'La boutique met trop de temps à répondre. Vérifiez l\'URL ou réessayez.' }, { status: 408 })
    }
    console.error('Clone error:', err)
    return NextResponse.json({ error: `Erreur lors du clonage : ${err.message}` }, { status: 500 })
  }
}
