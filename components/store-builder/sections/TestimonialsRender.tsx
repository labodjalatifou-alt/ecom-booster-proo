'use client'

import { Star, CheckCircle2 } from 'lucide-react'

export default function TestimonialsRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Ce que disent nos clients'
  const bgColor = settings.bg_color ?? '#f9fafb'
  const items = settings.items || [
    { id: '1', name: 'Sophie L.', rating: 5, text: 'Produit incroyable !', location: 'Paris', verified: true },
    { id: '2', name: 'Marc D.', rating: 5, text: 'Qualité au rendez-vous.', location: 'Lyon', verified: true },
    { id: '3', name: 'Julie M.', rating: 4, text: 'Très satisfaite !', location: 'Marseille', verified: true }
  ]

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < (item.rating || 5) ? 'currentColor' : 'none'} className={i < (item.rating || 5) ? '' : 'text-gray-200'} />
              ))}
            </div>
            
            <p className="text-gray-700 mb-6 flex-1 italic text-sm md:text-base">"{item.text}"</p>
            
            <div className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {(item.name || 'C')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  {item.name}
                  {item.verified !== false && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </p>
                {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
