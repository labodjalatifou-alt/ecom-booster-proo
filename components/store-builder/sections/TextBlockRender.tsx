'use client'

export default function TextBlockRender({ settings }: { settings: any }) {
  const s = settings || {}
  
  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div 
        className="max-w-3xl mx-auto prose prose-lg"
        style={{ 
          textAlign: s.text_align || 'center',
          color: s.text_color || 'var(--color-text)'
        }}
        dangerouslySetInnerHTML={{ __html: s.content || 'Racontez l\'histoire de votre marque ici. Suscitez l\'émotion et connectez-vous avec vos clients en partageant vos valeurs.' }}
      />
    </div>
  )
}
