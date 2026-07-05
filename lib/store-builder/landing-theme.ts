import type { CSSProperties } from 'react'

/** Retourne une couleur hex valide (#rrggbb) ou le fallback */
export function normalizeHexColor(color: unknown, fallback = '#f9fafb'): string {
  if (typeof color !== 'string' || !color.trim()) return fallback
  const c = color.trim()
  return c.startsWith('#') ? c : fallback
}

/** Convertit un hex (#rrggbb) en rgba — ne plante jamais si la couleur est invalide */
export function hexToRgba(hex: unknown, alpha: number, fallback = '#f9fafb'): string {
  const safe = normalizeHexColor(hex, fallback)
  const h = safe.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (full.length !== 6 || Number.isNaN(parseInt(full, 16))) {
    return `rgba(249,250,251,${alpha})`
  }
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Styles partagés — grande feuille (fond) + petite feuille (carte centrale) */
export function getLandingPageStyles(theme: Record<string, any> = {}) {
  const bgColor = theme.backgroundColor || '#f9fafb'
  const cardBg = theme.surface || '#ffffff'

  return {
    outer: {
      fontFamily: theme.fontFamily ? `'${theme.fontFamily}', 'Inter', sans-serif` : "'Inter', sans-serif",
      background: bgColor,
      color: theme.textColor || '#111827',
      minHeight: '100%',
    } as CSSProperties,
    card: {
      maxWidth: theme.cardMaxWidth ?? 1100,
      width: '100%',
      margin: '0 auto',
      minHeight: '100%',
      background: cardBg,
      borderWidth: theme.cardBorderWidth ?? 1,
      borderStyle: (theme.cardBorderStyle || 'solid') as CSSProperties['borderStyle'],
      borderColor: theme.cardBorderColor || theme.border || 'rgba(0,0,0,0.08)',
      borderRadius: theme.cardBorderRadius ?? 0,
      boxShadow: theme.cardShadow ?? '0 4px 40px rgba(0,0,0,0.06)',
    } as CSSProperties,
    cssVars: {
      '--color-primary': theme.primaryColor || '#E8527A',
      '--color-secondary': theme.secondaryColor || '#f3f4f6',
      '--color-bg': bgColor,
      '--color-text': theme.textColor || '#111827',
      '--color-text-soft': theme.textSoftColor || '#6b7280',
      '--color-border': theme.border || '#e5e7eb',
      '--color-heading': theme.headingColor || theme.textColor || '#111827',
      '--color-price': theme.priceColor || theme.primaryColor || '#111827',
      '--font-heading': theme.headingFont
        ? `'${theme.headingFont}', Georgia, serif`
        : 'inherit',
    } as CSSProperties,
  }
}

export function mergeHeaderTheme(settings: Record<string, any>, theme?: Record<string, any>) {
  if (!theme) return settings
  const themeLogo = theme.logo_url?.trim?.() || ''
  const blockLogo = settings.logo_image?.trim?.() || ''
  return {
    ...settings,
    logo_image: blockLogo || themeLogo,
    logo_height: settings.logo_height ?? theme.logo_height ?? 40,
  }
}
