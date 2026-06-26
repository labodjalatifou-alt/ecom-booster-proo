'use client'

export default function TitreRender({ settings, product }: { settings: any; product: any }) {
  const s = settings || {}
  const title = s.text || product?.title || 'Titre du produit'
  const align = s.text_align || 'left'

  // Taille en pixels : on utilise font_size (ex: 28) si défini, sinon fallback sm/md/lg.
  let fontSize: string
  if (s.font_size) {
    fontSize = `${s.font_size}px`
  } else {
    const map: Record<string, string> = { sm: '20px', md: '26px', lg: '32px' }
    fontSize = map[s.size_key || 'md'] || '26px'
  }

  return (
    <div className="px-5 pt-5">
      <h1
        className="font-black leading-tight"
        style={{
          color: s.color || '#111827',
          textAlign: align as any,
          fontSize,
          fontWeight: s.font_weight || 800,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
    </div>
  )
}
