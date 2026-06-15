'use client'

import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from 'lucide-react'
import type {
  BadgeTrustProps,
  BuilderSection,
  CountdownProps,
  FooterProps,
  HeroProps,
  OrderFormProps,
  ProductProps,
  TestimonialsProps,
  TextBlockProps,
  VideoProps,
} from '@/lib/store-builder/types'

interface PropertiesPanelProps {
  section: BuilderSection | null
  onUpdateSection: (sectionId: string, patch: Partial<BuilderSection['props']>) => void
  onRemoveSection: (sectionId: string) => void
  onToggleVisibility: (sectionId: string) => void
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void
  disableMoveUp: boolean
  disableMoveDown: boolean
}

function renderToggle(label: string, value: boolean, onChange: (next: boolean) => void) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
    </label>
  )
}

export default function PropertiesPanel({
  section,
  onUpdateSection,
  onRemoveSection,
  onToggleVisibility,
  onMoveSection,
  disableMoveUp,
  disableMoveDown,
}: PropertiesPanelProps) {
  if (!section) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Sélectionnez une section</h3>
        <p className="text-sm text-gray-500">Cliquez sur un bloc dans la liste ou dans l'aperçu pour modifier ses paramètres.</p>
      </div>
    )
  }

  const commonControls = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onMoveSection(section.id, 'up')}
          disabled={disableMoveUp}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp className="h-4 w-4" /> Monter
        </button>
        <button
          type="button"
          onClick={() => onMoveSection(section.id, 'down')}
          disabled={disableMoveDown}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowDown className="h-4 w-4" /> Descendre
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleVisibility(section.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {section.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {section.visible ? 'Masquer' : 'Afficher'}
        </button>
        <button
          type="button"
          onClick={() => onRemoveSection(section.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> Supprimer
        </button>
      </div>
    </div>
  )

  const renderHeroFields = (props: HeroProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={props.headline}
          onChange={e => onUpdateSection(section.id, { headline: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Sous-titre</label>
        <textarea
          value={props.subheadline}
          onChange={e => onUpdateSection(section.id, { subheadline: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Texte du bouton</label>
          <input
            type="text"
            value={props.cta_text}
            onChange={e => onUpdateSection(section.id, { cta_text: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lien du bouton</label>
          <input
            type="text"
            value={props.cta_link}
            onChange={e => onUpdateSection(section.id, { cta_link: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur d'arrière-plan</label>
          <input
            type="color"
            value={props.bg_color}
            onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur du texte</label>
          <input
            type="color"
            value={props.text_color}
            onChange={e => onUpdateSection(section.id, { text_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Image / vidéo URL</label>
          <input
            type="text"
            value={props.image_url}
            onChange={e => onUpdateSection(section.id, { image_url: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Disposition</label>
          <select
            value={props.image_position}
            onChange={e => onUpdateSection(section.id, { image_position: e.target.value as HeroProps['image_position'] })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="left">Image à gauche</option>
            <option value="right">Image à droite</option>
            <option value="background">Image en arrière-plan</option>
            <option value="none">Aucune image</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Alignement</label>
          <select
            value={props.text_align}
            onChange={e => onUpdateSection(section.id, { text_align: e.target.value as HeroProps['text_align'] })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Opacité superposition</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={props.overlay_opacity}
            onChange={e => onUpdateSection(section.id, { overlay_opacity: Number(e.target.value) })}
            className="mt-2 w-full"
          />
        </div>
      </div>
      <div>{renderToggle('Animation d’entrée', props.animation !== 'none', value => onUpdateSection(section.id, { animation: value ? 'fadeIn' : 'none' }))}</div>
    </div>
  )

  const renderProductFields = (props: ProductProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre du CTA</label>
        <input
          type="text"
          value={props.cta_text}
          onChange={e => onUpdateSection(section.id, { cta_text: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Couleur du bouton</label>
        <input
          type="color"
          value={props.cta_color}
          onChange={e => onUpdateSection(section.id, { cta_color: e.target.value })}
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {renderToggle('Afficher le prix', props.show_price, value => onUpdateSection(section.id, { show_price: value }))}
        {renderToggle('Afficher la description', props.show_description, value => onUpdateSection(section.id, { show_description: value }))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {renderToggle('Images produit', props.show_images, value => onUpdateSection(section.id, { show_images: value }))}
        {renderToggle('Variantes', props.show_variants, value => onUpdateSection(section.id, { show_variants: value }))}
      </div>
    </div>
  )

  const renderCountdownFields = (props: CountdownProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre du compte à rebours</label>
        <input
          type="text"
          value={props.title}
          onChange={e => onUpdateSection(section.id, { title: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin</label>
          <input
            type="datetime-local"
            value={props.target_date.slice(0, 16)}
            onChange={e => onUpdateSection(section.id, { target_date: new Date(e.target.value).toISOString() })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>{renderToggle('Afficher les secondes', props.show_seconds, value => onUpdateSection(section.id, { show_seconds: value }))}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {renderToggle('Afficher les jours', props.show_days, value => onUpdateSection(section.id, { show_days: value }))}
        {renderToggle('Afficher les heures', props.show_hours, value => onUpdateSection(section.id, { show_hours: value }))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {renderToggle('Afficher les minutes', props.show_minutes, value => onUpdateSection(section.id, { show_minutes: value }))}
        {renderToggle('Cacher le timer après expiration', props.on_expire !== 'hide', value => onUpdateSection(section.id, { on_expire: value ? 'message' : 'hide' }))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur fond</label>
          <input
            type="color"
            value={props.bg_color}
            onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur texte</label>
          <input
            type="color"
            value={props.text_color}
            onChange={e => onUpdateSection(section.id, { text_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
      </div>
    </div>
  )

  const renderOrderFormFields = (props: OrderFormProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre du formulaire</label>
        <input
          type="text"
          value={props.title}
          onChange={e => onUpdateSection(section.id, { title: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Texte du bouton</label>
        <input
          type="text"
          value={props.submit_text}
          onChange={e => onUpdateSection(section.id, { submit_text: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur bouton</label>
          <input
            type="color"
            value={props.submit_color}
            onChange={e => onUpdateSection(section.id, { submit_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bordure arrondie</label>
          <input
            type="range"
            min="0"
            max="32"
            value={props.border_radius}
            onChange={e => onUpdateSection(section.id, { border_radius: Number(e.target.value) })}
            className="mt-2 w-full"
          />
        </div>
      </div>
      {renderToggle('Afficher le résumé produit', props.show_product_summary, value => onUpdateSection(section.id, { show_product_summary: value }))}
    </div>
  )

  const renderTestimonialsFields = (props: TestimonialsProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={props.title}
          onChange={e => onUpdateSection(section.id, { title: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>{renderToggle('Afficher les étoiles', props.show_stars, value => onUpdateSection(section.id, { show_stars: value }))}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur de fond</label>
          <input
            type="color"
            value={props.bg_color}
            onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
      </div>
    </div>
  )

  const renderBadgeFields = (props: BadgeTrustProps) => (
    <div className="space-y-4">
      <div>{renderToggle('Afficher le bloc confiance', true, () => {})}</div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Couleur de fond</label>
        <input
          type="color"
          value={props.bg_color}
          onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
        />
      </div>
    </div>
  )

  const renderTextBlockFields = (props: TextBlockProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu</label>
        <textarea
          value={props.content}
          onChange={e => onUpdateSection(section.id, { content: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          rows={4}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur de fond</label>
          <input
            type="color"
            value={props.bg_color}
            onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur du texte</label>
          <input
            type="color"
            value={props.text_color}
            onChange={e => onUpdateSection(section.id, { text_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
      </div>
    </div>
  )

  const renderVideoFields = (props: VideoProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">URL de la vidéo</label>
        <input
          type="text"
          value={props.url}
          onChange={e => onUpdateSection(section.id, { url: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {renderToggle('Lecture automatique', props.autoplay, value => onUpdateSection(section.id, { autoplay: value }))}
        {renderToggle('Boucle', props.loop, value => onUpdateSection(section.id, { loop: value }))}
      </div>
      {renderToggle('Muet par défaut', props.muted, value => onUpdateSection(section.id, { muted: value }))}
    </div>
  )

  const renderFooterFields = (props: FooterProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Texte du footer</label>
        <textarea
          value={props.text}
          onChange={e => onUpdateSection(section.id, { text: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur de fond</label>
          <input
            type="color"
            value={props.bg_color}
            onChange={e => onUpdateSection(section.id, { bg_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur du texte</label>
          <input
            type="color"
            value={props.text_color}
            onChange={e => onUpdateSection(section.id, { text_color: e.target.value })}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white p-2"
          />
        </div>
      </div>
      <div>{renderToggle('Afficher WhatsApp', props.show_whatsapp, value => onUpdateSection(section.id, { show_whatsapp: value }))}</div>
      {props.show_whatsapp && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro WhatsApp</label>
          <input
            type="text"
            value={props.whatsapp_number}
            onChange={e => onUpdateSection(section.id, { whatsapp_number: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}
    </div>
  )

  const body = (() => {
    switch (section.type) {
      case 'hero':
        return renderHeroFields(section.props as HeroProps)
      case 'product':
        return renderProductFields(section.props as ProductProps)
      case 'countdown':
        return renderCountdownFields(section.props as CountdownProps)
      case 'order_form':
        return renderOrderFormFields(section.props as OrderFormProps)
      case 'testimonials':
        return renderTestimonialsFields(section.props as TestimonialsProps)
      case 'badge_trust':
        return renderBadgeFields(section.props as BadgeTrustProps)
      case 'text_block':
        return renderTextBlockFields(section.props as TextBlockProps)
      case 'video':
        return renderVideoFields(section.props as VideoProps)
      case 'footer':
        return renderFooterFields(section.props as FooterProps)
      default:
        return <p className="text-sm text-gray-500">Ce bloc peut être configuré plus tard.</p>
    }
  })()

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 capitalize">{section.type.replace('_', ' ')}</h3>
            <p className="text-sm text-gray-500">Personnalisez ce bloc pour le rendre unique.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{section.visible ? 'Visible' : 'Masquée'}</span>
        </div>
      </div>

      {commonControls}

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        {body}
      </div>
    </div>
  )
}
