export interface StoreTheme {
  id: string
  name: string
  preview_color: string
  colors: {
    bg: string
    surface: string
    text: string
    text_soft: string
    accent: string
    accent_deep: string
    gold: string
    border: string
  }
  fonts: {
    display: string
    body: string
  }
}

export const STORE_THEMES: StoreTheme[] = [
  {
    id: 'rose-gold',
    name: 'Rose & Doré',
    preview_color: '#E8527A',
    colors: {
      bg: '#FFF8F3',
      surface: '#FFFFFF',
      text: '#3A2A2E',
      text_soft: '#7A6469',
      accent: '#E8527A',
      accent_deep: '#C23A5E',
      gold: '#C9A24B',
      border: '#F0D9D2',
    },
    fonts: { display: "'Fraunces', serif", body: "'Plus Jakarta Sans', sans-serif" },
  },
  {
    id: 'ocean-blue',
    name: 'Bleu Océan',
    preview_color: '#2B6CB0',
    colors: {
      bg: '#F5F9FC',
      surface: '#FFFFFF',
      text: '#1A2B3C',
      text_soft: '#5B7184',
      accent: '#2B6CB0',
      accent_deep: '#1E4E80',
      gold: '#3CA0A0',
      border: '#DCE8F0',
    },
    fonts: { display: "'Fraunces', serif", body: "'Plus Jakarta Sans', sans-serif" },
  },
  {
    id: 'midnight',
    name: 'Noir Élégant',
    preview_color: '#D4AF37',
    colors: {
      bg: '#0F0F10',
      surface: '#1A1A1C',
      text: '#F4F1EA',
      text_soft: '#9B9590',
      accent: '#D4AF37',
      accent_deep: '#B8932A',
      gold: '#D4AF37',
      border: '#2A2A2D',
    },
    fonts: { display: "'Fraunces', serif", body: "'Plus Jakarta Sans', sans-serif" },
  },
]

export const DEFAULT_THEME = STORE_THEMES[0]
