'use client'

export default function BoutonsAchatRender({ settings }: { settings: any }) {
  const s = settings || {}
  const mainColor = s.btn_main_color || '#ef4444'
  const subBg = s.btn_sub_bg || '#f3f4f6'
  const subColor = s.btn_sub_color || '#374151'

  return (
    <div className="flex flex-col gap-3 my-4">
      <button
        className="w-full py-4 rounded-full text-white font-bold text-lg shadow-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
        style={{ backgroundColor: mainColor }}
      >
        {s.btn_main_text || 'Commander maintenant'}
      </button>
      {s.show_btn_sub && (
        <button
          className="w-full py-3 rounded-full font-bold transition-all duration-200 hover:brightness-95"
          style={{ backgroundColor: subBg, color: subColor }}
        >
          {s.btn_sub_text || 'Ajouter au panier'}
        </button>
      )}
    </div>
  )
}
