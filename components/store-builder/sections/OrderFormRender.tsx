'use client'

export default function OrderFormRender({ settings }: { settings: any }) {
  const s = settings || {}
  const btnColor = s.btn_color || '#ef4444'
  const bg = s.bg_color || '#ffffff'

  return (
    <div
      className="w-full max-w-lg mx-auto p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg my-8"
      style={{ backgroundColor: bg }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        {s.title || 'Formulaire de commande'}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-full bg-gray-50 pointer-events-none text-sm"
            placeholder="Ex: Jean Dupont"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de téléphone</label>
          <input
            type="tel"
            className="w-full px-4 py-3 border border-gray-200 rounded-full bg-gray-50 pointer-events-none text-sm"
            placeholder="Ex: +224 620 000 000"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse de livraison</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 pointer-events-none text-sm resize-none"
            rows={3}
            placeholder="Ex: Quartier, ville"
            readOnly
          />
        </div>
        {s.show_quantity && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantité</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full px-4 py-3 border border-gray-200 rounded-full bg-gray-50 pointer-events-none text-sm"
              readOnly
            />
          </div>
        )}
        <button
          className="w-full py-4 rounded-full text-white font-bold text-lg shadow-md transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: btnColor }}
        >
          {s.btn_text || 'Commander maintenant'}
        </button>
      </div>
    </div>
  )
}
