'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function FaqRender({ settings }: { settings: Record<string, any> }) {
  const title = settings.title ?? 'Questions fréquentes'
  const bgColor = settings.bg_color ?? '#ffffff'
  const items = settings.items || [
    { id: '1', question: 'Quel est le délai de livraison ?', answer: '2 à 5 jours ouvrables selon votre localisation.' },
    { id: '2', question: 'Comment passer une commande ?', answer: 'Remplissez le formulaire et notre équipe vous contactera.' },
    { id: '3', question: 'Puis-je payer à la livraison ?', answer: 'Oui, le paiement à la livraison est disponible.' }
  ]

  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="w-full py-8 px-4 rounded-xl" style={{ backgroundColor: bgColor }}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item: any, idx: number) => {
          const isOpen = openId === (item.id || idx.toString())
          return (
            <div key={item.id || idx} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenId(isOpen ? null : (item.id || idx.toString()))}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span>{item.question}</span>
                <Plus 
                  size={20} 
                  className={`text-blue-600 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-45' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-4 md:p-5 pt-0 text-gray-600 border-t border-gray-100">
                  {item.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
