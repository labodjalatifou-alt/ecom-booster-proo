'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ShieldCheck, Truck, Sparkles } from 'lucide-react'
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
}

export default function OrderFormRender({ settings, product, storeId }: OrderFormRenderProps) {
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
  const borderR = formSettings.border_radius ?? 20

  const colors = useMemo(() => ({
    bg: formSettings.bg_color || '#ffffff',
    border: formSettings.border_color || '#fce7f3',
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
      alert(`Désolé, une erreur est survenue lors de l'enregistrement de votre commande : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const btnAnimClass: Record<BtnAnimation, string> = {
    shake: 'anim-shake', pulse: 'anim-pulse', bounce: 'anim-bounce', glow: 'anim-glow', none: '',
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 order-confetti-wrap" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center anim-pop" onClick={e => e.stopPropagation()}
          style={{ border: `3px solid ${colors.btn}33` }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${colors.btn}18` }}>
            <Sparkles size={40} style={{ color: colors.btn }} />
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: colors.title }}>Commande confirmée ! 🎉</h3>
          <p className="text-sm mb-6" style={{ color: colors.subtitle }}>Merci <b>{name}</b> ! Notre équipe vous appelle au <b>{phone}</b>.</p>
          <button onClick={() => setSent(false)} className="w-full py-3.5 rounded-2xl font-black text-white" style={{ background: colors.btn }}>Fermer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8" id="order-form">
      <div
        className="max-w-md mx-auto overflow-hidden shadow-xl order-form-card"
        style={{
          background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bg} 100%)`,
          borderRadius: borderR,
          border: `2px solid ${colors.border}`,
          boxShadow: `0 20px 50px ${colors.btn}12, 0 4px 16px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Bandeau coloré en-tête */}
        <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${colors.btn} 0%, ${colors.accent} 100%)` }}>
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
                  className="w-full px-4 py-3.5 text-sm font-medium outline-none transition-all rounded-xl order-input"
                  style={{ backgroundColor: colors.inputBg, border: `2px solid ${colors.inputBorder}`, color: colors.title }}
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
                borderRadius: formSettings.btn_radius ?? 16,
                boxShadow: `0 8px 24px ${colors.btn}45`,
              }}
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
