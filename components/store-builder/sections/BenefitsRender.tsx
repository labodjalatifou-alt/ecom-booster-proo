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
      className="w-full py-10 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-md mx-auto">
        {s.title && (
          <h2 className="text-xl font-black text-center mb-8 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
              <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
