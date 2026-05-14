// app/api/shopify/publish/route.ts
// Crée un produit Shopify complet avec images médias + description HTML alternée

import { NextRequest, NextResponse } from 'next/server'

async function shopifyFetch(endpoint: string, options: RequestInit = {}) {
  const domain = process.env.SHOPIFY_DOMAIN || process.env.SHOPIFY_STORE_URL
  const token = process.env.SHOPIFY_ACCESS_TOKEN!
  const url = `https://${domain}/admin/api/2024-01/${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify ${res.status}: ${err}`)
  }
  return res.json()
}

// Construit le HTML de description avec alternance titre → paragraphe → image
function buildDescriptionHtml(
  paragraphes: Array<{ titre: string; texte: string }>,
  paragraphImages: Record<number, string>
): string {
  let html = ''

  paragraphes.forEach((p, i) => {
    // Titre H2
    html += `<h2>${p.titre}</h2>\n`

    // Texte (3 phrases → chacune dans un <p>)
    const phrases = p.texte.split(/(?<=\.)\s+/).filter(s => s.trim())
    phrases.forEach(phrase => {
      html += `<p>${phrase.trim()}</p>\n`
    })

    // Image du paragraphe si assignée
    if (paragraphImages[i]) {
      html += `<p><img src="${paragraphImages[i]}" alt="${p.titre}" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;" /></p>\n`
    }

    html += '\n'
  })

  return html
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      paragraphes,
      bullets,
      prix,
      currency,
      quantite,
      tags,
      mediaImages,
      paragraphImages,
      status = 'draft',
    } = await req.json()

    if (!title || !paragraphes) {
      return NextResponse.json({ error: 'Titre et paragraphes requis' }, { status: 400 })
    }

    // 1. Construire le HTML de description
    const descriptionHtml = buildDescriptionHtml(paragraphes, paragraphImages || {})
    const bulletsHtml = bullets?.length
      ? `<ul>\n${bullets.map((b: string) => `  <li>${b}</li>`).join('\n')}\n</ul>`
      : ''
    const fullHtml = descriptionHtml + bulletsHtml

    // 2. Créer le produit dans Shopify
    const productData = {
      product: {
        title,
        body_html: fullHtml,
        vendor: 'ECOM BOOSTER PRO',
        status,
        variants: [{
          price: parseFloat(String(prix || 0)).toFixed(2),
          inventory_quantity: quantite || 10,
          inventory_management: 'shopify',
          requires_shipping: true,
        }],
        tags: tags || '',
        // Shopify accepte les URLs externes directement comme src d'image
        images: (mediaImages || []).slice(0, 10).map((url: string, i: number) => ({
          src: url,
          position: i + 1,
        })),
      }
    }

    const result = await shopifyFetch('products.json', {
      method: 'POST',
      body: JSON.stringify(productData),
    })

    const product = result.product
    const domain = process.env.SHOPIFY_DOMAIN || process.env.SHOPIFY_STORE_URL
    const adminUrl = `https://${domain}/admin/products/${product.id}`

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        status: product.status,
        admin_url: adminUrl,
        images_count: product.images?.length || 0,
      }
    })

  } catch (err: any) {
    console.error('[shopify/publish] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
