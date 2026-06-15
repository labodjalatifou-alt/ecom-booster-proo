'use client'

import { useState } from 'react'
import type { OrderFormProps, StoreColors, StoreFonts, FormField } from '@/lib/store-builder/types'

interface Props {
  data: OrderFormProps
  colors: StoreColors
  fonts: StoreFonts
  storeId?: string
}

export default function OrderFormSection({ data, colors, fonts, storeId }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const radius = data.border_radius ?? 12

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeId) {
      setError('Boutique non configurée.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          customer_name: formData['field-name'] || Object.values(formData)[0] || '',
          customer_phone: formData['field-phone'] || '',
          customer_address: formData['field-address'] || '',
          customer_email: formData['field-email'] || '',
          quantity: 1,
          total_price: 0,
          notes: JSON.stringify(formData),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Erreur réseau')
      }
      setSubmitted(true)
    } catch (err: any) {
      console.error('Order submit error:', err)
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="order-form" style={{ backgroundColor: data.bg_color, padding: '64px 24px' }}>
        <div className="mx-auto max-w-lg text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: `${colors.success}20` }}
          >
            <svg className="w-12 h-12" style={{ color: colors.success }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black mb-4" style={{ color: colors.text, fontFamily: fonts.heading }}>
            Commande confirmée !
          </h3>
          <p className="text-lg leading-relaxed" style={{ color: colors.textLight, fontFamily: fonts.body }}>
            {data.success_message}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="order-form" style={{ backgroundColor: data.bg_color, padding: '64px 24px' }}>
      <div className="mx-auto max-w-lg">
        <h2
          className="text-3xl font-black text-center mb-10"
          style={{ color: colors.text, fontFamily: fonts.heading }}
        >
          {data.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {data.fields.map((field: FormField) => (
            <div key={field.id}>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                {field.label}
                {field.required && <span style={{ color: colors.danger }}>*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 18px',
                    borderRadius: radius, border: `2px solid ${colors.border}`,
                    color: colors.text, fontFamily: fonts.body,
                    fontSize: 15, outline: 'none', resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
                />
              ) : field.type === 'select' ? (
                <select
                  required={field.required}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 18px',
                    borderRadius: radius, border: `2px solid ${colors.border}`,
                    color: colors.text, fontFamily: fonts.body,
                    fontSize: 15, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
                >
                  <option value="">Sélectionner...</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required={field.required}
                    checked={formData[field.id] === 'true'}
                    onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.checked ? 'true' : 'false' }))}
                    className="w-5 h-5"
                    style={{ accentColor: colors.primary }}
                  />
                  <span style={{ color: colors.text, fontSize: 14, fontFamily: fonts.body }}>{field.placeholder}</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 18px',
                    borderRadius: radius, border: `2px solid ${colors.border}`,
                    color: colors.text, fontFamily: fonts.body,
                    fontSize: 15, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: colors.danger + '15', color: colors.danger, borderRadius: radius }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '18px 24px',
              backgroundColor: data.submit_color,
              color: data.submit_text_color,
              borderRadius: radius, border: 'none',
              fontSize: 18, fontWeight: 800, fontFamily: fonts.body,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.75 : 1,
              boxShadow: `0 8px 24px ${data.submit_color}55`,
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path opacity=".75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Envoi en cours...
              </span>
            ) : data.submit_text}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: colors.textLight }}>
            🔒 Vos informations sont sécurisées et ne seront jamais partagées
          </p>
        </form>
      </div>
    </section>
  )
}
