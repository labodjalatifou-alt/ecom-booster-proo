'use client'

import React from 'react'
import toast from 'react-hot-toast'
export default function NewsletterRender({ settings = {} }: { settings?: any }) {
  const title = settings.title || 'Rejoignez notre communauté'
  const subtitle = settings.subtitle || 'Recevez nos offres exclusives et promotions'
  const placeholder = settings.placeholder || 'Votre numéro WhatsApp'
  const buttonText = settings.button_text || "S'inscrire"
  const bgColor = settings.bg_color || '#6366f1'
  const theme = settings.theme || 'light' // 'light' or 'dark'
  
  const isDark = theme === 'dark'
  
  return (
    <section 
      className="landing-newsletter landing-full-bleed"
      style={{ 
        backgroundColor: isDark ? '#111827' : bgColor,
        padding: '60px 20px',
        color: isDark ? '#f9fafb' : '#ffffff',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>{subtitle}</p>}
        
        <form 
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault()
            toast.success("Inscription enregistrée !")
          }}
        >
          <input 
            type="text" 
            placeholder={placeholder}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              width: '100%',
              fontSize: 16,
              color: '#111827'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: isDark ? '#6366f1' : '#111827',
              color: '#ffffff',
              borderRadius: 8,
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  )
}

