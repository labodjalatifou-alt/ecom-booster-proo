'use client'
export default function ComparisonRender({ settings }: { settings: any }) {
  const s = settings || {}
  const rows = s.rows || []
  return (
    <div className="w-full py-12 px-4" style={{ backgroundColor: s.bg_color || '#fff' }}>
      {s.title && <h2 className="text-2xl font-black text-center text-gray-900 mb-8">{s.title}</h2>}
      <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full">
          <thead><tr>
            <th className="p-4 text-left text-sm font-bold text-gray-500 bg-gray-50">Fonctionnalité</th>
            <th className="p-4 text-center text-sm font-bold text-indigo-700 bg-indigo-50">{s.our_label || 'Nous'}</th>
            <th className="p-4 text-center text-sm font-bold text-gray-500 bg-gray-50">{s.competitor_label || 'Autres'}</th>
          </tr></thead>
          <tbody>{rows.map((row: any) => (
            <tr key={row.id} className="border-t border-gray-100">
              <td className="p-4 text-sm text-gray-700 font-medium">{row.feature}</td>
              <td className="p-4 text-center bg-indigo-50/50">{row.us ? <span className="text-green-600 text-lg font-bold">✓</span> : <span className="text-red-400 text-lg">✗</span>}</td>
              <td className="p-4 text-center">{row.them ? <span className="text-green-600 text-lg font-bold">✓</span> : <span className="text-red-400 text-lg">✗</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
