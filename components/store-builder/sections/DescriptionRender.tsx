'use client'

export default function DescriptionRender({ settings, product }: { settings: any; product: any }) {
  const s = settings || {}
  const html = s.content || product?.description || '<p>Description détaillée de votre produit...</p>'

  return (
    <div
      className="prose prose-sm max-w-none text-gray-600 my-4"
      style={{ color: s.text_color || '#4b5563' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
