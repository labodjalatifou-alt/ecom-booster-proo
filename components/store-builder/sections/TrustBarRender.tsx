'use client'

const ICONS: Record<string, string> = {
  check: '✓', shield: '🛡', truck: '🚚', lock: '🔒', star: '⭐', heart: '❤', refresh: '↩',
}

export default function TrustBarRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items: { icon?: string; label?: string }[] = s.items || [
    { icon: 'truck', label: 'Livraison rapide' },
    { icon: 'lock', label: 'Paiement à la livraison' },
    { icon: 'shield', label: 'Satisfait ou remboursé' },
  ]

  return (
    <div
      className="w-full py-3 px-4 border-b"
      style={{ backgroundColor: s.bg_color || '#ffffff', borderColor: s.border_color || '#e8e8e8' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-5 @md:gap-7 flex-wrap">
        {s.show_score !== false && (
          <>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-xl font-bold" style={{ color: s.text_color || '#1a1a1a' }}>
                {s.score || '4.8'}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5" style={{ color: s.icon_color || '#00b67a' }}>★★★★★</div>
                <span className="text-[11px]" style={{ color: s.muted_color || '#888' }}>
                  {s.score_label || '1 247 avis vérifiés'}
                </span>
              </div>
            </div>
            <div className="w-px h-7 flex-shrink-0" style={{ backgroundColor: s.border_color || '#e8e8e8' }} />
          </>
        )}
        <div className="flex items-center gap-5 flex-wrap justify-center">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: s.icon_color || '#00b67a' }} className="text-sm">
                {ICONS[item.icon || 'check']}
              </span>
              <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: s.text_color || '#1a1a1a' }}>
                {item.label}
              </span>
              {i < items.length - 1 && (
                <span className="w-1 h-1 rounded-full ml-3" style={{ backgroundColor: s.border_color || '#e8e8e8' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
