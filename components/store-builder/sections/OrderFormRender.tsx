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

  useEffect(() => {
    if (sent) {
      // Jouer le son de notification
      try {
        const audio = new Audio('/sounds/shopify-notif.mp3')
        audio.play().catch(e => console.log('Audio play prevented', e))
      } catch (e) {}
    }
  }, [sent])

  if (sent) {
    const productImage = product?.image_url || product?.images?.[0] || 'https://placehold.co/100x100/e2e8f0/64748b?text=Produit'
    const waNumber = themeSettings?.whatsapp_number || ''
    const defaultWaMsg = `Bonjour, je viens de passer une commande pour ${product?.title || 'un produit'} (${finalQty}x). Mon nom est ${name}.`
    const waText = encodeURIComponent(s.popup_whatsapp_msg || defaultWaMsg)
    const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${waText}` : ''
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 order-confetti-wrap overflow-y-auto" 
           style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(16px)' }}>
        <div className="bg-white rounded-[24px] shadow-2xl max-w-lg w-full p-6 @md:p-8 text-center anim-pop relative overflow-hidden my-auto border border-gray-100">
          
          <button onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10">
            ✕
          </button>

          {/* Icône succès animée */}
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(59,130,246,0.3)] anim-bounce">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h3 className="text-2xl @md:text-3xl font-black mb-2 text-[#0b1f3f]">Commande passée avec succès ! 🎉</h3>
          <p className="text-sm @md:text-base mb-6 text-gray-600 font-medium">
            Merci pour votre confiance, nous vous appelons bientôt pour confirmer votre commande.
          </p>

          <div className="flex flex-col @md:flex-row gap-4 mb-8">
            {/* Récapitulatif Box */}
            <div className="flex-1 bg-[#0b1f3f] text-white rounded-[16px] p-5 text-left shadow-lg">
              <h4 className="text-xs font-bold text-white/70 uppercase mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Récapitulatif
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  <img src={productImage} alt={product?.title || 'Produit'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm line-clamp-1">{product?.title || 'Votre produit'}</p>
                  <p className="text-xs text-white/60 mt-1">Quantité : {finalQty}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white/80 border-t border-white/10 pt-4">
                <div className="flex justify-between"><span>Sous-total</span><span className="font-semibold text-white">{total.toLocaleString('fr-FR')} {currency}</span></div>
                <div className="flex justify-between"><span>Livraison</span><span className="font-bold text-green-400">Gratuite</span></div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <span className="font-black text-white text-base">Total payé</span>
                <span className="font-black text-xl text-white">{total.toLocaleString('fr-FR')} {currency}</span>
              </div>
            </div>

            {/* Contact / Info Boxes */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-[16px] p-4 text-left flex gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">On vous appelle</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Notre équipe vous contactera sous peu pour confirmer les détails de la livraison au {phone}.</p>
                </div>
              </div>

              {s.show_popup_whatsapp !== false && waLink && (
                <div className="bg-green-50/50 border border-green-100 rounded-[16px] p-4 text-left flex flex-col gap-2 shadow-sm">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Besoin de nous joindre ?</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-tight">Contactez-nous directement sur WhatsApp pour toute question.</p>
                    </div>
                  </div>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                     className="mt-1 w-full py-2.5 rounded-xl font-bold text-white text-[13px] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2" 
                     style={{ background: '#25D366' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    Discuter sur WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Animation Livreur & Badges */}
          <div className="border-t border-gray-100 pt-6 mt-4 relative">
            <div className="w-full h-[60px] relative overflow-hidden flex items-end justify-center mb-6">
              <div className="absolute bottom-4 left-0 right-0 border-b-2 border-dashed border-gray-200" />
              <div className="absolute left-[10%] w-3 h-3 bg-blue-500 rounded-full bottom-[13px] shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10" />
              <div className="absolute right-[10%] w-4 h-4 bg-gray-200 rounded-full bottom-[11px] flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
                alt="Livraison" 
                className="h-12 absolute bottom-4 anim-delivery" 
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
              />
            </div>

            <div className="flex justify-center gap-6 @md:gap-10 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={18} className="text-blue-500" /> Paiement sécurisé
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                Livraison rapide
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                Produits de qualité
              </div>
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



