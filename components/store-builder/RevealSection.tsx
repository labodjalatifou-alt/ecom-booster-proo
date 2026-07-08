'use client'

import { CSSProperties } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

type RevealVariant = 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'zoomIn'

interface RevealSectionProps {
  children: React.ReactNode
  variant?: RevealVariant
  delay?: number   // en ms
  duration?: number // en ms
  className?: string
  style?: CSSProperties
  disabled?: boolean // pour désactiver dans l'éditeur
}

const VARIANTS: Record<RevealVariant, { hidden: CSSProperties; visible: CSSProperties }> = {
  fadeInUp: {
    hidden: { opacity: 0, transform: 'translateY(40px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInLeft: {
    hidden: { opacity: 0, transform: 'translateX(-40px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  fadeInRight: {
    hidden: { opacity: 0, transform: 'translateX(40px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  zoomIn: {
    hidden: { opacity: 0, transform: 'scale(0.92)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
}

/**
 * Enveloppe une section dans un conteneur animé au scroll.
 * Désactivé automatiquement côté éditeur via la prop `disabled`.
 */
export default function RevealSection({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 650,
  className = '',
  style,
  disabled = false,
}: RevealSectionProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08 })

  if (disabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  const v = VARIANTS[variant]

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(isVisible ? v.visible : v.hidden),
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
