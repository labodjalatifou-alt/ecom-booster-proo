'use client'

import { useState } from 'react'

/** Styles de formulaires disponibles */
const FORM_STYLES = [
  { id: 'classic', label: 'Classique', desc: 'Fond blanc, bordure discrète, look standard' },
  { id: 'modern', label: 'Moderne', desc: 'Fond sombre, inputs arrondis, accents colorés' },
  { id: 'minimal', label: 'Minimal', desc: 'Sans bordure, lignes fines, look épuré' },
  { id: 'glowing', label: 'Lumineux', desc: 'Bouton lumineux, ombres néon, premium' },
] as const

/** Animations de bouton disponibles */
const BTN_ANIMATIONS = [
  { id: 'shake', label: 'Secousse', desc: 'Bouton tremble pour attirer l\'attention' },
  { id: 'pulse', label: 'Pulsation', desc: 'Bouton pulse doucement en continu' },
  { id: 'bounce', label: 'Rebond', desc: 'Bouton rebondit subtilement' },
  { id: 'none', label: 'Aucune', desc: 'Pas d\'animation' },
] as const

type FormStyle = 'classic' | 'modern' | 'minimal' | 'glowing'
type BtnAnimation = 'shake' | 'pulse' | 'bounce' | 'none'

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
  const [qty, setQty] = useState(1)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const price = product?.price ? Number(product.price) : 0
  const currency = product?.currency || 'FCFA'
  const total = price * qty

  const btnColor = s.btn_color || '#C23A5E'
  const titleColor = s.title_color || '#111827'
  const labelColor = s.label_color || '#6b7280'
  const formStyle: FormStyle = s.form_style || 'classic'
  const btnAnimation: BtnAnimation = s.btn_animation || 'shake'

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
          product: product?.title || null,
          price: price,
          total,
          quantity: qty,
          currency,
          store_id: storeId || s.store_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        console.error('Erreur commande:', data.error)
      }
      setSent(true)
    } catch (err) {
      console.error('Erreur réseau commande:', err)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  // ── Styles d'inputs par variante ──
  const inputStyles: Record<FormStyle, string> = {
    classic:
      'w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
    modern:
      'w-full px-4 py-3.5 text-sm bg-gray-800 border border-gray-700 rounded-2xl outline-none transition-all placeholder-gray-500 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30',
    minimal:
      'w-full px-1 py-3 text-sm bg-transparent border-b-2 border-gray-200 rounded-none outline-none transition-all placeholder-gray-300 focus:border-indigo-400',
    glowing:
      'w-full px-4 py-3.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl outline-none transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:shadow-lg',
  }

  // ── Style de carte par variante ──
  const cardStyles: Record<FormStyle, React.CSSProperties> = {
    classic: { backgroundColor: s.bg_color || '#ffffff', borderColor: s.border_color || '#f0f0f0' },
    modern: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1 },
    minimal: { backgroundColor: 'transparent', borderWidth: 0 },
    glowing: { backgroundColor: s.bg_color || '#ffffff', borderColor: s.border_color || '#e5e7eb', borderWidth: 1 },
  }

  // ── Animation CSS du bouton ──
  const btnAnimClass: Record<BtnAnimation, string> = {
    shake: 'animate-btn-shake',
    pulse: 'animate-btn-pulse',
    bounce: 'animate-btn-bounce',
    none: '',
  }

  const inputBase = inputStyles[formStyle]

  // ── Overlay de succès (partagé entre toutes les variantes) ──
  if (sent) {
    const confetti = ['#fbbf24', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444']
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)' }}
        onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setQty(1) }}
      >
        <style>{`
          @keyframes orderPop {
            0% { transform: scale(.7) translateY(20px); opacity: 0; }
            55% { transform: scale(1.04) translateY(0); opacity: 1; }
            100% { transform: scale(1); }
          }
          @keyframes orderCheck {
            0% { transform: scale(0); }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes confettiBurst {
            0% { transform: translate(0,0) rotate(0); opacity: 1; }
            100% { transform: translate(var(--x), var(--y)) rotate(540deg); opacity: 0; }
          }
        `}</style>
        <div
          className="landing-pop bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center relative overflow-hidden"
          style={{ animation: 'orderPop .5s cubic-bezier(.2,.8,.2,1) both' }}
          onClick={(e) => e.stopPropagation()}
        >
          {confetti.map((c, i) => {
            const angle = (i / confetti.length) * Math.PI * 2
            const dist = 90 + Math.random() * 50
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top: 70,
                  left: '50%',
                  width: 9,
                  height: 9,
                  background: c,
                  borderRadius: 2,
                  '--x': `${Math.cos(angle) * dist}px`,
                  '--y': `${Math.sin(angle) * dist}px`,
                  animation: `confettiBurst 1.1s ease-out forwards`,
                  animationDelay: `${0.15 + i * 0.04}s`,
                } as React.CSSProperties}
              />
            )
          })}

          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: '#dcfce7', animation: 'orderCheck .6s cubic-bezier(.2,.8,.2,1) both' }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-1">Commande confirmée ! 🎉</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Merci <b className="text-gray-800">{name}</b> ! 🙌<br />
            Votre commande a bien été reçue. Notre équipe va vous appeler au
            <br /><b className="text-gray-800">{phone}</b> pour confirmer la livraison à <b className="text-gray-800">{city}</b>.
          </p>

          <div className="bg-gray-50 rounded-2xl p-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">📞 Confirmation sous</span>
              <span className="font-bold text-gray-900">15-30 min</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-gray-500">🚚 Paiement</span>
              <span className="font-bold text-green-600">À la livraison</span>
            </div>
          </div>

          <button
            onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setQty(1) }}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm transition hover:brightness-110 active:scale-[.98]"
            style={{ backgroundColor: btnColor }}
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  // ── Labels adaptés à la variante ──
  const isDark = formStyle === 'modern'

  return (
    <div className="w-full px-4 py-8" id="order-form">
      <div
        className={`max-w-md mx-auto p-5 rounded-2xl shadow-sm ${formStyle === 'minimal' ? '' : 'border'}`}
        style={cardStyles[formStyle]}
      >
        <h3 className="text-lg font-black mb-1" style={{ color: isDark ? '#ffffff' : titleColor }}>
          {s.title || '📦 Passer ma commande'}
        </h3>
        <p className="text-xs mb-4" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Remplissez le formulaire — on vous appelle pour confirmer.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#d1d5db' : labelColor }}>Nom complet *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Amadou Diallo"
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#d1d5db' : labelColor }}>Téléphone *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ex: 620 00 00 00"
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#d1d5db' : labelColor }}>Ville / Quartier *</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Ex: Conakry, Matam"
              required
              className={inputBase}
            />
          </div>

          {price > 0 && (
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: isDark ? '#d1d5db' : labelColor }}>Quantité</label>
              <div className="flex items-center justify-between gap-3">
                <div className={`flex items-center overflow-hidden ${formStyle === 'minimal' ? 'border-b-2' : 'border rounded-xl'}`} style={{ borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className={`w-10 h-10 text-xl font-bold transition ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>−</button>
                  <span className={`w-10 text-center font-bold ${isDark ? 'text-white' : ''}`}>{qty}</span>
                  <button type="button" onClick={() => setQty(q => q + 1)} className={`w-10 h-10 text-xl font-bold transition ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>+</button>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Total</div>
                  <div className="font-black text-base" style={{ color: formStyle === 'modern' ? '#60a5fa' : btnColor }}>
                    {total.toLocaleString('fr-FR')} {currency}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Bouton submit avec animation sélectionnée ── */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 ${btnAnimClass[btnAnimation]}`}
            style={{
              backgroundColor: loading ? '#9ca3af' : btnColor,
              ...(formStyle === 'glowing' && !loading
                ? { boxShadow: `0 0 20px ${btnColor}44, 0 4px 20px ${btnColor}33` }
                : {}),
            }}
          >
            {loading ? '⏳ Envoi...' : (s.btn_text || '🛒 COMMANDER MAINTENANT')}
          </button>

          <p className={`text-[11px] text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            🔒 Paiement à la livraison · Vos données sont sécurisées
          </p>
        </form>
      </div>

      {/* ── Animations CSS (injectées une seule fois) ── */}
      <style>{`
        @keyframes btnShake {
          0%, 88%, 100% { transform: translateX(0) scale(1); }
          89% { transform: translateX(-3px) scale(1.01); }
          90.5% { transform: translateX(3px) scale(1.01); }
          92% { transform: translateX(-3px) scale(1.01); }
          93.5% { transform: translateX(3px) scale(1.01); }
          95% { transform: translateX(-2px) scale(1.01); }
          96.5% { transform: translateX(2px) scale(1.01); }
          98% { transform: translateX(0) scale(1.01); }
        }
        .animate-btn-shake { animation: btnShake 4.5s ease-in-out infinite; }

        @keyframes btnPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,.18); }
          50% { transform: scale(1.03); box-shadow: 0 8px 30px rgba(0,0,0,.28); }
        }
        .animate-btn-pulse { animation: btnPulse 2.5s ease-in-out infinite; }

        @keyframes btnBounce {
          0%, 80%, 100% { transform: translateY(0); }
          85% { transform: translateY(-4px); }
          90% { transform: translateY(0); }
          95% { transform: translateY(-2px); }
        }
        .animate-btn-bounce { animation: btnBounce 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

// Export pour le PropertiesPanel
export { FORM_STYLES, BTN_ANIMATIONS }
export type { FormStyle, BtnAnimation }
