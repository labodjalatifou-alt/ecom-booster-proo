'use client'

import { MessageCircle } from 'lucide-react'

export default function FooterRender({ settings }: { settings: Record<string, any> }) {
  const bgColor = settings.bg_color ?? '#111827'
  const textColor = settings.text_color ?? '#ffffff'
  const copyright = settings.copyright ?? `© ${new Date().getFullYear()} Tous droits réservés.`
  const whatsappNumber = settings.whatsapp_number
  const showWhatsapp = settings.show_whatsapp ?? true

  return (
    <>
      <footer 
        className="w-full py-8 px-4 mt-8"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center text-center opacity-80 text-sm">
          <p>{copyright}</p>
        </div>
      </footer>

      {whatsappNumber && showWhatsapp && (
        <a 
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors hover:scale-110"
        >
          <MessageCircle size={28} />
        </a>
      )}
    </>
  )
}
