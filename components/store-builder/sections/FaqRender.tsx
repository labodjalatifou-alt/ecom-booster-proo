'use client'
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export default function FaqRender({ settings }: { settings: any }) {
  const s = settings || {}
  const items = s.items || [
    { id: '1', question: 'Quels sont les délais de livraison ?', answer: 'Nous expédions nos commandes sous 24 à 48h. La livraison prend ensuite 2 à 5 jours ouvrés selon votre région.' },
    { id: '2', question: 'Le produit est-il garanti ?', answer: 'Oui, nous offrons une garantie de satisfaction de 30 jours. Si vous n\'êtes pas satisfait, nous vous remboursons intégralement.' },
    { id: '3', question: 'Comment puis-je suivre ma commande ?', answer: 'Dès l\'expédition de votre commande, vous recevrez un email contenant un lien de suivi en temps réel.' },
  ]

  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  return (
    <div 
      className="w-full py-16 px-4"
      style={{ backgroundColor: s.bg_color || 'var(--color-bg)' }}
    >
      <div className="max-w-3xl mx-auto">
        {s.title && (
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10 tracking-tight" style={{ color: 'var(--color-text)' }}>
            {s.title}
          </h2>
        )}

        <div className="flex flex-col gap-4">
          {items.map((item: any) => {
            const isOpen = openId === item.id
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg ${isOpen ? 'text-blue-600' : 'text-gray-900'}`}>
                    {item.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                <div 
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
