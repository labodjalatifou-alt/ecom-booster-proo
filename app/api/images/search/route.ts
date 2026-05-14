// app/api/images/search/route.ts
// Recherche d'images stricte via Serper.dev
// Objectif : Trouver le modèle exact + Photos en action (Lifestyle) + Filtrage impitoyable

import { NextRequest, NextResponse } from 'next/server'

const SERPER_API_KEY = process.env.SERPER_API_KEY

interface ProductImage {
  url: string
  title: string
  source: string
  type: 'pinterest' | 'amazon' | 'aliexpress'
  style: 'product' | 'lifestyle'
  thumbnail?: string
  width?: number
  height?: number
}

// Traduit le nom produit en terme de recherche très précis via Claude
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
        max_tokens: 40,
        messages: [{
          role: 'user',
          content: `Extract the EXACT product name and model from this text, and translate it to English for an e-commerce search. Keep brand names or specific model numbers if present. Do NOT add generic words. Reply ONLY with the search term.

Product: "${produit}"`
        }]
      })
    })
    const data = await res.json()
    const raw = (data.content?.[0]?.text || '').trim()
    const term = raw.replace(/^["'→\-\s]+|["'\s]+$/g, '').trim()
    if (!term || term.toLowerCase() === 'undefined' || term.length < 2) return produit
    console.log(`[images/search] Terme précis : "${produit}" → "${term}"`)
    return term
  } catch {
    return produit
  }
}

// Appel Serper
async function serperSearch(
  query: string,
  num: number
): Promise<{ items: any[]; error?: string }> {
  try {
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num, gl: 'us', hl: 'en' }),
    })
    const data = await res.json()
    if (!res.ok) return { items: [], error: data.message || `HTTP ${res.status}` }
    return { items: data.images || [] }
  } catch (err: any) {
    return { items: [], error: err.message }
  }
}

// Le Garde du Corps : Filtre ultra-strict
function filterStrictImages(images: any[], sourceName: ProductImage['type'], style: ProductImage['style'], allowedDomains: string[]): ProductImage[] {
  const filtered: ProductImage[] = []
  
  for (const img of images) {
    if (!img.imageUrl) continue
    
    const url = img.imageUrl.toLowerCase()
    const sourceDomain = (img.source || img.domain || '').toLowerCase()

    // 1. Bloquer les mauvaises extensions
    if (url.includes('.gif') || url.includes('.svg') || url.includes('base64')) continue

    // 2. Bloquer les images trop petites (pixelisées)
    if (img.imageWidth && img.imageWidth < 400) continue
    if (img.imageHeight && img.imageHeight < 400) continue

    // 3. Forcer la provenance : L'image DOIT venir du domaine autorisé
    const isFromAllowedDomain = allowedDomains.some(domain => sourceDomain.includes(domain))
    if (!isFromAllowedDomain) continue

    // 4. Bloquer explicitement les blogs/youtube au cas où ça passerait
    const blocked = ['youtube', 'blog', 'article', 'news', 'wordpress', 'tiktok']
    if (blocked.some(b => url.includes(b) || sourceDomain.includes(b))) continue

    filtered.push({
      url: img.imageUrl,
      thumbnail: img.thumbnailUrl || img.imageUrl,
      title: img.title || '',
      source: sourceDomain,
      type: sourceName,
      style: style,
      width: img.imageWidth,
      height: img.imageHeight,
    })
  }

  return filtered
}

export async function POST(req: NextRequest) {
  try {
    const { produit } = await req.json()

    if (!produit?.trim()) return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 })
    if (!SERPER_API_KEY) return NextResponse.json({ error: 'SERPER_API_KEY manquante.' }, { status: 500 })

    const term = await translateToSearchTerm(produit.trim())

    // On lance 6 recherches en parallèle : (Produit normal + Lifestyle) x 3 sources
    const [
      aliProduct, aliLifestyle,
      amazonProduct, amazonLifestyle,
      pinProduct, pinLifestyle
    ] = await Promise.all([
      serperSearch(`site:aliexpress.com "${term}"`, 15),
      serperSearch(`site:aliexpress.com "${term}" (lifestyle OR model OR in use OR holding)`, 15),
      
      serperSearch(`site:amazon.com "${term}"`, 10),
      serperSearch(`site:amazon.com "${term}" (lifestyle OR model OR in use)`, 10),
      
      serperSearch(`site:pinterest.com "${term}" aesthetic`, 15),
      serperSearch(`site:pinterest.com "${term}" (model OR lifestyle OR using OR drinking OR hands)`, 15)
    ])

    // Filtrage très strict
    const allImages: ProductImage[] = [
      ...filterStrictImages(aliProduct.items, 'aliexpress', 'product', ['aliexpress.com', 'alicdn']),
      ...filterStrictImages(aliLifestyle.items, 'aliexpress', 'lifestyle', ['aliexpress.com', 'alicdn']),
      
      ...filterStrictImages(amazonProduct.items, 'amazon', 'product', ['amazon.com', 'ssl-images-amazon']),
      ...filterStrictImages(amazonLifestyle.items, 'amazon', 'lifestyle', ['amazon.com', 'ssl-images-amazon']),
      
      ...filterStrictImages(pinProduct.items, 'pinterest', 'product', ['pinterest.com', 'pinimg.com']),
      ...filterStrictImages(pinLifestyle.items, 'pinterest', 'lifestyle', ['pinterest.com', 'pinimg.com'])
    ]

    // Dédupliquer par URL
    const seen = new Set<string>()
    const unique = allImages.filter(img => {
      if (seen.has(img.url)) return false
      seen.add(img.url)
      return true
    })

    console.log(`[images/search] ✅ ${unique.length} images ultra-filtrées trouvées`)

    return NextResponse.json({
      images: unique.slice(0, 20), // Max 20 images
      searchTerm: term,
      total: unique.length
    })

  } catch (err: any) {
    console.error('[images/search] Erreur:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
