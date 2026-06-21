import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { STORE_TEMPLATES } from '@/lib/store-builder/templates';
import EditorClient from './EditorClient';

export default async function StoreBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  const { id } = await params;

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*, store_settings(*)')
    .eq('id', id)
    .single();

  if (storeError || !store) {
    redirect('/boutiques');
  }

  const { data: storePage } = await supabase
    .from('store_pages')
    .select('*')
    .eq('store_id', id)
    .eq('slug', 'home')
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  let builderJson = storePage?.builder_json;

  if (!builderJson || !builderJson.template || builderJson.template.length === 0) {
    const templateId = store.store_settings?.theme_id || 'shrine-mono-product';
    const template = STORE_TEMPLATES.find((t: any) => t.id === templateId) || STORE_TEMPLATES[0];

    builderJson = {
      header: [
        {
          id: `h-${Date.now()}`,
          type: 'AnnouncementBar',
          title: "Barre d'annonce",
          hidden: false,
          settings: {
            text: "Livraison gratuite à partir de 50 000 FCFA",
            bg_color: "#1e1b4b",
            text_color: "#ffffff"
          }
        }
      ],
      template: template.sections.map((sec: any) => ({
        id: sec.id,
        type: sec.type,
        title: sec.type,
        hidden: sec.hidden !== undefined ? sec.hidden : !sec.visible,
        settings: sec.settings || sec.props || {}
      })),
      footer: [
        {
          id: `f-${Date.now()}`,
          type: 'Footer',
          title: 'Pied de page',
          hidden: false,
          settings: {}
        }
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

  return (
    <EditorClient
      storeId={id}
      initialData={builderJson}
      products={products || []}
    />
  );
}