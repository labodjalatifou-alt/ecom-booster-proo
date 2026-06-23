'use client'

export default function DescriptionRender({ settings, product }: { settings: any; product?: any }) {
  const s = settings || {}
  const content = s.content || product?.description || ''

  if (!content) {
    return (
      <p className="text-sm italic my-6" style={{ color: s.text_soft_color || '#9B9590' }}>
        Ajoutez une description depuis la fiche produit ou le panneau de droite.
      </p>
    )
  }

  return (
    <div
      className="prose prose-sm md:prose-base max-w-none leading-relaxed my-8 [&_img]:rounded-3xl [&_img]:my-6 [&_img]:shadow-sm [&_p]:mb-4 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-3"
      style={{ color: s.text_color || '#4b5563' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
