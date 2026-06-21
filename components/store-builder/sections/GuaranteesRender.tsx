'use client'

export default function GuaranteesRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? '#ffffff'
  const items = settings.items || [
    { id: '1', icon: '🛡️', title: 'Paiement Sécurisé', text: 'Cryptage SSL' },
    { id: '2', icon: '📦', title: 'Livraison Garantie', text: 'Suivi en temps réel' },
    { id: '3', icon: '↩️', title: 'Retour Gratuit', text: 'Sous 30 jours' },
    { id: '4', icon: '📞', title: 'Support 7j/7', text: 'Toujours disponible' }
  ]

  return (
    <div className="w-full py-8 px-4 rounded-xl border border-gray-100 shadow-sm" style={{ backgroundColor: bgColor }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-x divide-gray-100">
        {items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="flex flex-col items-center text-center px-2">
            <span className="text-3xl mb-3">{item.icon || '✨'}</span>
            <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{item.title}</h3>
            <p className="text-xs md:text-sm text-gray-500">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
