'use client'

/** En-tête minimal quand le thème a un logo mais pas de bloc Header dans le builder */
export default function ThemeLogoBar({
  logoUrl,
  logoHeight = 40,
  storeName,
  bgColor,
}: {
  logoUrl?: string
  logoHeight?: number
  storeName?: string
  bgColor?: string
}) {
  if (!logoUrl?.trim()) return null

  return (
    <header
      className="w-full border-b py-3 px-4 flex items-center justify-center"
      style={{
        backgroundColor: bgColor || 'var(--color-bg, #fff)',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <img
        src={logoUrl.trim()}
        alt={storeName || 'Logo'}
        style={{ height: logoHeight, width: 'auto', maxWidth: 'min(280px, 80vw)' }}
        className="object-contain"
      />
    </header>
  )
}
