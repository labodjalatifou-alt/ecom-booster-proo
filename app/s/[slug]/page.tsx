import React from 'react';
import SectionRenderer from '@/components/store-builder/SectionRenderer';
import { Store } from '@/lib/store-builder/types';

// Mock function - in production, fetch from Supabase
async function getStoreBySlug(slug: string): Promise<Store | null> {
  // Simulating DB delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (slug === 'demo') {
    return {
      id: 'store-1',
      name: 'Boutique de Démo',
      slug: 'demo',
      theme: {
        colors: { primary: '#008060', secondary: '#ffffff', accent: '#ff0000', text: '#333333', background: '#f9fafb' },
        typography: { headingFont: 'Inter', bodyFont: 'Inter' },
        spacing: { padding: 16 },
        buttons: { borderRadius: 8, style: 'solid' }
      },
      pages: {
        'home': {
          header: [{ id: 'h1', type: 'AnnouncementBar', title: 'Barre d\'annonce', hidden: false, settings: {} }],
          template: [
            { id: 's1', type: 'Hero', title: 'Hero', hidden: false, settings: { title: 'Bienvenue sur notre boutique publique !', overlayOpacity: 50 } },
            { id: 's2', type: 'Benefits', title: 'Avantages', hidden: false, settings: {} },
            { id: 's3', type: 'OrderForm', title: 'Commande', hidden: false, settings: {} },
          ],
          footer: [{ id: 'f1', type: 'Footer', title: 'Footer', hidden: false, settings: {} }]
        }
      }
    };
  }
  return null;
}

export default async function PublicStorePage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-500">Boutique introuvable.</p>
        </div>
      </div>
    );
  }

  const page = store.pages['home']; // Force home for now

  return (
    <div className="w-full min-h-screen flex flex-col font-sans" style={{ backgroundColor: store.theme.colors.background }}>
      
      {/* Header */}
      {page.header.map(section => !section.hidden && (
        <SectionRenderer key={section.id} type={section.type} settings={section.settings} />
      ))}

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {page.template.map(section => !section.hidden && (
          <SectionRenderer key={section.id} type={section.type} settings={section.settings} />
        ))}
      </main>

      {/* Footer */}
      {page.footer.map(section => !section.hidden && (
        <SectionRenderer key={section.id} type={section.type} settings={section.settings} />
      ))}

    </div>
  );
}
