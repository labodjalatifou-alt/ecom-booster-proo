'use client'
import { Star, BadgeCheck } from 'lucide-react'

// Rotations pseudo-aléatoires mais stables (basées sur l'index) pour un effet
// "feuilles éparpillées sur une table" — discret, jamais cassé.
const TILTS = [-1.5, 1.2, -0.8, 1.6, -1.1, 0.9, -1.3, 1.4]

export default function TestimonialsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', name: 'Sophie L.', rating: 5, text: 'Produit incroyable, il a changé mon quotidien ! La livraison a été très rapide.', verified: true },
    { id: '2', name: 'Marc D.', rating: 5, text: 'La qualité est au rendez-vous. Je recommande fortement ce site.', verified: true },
    { id: '3', name: 'Julie M.', rating: 4, text: 'Très satisfaite de mon achat. Le service client est très réactif.', verified: true },
    { id: '4', name: 'Karim B.', rating: 5, text: 'Rapport qualité-prix imbattable. Je recommande à 100%.', verified: true },
  ]

  const isList = s.layout === 'list'
  const isCompact = s.layout === 'grid' && items.length >= 4

  return (
    <div className="w-full py-8 px-4" style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}>
      <div className={isList ? 'max-w-2xl mx-auto' : isCompact ? 'max-w-4xl mx-auto' : 'max-w-md mx-auto'}>
        {s.title && (
          <h2
            className="text-xl font-black text-center mb-1 tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading, inherit)' }}
          >
            {s.title}
          </h2>
        )}
        {!isList && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <div className="flex gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <span className="text-sm font-bold text-gray-700">4.9/5</span>
            <span className="text-xs text-gray-400">· {items.length * 40}+ avis vérifiés</span>
          </div>
        )}

        <div className={isList ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {items.map((item: any, i: number) => {
            const tilt = TILTS[i % TILTS.length]
            if (isList) {
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex text-yellow-400 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={16} fill={j < (item.rating || 5) ? 'currentColor' : 'none'} className={j < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-[13px] md:text-sm text-gray-600 leading-relaxed mb-3">"{item.text}"</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                    {item.verified !== false && <BadgeCheck size={14} className="text-blue-500" />}
                  </div>
                </div>
              )
            }
            return (
              <div
                key={item.id}
                className="bg-white p-3 rounded-2xl shadow-md border border-gray-100 flex flex-col transition-transform hover:scale-[1.02] hover:-rotate-0"
                style={{
                  transform: `rotate(${tilt}deg)`,
                  marginTop: i % 2 === 1 ? '10px' : 0,
                }}
              >
                {/* Photo produit + étoiles */}
                <div className="flex items-center gap-2 mb-2">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : null}
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} fill={j < (item.rating || 5) ? 'currentColor' : 'none'} className={j < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>

                {/* Texte de l'avis */}
                <p className="text-[13px] text-gray-600 leading-snug mb-3 flex-1 line-clamp-4">
                  "{item.text}"
                </p>

                {/* Auteur : photo + nom + pays */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-auto">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400 flex-shrink-0">
                      {item.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900 text-xs truncate">{item.name}</span>
                      {item.verified !== false && <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />}
                    </div>
                    {item.location && (
                      <div className="text-[11px] text-gray-400 truncate flex items-center gap-0.5">
                        📍 {item.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`.line-clamp-4{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  )
}
