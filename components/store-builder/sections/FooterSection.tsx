'use client'
import type { FooterProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: FooterProps
  colors: StoreColors
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase()
  if (p === 'facebook') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  )
  if (p === 'instagram') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
  if (p === 'tiktok') return <span className="text-lg font-bold">TT</span>
  if (p === 'youtube') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000"/></svg>
  )
  return <span className="text-sm">{platform.charAt(0).toUpperCase()}</span>
}

export default function FooterSection({ props, colors, isEditing, isSelected, onClick }: Props) {
  const columns = props.columns || []

  return (
    <>
      <footer
        onClick={onClick}
        className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ backgroundColor: props.bg_color || '#111827', color: props.text_color || '#9ca3af' }}
      >
        {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Footer</span>}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-white mb-3">{props.logo_text || 'Ma Boutique'}</h2>
              {props.description && (
                <p className="text-sm leading-relaxed mb-6" style={{ color: props.text_color || '#9ca3af' }}>{props.description}</p>
              )}
              {/* Socials */}
              {(props.social_links || []).length > 0 && (
                <div className="flex gap-3">
                  {props.social_links.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90"
                      style={{ backgroundColor: '#ffffff15', color: props.text_color || '#9ca3af' }}>
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Columns */}
            {columns.map((col, ci) => (
              <div key={ci}>
                <h3 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">{col.title}</h3>
                <ul className="flex flex-col gap-3">
                  {(col.links || []).map((link, li) => (
                    <li key={li}>
                      <a href={link.url} className="text-sm transition-all hover:text-white hover:translate-x-1 inline-block"
                        style={{ color: props.text_color || '#9ca3af' }}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment icons */}
          {props.payment_icons && (
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-xs uppercase tracking-wide opacity-50">Paiement accepté :</span>
              {['💳', '📱', '🏦', '💵'].map((icon, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#ffffff10', color: props.text_color || '#9ca3af' }}>
                  {icon}
                </span>
              ))}
            </div>
          )}

          {/* Bottom */}
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: '#ffffff15' }}>
            <p className="text-sm opacity-60">{props.copyright || `© ${new Date().getFullYear()} Ma Boutique`}</p>
            <div className="flex gap-4 text-xs opacity-60">
              <a href="#" className="hover:opacity-100 transition-opacity">Confidentialité</a>
              <a href="#" className="hover:opacity-100 transition-opacity">CGV</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      {props.show_whatsapp && props.whatsapp_number && !isEditing && (
        <a
          href={`https://wa.me/${props.whatsapp_number.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      )}
    </>
  )
}
