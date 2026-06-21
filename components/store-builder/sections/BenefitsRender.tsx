'use client'

export default function BenefitsRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Pourquoi nous choisir ?'
  const bgColor = settings.bg_color ?? '#f9fafb'
  const items = settings.items || [
    { id: '1', icon: '🚚', title: 'Livraison Rapide', text: 'Chez vous en 48h' },
    { id: '2', icon: '🔒', title: 'Paiement Sécurisé', text: '100% sécurisé' },
    { id: '3', icon: '⭐', title: 'Qualité Garantie', text: 'Satisfait ou remboursé' },
    { id: '4', icon: '↩️', title: 'Retours Faciles', text: '30 jours' }
  ]

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-50">
            <span className="text-4xl mb-3">{item.icon || '✨'}</span>
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
