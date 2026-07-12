import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { buildStorePage, getBoutiqueTheme, buildThemeSettings } from '@/lib/store-builder/boutique-themes';
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

  // ── Migrate old format { sections: [...] } → { header, template, footer } ──
  if (builderJson && Array.isArray(builderJson.sections) && !builderJson.template) {
    const migrated = {
      header: [],
      template: builderJson.sections.map((sec: any) => ({
        id: sec.id || `${sec.type}-${Date.now()}`,
        type: sec.type,
        title: sec.type,
        hidden: sec.visible === false,
        settings: sec.props || sec.settings || {},
      })),
      footer: [],
    }
    builderJson = migrated
    if (storePage) {
      await supabase.from('store_pages').update({ builder_json: migrated }).eq('id', storePage.id)
    }
  }

  // ── Migration silencieuse : injecter un id pour chaque bloc qui en manque ──
  if (builderJson) {
    for (const section of ['header', 'template', 'footer'] as const) {
      if (Array.isArray(builderJson[section])) {
        builderJson[section] = (builderJson[section] as any[]).map((b: any, i: number) => ({
          ...b,
          id: b.id || `${b.type || 'block'}-${Date.now()}-${i}`,
        }))
      }
    }
  }

  if (!builderJson || !builderJson.template || builderJson.template.length === 0) {
    // Utiliser le système de thèmes boutique pour générer un builder_json complet avec layout
    const themeId = store.store_settings?.theme_id || 'nature-vert';
    const storeName = store.name || 'Ma Boutique';
    builderJson = buildStorePage(themeId, storeName, null);

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

  // ── Migration silencieuse : injecter themeSettings.layout si absent ──
  // Les boutiques créées avant le commit a2fa66c n'ont pas ce champ.
  // Sans lui, resolveLayout() retourne 'single-column' et le layout multi-colonnes ne s'active pas.
  if (builderJson && builderJson.themeSettings && !builderJson.themeSettings.layout) {
    const storeSettings = Array.isArray(store.store_settings)
      ? store.store_settings[0]
      : store.store_settings;
    const themeId = storeSettings?.theme_id || 'nature-vert';
    const theme = getBoutiqueTheme(themeId);
    const canonical = buildThemeSettings(theme);

    builderJson = {
      ...builderJson,
      themeSettings: {
        ...canonical,          // valeurs de base du thème (layout inclus)
        ...builderJson.themeSettings, // préserver les perso utilisateur (couleurs, logo…)
        layout: builderJson.themeSettings.layout || canonical.layout, // forcer le layout
      },
    };
    // Persister silencieusement
    if (storePage?.id) {
      await supabase.from('store_pages').update({ builder_json: builderJson }).eq('id', storePage.id);
    }
  }

  return (
    <EditorClient
      storeId={id}
      storeName={store.name}
      storeSlug={store.slug}
      storeStatus={store.status}
      initialData={builderJson}
      products={products || []}
    />
  );
}