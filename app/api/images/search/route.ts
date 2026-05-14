// app/api/images/search/route.ts
// Recherche Hybride : Serper (Amazon/Pinterest) + AliExpress DataHub (Recherche Inversée par Image)

import { NextRequest, NextResponse } from 'next/server'

const SERPER_API_KEY = process.env.SERPER_API_KEY
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!

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

// 1. Traduit le nom produit via Claude
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
    return term
  } catch {
    return produit
  }
}

// 2. Appel Serper.dev
async function serperSearch(query: string, num: number): Promise<{ items: any[]; error?: string }> {
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

// 3. Appel AliExpress DataHub (RapidAPI)
async function searchAliExpressDataHub(imageUrl: string): Promise<ProductImage[]> {
  if (!RAPIDAPI_KEY) return []
  
  try {
    const url = `https://aliexpress-datahub.p.rapidapi.com/item_search_image?sort=default&catId=0&imgUrl=${encodeURIComponent(imageUrl)}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      }
    })
    
    if (!res.ok) return []
    const data = await res.json()
    const results = data.result?.resultList || []
    
    const aliImages: ProductImage[] = []
    for (const item of results) {
      if (item.item?.image) {
        let imgUrl = item.item.image
        // Ajouter 'https:' si l'URL commence par '//'
        if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`
        
        aliImages.push({
          url: imgUrl,
          title: item.item.title || '',
          source: 'aliexpress.com',
          type: 'aliexpress',
          style: 'product',
        })
      }
    }
    return aliImages
  } catch (err) {
    console.error('Erreur DataHub:', err)
    return []
  }
}

// 4. Le Garde du Corps : Filtre ultra-strict pour Serper
function filterStrictImages(images: any[], sourceName: ProductImage['type'], style: ProductImage['style'], allowedDomains: string[]): ProductImage[] {
  const filtered: ProductImage[] = []
  for (const img of images) {
    if (!img.imageUrl) continue
    const url = img.imageUrl.toLowerCase()
    const sourceDomain = (img.source || img.domain || '').toLowerCase()

    if (url.includes('.gif') || url.includes('.svg') || url.includes('base64')) continue
    if (img.imageWidth && img.imageWidth < 400) continue
    if (img.imageHeight && img.imageHeight < 400) continue
    if (!allowedDomains.some(domain => sourceDomain.includes(domain))) continue
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

    const term = await translateToSearchTerm(produit.trim())

    // ÉTAPE 1 : Chercher d'abord sur Amazon via Serper pour avoir une image de référence (très fiable)
    const [amazonProduct, amazonLifestyle, pinProduct, pinLifestyle] = await Promise.all([
      serperSearch(`site:amazon.com "${term}"`, 10),
      serperSearch(`site:amazon.com "${term}" (lifestyle OR model OR in use)`, 10),
      serperSearch(`site:pinterest.com "${term}" aesthetic`, 10),
      serperSearch(`site:pinterest.com "${term}" (model OR lifestyle OR using OR drinking OR hands)`, 10)
    ])

    const amazonImages = filterStrictImages(amazonProduct.items, 'amazon', 'product', ['amazon.com', 'ssl-images-amazon'])
    
    // ÉTAPE 2 : MAGIE 🪄 Prendre la meilleure image Amazon et l'envoyer à AliExpress DataHub !
    let aliExpressImages: ProductImage[] = []
    if (amazonImages.length > 0) {
      const referenceImageUrl = amazonImages[0].url
      console.log(`[images/search] Image de référence pour AliExpress DataHub : ${referenceImageUrl}`)
      aliExpressImages = await searchAliExpressDataHub(referenceImageUrl)
    }

    // Si RapidAPI échoue (quota épuisé ou pas d'image de référence), on fait un fallback sur Serper pour AliExpress
    if (aliExpressImages.length === 0) {
      console.log('[images/search] Fallback Serper pour AliExpress')
      const aliRes = await serperSearch(`site:aliexpress.com "${term}"`, 10)
      aliExpressImages = filterStrictImages(aliRes.items, 'aliexpress', 'product', ['aliexpress.com', 'alicdn'])
    }

    // Filtrage et assemblage
    const allImages: ProductImage[] = [
      ...aliExpressImages, // Les vraies images brutes AliExpress !
      ...amazonImages,
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

    console.log(`[images/search] ✅ ${unique.length} images trouvées (avec DataHub)`)

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
