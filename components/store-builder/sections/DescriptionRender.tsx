'use client'

export default function DescriptionRender({ settings, product }: { settings: any; product?: any }) {
  const s = settings || {}
  const content = s.content || product?.description || ''

  if (!content) {
    return (
      <p className="text-sm italic my-6 px-4" style={{ color: s.text_soft_color || '#9B9590' }}>
        Ajoutez une description depuis la fiche produit ou le panneau de droite.
      </p>
    )
  }

  return (
    <div className="px-5 py-6">
      <div
        className="prose prose-sm max-w-none leading-relaxed text-[15px] [&_img]:rounded-2xl [&_img]:my-4 [&_img]:shadow-sm [&_p]:mb-4 [&_h1]:font-black [&_h1]:text-lg [&_h2]:font-bold [&_h2]:text-base [&_h3]:font-bold [&_h3]:text-sm [&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
        style={{ color: s.text_color || '#4b5563' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
