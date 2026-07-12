'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ShieldCheck, Truck, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { ensureOrderFormSettings, calcBundleTotal } from '@/lib/store-builder/form-presets'
import BundleOffers from '@/components/store-builder/sections/BundleOffers'

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

  if (sent) {
    const productImage = product?.image_url || product?.images?.[0] || 'https://placehold.co/100x100/e2e8f0/64748b?text=Produit'
    const waNumber = themeSettings?.whatsapp_number || ''
    const waText = encodeURIComponent(`Bonjour, je viens de passer une commande pour ${product?.title || 'un produit'} (${finalQty}x). Mon nom est ${name}.`)
    const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${waText}` : ''
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 order-confetti-wrap" 
           style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(16px)' }}
           onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }}>
        <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 text-center anim-pop relative overflow-hidden" 
             onClick={e => e.stopPropagation()}
             style={{ border: `1px solid rgba(255,255,255,0.2)` }}>
          
          <div className="absolute top-0 left-0 w-full h-2" style={{ background: `linear-gradient(90deg, ${colors.btn}, ${colors.accent})` }} />
          
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center shadow-lg" 
               style={{ background: `linear-gradient(135deg, ${colors.btn} 0%, ${colors.accent} 100%)` }}>
            <Sparkles size={40} className="text-white" />
          </div>
          
          <h3 className="text-3xl font-black mb-2 tracking-tight text-gray-900">Félicitations !</h3>
          <p className="text-base mb-6 text-gray-500 font-medium">
            Votre commande a été confirmée avec succès.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-100 shadow-inner">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Récapitulatif de la commande</h4>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                <img src={productImage} alt={product?.title || 'Produit'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{product?.title || 'Votre produit'}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded-md">Qté : {finalQty}</p>
                  <p className="font-black text-lg" style={{ color: colors.btn }}>
                    {total.toLocaleString('fr-FR')} {currency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/80 rounded-2xl p-4 mb-6 text-sm flex items-start gap-3 text-left border border-blue-100/50">
             <span className="text-xl mt-0.5">🚚</span> 
             <p className="text-blue-900 leading-relaxed">
               <b>{name}</b>, nous vous appellerons au <b>{phone}</b> pour confirmer l'expédition. Restez à l'écoute !
             </p>
          </div>

          <div className="flex flex-col gap-3">
            {waLink && (
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-black text-white text-[15px] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2" 
                style={{ background: '#25D366' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                Contacter sur WhatsApp
              </a>
            )}
            
            <button 
              onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }} 
              className="w-full py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 text-[15px] transition-colors"
            >
              Fermer la fenêtre
            </button>
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
        .anim-shake{animation:animShake 4s ease-in-out infinite}
        .anim-pulse{animation:animPulse 2.2s ease-in-out infinite}
        .anim-bounce{animation:animBounce 2s ease-in-out infinite}
        .anim-glow{animation:animGlow 2s ease-in-out infinite}
        .anim-pop{animation:animPop .35s cubic-bezier(.2,.8,.2,1) both}
        .order-form-card { animation: animPop .5s ease both; }
      `}</style>
    </div>
  )
}

export { BTN_ANIMATIONS }
export type { BtnAnimation }



