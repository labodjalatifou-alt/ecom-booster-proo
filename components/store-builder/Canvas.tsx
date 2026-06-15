'use client'

import type {
  BuilderSection,
  StoreColors,
  StoreFonts,
  OrderFormProps,
  TestimonialsProps,
  BadgeTrustProps,
  VideoProps,
  TextBlockProps,
  FooterProps,
} from '@/lib/store-builder/types'

interface CanvasProps {
  sections: BuilderSection[]
  colors: StoreColors
  fonts: StoreFonts
  activeSectionId: string | null
  onSelectSection: (sectionId: string) => void
}

function formatCountdown(targetDate: string) {
  const diff = Math.max(0, Date.parse(targetDate) - Date.now())
  const seconds = Math.floor(diff / 1000) % 60
  const minutes = Math.floor(diff / (1000 * 60)) % 60
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return { days, hours, minutes, seconds }
}

export default function Canvas({ sections, colors, fonts, activeSectionId, onSelectSection }: CanvasProps) {
  const containerStyle = {
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.body,
  }

  const renderSection = (section: BuilderSection) => {
    if (!section.visible) {
      return (
        <button
          key={section.id}
          type="button"
          onClick={() => onSelectSection(section.id)}
          className="group w-full rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-8 text-left transition hover:border-indigo-300"
        >
          <p className="text-sm font-semibold text-gray-900">{section.type.replace('_', ' ')} (masquée)</p>
          <p className="mt-2 text-sm text-gray-500">Cliquez pour la remettre visible et la modifier.</p>
        </button>
      )
    }

    switch (section.type) {
      case 'hero': {
        const props = section.props as any
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full overflow-hidden rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-[${props.bg_color}] text-left transition hover:shadow-lg focus:outline-none`}
            style={{ backgroundColor: props.bg_color, color: props.text_color }}
          >
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center p-10">
              <div className="space-y-6">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Nouveau</span>
                <h2 className="text-4xl font-semibold" style={{ color: props.text_color, fontFamily: fonts.heading }}>{props.headline}</h2>
                <p className="max-w-2xl text-base text-gray-600" style={{ color: props.text_color }}>{props.subheadline}</p>
                <a
                  href={props.cta_link}
                  className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  {props.cta_text}
                </a>
              </div>
              {props.image_position !== 'none' && (
                <div className="relative rounded-[1.5rem] bg-white/80 p-6 shadow-xl">
                  <div className="h-72 rounded-[1.5rem] bg-gray-100" style={{ backgroundImage: props.image_url ? `url(${props.image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!props.image_url && <div className="flex h-full items-center justify-center text-gray-400">Image produit</div>}
                  </div>
                </div>
              )}
            </div>
          </button>
        )
      }
      case 'product': {
        const props = section.props as any
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
          >
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-indigo-700">Best-seller</div>
                <h3 className="text-2xl font-semibold text-gray-900">Gamme phare</h3>
                {props.show_description && <p className="mt-3 text-sm text-gray-500">Description courte du produit et points forts de la marque. Convient pour les boutiques premium ou tendance.</p>}
                <div className="mt-6 space-y-4">
                  {props.show_price && <p className="text-3xl font-semibold text-gray-900">49,90 €</p>}
                  <div className="grid gap-3 md:grid-cols-2">
                    {props.show_variants && (
                      <div className="rounded-3xl border border-gray-200 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Variantes</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700">Noir</span>
                          <span className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700">Blanc</span>
                          <span className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700">Édition luxe</span>
                        </div>
                      </div>
                    )}
                    <div className="rounded-3xl border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Quantité</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700">-</button>
                        <span className="text-sm font-semibold text-gray-900">1</span>
                        <button className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.8rem] bg-slate-50 p-6">
                <div className="mb-4 h-72 rounded-[1.5rem] bg-gray-200" />
                <button className="w-full rounded-full py-4 text-sm font-semibold text-white" style={{ backgroundColor: props.cta_color }}>
                  {props.cta_text}
                </button>
              </div>
            </div>
          </button>
        )
      }
      case 'countdown': {
        const props = section.props as any
        const { days, hours, minutes, seconds } = formatCountdown(props.target_date)
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full overflow-hidden rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} transition hover:shadow-lg`}
            style={{ backgroundColor: props.bg_color, color: props.text_color }}
          >
            <div className="grid gap-6 p-10 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">Urgence</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">{props.title}</h3>
                <p className="mt-3 max-w-xl text-sm text-white/80">Offre limitée, parfait pour booster les conversions en quelques heures.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                {props.show_days && <div className="rounded-3xl bg-white/10 px-4 py-5"><span className="block text-3xl font-semibold">{days}</span><span className="text-xs uppercase tracking-[0.2em] text-white/80">Jours</span></div>}
                {props.show_hours && <div className="rounded-3xl bg-white/10 px-4 py-5"><span className="block text-3xl font-semibold">{hours}</span><span className="text-xs uppercase tracking-[0.2em] text-white/80">Heures</span></div>}
                {props.show_minutes && <div className="rounded-3xl bg-white/10 px-4 py-5"><span className="block text-3xl font-semibold">{minutes}</span><span className="text-xs uppercase tracking-[0.2em] text-white/80">Minutes</span></div>}
                {props.show_seconds && <div className="rounded-3xl bg-white/10 px-4 py-5"><span className="block text-3xl font-semibold">{seconds}</span><span className="text-xs uppercase tracking-[0.2em] text-white/80">Secondes</span></div>}
              </div>
            </div>
          </button>
        )
      }
      case 'order_form': {
        const props = section.props as OrderFormProps
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
          >
            <div className="grid gap-8 md:grid-cols-[1fr_0.95fr]">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">{props.title}</h3>
                <p className="text-sm text-gray-500">Formulaire de commande modulable pour capturer les informations clients.</p>
                {props.fields.slice(0, 3).map((field: any) => (
                  <div key={field.id} className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{field.label}</div>
                ))}
              </div>
              <div className="rounded-[1.8rem] border border-gray-200 bg-slate-50 p-6">
                <label className="mb-3 block text-sm font-semibold text-gray-900">Résumé produit</label>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">Produit sélectionné</p>
                    <p className="text-xs text-gray-500">Quantité 1</p>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-full py-4 text-sm font-semibold text-white" style={{ backgroundColor: props.submit_color }}>
                  {props.submit_text}
                </button>
              </div>
            </div>
          </button>
        )
      }
      case 'testimonials': {
        const props = section.props as TestimonialsProps
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
          >
            <h3 className="text-2xl font-semibold text-gray-900">{props.title}</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {props.items.slice(0, 2).map(item => (
                <div key={item.id} className="rounded-3xl border border-gray-200 p-5">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="mt-2 text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </button>
        )
      }
      case 'badge_trust': {
        const props = section.props as BadgeTrustProps
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {props.items.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-start gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-500">Confiance rapide</p>
                  </div>
                </div>
              ))}
            </div>
          </button>
        )
      }
      case 'video': {
        const props = section.props as any
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} overflow-hidden bg-black text-left transition hover:shadow-lg`}
          >
            <div className="aspect-video bg-gray-900/60 p-6 text-white">
              <p className="text-lg font-semibold">Vidéo de présentation</p>
              <p className="mt-3 text-sm text-white/80">{props.url || 'Ajoutez une URL YouTube ou MP4 pour afficher la preview.'}</p>
            </div>
          </button>
        )
      }
      case 'text_block': {
        const props = section.props as any
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
            style={{ backgroundColor: props.bg_color, color: props.text_color }}
          >
            <p className="text-lg leading-8" style={{ maxWidth: props.max_width }}>{props.content}</p>
          </button>
        )
      }
      case 'footer': {
        const props = section.props as FooterProps
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-black p-8 text-left text-white transition hover:shadow-lg`}
            style={{ backgroundColor: props.bg_color, color: props.text_color }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Footer</p>
                <p className="mt-3 text-sm leading-7">{props.text}</p>
              </div>
              <div className="space-y-2">
                {props.links.map((link: { label: string; url: string }) => (
                  <a key={link.label} href={link.url} className="block text-sm text-white/80 hover:text-white" target="_blank" rel="noreferrer">{link.label}</a>
                ))}
              </div>
            </div>
          </button>
        )
      }
      default:
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`group w-full rounded-[2rem] border ${activeSectionId === section.id ? 'border-indigo-500' : 'border-gray-200'} bg-white p-8 text-left transition hover:shadow-lg`}
          >
            <p className="font-semibold text-gray-900">{section.type.replace('_', ' ')}</p>
          </button>
        )
    }
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-gray-200 bg-slate-50 p-6">
      {sections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">Aucune section pour le moment</p>
          <p className="mt-2 text-sm text-gray-500">Ajoutez des blocs depuis le panneau de gauche pour commencer.</p>
        </div>
      ) : (
        sections.map(section => renderSection(section))
      )}
    </div>
  )
}
