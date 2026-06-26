'use client'

import { Trash2 } from 'lucide-react'
import TextField from './fields/TextField'
import TextareaField from './fields/TextareaField'
import ColorField from './fields/ColorField'
import ToggleField from './fields/ToggleField'
import SliderField from './fields/SliderField'
import SelectField from './fields/SelectField'
import ImageUploadField from './fields/ImageUploadField'
import ItemsListField, { FieldSchema } from './fields/ItemsListField'
import type { EditorBlock } from './Editor'

interface PropertiesPanelProps {
  block: EditorBlock | null
  onUpdateSettings: (blockId: string, settings: Record<string, any>) => void
  onDelete: (blockId: string) => void
}

export default function PropertiesPanel({ block, onUpdateSettings, onDelete }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col items-center justify-center p-6 text-center text-gray-400 flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </div>
        <p className="font-medium">Cliquez sur un élément pour le modifier</p>
      </div>
    )
  }

  const s = block.settings || {}
  const update = (key: string, value: any) => onUpdateSettings(block.id, { [key]: value })

  const renderFields = () => {
    switch (block.type) {
      // Barre d'annonce — gère les DEUX noms (header utilise "AnnouncementBar", template utilise "announcement_bar")
      case 'AnnouncementBar':
      case 'announcement_bar':
        return (
          <>
            <TextField label="Texte de l'annonce" value={s.text} onChange={v => update('text', v)} />
            <SliderField label="Vitesse (s — grand = lent)" value={s.speed ?? 18} onChange={v => update('speed', v)} min={5} max={60} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
            <ToggleField label="Bouton fermer" value={s.show_close ?? s.close_button} onChange={v => update('show_close', v)} />
          </>
        )
      case 'Header':
      case 'header':
        return (
          <>
            <TextField label="Nom / Logo texte" value={s.logo_text} onChange={v => update('logo_text', v)} />
            <SelectField label="Position logo" value={s.logo_position || 'center'} options={['left', 'center', 'right']} onChange={v => update('logo_position', v)} />
            <ToggleField label="Afficher recherche" value={s.show_search} onChange={v => update('show_search', v)} />
            <ToggleField label="Afficher panier" value={s.show_cart} onChange={v => update('show_cart', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
          </>
        )
      case 'Titre':
        return (
          <>
            <TextareaField label="Titre du produit" value={s.text} onChange={v => update('text', v)} />
            <SliderField label="Taille police (px)" value={s.font_size ?? 22} onChange={v => update('font_size', v)} min={12} max={60} />
            <SliderField label="Épaisseur (400=fin, 900=gras)" value={s.font_weight ?? 800} onChange={v => update('font_weight', v)} min={400} max={900} step={100} />
            <SelectField label="Alignement" value={s.text_align || 'left'} options={['left', 'center', 'right']} onChange={v => update('text_align', v)} />
            <ColorField label="Couleur" value={s.color} onChange={v => update('color', v)} />
          </>
        )
      case 'Note de produit':
        return (
          <>
            <SliderField label="Note" value={s.rating ?? 5} onChange={v => update('rating', v)} min={1} max={5} />
            <TextField label="Nombre d'avis (ex: 128 avis)" value={s.reviews_count} onChange={v => update('reviews_count', v)} />
            <ColorField label="Couleur étoiles" value={s.star_color} onChange={v => update('star_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
            <ToggleField label="Afficher" value={s.show !== false} onChange={v => update('show', v)} />
          </>
        )
      case 'Prix':
        return (
          <>
            <TextField label="Prix principal (ex: 15000 FCFA)" value={s.price} onChange={v => update('price', v)} />
            <SliderField label="Taille prix principal (px)" value={s.price_font_size ?? 24} onChange={v => update('price_font_size', v)} min={14} max={48} />
            <TextField label="Prix barré (ex: 30000 FCFA)" value={s.compare_at_price} onChange={v => update('compare_at_price', v)} />
            <ColorField label="Couleur prix" value={s.price_color} onChange={v => update('price_color', v)} />
            <ColorField label="Couleur prix barré" value={s.compare_color} onChange={v => update('compare_color', v)} />
            <ToggleField label="Afficher badge promo" value={s.show_badge !== false} onChange={v => update('show_badge', v)} />
            <TextField label="Texte badge (ex: -50%)" value={s.badge_text} onChange={v => update('badge_text', v)} />
            <ColorField label="Couleur fond badge" value={s.badge_bg} onChange={v => update('badge_bg', v)} />
            <ColorField label="Couleur texte badge" value={s.badge_text_color} onChange={v => update('badge_text_color', v)} />
          </>
        )
      case "Boutons d'achat":
        return (
          <>
            <TextField label="Texte bouton principal" value={s.btn_main_text} onChange={v => update('btn_main_text', v)} />
            <ColorField label="Couleur bouton principal" value={s.btn_main_color} onChange={v => update('btn_main_color', v)} />
            <ToggleField label="Afficher bouton secondaire" value={s.show_btn_sub} onChange={v => update('show_btn_sub', v)} />
            <TextField label="Texte bouton secondaire" value={s.btn_sub_text} onChange={v => update('btn_sub_text', v)} />
            <ColorField label="Couleur fond bouton secondaire" value={s.btn_sub_bg} onChange={v => update('btn_sub_bg', v)} />
            <ColorField label="Couleur texte bouton secondaire" value={s.btn_sub_color} onChange={v => update('btn_sub_color', v)} />
          </>
        )
      case 'Description':
        return (
          <>
            <TextareaField label="Contenu description" value={s.content} onChange={v => update('content', v)} rows={6} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
          </>
        )
      // Bloc générique hérité de l'ancien système — on lui donne des vrais champs en attendant la migration
      case 'product':
      case 'Product':
        return (
          <>
            <div className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3 mb-4">
              Ce bloc est un ancien format. Utilise plutôt les blocs séparés (Titre, Prix, Description...) pour plus de contrôle.
            </div>
            <ToggleField label="Afficher prix" value={s.show_price !== false} onChange={v => update('show_price', v)} />
            <ToggleField label="Afficher description" value={s.show_description !== false} onChange={v => update('show_description', v)} />
            <ToggleField label="Afficher avis" value={s.show_reviews_count !== false} onChange={v => update('show_reviews_count', v)} />
            <TextField label="Texte urgence" value={s.urgency_text} onChange={v => update('urgency_text', v)} />
            <TextField label="Texte bouton" value={s.cta_text} onChange={v => update('cta_text', v)} />
            <ColorField label="Couleur bouton" value={s.cta_color} onChange={v => update('cta_color', v)} />
          </>
        )
      case 'countdown':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date cible</label>
              <input type="datetime-local" value={s.target_date ? s.target_date.slice(0, 16) : ''} onChange={e => update('target_date', new Date(e.target.value).toISOString())} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
            <ColorField label="Couleur accent (chiffres)" value={s.accent_color} onChange={v => update('accent_color', v)} />
            <SelectField label="À expiration" value={s.on_expire || 'message'} options={['reset', 'hide', 'message']} onChange={v => update('on_expire', v)} />
            <TextField label="Message d'expiration" value={s.expire_message} onChange={v => update('expire_message', v)} />
          </>
        )
      case 'testimonials':
        return (
          <>
            <TextField label="Titre section" value={s.title} onChange={v => update('title', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ItemsListField
              label="Avis clients" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'name', label: 'Nom' },
                { type: 'text', id: 'location', label: 'Pays / Ville' },
                { type: 'textarea', id: 'text', label: 'Avis' },
                { type: 'slider', id: 'rating', label: 'Note', min: 1, max: 5 },
                { type: 'image', id: 'image', label: 'Photo de profil' },
                { type: 'image', id: 'product_image', label: 'Photo du produit reçu' },
                { type: 'toggle', id: 'verified', label: 'Vérifié' }
              ]}
            />
          </>
        )
      case 'benefits':
      case 'icon_grid':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur icônes" value={s.icon_color} onChange={v => update('icon_color', v)} />
            <ItemsListField
              label="Avantages" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'icon', label: 'Icône (emoji)' },
                { type: 'text', id: 'title', label: 'Titre' },
                { type: 'text', id: 'text', label: 'Texte' },
                { type: 'text', id: 'description', label: 'Description' }
              ]}
            />
          </>
        )
      case 'before_after':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <ImageUploadField label="Image Avant" value={s.before_image} onChange={v => update('before_image', v)} />
            <ImageUploadField label="Image Après" value={s.after_image} onChange={v => update('after_image', v)} />
            <TextField label="Label Avant" value={s.before_label} onChange={v => update('before_label', v)} />
            <TextField label="Label Après" value={s.after_label} onChange={v => update('after_label', v)} />
          </>
        )
      case 'comparison':
      case 'comparison_table':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <TextField label="Nom colonne Nous" value={s.our_label || s.us_name} onChange={v => update('our_label', v)} />
            <TextField label="Nom colonne Concurrent" value={s.competitor_label || s.them_name} onChange={v => update('competitor_label', v)} />
            <ItemsListField
              label="Lignes" value={s.rows} onChange={v => update('rows', v)}
              itemSchema={[
                { type: 'text', id: 'feature', label: 'Fonctionnalité' },
                { type: 'toggle', id: 'us', label: 'Nous ✓' },
                { type: 'toggle', id: 'them', label: 'Concurrent ✓' }
              ]}
            />
          </>
        )
      case 'stats':
        return (
          <>
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ItemsListField
              label="Stats" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'icon', label: 'Icône emoji' },
                { type: 'text', id: 'number', label: 'Chiffre' },
                { type: 'text', id: 'suffix', label: 'Suffixe (%, +, k...)' },
                { type: 'text', id: 'label', label: 'Label' }
              ]}
            />
          </>
        )
      case 'faq':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ItemsListField
              label="Questions" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'question', label: 'Question' },
                { type: 'textarea', id: 'answer', label: 'Réponse' }
              ]}
            />
          </>
        )
      case 'guarantees':
        return (
          <>
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ItemsListField
              label="Garanties" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'icon', label: 'Icône emoji' },
                { type: 'text', id: 'title', label: 'Titre' },
                { type: 'text', id: 'text', label: 'Texte' }
              ]}
            />
          </>
        )
      case 'marquee':
        return (
          <>
            <TextField label="Texte" value={s.text} onChange={v => update('text', v)} />
            <SliderField label="Vitesse (s — grand = lent)" value={s.speed ?? 20} onChange={v => update('speed', v)} min={5} max={60} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
          </>
        )
      case 'image_text':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <TextareaField label="Texte" value={s.text} onChange={v => update('text', v)} />
            <ImageUploadField label="Image" value={s.image_url} onChange={v => update('image_url', v)} />
            <SelectField label="Position image" value={s.image_position || 'left'} options={['left', 'right']} onChange={v => update('image_position', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
          </>
        )
      case 'video':
        return (
          <>
            <TextField label="Titre" value={s.title} onChange={v => update('title', v)} />
            <TextField label="URL YouTube ou MP4" value={s.url} onChange={v => update('url', v)} />
            <ImageUploadField label="Image poster" value={s.poster_url || s.poster_image} onChange={v => update('poster_url', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
          </>
        )
      case 'text_block':
        return (
          <>
            <TextareaField label="Contenu" value={s.content} onChange={v => update('content', v)} rows={6} />
            <SelectField label="Alignement" value={s.text_align || 'center'} options={['left', 'center', 'right']} onChange={v => update('text_align', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
          </>
        )
      case 'order_form':
      case 'OrderForm':
        return (
          <>
            <TextField label="Titre du formulaire" value={s.title} onChange={v => update('title', v)} />
            <TextField label="Texte bouton" value={s.submit_text || s.btn_text} onChange={v => update('btn_text', v)} />
            <ColorField label="Couleur bouton" value={s.submit_color || s.btn_color} onChange={v => update('btn_color', v)} />
            <ColorField label="Couleur fond carte" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur bordure" value={s.border_color} onChange={v => update('border_color', v)} />
            <ColorField label="Couleur titre" value={s.title_color} onChange={v => update('title_color', v)} />
            <ToggleField label="Animation secousse (bouton)" value={s.shake_animation !== false} onChange={v => update('shake_animation', v)} />
          </>
        )
      case 'countdown_top_bar':
        return (
          <>
            <TextField label="Label (ex: Offre)" value={s.label} onChange={v => update('label', v)} />
            <TextField label="Texte réduction (ex: -50%)" value={s.discount_text} onChange={v => update('discount_text', v)} />
            <TextField label="Suffixe (ex: se termine dans)" value={s.suffix} onChange={v => update('suffix', v)} />
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date cible</label>
              <input type="datetime-local" value={s.target_date ? s.target_date.slice(0, 16) : ''} onChange={e => update('target_date', new Date(e.target.value).toISOString())} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
            </div>
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
            <ColorField label="Couleur accent (réduction)" value={s.accent_color} onChange={v => update('accent_color', v)} />
          </>
        )
      case 'Galerie':
      case 'medias':
      case 'gallery':
        return (
          <div className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-4 leading-relaxed">
            🖼️ La galerie affiche automatiquement les images du produit sélectionné.
            <br /><br />
            Pour la modifier, changez les images depuis la fiche produit. Vous pouvez glisser cette section où vous voulez dans la page.
          </div>
        )
      case 'spacer':
        return (
          <>
            <SliderField label="Hauteur (px)" value={s.height} onChange={v => update('height', v)} min={8} max={200} />
          </>
        )
      case 'Footer':
      case 'footer':
        return (
          <>
            <TextField label="Texte copyright" value={s.copyright} onChange={v => update('copyright', v)} />
            <TextField label="Numéro WhatsApp" value={s.whatsapp_number} onChange={v => update('whatsapp_number', v)} />
            <ToggleField label="Bouton WhatsApp flottant" value={s.show_whatsapp !== false} onChange={v => update('show_whatsapp', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur texte" value={s.text_color} onChange={v => update('text_color', v)} />
          </>
        )
      case 'testimonials_floating':
        return (
          <>
            <TextField label="Titre section" value={s.title} onChange={v => update('title', v)} />
            <SliderField label="Vitesse animation (s)" value={s.animation_time || 30} onChange={v => update('animation_time', v)} min={10} max={60} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur accent (badge note)" value={s.accent_color} onChange={v => update('accent_color', v)} />
            <ItemsListField
              label="Témoignages" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'text', id: 'name', label: 'Nom' },
                { type: 'textarea', id: 'text', label: 'Avis' },
                { type: 'slider', id: 'rating', label: 'Note', min: 1, max: 5 },
                { type: 'image', id: 'image', label: 'Photo' }
              ] as FieldSchema[]}
            />
          </>
        )
      case 'trust_bar':
        return (
          <>
            <ToggleField label="Afficher la note" value={s.show_score !== false} onChange={v => update('show_score', v)} />
            <TextField label="Note (ex: 4.8)" value={s.score} onChange={v => update('score', v)} />
            <TextField label="Texte sous la note" value={s.score_label} onChange={v => update('score_label', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ColorField label="Couleur icônes" value={s.icon_color} onChange={v => update('icon_color', v)} />
            <ItemsListField
              label="Éléments de confiance" value={s.items} onChange={v => update('items', v)}
              itemSchema={[
                { type: 'select', id: 'icon', label: 'Icône', options: ['check', 'shield', 'truck', 'lock', 'star', 'heart', 'refresh'] },
                { type: 'text', id: 'label', label: 'Texte' }
              ] as FieldSchema[]}
            />
          </>
        )
      case 'stock_urgency':
        return (
          <>
            <TextField label="Message" value={s.message} onChange={v => update('message', v)} />
            <SliderField label="Stock restant" value={s.stock_left ?? 7} onChange={v => update('stock_left', v)} min={1} max={50} />
            <SliderField label="Stock total (pour la barre)" value={s.stock_total ?? 20} onChange={v => update('stock_total', v)} min={1} max={100} />
            <ColorField label="Couleur barre" value={s.bar_color} onChange={v => update('bar_color', v)} />
            <ColorField label="Couleur fond" value={s.bg_color} onChange={v => update('bg_color', v)} />
            <ToggleField label="Afficher ventes du jour" value={s.show_sold_count} onChange={v => update('show_sold_count', v)} />
            <TextField label="Texte ventes (ex: 38 vendus aujourd'hui)" value={s.sold_text} onChange={v => update('sold_text', v)} />
          </>
        )
      default:
        return (
          <div className="text-sm text-gray-500">
            Aucun paramètre disponible pour le type <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{block.type}</code>.
          </div>
        )
    }
  }

  const isDeletable = !['Header', 'header', 'AnnouncementBar', 'announcement_bar', 'Footer', 'footer'].includes(block.type)

  return (
    <div className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div>
          <h2 className="font-bold text-sm text-gray-800">{block.title}</h2>
          <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Édition</span>
        </div>
        {isDeletable && (
          <button
            onClick={() => onDelete(block.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/30">
        {renderFields()}
      </div>
    </div>
  )
}