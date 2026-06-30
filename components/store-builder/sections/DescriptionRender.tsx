'use client'

import type { CSSProperties } from 'react'

/**
 * Rendu description produit — respecte le HTML TipTap (H1/H2/H3, gras, alignements).
 */
export default function DescriptionRender({ settings, product }: { settings: any; product?: any }) {
  const s = settings || {}
  // Surcharge du bloc prioritaire ; sinon description fiche produit
  const blockContent = s.content?.trim?.() ? s.content : ''
  const productContent = product?.description?.trim?.() ? product.description : ''
  const content = blockContent || productContent
  const align = s.text_align || 'left'

  if (!content) {
    return (
      <p className="text-sm italic my-6 px-4" style={{ color: s.text_soft_color || '#9B9590', textAlign: align as any }}>
        Ajoutez une description depuis la fiche produit ou le panneau de droite.
      </p>
    )
  }

  return (
    <div className="px-5 py-6">
      <div
        className="landing-description max-w-none leading-relaxed"
        style={{
          color: s.text_color || '#4b5563',
          textAlign: align as CSSProperties['textAlign'],
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style>{`
        .landing-description { font-size: 15px; line-height: 1.65; }
        .landing-description p {
          margin: 0 0 1rem;
          font-size: 15px;
          line-height: 1.65;
        }
        .landing-description p:last-child { margin-bottom: 0; }
        .landing-description h1 {
          display: block;
          font-size: clamp(1.75rem, 5vw, 2.25rem) !important;
          font-weight: 900 !important;
          line-height: 1.15 !important;
          margin: 1.25rem 0 0.75rem !important;
          color: var(--color-heading, #111827);
        }
        .landing-description h2 {
          display: block;
          font-size: clamp(1.35rem, 4vw, 1.65rem) !important;
          font-weight: 800 !important;
          line-height: 1.25 !important;
          margin: 1rem 0 0.5rem !important;
          color: var(--color-heading, #111827);
        }
        .landing-description h3 {
          display: block;
          font-size: clamp(1.1rem, 3.5vw, 1.25rem) !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          margin: 0.75rem 0 0.35rem !important;
          color: var(--color-heading, #111827);
        }
        .landing-description strong, .landing-description b { font-weight: 800; }
        .landing-description em, .landing-description i { font-style: italic; }
        .landing-description u { text-decoration: underline; }
        .landing-description ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0 1rem; }
        .landing-description ol { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0 1rem; }
        .landing-description li { margin-bottom: 0.25rem; }
        .landing-description img,
        .landing-description video {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 1rem auto;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .landing-description a { color: var(--color-primary, #6366f1); text-decoration: underline; }
        .landing-description blockquote {
          border-left: 4px solid var(--color-primary, #6366f1);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          opacity: 0.85;
        }
        .landing-description p[style*="text-align: center"] img,
        .landing-description p[style*="text-align:center"] img,
        .landing-description h1[style*="text-align: center"] img,
        .landing-description h2[style*="text-align: center"] img,
        .landing-description h3[style*="text-align: center"] img {
          margin-left: auto;
          margin-right: auto;
        }
        .landing-description[style*="text-align: center"] img,
        .landing-description[style*="text-align:center"] img {
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  )
}
