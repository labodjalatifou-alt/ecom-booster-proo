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

/** Détecte si une couleur hex est sombre (luminosité < 50%) */
function isDarkColor(hex: string): boolean {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (full.length !== 6) return false
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  // Luminosité perçue (formule WCAG)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum < 0.4
}

/** Styles partagés — grande feuille (fond) + petite feuille (carte centrale) */
export function getLandingPageStyles(theme: Record<string, any> = {}) {
  const bgColor = theme.backgroundColor || '#f9fafb'
  const surfaceColor = theme.surface || '#ffffff'
  const textColor = theme.textColor || '#111827'
  const isDark = isDarkColor(bgColor) || isDarkColor(surfaceColor)

  // En mode sombre : les inputs/champs doivent avoir fond clair, texte sombre
  // pour être lisibles (formulaire de commande, etc.)
  const inputBg = isDark ? '#1f2937' : '#ffffff'
  const inputText = isDark ? '#f9fafb' : '#111827'
  const inputBorder = isDark ? '#374151' : '#e5e7eb'

  return {
    outer: {
      fontFamily: theme.fontFamily ? `'${theme.fontFamily}', 'Inter', sans-serif` : "'Inter', sans-serif",
      background: bgColor,
      color: textColor,
      minHeight: '100%',
    } as CSSProperties,
    card: {
      maxWidth: theme.cardMaxWidth ?? 1100,
      width: '100%',
      margin: '0 auto',
      minHeight: '100%',
      background: surfaceColor,
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
      '--color-surface': surfaceColor,
      '--color-text': textColor,
      '--color-text-soft': theme.textSoftColor || (isDark ? '#9ca3af' : '#6b7280'),
      '--color-border': theme.border || (isDark ? '#374151' : '#e5e7eb'),
      '--color-heading': theme.headingColor || textColor,
      '--color-price': theme.priceColor || theme.primaryColor || textColor,
      '--color-gold': theme.gold || theme.primaryColor || '#f59e0b',
      '--color-accent-deep': theme.accentDeep || theme.primaryColor || '#ea580c',
      '--font-heading': theme.headingFont
        ? `'${theme.headingFont}', Georgia, serif`
        : 'inherit',
      // Inputs — lisibles même en dark theme
      '--color-input-bg': inputBg,
      '--color-input-text': inputText,
      '--color-input-border': inputBorder,
      '--is-dark': isDark ? '1' : '0',
    } as CSSProperties,
    isDark,
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
