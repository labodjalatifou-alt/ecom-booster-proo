import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase'
import {
  buildStorePage,
  getBoutiqueTheme,
  toStoreColors,
  toStoreFonts,
  BOUTIQUE_THEMES,
} from '@/lib/store-builder/boutique-themes'

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

function extractHexColors(html: string): string[] {
  const found = new Set<string>()
  const hexRe = /#([0-9a-fA-F]{3,8})\b/g
  let match
  while ((match = hexRe.exec(html)) !== null) {
    const c = match[0].toLowerCase()
    if (c !== '#ffffff' && c !== '#000000' && c !== '#fff' && c !== '#000') {
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
      if (p && p !== 'sans-serif' && p !== 'serif' && p !== 'monospace' && !p.includes('inherit')) {
        fonts.add(p)
      }
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
      const src = m[1]
      if (src.startsWith('http')) return src
      if (src.startsWith('/')) return new URL(src, baseUrl).href
      return new URL(src, baseUrl).href
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

function findClosestTheme(colors: string[], fonts: string[]) {
  if (BOUTIQUE_THEMES.length === 0) return 'nature-vert'

  const themeScores = BOUTIQUE_THEMES.map(theme => {
    let score = 0
    const themeAccent = theme.colors.accent.toLowerCase()
    const themeBg = theme.colors.bg.toLowerCase()

    for (const c of colors) {
      const cl = c.toLowerCase()
      if (cl === themeAccent) score += 50
      if (cl === themeBg) score += 20
      const cRgb = parseInt(cl.slice(1, 3), 16)
      const cG = parseInt(cl.slice(3, 5), 16)
      const cB = parseInt(cl.slice(5, 7), 16)
      const tRgb = parseInt(themeAccent.slice(1, 3), 16)
      const tG = parseInt(themeAccent.slice(3, 5), 16)
      const tB = parseInt(themeAccent.slice(5, 7), 16)
      const dist = Math.sqrt((cRgb - tRgb) ** 2 + (cG - tG) ** 2 + (cB - tB) ** 2)
      if (dist < 100) score += 10
    }

    for (const f of fonts) {
      if (theme.fonts.display.toLowerCase().includes(f.toLowerCase()) ||
          theme.fonts.body.toLowerCase().includes(f.toLowerCase())) {
        score += 15
      }
    }

    return { id: theme.id, score }
  })

  themeScores.sort((a, b) => b.score - a.score)
  return themeScores[0].id
}

function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'boutique-clonee'
}

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
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!resp.ok) {
      return NextResponse.json({ error: `Impossible d'accéder à l'URL (HTTP ${resp.status}). Vérifiez que la boutique est accessible en ligne.` }, { status: 400 })
    }

    const html = await resp.text()
    const baseUrl = resp.url || normalizedUrl

    const title = extractMeta(html, 'title') || extractMeta(html, 'og:title') || new URL(baseUrl).hostname.replace('www.', '')
    const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || ''
    const hexColors = extractHexColors(html)
    const inlineColors = parseInlineCssColors(html)
    const allColors = [...new Set([...hexColors, ...inlineColors])]
    const fonts = extractFonts(html)
    const logoUrl = extractLogoUrl(html, baseUrl)

    const bestThemeId = findClosestTheme(allColors, fonts)
    const theme = getBoutiqueTheme(bestThemeId)

    const baseName = title.replace(/[|‐]/g, '-').split('-')[0]?.trim() || 'Boutique clonée'
    const storeName = baseName.length > 40 ? baseName.slice(0, 40) : baseName
    const slug = sanitizeSlug(storeName)

    const supabase = createAdminSupabase()

    const { data: existing } = await supabase.from('stores').select('id').eq('slug', slug).maybeSingle()
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

    const builderJson = buildStorePage(theme.id, storeName, null)

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ name: storeName, slug: finalSlug, status: 'draft' })
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
      pixels: { meta: '', tiktok: '', google: '' },
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
      builder_json: {
        ...builderJson,
        themeSettings: {
          ...builderJson.themeSettings,
          logo_url: logoUrl || '',
        },
      },
      is_published: false,
    })

    if (pageError) {
      await supabase.from('store_settings').delete().eq('store_id', store.id)
      await supabase.from('stores').delete().eq('id', store.id)
      return NextResponse.json({ error: pageError.message }, { status: 500 })
    }

    return NextResponse.json({
      data: store,
      analysis: {
        title,
        description: description.slice(0, 200),
        colors_detected: allColors.slice(0, 10),
        fonts_detected: fonts.slice(0, 5),
        logo_detected: !!logoUrl,
        theme_used: theme.name,
        theme_id: theme.id,
      },
    })
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json({ error: 'La boutique met trop de temps à répondre. Vérifiez l\'URL ou réessayez.' }, { status: 408 })
    }
    return NextResponse.json({ error: `Erreur lors du clonage : ${err.message}` }, { status: 500 })
  }
}