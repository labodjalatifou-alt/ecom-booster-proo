'use client'
import { Check, X } from 'lucide-react'

export default function ComparisonRender({ settings }: { settings: any }) {
  const s = settings || {}
  const rows = s.rows || [
    { id: '1', feature: 'Qualité Premium', us: true, them: false },
    { id: '2', feature: 'Garantie à vie', us: true, them: false },
    { id: '3', feature: 'Support Client 24/7', us: true, them: false },
    { id: '4', feature: 'Design ergonomique', us: true, them: true },
  ]

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-4xl mx-auto">
        {s.title && (
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-1/2 p-6 font-semibold text-gray-500 uppercase tracking-wider text-xs">Fonctionnalité</th>
                <th className="w-1/4 p-6 font-black text-center text-gray-900 border-l border-gray-100 bg-blue-50/50">{s.our_label || 'Nous'}</th>
                <th className="w-1/4 p-6 font-bold text-center text-gray-500 border-l border-gray-100">{s.competitor_label || 'Les autres'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-medium text-gray-800">{row.feature}</td>
                  <td className="p-6 text-center border-l border-gray-100 bg-blue-50/30">
                    {row.us ? (
                      <div className="mx-auto w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="mx-auto w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <X size={18} strokeWidth={3} />
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-center border-l border-gray-100">
                    {row.them ? (
                      <div className="mx-auto w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center opacity-50">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="mx-auto w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                        <X size={18} strokeWidth={3} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
