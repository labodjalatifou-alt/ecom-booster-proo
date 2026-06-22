'use client'

const SIZE_MAP: Record<string, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl md:text-5xl',
}

export default function TitreRender({ settings, product }: { settings: any; product: any }) {
  const s = settings || {}
  const title = s.text || product?.title || 'Titre du produit'
  const size = SIZE_MAP[s.size_key || 'md'] || 'text-3xl'
  const align = s.text_align || 'left'

  return (
    <h1
      className={`font-black leading-tight mb-3 ${size}`}
      style={{ color: s.color || '#111827', textAlign: align as any }}
    >
      {title}
    </h1>
  )
}
