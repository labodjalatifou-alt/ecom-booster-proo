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
    name: 'Élégance Féminine',
    preview_color: '#E8527A',
    colors: {
      bg: '#FFF5F7',
      surface: '#FFFFFF',
      text: '#2D1B20',
      text_soft: '#8A7076',
      accent: '#E8527A',
      accent_deep: '#C23A5E',
      gold: '#D4AF37',
      border: '#FCE7EC',
    },
    fonts: { display: "'Playfair Display', serif", body: "'Outfit', sans-serif" },
  },
  {
    id: 'tech-minimal',
    name: 'Brutalisme / Tech',
    preview_color: '#000000',
    colors: {
      bg: '#F4F4F5',
      surface: '#FFFFFF',
      text: '#09090B',
      text_soft: '#71717A',
      accent: '#000000',
      accent_deep: '#27272A',
      gold: '#3B82F6',
      border: '#E4E4E7',
    },
    fonts: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  },
  {
    id: 'nature-bio',
    name: 'Nature / Santé',
    preview_color: '#10B981',
    colors: {
      bg: '#F6FAF7',
      surface: '#FFFFFF',
      text: '#064E3B',
      text_soft: '#34D399',
      accent: '#10B981',
      accent_deep: '#059669',
      gold: '#F59E0B',
      border: '#D1FAE5',
    },
    fonts: { display: "'Lora', serif", body: "'Roboto', sans-serif" },
  },
]

export const DEFAULT_THEME = STORE_THEMES[0]
