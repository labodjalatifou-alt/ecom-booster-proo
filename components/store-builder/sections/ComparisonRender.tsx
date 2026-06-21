'use client'

import { Check, X } from 'lucide-react'

export default function ComparisonRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Pourquoi nous ?'
  const ourLabel = settings.our_label ?? 'Notre Produit'
  const competitorLabel = settings.competitor_label ?? 'Les Autres'
  const bgColor = settings.bg_color ?? '#ffffff'
  
  const rows = settings.rows || [
    { id: '1', feature: 'Qualité Premium', us: true, them: false },
    { id: '2', feature: 'Garantie à vie', us: true, them: false },
    { id: '3', feature: 'Support 24/7', us: true, them: true }
  ]

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 w-1/3"></th>
              <th className="p-4 md:p-6 border-b border-gray-200 bg-blue-50/50 text-center font-bold text-blue-700 w-1/3 text-lg md:text-xl">
                {ourLabel}
              </th>
              <th className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 text-center font-bold text-gray-500 w-1/3 text-sm md:text-base">
                {competitorLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx: number) => (
              <tr key={row.id || idx} className="group">
                <td className="p-4 md:p-6 border-b border-gray-100 font-medium text-gray-900 group-hover:bg-gray-50/50 transition-colors">
                  {row.feature}
                </td>
                <td className="p-4 md:p-6 border-b border-gray-100 bg-blue-50/30 text-center">
                  {row.us ? (
                    <Check className="mx-auto text-green-500 w-6 h-6 md:w-8 md:h-8" />
                  ) : (
                    <X className="mx-auto text-gray-300 w-5 h-5 md:w-6 md:h-6" />
                  )}
                </td>
                <td className="p-4 md:p-6 border-b border-gray-100 text-center group-hover:bg-gray-50/50 transition-colors">
                  {row.them ? (
                    <Check className="mx-auto text-gray-400 w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <X className="mx-auto text-red-400/80 w-5 h-5 md:w-6 md:h-6" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
