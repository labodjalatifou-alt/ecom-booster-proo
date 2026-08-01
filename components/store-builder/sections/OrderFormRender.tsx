'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ShieldCheck, Truck, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { ensureOrderFormSettings, calcBundleTotal } from '@/lib/store-builder/form-presets'
import BundleOffers from '@/components/store-builder/sections/BundleOffers'
import VariantSelector from './VariantSelector'

const BTN_ANIMATIONS = [
  { id: 'shake', label: 'Secousse' },
  { id: 'pulse', label: 'Pulsation' },
  { id: 'bounce', label: 'Rebond' },
  { id: 'glow', label: 'Lueur' },
  { id: 'none', label: 'Aucune' },
] as const

type BtnAnimation = typeof BTN_ANIMATIONS[number]['id']

interface OrderFormRenderProps {
  settings: any
  product?: any
  storeId?: string | null
  themeSettings?: any
}

export default function OrderFormRender({ settings, product, storeId, themeSettings }: OrderFormRenderProps) {
  const s = settings || {}
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({})

  const unitPrice = product?.price ? Number(product.price) : 0
  const currency = product?.currency || 'FCFA'

  const formSettings = useMemo(
    () => ensureOrderFormSettings(s, unitPrice || 15000, currency),
    [s, unitPrice, currency],
  )

  const bundlesEnabled = formSettings.bundles_enabled !== false && unitPrice > 0
  const bundles = formSettings.bundles || []
  const visibleBundles = bundles.filter((b: any) => !b.hidden)
  const defaultBundle = visibleBundles.find((b: any) => b.popular) || visibleBundles[0]
  const [selectedBundleId, setSelectedBundleId] = useState(defaultBundle?.id || 'b1')

  useEffect(() => {
    if (defaultBundle?.id) setSelectedBundleId(defaultBundle.id)
  }, [defaultBundle?.id])

  const selectedBundle = visibleBundles.find((b: any) => b.id === selectedBundleId) || visibleBundles[0]
  const [manualQty, setManualQty] = useState(1)
  const finalQty = bundlesEnabled ? (selectedBundle?.qty || 1) : manualQty
  const total = bundlesEnabled && selectedBundle
    ? calcBundleTotal(unitPrice, finalQty, selectedBundle)
    : unitPrice * finalQty

const btnAnimation: BtnAnimation = formSettings.btn_animation || 'pulse'
  const borderR = formSettings.card_border_radius ?? formSettings.border_radius ?? 20

  const variantOptions: { name: string; values: string[] }[] = formSettings.variant_options || []

  const colors = useMemo(() => ({
    bg: formSettings.bg_color || '#ffffff',
    border: formSettings.custom_border_color || formSettings.border_color || '#fce7f3',
    title: formSettings.title_color || '#1f2937',
    subtitle: formSettings.subtitle_color || '#6b7280',
    label: formSettings.label_color || '#374151',
    btn: formSettings.btn_color || '#E8527A',
    btnText: formSettings.btn_text_color || '#ffffff',
    inputBg: formSettings.input_bg || '#fafafa',
    inputBorder: formSettings.input_border || '#e5e7eb',
    inputFocus: formSettings.input_focus_border || formSettings.btn_color || '#E8527A',
    bundleSelectedBg: formSettings.bundle_selected_bg || '#FFF0F5',
    bundleSelectedBorder: formSettings.bundle_selected_border || formSettings.btn_color || '#E8527A',
    bundleBg: formSettings.bundle_bg || '#ffffff',
    bundleBorder: formSettings.bundle_border || '#f3f4f6',
    bundleBadgeBg: formSettings.bundle_badge_bg || formSettings.btn_color || '#E8527A',
    bundleBadgeText: formSettings.bundle_badge_text || '#ffffff',
    accent: formSettings.accent_color || formSettings.btn_color || '#E8527A',
    // Premium
    cardShadow: formSettings.card_shadow || '0 20px 50px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    cardShadowHover: formSettings.card_shadow_hover || '0 28px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
    cardBorderWidth: formSettings.card_border_width ?? 2,
    cardBorderStyle: formSettings.card_border_style || 'solid',
    cardBorderColor: formSettings.custom_border_color || formSettings.border_color || '#fce7f3',
    headerGradient: formSettings.header_gradient || `linear-gradient(135deg, ${formSettings.btn_color || '#E8527A'} 0%, ${formSettings.accent_color || '#C23A5E'} 100%)`,
    bgGradient: formSettings.bg_gradient || `linear-gradient(180deg, ${formSettings.bg_color || '#ffffff'} 0%, ${formSettings.bg_color || '#ffffff'} 100%)`,
    btnShadow: formSettings.btn_shadow || `0 4px 20px ${formSettings.btn_color || '#E8527A'}45`,
    btnShadowHover: formSettings.btn_shadow_hover || `0 8px 30px ${formSettings.btn_color || '#E8527A'}55`,
    btnBorderRadius: formSettings.btn_border_radius ?? 14,
    inputBorderRadius: formSettings.input_border_radius ?? 10,
    inputFocusShadow: formSettings.input_focus_shadow || `0 0 0 3px ${formSettings.btn_color || '#E8527A'}33`,
    bundleCardShadow: formSettings.bundle_card_shadow || '0 8px 24px rgba(0,0,0,0.06)',
    bundleCardShadowHover: formSettings.bundle_card_shadow_hover || '0 16px 40px rgba(0,0,0,0.1)',
    bundleCardBorderRadius: formSettings.bundle_card_border_radius ?? 14,
    bundleCardBorderWidth: formSettings.bundle_card_border_width ?? 2,
    bundleCardBorderStyle: formSettings.bundle_card_border_style || 'solid',
    bundleCardBorderColor: formSettings.bundle_border || '#f3f4f6',
    paddingTop: formSettings.padding_top ?? 24,
    paddingBottom: formSettings.padding_bottom ?? 24,
    paddingLeft: formSettings.padding_left ?? 24,
    paddingRight: formSettings.padding_right ?? 24,
  }), [formSettings])

  const btnLabel = loading
    ? '⏳ Envoi en cours...'
    : unitPrice > 0
      ? `${formSettings.btn_text || '🛒 COMMANDER'} — ${total.toLocaleString('fr-FR')} ${currency}`
      : (formSettings.btn_text || '🛒 COMMANDER MAINTENANT')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !city) return

    // Redirection WhatsApp si activé
    if (s.enable_whatsapp_order) {
      const waNumber = s.whatsapp_order_number || themeSettings?.whatsapp_number || ''
      if (!waNumber) {
        toast.error('Numéro WhatsApp non configuré.')
        return
      }
      const defaultMsg = `Bonjour, je souhaite commander ${product?.title} (${finalQty}x).\nNom: ${name}\nTél: ${phone}\nVille: ${city}`
      const waText = encodeURIComponent(s.whatsapp_order_msg || defaultMsg)
      const waLink = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${waText}`
      window.open(waLink, '_blank')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          phone,
          city,
          email: email || null,
          product: product?.title || null,
          price: unitPrice,
          total,
          quantity: finalQty,
          currency,
          store_id: storeId || s.store_id || null,
          variant: Object.keys(variantSelections).length ? variantSelections : null,
        }),
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Erreur serveur inattendue (la réponse n'est pas au format JSON).")
      }
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Impossible d\'enregistrer votre commande.')
      }

      setSent(true)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        ;(window as any).fbq('track', 'Purchase', { value: total, currency })
      }
    } catch (err: any) {
      console.error('[Order Submit Error]:', err)
      toast.error(`Désolé, une erreur est survenue : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const btnAnimClass: Record<BtnAnimation, string> = {
    shake: 'anim-shake', pulse: 'anim-pulse', bounce: 'anim-bounce', glow: 'anim-glow', none: '',
  }

  // Audio playback removed from client order confirmation

  if (sent) {
    const productImage = product?.image_url || product?.images?.[0] || 'https://placehold.co/100x100/e2e8f0/64748b?text=Produit'
    const waNumber = themeSettings?.whatsapp_number || ''
    const defaultWaMsg = `Bonjour, je viens de passer une commande pour ${product?.title || 'un produit'} (${finalQty}x). Mon nom est ${name}.`
    const waText = encodeURIComponent(s.popup_whatsapp_msg || defaultWaMsg)
    const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${waText}` : ''
    
    // Génère un numéro de commande aléatoire (ou utilise un hash) pour l'affichage
    const randomId = Math.floor(10000 + Math.random() * 90000)
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" 
           style={{ background: 'rgba(23, 37, 84, 0.6)', backdropFilter: 'blur(8px)' }}>
        <div className="bg-white rounded-[28px] shadow-2xl max-w-[500px] w-full p-6 @md:p-8 text-center anim-pop relative overflow-hidden my-auto border border-gray-100">
          
          {/* Confetti Background (CSS) */}
          <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-60">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10%" cy="20%" r="3" fill="#E8527A" opacity="0.8"/>
                <circle cx="80%" cy="10%" r="4" fill="#E8527A" opacity="0.6"/>
                <rect x="20%" y="30%" width="6" height="6" fill="#10B981" opacity="0.7" transform="rotate(25)"/>
                <rect x="85%" y="40%" width="5" height="5" fill="#3B82F6" opacity="0.8" transform="rotate(45)"/>
                <path d="M50,10 L54,18 L46,18 Z" fill="#F59E0B" opacity="0.9" />
                <path d="M70,30 L73,36 L67,36 Z" fill="#10B981" opacity="0.6" transform="rotate(-20 70 30)"/>
                <circle cx="30%" cy="10%" r="2" fill="#3B82F6" opacity="0.5"/>
                <circle cx="90%" cy="25%" r="3" fill="#F59E0B" opacity="0.8"/>
             </svg>
          </div>

          <button onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-full text-gray-500 transition-colors z-20 shadow-sm">
            ✕
          </button>

          {/* Icône succès */}
          <div className="relative z-10 w-[88px] h-[88px] mx-auto mb-5 bg-[#0066ff] rounded-full flex items-center justify-center shadow-[0_0_0_12px_rgba(0,102,255,0.08)]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h3 className="text-[26px] font-black mb-1.5 text-[#0b1f3f] relative z-10 tracking-tight">Commande confirmée !</h3>
          <p className="text-[14px] mb-5 text-[#475569] relative z-10 px-2 font-medium">
            Merci pour votre confiance, votre commande a été enregistrée avec succès.
          </p>

          <div className="inline-flex items-center gap-1.5 bg-[#0066ff] text-white px-4 py-1.5 rounded-full text-[13px] font-bold mb-7 shadow-sm relative z-10 tracking-wide">
            <ShieldCheck size={14} strokeWidth={2.5} /> N° Commande : #CMD-{randomId}
          </div>

          <div className="flex flex-col gap-4 text-left relative z-10">
            
            {/* Récapitulatif Box */}
            <div className="bg-white border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-2 border-b border-gray-100/50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h4 className="text-xs font-bold text-[#0b1f3f] uppercase tracking-wide">RÉCAPITULATIF DE VOTRE COMMANDE</h4>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                    <img src={productImage} alt={product?.title || 'Produit'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0b1f3f] text-[15px] leading-tight mb-1.5 line-clamp-2">{product?.title || 'Votre produit'}</p>
                    <span className="inline-block bg-[#eff6ff] text-[#0066ff] px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                      Quantité : {finalQty}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0066ff] text-base">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4"></div>

                <div className="space-y-2.5 text-[13px] text-[#475569] font-medium">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg> Sous-total</div>
                    <span>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Truck size={16} strokeWidth={2.5} /> Livraison</div>
                    <span className="font-bold text-[#16a34a]">Gratuite</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Sparkles size={16} strokeWidth={2.5} /> Frais de service</div>
                    <span>0 FCFA</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#eff6ff] px-4 py-3 border-t border-[#bfdbfe] flex justify-between items-center">
                <span className="font-black text-[#0b1f3f] text-[15px]">Total payé</span>
                <span className="font-black text-lg text-[#0066ff]">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Traitement Box (Vert) */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden shadow-sm">
              <div className="w-11 h-11 rounded-full bg-[#22c55e] text-white flex items-center justify-center flex-shrink-0 shadow-sm z-10">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1 z-10">
                <h4 className="font-bold text-[#166534] text-[13px] mb-0.5 tracking-tight">Votre commande est en cours de traitement.</h4>
                <p className="text-[11px] text-[#15803d]/90 leading-snug pr-12 font-medium">Vous recevrez un appel ou un message pour confirmer les détails de la livraison.</p>
              </div>
              {/* Illustration Livreur */}
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
                alt="Livraison" 
                className="w-[70px] h-[70px] absolute -right-2 -bottom-2 opacity-95 object-contain"
                style={{ filter: 'drop-shadow(-2px 4px 6px rgba(22,101,52,0.15))' }}
              />
            </div>

            {/* WhatsApp Box (Bleu) */}
            {waLink && (
              <div className="bg-[#0066ff] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden text-white shadow-[0_8px_20px_rgba(0,102,255,0.25)]">
                <div className="flex-1 z-10">
                  <h4 className="font-bold text-[15px] mb-1.5 tracking-tight">Une question ? Besoin d'aide ?</h4>
                  <p className="text-[11px] text-white/90 mb-4 leading-snug pr-16 font-medium">Notre équipe est disponible sur WhatsApp pour vous accompagner.</p>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 bg-white text-[#0b1f3f] px-4 py-2 rounded-full text-[13px] font-black shadow-md hover:scale-[1.02] active:scale-95 transition-all w-fit">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Discuter sur WhatsApp <span className="text-gray-400 font-normal">›</span>
                  </a>
                </div>
                {/* Illustration Téléphone */}
                <div className="absolute -right-4 -bottom-6 w-36 h-36 opacity-100 z-0">
                  <img src="https://cdn3d.iconscout.com/3d/free/thumb/free-whatsapp-9238385-7566213.png" alt="WhatsApp" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
              </div>
            )}
          </div>

          {/* Pied de page (Réassurance) */}
          <div className="flex justify-center items-center gap-3 @md:gap-6 mt-7 pt-5 flex-wrap relative z-10">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><ShieldCheck size={16} strokeWidth={2.5} /></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Paiement<br/>sécurisé</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Livraison<br/>rapide</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Produits<br/>de qualité</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Support client<br/>réactif</span>
            </div>
          </div>
          
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8" id="order-form">
      <div
        className="max-w-md mx-auto overflow-hidden order-form-card"
        style={{
          background: colors.bgGradient,
          borderRadius: borderR,
          border: `${colors.cardBorderWidth}px ${colors.cardBorderStyle} ${colors.cardBorderColor}`,
          boxShadow: colors.cardShadow,
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = colors.cardShadowHover }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = colors.cardShadow }}
      >
{/* Bandeau coloré en-tête */}
        <div className="px-5 py-4" style={{ background: colors.headerGradient }}>
          <h3 className="font-black text-white text-lg leading-tight">
            {formSettings.title || '📦 Finaliser ma commande'}
          </h3>
          {formSettings.show_subtitle !== false && formSettings.subtitle && (
            <p className="text-white/85 text-xs mt-1">{formSettings.subtitle}</p>
          )}
        </div>

        <div className="p-5">
          {bundlesEnabled && visibleBundles.length > 0 && (
            <BundleOffers
              bundles={visibleBundles}
              selectedId={selectedBundleId}
              onSelect={setSelectedBundleId}
              unitPrice={unitPrice}
              currency={currency}
              productImage={product?.image_url || product?.images?.[0]}
              colors={{
                selectedBg: colors.bundleSelectedBg,
                selectedBorder: colors.bundleSelectedBorder,
                bg: colors.bundleBg,
                border: colors.bundleBorder,
                badgeBg: colors.bundleBadgeBg,
                badgeText: colors.bundleBadgeText,
                title: colors.title,
                subtitle: colors.subtitle,
                price: colors.btn,
                savings: colors.bundleSelectedBorder,
                accent: colors.accent,
              }}
              borderWidth={formSettings.bundle_border_width ?? 2}
              borderRadius={formSettings.bundle_border_radius ?? 14}
              borderStyle={formSettings.bundle_border_style || 'solid'}
              selectedBorderWidth={formSettings.bundle_selected_border_width ?? 3}
              layout={formSettings.bundle_layout || 'deals'}
            />
          )}

          {variantOptions.length > 0 && (
            <div className="mb-4">
              <VariantSelector options={variantOptions} onChange={setVariantSelections} themeSettings={themeSettings} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {[
              { key: 'name', show: formSettings.show_name !== false, label: 'Nom complet *', val: name, set: setName, type: 'text', ph: 'Ex: Amadou Diallo', req: true },
              { key: 'phone', show: formSettings.show_phone !== false, label: 'Téléphone *', val: phone, set: setPhone, type: 'tel', ph: 'Ex: 620 00 00 00', req: true },
              { key: 'city', show: formSettings.show_city !== false, label: 'Ville / Quartier *', val: city, set: setCity, type: 'text', ph: 'Ex: Conakry, Matam', req: true },
              { key: 'email', show: !!formSettings.show_email, label: 'Email', val: email, set: setEmail, type: 'email', ph: 'email@exemple.com', req: false },
            ].filter(f => f.show).map(f => (
              <div key={f.key} className="order-field">
                <label className="block text-xs font-black mb-1.5 uppercase tracking-wide" style={{ color: colors.label }}>{f.label}</label>
<input
                  type={f.type}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  required={f.req}
                  placeholder={f.ph}
                  className="w-full px-4 py-3.5 text-sm font-medium outline-none transition-all order-input"
                  style={{
                    backgroundColor: colors.inputBg,
                    border: `2px solid ${colors.inputBorder}`,
                    borderRadius: formSettings.input_border_radius ?? 10,
                    color: colors.title,
                  }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = colors.inputFocusShadow }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            ))}

            {!bundlesEnabled && unitPrice > 0 && formSettings.show_qty_picker !== false && (
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-black uppercase" style={{ color: colors.label }}>Quantité</span>
                <div className="flex items-center rounded-xl overflow-hidden border-2" style={{ borderColor: colors.inputBorder }}>
                  <button type="button" onClick={() => setManualQty(q => Math.max(1, q - 1))} className="w-11 h-11 font-black text-lg hover:bg-black/5">−</button>
                  <span className="w-10 text-center font-black">{manualQty}</span>
                  <button type="button" onClick={() => setManualQty(q => q + 1)} className="w-11 h-11 font-black text-lg hover:bg-black/5">+</button>
                </div>
              </div>
            )}

<button
              type="submit"
              disabled={loading}
              className={`w-full py-4 font-black text-[15px] shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 mt-1 ${btnAnimClass[btnAnimation]}`}
              style={{
                background: `linear-gradient(135deg, ${colors.btn} 0%, ${colors.accent} 100%)`,
                color: colors.btnText,
                borderRadius: formSettings.btn_border_radius ?? 14,
                boxShadow: colors.btnShadow,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = colors.btnShadowHover }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = colors.btnShadow }}
            >
              {btnLabel}
            </button>

            {formSettings.show_footer_text !== false && (
              <div className="flex items-center justify-center gap-4 pt-1 flex-wrap">
                <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: colors.subtitle }}>
                  <ShieldCheck size={12} /> Paiement à la livraison
                </span>
                <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: colors.subtitle }}>
                  <Truck size={12} /> Livraison rapide
                </span>
              </div>
            )}
            {formSettings.footer_text && (
              <p className="text-[10px] text-center" style={{ color: colors.subtitle }}>{formSettings.footer_text}</p>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .order-input:focus { border-color: ${colors.inputFocus} !important; box-shadow: 0 0 0 3px ${colors.inputFocus}22; }
        @keyframes animShake { 0%,88%,100%{transform:translateX(0)} 89%,93%{transform:translateX(-4px)} 90%,94%{transform:translateX(4px)} }
        @keyframes animPulse { 0%,100%{transform:scale(1);box-shadow:0 8px 24px ${colors.btn}45} 50%{transform:scale(1.02);box-shadow:0 12px 32px ${colors.btn}55} }
        @keyframes animBounce { 0%,80%,100%{transform:translateY(0)} 85%{transform:translateY(-5px)} }
        @keyframes animGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.12)} }
        @keyframes animPop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes animDelivery { 0% { left: 10%; } 100% { left: 70%; } }
        .anim-shake{animation:animShake 4s ease-in-out infinite}
        .anim-pulse{animation:animPulse 2.2s ease-in-out infinite}
        .anim-bounce{animation:animBounce 2s ease-in-out infinite}
        .anim-glow{animation:animGlow 2s ease-in-out infinite}
        .anim-pop{animation:animPop .35s cubic-bezier(.2,.8,.2,1) both}
        .anim-delivery { animation: animDelivery 4s ease-out forwards; }
        .order-form-card { animation: animPop .5s ease both; }
      `}</style>
    </div>
  )
}

export { BTN_ANIMATIONS }
export type { BtnAnimation }



