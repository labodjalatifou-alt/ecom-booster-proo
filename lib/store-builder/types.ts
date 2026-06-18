export type FieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'color' | 'image' | 'toggle' | 'select' | 'range' | 'url' | 'items_list';

export interface SectionDefinition {
  type: string;
  category: 'Marketing' | 'Contenu' | 'Produits' | 'Avis & Confiance' | 'Informations' | 'Structure' | 'Fixe';
  title: string;
  icon: string; // Lucide icon name
  defaultSettings: any;
  fields: FieldDefinition[];
}

export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  options?: { label: string; value: string }[]; // For select
  min?: number; // For range
  max?: number; // For range
  step?: number; // For range
  defaultItem?: any; // For items_list
  itemFields?: FieldDefinition[]; // For items_list
  placeholder?: string;
}

export interface StoreSection {
  id: string;
  type: string; // Refers to SectionDefinition.type
  title: string; // Custom title override
  hidden: boolean;
  settings: any;
}

export interface StoreTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  spacing: {
    padding: number;
  };
  buttons: {
    borderRadius: number;
    style: 'solid' | 'outline' | 'ghost';
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  status: 'published' | 'paused' | 'draft';
  created_at: string;
  updated_at?: string;
  theme: StoreTheme;
  pages: {
    [pageSlug: string]: {
      header: StoreSection[]; // Always 1
      template: StoreSection[]; // Draggable sections
      footer: StoreSection[]; // Always 1
    }
  };
}

export type StoreColors = StoreTheme['colors'];
export type StoreFonts = StoreTheme['typography'];
export type BuilderSection = StoreSection;
