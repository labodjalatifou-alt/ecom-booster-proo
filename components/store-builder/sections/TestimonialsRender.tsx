'use client'
import { Star, CheckCircle } from 'lucide-react'

export default function TestimonialsRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', name: 'Sophie L.', rating: 5, text: 'Produit incroyable, il a changé mon quotidien ! La livraison a été très rapide.', verified: true },
    { id: '2', name: 'Marc D.', rating: 5, text: 'La qualité est au rendez-vous. Je recommande fortement ce site.', verified: true },
    { id: '3', name: 'Julie M.', rating: 4, text: 'Très satisfaite de mon achat. Le service client est très réactif.', verified: true },
  ]

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12 tracking-tight" style={{ color: 'var(--color-text)' }}>
          {s.title || "Ce que nos clients pensent"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item: any) => (
            <div 
              key={item.id}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex text-yellow-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill={i < (item.rating || 5) ? 'currentColor' : 'none'} className={i < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              
              <p className="text-gray-600 mb-6 flex-1 italic leading-relaxed">
                "{item.text}"
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                      {item.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                    {item.location && <div className="text-xs text-gray-500">{item.location}</div>}
                  </div>
                </div>
                {item.verified !== false && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle size={12} />
                    Vérifié
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
