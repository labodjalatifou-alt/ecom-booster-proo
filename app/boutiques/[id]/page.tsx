import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { STORE_TEMPLATES } from '@/lib/store-builder/templates';

const Editor = dynamic(() => import('@/components/store-builder/Editor'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f1f2f4]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-500 font-medium">Chargement de l'éditeur...</p>
    </div>
  )
});

export default async function StoreBuilderPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // 1. Fetch store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (storeError || !store) {
    redirect('/boutiques');
  }

  // 2. Fetch page 'home'
  let { data: storePage } = await supabase
    .from('store_pages')
    .select('*')
    .eq('store_id', id)
    .eq('slug', 'home')
    .single();

  let builderJson = storePage?.builder_json;

  // 3. Init if empty
  if (!builderJson || !builderJson.template || builderJson.template.length === 0) {
    // Find template
    const templateId = store.theme_id || 'shrine-mono-product';
    const template = STORE_TEMPLATES.find(t => t.id === templateId) || STORE_TEMPLATES[0];

    // Build the initial JSON
    builderJson = {
      header: [
        { id: `h-${Date.now()}`, type: 'AnnouncementBar', title: 'Barre d\'annonce', hidden: false, settings: { text: "Livraison gratuite à partir de 50 000 FCFA", bg_color: "#1e1b4b", text_color: "#ffffff" } }
      ],
      template: template.sections.map((sec: any) => ({
        id: sec.id,
        type: sec.type,
        title: sec.type,
        hidden: sec.hidden !== undefined ? sec.hidden : !sec.visible,
        settings: sec.settings || sec.props || {}
      })),
      footer: [
        { id: `f-${Date.now()}`, type: 'Footer', title: 'Pied de page', hidden: false, settings: {} }
      ]
    };

    if (storePage) {
      await supabase.from('store_pages').update({ builder_json: builderJson }).eq('id', storePage.id);
    } else {
      await supabase.from('store_pages').insert({
        store_id: id,
        title: 'Accueil',
        slug: 'home',
        builder_json: builderJson
      });
    }
  }

  return <Editor storeId={id} initialData={builderJson} />;
}
