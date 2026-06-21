'use client'

export default function GuaranteesRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '🛡️', title: 'Paiement 100% Sécurisé', text: 'Vos données sont cryptées' },
    { id: '2', icon: '📦', title: 'Suivi de commande', text: 'Suivez votre colis en temps réel' },
    { id: '3', icon: '↩️', title: 'Retours sous 30 jours', text: 'Garantie satisfait ou remboursé' },
    { id: '4', icon: '📞', title: 'Service Client 7j/7', text: 'Une équipe à votre écoute' },
  ]

  return (
    <div 
      className="w-full py-12 px-4 border-y"
      style={{ 
        backgroundColor: s.bg_color || 'var(--color-bg)',
        borderColor: s.bg_color ? 'rgba(0,0,0,0.05)' : 'var(--color-secondary)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {items.map((item: any) => (
            <div key={item.id} className="flex flex-col items-center text-center max-w-[200px]">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
