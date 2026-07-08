'use client'

import dynamic from 'next/dynamic'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Animations Lottie inline minifiées (libres de droits, générées programmatiquement)
// Chaque animation est un JSON Lottie simple dessiné en code

const TRUCK_ANIMATION = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: "truck",
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "truck", sr: 1, ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [
        { t: 0, s: [100, 100, 100], e: [105, 100, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 30, s: [105, 100, 100], e: [100, 100, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 60, s: [100, 100, 100] }
      ]}
    },
    shapes: [
      { ty: "gr", it: [
        { ty: "rc", p: { a: 0, k: [-10, 0] }, s: { a: 0, k: [50, 30] }, r: { a: 0, k: 4 } },
        { ty: "fl", c: { a: 0, k: [0.38, 0.4, 0.94, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]},
      { ty: "gr", it: [
        { ty: "rc", p: { a: 0, k: [22, 2] }, s: { a: 0, k: [16, 26] }, r: { a: 0, k: 4 } },
        { ty: "fl", c: { a: 0, k: [0.55, 0.57, 0.96, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]}
    ],
    ip: 0, op: 60, st: 0, bm: 0
  }]
}

const SHIELD_ANIMATION = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: "shield",
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "shield", sr: 1, ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [
        { t: 0, s: [100, 100, 100], e: [108, 108, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 30, s: [108, 108, 100], e: [100, 100, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 60, s: [100, 100, 100] }
      ]}
    },
    shapes: [{ ty: "gr", it: [
      { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 3 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 12 }, is: { a: 0, k: 0 }, or: { a: 0, k: 22 }, os: { a: 0, k: 0 }, ix: 1 },
      { ty: "fl", c: { a: 0, k: [0.06, 0.73, 0.51, 1] }, o: { a: 0, k: 100 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ]}],
    ip: 0, op: 60, st: 0, bm: 0
  }]
}

const STAR_ANIMATION = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: "star",
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "star", sr: 1, ks: {
      o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] },
      r: { a: 1, k: [
        { t: 0, s: [0], e: [360], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 60, s: [360] }
      ]},
      s: { a: 0, k: [100, 100, 100] }
    },
    shapes: [{ ty: "gr", it: [
      { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: -90 }, ir: { a: 0, k: 10 }, is: { a: 0, k: 0 }, or: { a: 0, k: 22 }, os: { a: 0, k: 0 }, ix: 1 },
      { ty: "fl", c: { a: 0, k: [0.96, 0.62, 0.04, 1] }, o: { a: 0, k: 100 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ]}],
    ip: 0, op: 60, st: 0, bm: 0
  }]
}

const LOCK_ANIMATION = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 100, h: 100, nm: "lock",
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "lock-body", sr: 1, ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 58, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [
        { t: 0, s: [100, 100, 100], e: [105, 105, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 30, s: [105, 105, 100], e: [100, 100, 100], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: 60, s: [100, 100, 100] }
      ]}
    },
    shapes: [{ ty: "gr", it: [
      { ty: "rc", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [36, 28] }, r: { a: 0, k: 6 } },
      { ty: "fl", c: { a: 0, k: [0.38, 0.4, 0.94, 1] }, o: { a: 0, k: 100 } },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ]}],
    ip: 0, op: 60, st: 0, bm: 0
  }]
}

const ANIMATIONS: Record<string, any> = {
  truck: TRUCK_ANIMATION,
  shield: SHIELD_ANIMATION,
  star: STAR_ANIMATION,
  lock: LOCK_ANIMATION,
  check: SHIELD_ANIMATION,
  gift: STAR_ANIMATION,
  chat: TRUCK_ANIMATION,
}

interface LottieIconProps {
  name: 'truck' | 'shield' | 'star' | 'lock' | 'check' | 'gift' | 'chat' | string
  size?: number
  loop?: boolean
  className?: string
}

/**
 * Icône animée Lottie pour une expérience premium.
 * Utilise des animations intégrées (pas de fichiers externes).
 */
export default function LottieIcon({ name, size = 48, loop = true, className = '' }: LottieIconProps) {
  const animData = ANIMATIONS[name] || ANIMATIONS['shield']

  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie
        animationData={animData}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
