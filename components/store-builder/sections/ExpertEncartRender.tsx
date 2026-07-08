'use client'

import React from 'react'
import Image from 'next/image'

export default function ExpertEncartRender({ settings = {} }: { settings?: any }) {
  const title = settings.title || 'Recommandé par les experts'
  const name = settings.name || 'Dr. Jean Dupont'
  const role = settings.role || 'Dermatologue certifié'
  const quote = settings.quote || "C'est la formule la plus avancée que j'ai pu analyser cette année."
  const imageUrl = settings.image_url
  const signatureUrl = settings.signature_url
  const bgColor = settings.bg_color || '#f9fafb'

  return (
    <section className="landing-expert-encart landing-full-bleed" style={{ backgroundColor: bgColor, padding: '48px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 32 }}>{title}</h2>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          backgroundColor: '#ffffff',
          padding: '32px 24px',
          borderRadius: 16,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              backgroundColor: '#e5e7eb',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {imageUrl ? (
                <Image src={imageUrl} alt={name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 32 }}>👨‍⚕️</div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{name}</div>
              <div style={{ color: '#6366f1', fontSize: 14 }}>{role}</div>
            </div>
          </div>
          
          <blockquote style={{ 
            fontSize: 18, 
            fontStyle: 'italic', 
            color: '#374151',
            lineHeight: 1.6,
            position: 'relative'
          }}>
            "{quote}"
          </blockquote>

          {signatureUrl && (
            <div style={{ marginTop: 16, width: 120, height: 40, position: 'relative' }}>
              <Image src={signatureUrl} alt="Signature" fill style={{ objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
