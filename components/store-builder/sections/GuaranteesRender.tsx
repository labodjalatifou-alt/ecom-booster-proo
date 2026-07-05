'use client'

export default function GuaranteesRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', icon: '🛡️', title: 'Paiement 100% Sécurisé', text: 'Vos données sont cryptées' },
    { id: '2', icon: '📦', title: 'Suivi de commande', text: 'Suivez votre colis en temps réel' },
    { id: '3', icon: '↩️', title: 'Retours sous 30 jours', text: 'Garantie satisfait ou remboursé' },
    { id: '4', icon: '📞', title: 'Service Client 7j/7', text: 'Une équipe à votre écoute' },
  ]

  const iconOnly = s.style === 'icons' || items.every((i: any) => !i.text)

  return (
    <div 
      className={`w-full py-8 px-4 ${iconOnly ? '' : 'border-y'}`}
      style={{ 
        backgroundColor: s.bg_color || 'var(--color-bg)',
        borderColor: s.bg_color ? 'rgba(0,0,0,0.05)' : 'var(--color-secondary)',
        color: s.icon_color === '#FFFFFF' ? '#fff' : undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {s.title && (
          <h2 className="text-lg font-black text-center mb-6" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {s.title}
          </h2>
        )}
        <div className={`flex ${iconOnly ? 'flex-wrap justify-around' : 'flex-wrap justify-center'} gap-6 md:gap-10`}>
          {items.map((item: any) => (
            <div key={item.id} className={`flex flex-col items-center text-center ${iconOnly ? 'max-w-[140px]' : 'max-w-[200px]'}`}>
              <div className={`${iconOnly ? 'text-2xl' : 'text-3xl'} mb-2`}>{item.icon}</div>
              <h4 className={`font-bold text-sm ${iconOnly ? 'leading-tight' : 'mb-1'}`} style={{ color: s.icon_color === '#FFFFFF' ? '#fff' : undefined }}>
                {item.title}
              </h4>
              {!iconOnly && item.text && <p className="text-xs opacity-70">{item.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
