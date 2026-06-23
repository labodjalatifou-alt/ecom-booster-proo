'use client'

export default function OrderFormRender({ settings }: { settings: any }) {
  const s = settings || {}

  return (
    <div
      className="w-full p-7 rounded-3xl border my-2"
      style={{ backgroundColor: s.bg_color || '#ffffff', borderColor: s.border_color || '#f0d9d2' }}
    >
      <h3 className="text-lg font-bold mb-5" style={{ color: s.title_color || '#111827' }}>
        {s.title || 'Finaliser ma commande'}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: s.label_color || '#7A6469' }}>
            Nom complet
          </label>
          <input
            type="text"
            readOnly
            className="w-full px-4 py-3 border rounded-full bg-gray-50 pointer-events-none"
            style={{ borderColor: s.input_border || '#f0d9d2' }}
            placeholder="Ex: Aïcha Diallo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: s.label_color || '#7A6469' }}>
            Téléphone
          </label>
          <input
            type="tel"
            readOnly
            className="w-full px-4 py-3 border rounded-full bg-gray-50 pointer-events-none"
            style={{ borderColor: s.input_border || '#f0d9d2' }}
            placeholder="Ex: 620 00 00 00"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: s.label_color || '#7A6469' }}>
            Adresse de livraison
          </label>
          <input
            type="text"
            readOnly
            className="w-full px-4 py-3 border rounded-full bg-gray-50 pointer-events-none"
            style={{ borderColor: s.input_border || '#f0d9d2' }}
            placeholder="Quartier, ville, repère"
          />
        </div>
        <button
          className="w-full py-4 rounded-full text-white font-bold text-base shadow-lg"
          style={{
            backgroundColor: s.btn_color || '#C23A5E',
            animation: s.shake_animation !== false ? 'orderBtnShake 4.5s ease-in-out infinite' : 'none',
          }}
        >
          {s.btn_text || 'COMMANDER MAINTENANT'}
        </button>
        <p className="text-xs text-center" style={{ color: s.trust_text_color || '#9B9590' }}>
          🔒 Vos informations restent confidentielles
        </p>
      </div>

      <style>{`
        @keyframes orderBtnShake {
          0%, 88%, 100% { transform: translateX(0) scale(1); }
          89% { transform: translateX(-3px) scale(1.01); }
          90.5% { transform: translateX(3px) scale(1.01); }
          92% { transform: translateX(-3px) scale(1.01); }
          93.5% { transform: translateX(3px) scale(1.01); }
          95% { transform: translateX(-2px) scale(1.01); }
          96.5% { transform: translateX(2px) scale(1.01); }
          98% { transform: translateX(0) scale(1.01); }
        }
      `}</style>
    </div>
  )
}
