'use client'
import { MessageCircle } from 'lucide-react'

export default function FooterRender({ settings }: { settings: any }) {
  const s = settings || {}
  
  return (
    <>
      <footer 
        className="w-full py-12 px-4 border-t"
        style={{ 
          backgroundColor: s.bg_color || 'var(--color-bg)', 
          color: s.text_color || 'var(--color-text)',
          borderColor: s.bg_color ? 'rgba(0,0,0,0.05)' : 'var(--color-secondary)'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-6">
          <div className="text-center @md:text-left">
            <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              {s.logo_text || 'MA BOUTIQUE'}
            </h3>
            <p className="text-sm opacity-70 max-w-sm">
              Votre boutique de confiance pour des produits de qualité exceptionnelle.
            </p>
          </div>
          
          <div className="flex flex-col items-center @md:items-end gap-4">
            <div className="flex gap-4 text-sm font-semibold opacity-80">
              <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Politique de retour</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Mentions légales</a>
            </div>
            <p className="text-xs opacity-60">
              {s.copyright || `© ${new Date().getFullYear()} Tous droits réservés.`}
            </p>
          </div>
        </div>
      </footer>

      {/* Bouton WhatsApp Flottant */}
      {s.show_whatsapp !== false && s.whatsapp_number && (
        <a 
          href={`https://wa.me/${s.whatsapp_number.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all z-50 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <MessageCircle size={28} />
        </a>
      )}
    </>
  )
}
