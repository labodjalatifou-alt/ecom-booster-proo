'use client'
import { useState } from 'react'
import type { OrderFormProps, StoreColors } from '@/lib/store-builder/types'

interface Props {
  props: OrderFormProps
  colors: StoreColors
  storeId?: string
  isEditing?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export default function OrderFormSection({ props, colors, storeId, isEditing, isSelected, onClick }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    ;(props.fields || []).forEach(f => {
      if (f.required && !form[f.id]?.trim()) errs[f.id] = 'Ce champ est requis'
    })
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) return
    if (!validate()) return
    setLoading(true)
    try {
      const nameField = props.fields?.find(f => f.type === 'text' && f.label.toLowerCase().includes('nom'))
      const phoneField = props.fields?.find(f => f.type === 'tel')
      const addressField = props.fields?.find(f => f.label.toLowerCase().includes('adresse'))
      await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          customer_name: form[nameField?.id || ''] || '',
          customer_phone: form[phoneField?.id || ''] || '',
          customer_address: form[addressField?.id || ''] || '',
          quantity,
          notes: JSON.stringify(form),
        }),
      })
      setSuccess(true)
    } catch { setLoading(false) }
    setLoading(false)
  }

  const radius = props.border_radius || 12

  const formContent = (
    <div className="flex flex-col gap-4">
      {success ? (
        <div className="text-center py-12 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: `${colors.success}20` }}>✅</div>
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>{props.success_message}</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {(props.fields || []).map(field => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: colors.text }}>
                {field.label} {field.required && <span style={{ color: colors.danger }}>*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  value={form[field.id] || ''}
                  onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                  className="px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{ borderRadius: radius, border: `1.5px solid ${errors[field.id] ? colors.danger : colors.border}`, backgroundColor: '#fff', color: colors.text }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={form[field.id] || ''}
                  onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                  className="px-4 py-3 text-sm outline-none"
                  style={{ borderRadius: radius, border: `1.5px solid ${errors[field.id] ? colors.danger : colors.border}`, backgroundColor: '#fff', color: colors.text }}
                >
                  <option value="">{field.placeholder}</option>
                  {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.id] || ''}
                  onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                  className="px-4 py-3 text-sm outline-none transition-all"
                  style={{ borderRadius: radius, border: `1.5px solid ${errors[field.id] ? colors.danger : colors.border}`, backgroundColor: '#fff', color: colors.text }}
                />
              )}
              {errors[field.id] && <span className="text-xs" style={{ color: colors.danger }}>{errors[field.id]}</span>}
            </div>
          ))}

          {props.show_quantity && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: colors.text }}>Quantité</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.bgSection, color: colors.text, border: `1.5px solid ${colors.border}` }}>−</button>
                <span className="text-lg font-bold w-8 text-center" style={{ color: colors.text }}>{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.bgSection, color: colors.text, border: `1.5px solid ${colors.border}` }}>+</button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-black text-base mt-2 flex items-center justify-center gap-3 transition-all"
            style={{
              backgroundColor: props.submit_color || colors.primary,
              color: props.submit_text_color || '#fff',
              borderRadius: radius,
              boxShadow: `0 8px 24px ${props.submit_color || colors.primary}50`,
              transform: loading ? 'none' : undefined,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
            ) : (
              <>{props.submit_text || 'Confirmer ma commande'} 🛒</>
            )}
          </button>
        </form>
      )}
    </div>
  )

  return (
    <div
      id="order-form"
      onClick={onClick}
      className={`py-16 px-4 relative ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: props.bg_color || colors.bgSection }}
    >
      {isSelected && <span className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-20 font-medium">Formulaire commande</span>}

      <div style={{ maxWidth: props.layout === 'split' ? 1100 : 560, margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{props.title}</h2>
          {props.subtitle && <p style={{ color: colors.textLight }}>{props.subtitle}</p>}
        </div>

        {props.layout === 'split' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border" style={{ borderColor: colors.border }}>{formContent}</div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border flex flex-col gap-6" style={{ borderColor: colors.border }}>
              <h3 className="font-bold text-xl" style={{ color: colors.text }}>Récapitulatif</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                  <span style={{ color: colors.textLight }}>Quantité</span>
                  <span className="font-bold" style={{ color: colors.text }}>{quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold" style={{ color: colors.text }}>Total</span>
                  <span className="text-2xl font-black" style={{ color: colors.primary }}>À la livraison</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {['🚚 Livraison rapide 2-5 jours', '✅ Paiement à la livraison', '🔒 100% sécurisé', '↩️ Retour facile 30 jours'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>{b}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border" style={{ borderColor: colors.border }}>{formContent}</div>
        )}
      </div>
    </div>
  )
}
