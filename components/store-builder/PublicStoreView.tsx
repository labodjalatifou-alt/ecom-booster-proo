'use client'

import { useEffect } from 'react'
import type { BuilderPage, StoreColors, StoreFonts, StoreSettings } from '@/lib/store-builder/types'
import { THEMES, DEFAULT_COLORS, DEFAULT_FONTS } from '@/lib/store-builder/defaults'
import SectionRenderer from './SectionRenderer'

interface Props {
  builderPage: BuilderPage
  settings: StoreSettings | null
  storeId: string
  storeName: string
}

export default function PublicStoreView({ builderPage, settings, storeId, storeName }: Props) {
  const activeTheme = THEMES.find(t => t.id === settings?.theme_id) ?? THEMES[0]

  const colors: StoreColors = {
    ...DEFAULT_COLORS,
    ...activeTheme.default_colors,
    ...(settings?.colors ?? {}),
  }

  const fonts: StoreFonts = settings?.fonts ?? DEFAULT_FONTS

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontNames = Array.from(new Set([fonts.heading, fonts.body].filter(Boolean)))
    if (!fontNames.length) return
    const id = 'store-google-fonts'
    const existing = document.getElementById(id)
    if (existing) existing.remove()

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${fontNames
      .map(f => `family=${encodeURIComponent(f)}:wght@400;600;700;900`)
      .join('&')}&display=swap`
    document.head.appendChild(link)
  }, [fonts.heading, fonts.body])

  // Inject CSS custom properties + any custom CSS from settings
  const cssVars = `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-text: ${colors.text};
      --color-bg: ${colors.bg};
      --color-border: ${colors.border};
      --font-heading: '${fonts.heading}', system-ui, sans-serif;
      --font-body: '${fonts.body}', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); background: var(--color-bg); }
    ${settings?.custom_css ?? ''}
  `

  if (!builderPage?.sections?.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body }}>
        <p style={{ color: colors.textLight }}>Cette boutique est en cours de construction.</p>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <main style={{ fontFamily: fonts.body, backgroundColor: colors.bg, minHeight: '100vh' }}>
        {builderPage.sections.map(section => (
          <SectionRenderer
            key={section.id}
            section={section}
            colors={colors}
            fonts={fonts}
            storeId={storeId}
          />
        ))}
      </main>
    </>
  )
}
