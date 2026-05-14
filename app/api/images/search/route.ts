// app/api/images/search/route.ts
// Recherche d'images qualité via Serper.dev
// Stratégie : site: ciblés (Pinterest, Amazon, AliExpress, Shein, Etsy) pour des images e-com réelles

import { NextRequest, NextResponse } from 'next/server'

const SERPER_API_KEY = process.env.SERPER_API_KEY

interface ProductImage {
  url: string
  title: string
  source: string
  type: 'pinterest' | 'amazon' | 'ecom' | 'lifestyle'
  thumbnail?: string
  width?: number
  height?: number
}

interface SearchQueries {
  pinterest: string;
  aesthetic: string;
  ugc: string;
  infographic: string;
}

// Traduit le nom produit en terme de recherche anglais générique via Claude Haiku
async function translateToSearchTerm(produit: string): Promise<string> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 30,
        messages: [{
          role: 'user',
          content: `Translate this product name to a short generic English search term (2-4 words max, no brand names). Reply with ONLY the search term, nothing else.

Examples:
"rasoir électrique homme" → electric shaver men
"crème éclaircissante visage" → face brightening cream
"gel exfoliant" → exfoliating gel
"mètre laser" → laser tape measure

Product: "${produit}"`
        }]
      })
    })
    const data = await res.json()
    const raw = (data.content?.[0]?.text || '').trim()
    const term = raw.replace(/^["'→\-\s]+|["'\s]+$/g, '').trim()
    if (!term || term.toLowerCase() === 'undefined' || term.length < 2) {
      return produit
    }
    console.log(`[images/search] "${produit}" → "${term}"`)
    return term
  } catch {
    return produit
  }
}

// Appel Serper avec gestion d'erreur
async function serperSearch(
  query: string,
  num: number,
  page = 1
): Promise<{ items: any[]; error?: string }> {
  try {
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num, gl: 'us', hl: 'en', page }),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.message || `HTTP ${res.status}`
      if (res.status === 401 || res.status === 403) return { items: [], error: 'Clé Serper.dev invalide. Vérifiez SERPER_API_KEY.' }
      if (res.status === 429) return { items: [], error: 'Quota Serper.dev épuisé.' }
      return { items: [], error: `Serper ${res.status}: ${msg}` }
    }
    return { items: data.images || [] }
  } catch (err: any) {
    return { items: [], error: `Erreur réseau: ${err.message}` }
  }
}

// Mappe un item Serper
function mapItem(item: any, type: ProductImage['type']): ProductImage {
  return {
    url: item.imageUrl || '',
    thumbnail: item.thumbnailUrl || item.imageUrl || '',
    title: item.title || '',
    source: item.source || item.domain || '',
    type,
    width: item.imageWidth,
    height: item.imageHeight,
  }
}

// Filtre : exclut uniquement les URLs vides, gif, svg, et sources inutiles
function filterImages(images: ProductImage[]): ProductImage[] {
  // Sources à exclure absolument
  const blocked = [
    'youtube.com', 'youtu.be',
    'twitter.com', 'x.com',
    'facebook.com', 'fb.com',
    'tiktok.com',
    'reddit.com',
  ]
  return images.filter(img => {
    if (!img.url?.trim()) return false
    const clean = img.url.toLowerCase().split('?')[0]
    if (clean.endsWith('.gif') || clean.endsWith('.svg')) return false
    // On ne filtre plus par taille pour ne pas rater de bonnes images Pinterest
    const src = img.source.toLowerCase()
    if (blocked.some(d => src.includes(d))) return false
    return true
  })
}

export async function POST(req: NextRequest) {
  try {
    const { produit } = await req.json()

    if (!produit?.trim()) {
      return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 })
    }
    if (!SERPER_API_KEY || SERPER_API_KEY === 'COLLE_TA_CLE_ICI') {
      return NextResponse.json({
        error: 'Clé Serper manquante. Ajoutez SERPER_API_KEY dans .env.local',
        hint: 'Compte gratuit (2500 req/mois) sur https://serper.dev',
      }, { status: 500 })
    }

    const term = await translateToSearchTerm(produit.trim())

    // ── Stratégie : 3 sources directes sans mots-clés restrictifs (3 crédits) ──
    const [pinterestRes, amazonRes, aliRes] = await Promise.all([
      // 1. Pinterest — pour l'esthétique et le lifestyle
      serperSearch(`site:pinterest.com "${term}"`, 10, 1),

      // 2. Amazon — pour les photos produit pro
      serperSearch(`site:amazon.com "${term}"`, 6, 1),

      // 3. AliExpress — pour les déclinaisons e-commerce
      serperSearch(`site:aliexpress.com "${term}"`, 6, 1),
    ])

    const allFailed = [pinterestRes, amazonRes, aliRes].every(r => r.error && !r.items.length)
    if (allFailed) {
      return NextResponse.json({
        error: pinterestRes.error || 'Aucun résultat.',
        images: [], searchTerm: term, total: 0,
      }, { status: 502 })
    }

    // Assembler dans l'ordre de priorité qualité
    const allImages: ProductImage[] = [
      ...filterImages(pinterestRes.items.map(i => mapItem(i, 'pinterest'))),
      ...filterImages(amazonRes.items.map(i => mapItem(i, 'amazon'))),
      ...filterImages(aliRes.items.map(i => mapItem(i, 'ecom'))),
    ]

    // Dédupliquer par URL
    const seen = new Set<string>()
    const unique = allImages.filter(img => {
      if (!img.url || seen.has(img.url)) return false
      seen.add(img.url)
      return true
    })

    console.log(`[images/search] ✅ ${unique.length} images`)

    const warning = [pinterestRes, amazonRes, aliRes].find(r => r.error)?.error

    return NextResponse.json({
      images: unique.slice(0, 15), // Max 15 images
      searchTerm: term,
      total: unique.length,
      ...(warning ? { warning } : {}),
    })

  } catch (err: any) {
    console.error('[images/search] Erreur:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
