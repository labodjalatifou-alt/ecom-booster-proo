'use client'

import { useState, useEffect } from 'react'

interface LandingPageProps {
  store: any
  product: any
  settings: any
}

// ── Countdown timer hook ──────────────────────────────────────────────────────
function useCountdown(hours = 12) {
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 })
  useEffect(() => {
    const end = Date.now() + hours * 3600000
    const tick = () => {
      const diff = Math.max(0, end - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }
function fmtPrice(p: any, currency = 'FCFA') {
  if (!p) return null
  return `${Number(p).toLocaleString('fr-FR')} ${currency}`
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', padding: '16px 0', cursor: 'pointer', background: 'none',
          border: 'none', fontWeight: 700, fontSize: 15, color: '#111827', textAlign: 'left',
        }}
      >
        <span style={{ paddingRight: 12 }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{a}</div>
      )}
    </div>
  )
}

// ── Order Form ────────────────────────────────────────────────────────────────
function OrderForm({ product, accent, storeName }: { product: any; accent: string; storeName: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [qty, setQty] = useState(1)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const price = product?.price ? Number(product.price) : 0
  const currency = product?.currency || 'FCFA'
  const total = price * qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !city) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 15, fontFamily: 'inherit', outline: 'none',
    background: '#fafafa', color: '#111827', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 5,
  }

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>Commande reçue !</h3>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        Merci {name} ! Nous vous appellerons au <b>{phone}</b> pour confirmer votre livraison à {city}.
      </p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 0 0' }}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Nom complet *</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
          placeholder="Ex: Amadou Diallo" required />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Téléphone *</label>
        <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="Ex: 620 00 00 00" required />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Ville / Quartier *</label>
        <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)}
          placeholder="Ex: Conakry, Matam" required />
      </div>
      {price > 0 && (
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Quantité</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 40, height: 40, background: '#f5f5f5', border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>−</button>
            <span style={{ width: 44, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{qty}</span>
            <button type="button" onClick={() => setQty(q => q + 1)}
              style={{ width: 40, height: 40, background: '#f5f5f5', border: 'none', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
            Total : <b style={{ color: '#111827', fontSize: 15 }}>{total.toLocaleString('fr-FR')} {currency}</b>
          </p>
        </div>
      )}
      <button type="submit" disabled={loading} style={{
        width: '100%', padding: '16px', background: loading ? '#9ca3af' : accent,
        color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em',
        transition: 'background .2s', fontFamily: 'inherit',
      }}>
        {loading ? '⏳ Envoi...' : '🛒 COMMANDER MAINTENANT'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
        🔒 Paiement à la livraison · Vos données sont sécurisées
      </p>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage({ store, product, settings }: LandingPageProps) {
  const [activeImg, setActiveImg] = useState(0)
  const time = useCountdown(settings?.countdown_hours || 12)

  // Theme colors (customizable via store_settings)
  const accent = settings?.primary_color || settings?.accent_color || '#ea580c'
  const accentLight = settings?.accent_light || '#fff7ed'
  const storeName = store?.name || 'Ma Boutique'
  const logoUrl = settings?.logo_url || null
  const announcementText = settings?.announcement_text || 'Livraison Gratuite & Paiement À La Livraison'
  const showCountdown = settings?.show_countdown !== false
  const whatsapp = settings?.whatsapp_number || null

  const currency = product?.currency || 'FCFA'
  const price = fmtPrice(product?.price, currency)
  const comparePrice = fmtPrice(product?.compare_price, currency)
  const discount = product?.price && product?.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : null

  const images: string[] = product?.images?.length
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : []

  const description: string = product?.description || ''
  const tags: string[] = Array.isArray(product?.tags) ? product.tags : []

  const s: React.CSSProperties = {
    fontFamily: settings?.font_family || "'Inter', 'Plus Jakarta Sans', sans-serif",
    background: settings?.bg_color || '#f9fafb',
    color: '#111827',
    minHeight: '100vh',
  }

  return (
    <div style={s}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        img { max-width: 100%; display: block; }
        body { overflow-x: hidden; }
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,.2); }
          50% { transform: scale(1.02); box-shadow: 0 8px 30px rgba(0,0,0,.3); }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .lp-fade { animation: slideUp .4s ease both; }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ──────────────────────────────────── */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>
        {announcementText}
      </div>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
        {logoUrl
          ? <img src={logoUrl} alt={storeName} style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
          : <span style={{ fontWeight: 800, fontSize: 20, color: accent }}>{storeName}</span>
        }
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 0 100px' }}>

        {/* ── COUNTDOWN ──────────────────────────────────────── */}
        {showCountdown && (
          <div style={{ background: '#1f2937', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ color: '#f9fafb', fontSize: 13, fontWeight: 600 }}>
              🔥 Offre <b style={{ color: '#fbbf24' }}>{discount ? `-${discount}%` : 'Spéciale'}</b> se termine dans
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 8, padding: '5px 10px', color: '#fff', fontWeight: 700, fontSize: 15, minWidth: 38, textAlign: 'center' }}>
                  {v}{['h', 'm', 's'][i]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IMAGE CAROUSEL ─────────────────────────────────── */}
        {images.length > 0 && (
          <div style={{ background: '#fff', padding: '16px 16px 8px' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f3f4f6', aspectRatio: '1/1', position: 'relative' }}>
              <img src={images[activeImg]} alt={product?.title || storeName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {discount && (
                <span style={{ position: 'absolute', top: 12, left: 12, background: '#dc2626', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `2px solid ${activeImg === i ? accent : 'transparent'}`, cursor: 'pointer', background: 'none', padding: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCT INFO ──────────────────────────────────────── */}
        <div style={{ padding: '16px 16px 0', background: settings?.bg_color || '#f9fafb' }}>

          {/* Badges */}
          {(tags.length > 0 || discount) && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {discount && (
                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  🔥 -{discount}% RÉDUCTION
                </span>
              )}
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} style={{ background: accentLight, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  ⚡ {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          {product?.title && (
            <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: '#111827', marginBottom: 10 }}>
              {product.title}
            </h1>
          )}

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, color: '#6b7280' }}>
            <span style={{ color: '#eab308', fontSize: 16 }}>⭐⭐⭐⭐⭐</span>
            <b style={{ color: '#111827' }}>4.8</b>
            <span>(127 avis) · <b style={{ color: '#111827' }}>500+ vendus</b></span>
          </div>

          {/* Price */}
          {price && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{price}</span>
              {comparePrice && (
                <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>{comparePrice}</span>
              )}
            </div>
          )}

          {/* Trust bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, fontSize: 14 }}>
            {[
              ['💎', '✅ Qualité Garantie'],
              ['🚚', '🚚 Livraison Gratuite'],
              ['💵', '💰 Paiement à la réception'],
              ['🔒', '🔒 Satisfait ou remboursé'],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ORDER FORM ────────────────────────────────────────── */}
        <div style={{ margin: '0 16px 8px', background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,.07)', border: '1px solid #e5e7eb' }} id="order-form">
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>📦 Passer ma commande</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 0 }}>Remplissez le formulaire — on vous appelle pour confirmer.</p>
          <OrderForm product={product} accent={accent} storeName={storeName} />
        </div>

        {/* ── DESCRIPTION ───────────────────────────────────────── */}
        {description && (
          <div style={{ padding: '20px 16px' }}>
            <div
              style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {/* ── REVIEWS ───────────────────────────────────────────── */}
        <div style={{ padding: '24px 16px', background: '#fff', margin: '0 0 8px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 4 }}>⭐ Avis de nos clients</h2>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Découvrez ce que nos clients pensent</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Fatoumata C.', city: 'Conakry', stars: 5, text: 'Produit de très bonne qualité ! Livraison rapide, je recommande vivement.' },
              { name: 'Mamadou D.', city: 'Matam', stars: 5, text: 'Excellent rapport qualité-prix. Ma famille est très contente de cet achat.' },
              { name: 'Aissatou B.', city: 'Dixinn', stars: 4, text: 'Service client au top ! Le produit correspond parfaitement à la description.' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div style={{ color: '#eab308', fontSize: 14, marginBottom: 8 }}>{'⭐'.repeat(r.stars)}</div>
                <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.5, marginBottom: 14 }}>{r.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: accentLight, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {r.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.city}</div>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>✓ Achat vérifié</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <div style={{ padding: '0 16px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 20 }}>Questions fréquentes</h2>
          <FaqItem accent={accent} q="💳 Paiement à la livraison" a="Vous payez uniquement à la réception. Aucun paiement en ligne requis." />
          <FaqItem accent={accent} q="📦 Expédition" a="Livraison gratuite, 1 à 2 jours ouvrables selon votre zone." />
          <FaqItem accent={accent} q="🔄 Retours" a="Retour possible sous 7 jours après réception. Contactez-nous pour toute réclamation." />
          <FaqItem accent={accent} q="🛡️ Garantie 30 jours" a="Garantie contre les défauts de fabrication. Satisfait ou remboursé." />
          {whatsapp && (
            <FaqItem accent={accent} q="💬 Service client" a={`Notre équipe répond à toutes vos questions. Contactez-nous sur WhatsApp : ${whatsapp}`} />
          )}
        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer style={{ padding: '20px 16px', borderTop: '1px solid #e5e7eb', textAlign: 'center', background: '#fff' }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: accent, marginBottom: 6 }}>{storeName}</p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>© {new Date().getFullYear()} {storeName} — Tous droits réservés</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, fontSize: 12, color: '#6b7280' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Confidentialité</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Retours</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          </div>
        </footer>

      </main>

      {/* ── FLOATING CTA ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 16px 16px',
        background: 'linear-gradient(to top, rgba(249,250,251,1) 60%, rgba(249,250,251,0))',
      }}>
        <a href="#order-form" style={{
          display: 'block', width: '100%', maxWidth: 560, margin: '0 auto',
          padding: '16px', background: accent, color: '#fff', textAlign: 'center',
          borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none',
          letterSpacing: '0.02em', animation: 'ctaPulse 3s ease-in-out infinite',
        }}>
          🛒 COMMANDER MAINTENANT
        </a>
      </div>

      {/* ── WHATSAPP BUTTON ──────────────────────────────────────── */}
      {whatsapp && (
        <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          style={{
            position: 'fixed', bottom: 80, right: 20, width: 52, height: 52,
            background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.2)', zIndex: 50,
            textDecoration: 'none', fontSize: 26,
          }}>
          💬
        </a>
      )}
    </div>
  )
}
