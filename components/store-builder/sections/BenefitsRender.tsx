'use client'

export default function BenefitsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '🚚', title: 'Livraison Rapide', text: 'Expédition sous 24/48h' },
    { id: '2', icon: '🔒', title: 'Paiement Sécurisé', text: 'Via carte bancaire ou PayPal' },
    { id: '3', icon: '⭐', title: 'Qualité Premium', text: 'Satisfaction garantie à 100%' },
    { id: '4', icon: '↩️', title: 'Retours Faciles', text: 'Vous avez 30 jours pour changer d\'avis' },
  ]

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-7xl mx-auto">
        {s.title && (
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
