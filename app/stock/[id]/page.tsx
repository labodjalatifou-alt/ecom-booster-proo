"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Package, 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Plus, 
  Globe, 
  Tag, 
  Layers, 
  Loader2, 
  ImageIcon, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/components/StoreProvider';
import toast from 'react-hot-toast';
import { sanitizeError } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currency } = useStore();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setProduct(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setPrice(data.price || '0');
      setStock(data.stock || 0);
      setImageUrls(data.images || (data.image_url ? [data.image_url] : []));
      
    } catch (err: any) {
      toast.error("Produit introuvable");
      router.push('/stock');
    } finally {
      setLoading(false);
    }
  }

  async function refreshFromShopify() {
    setSaving(true);
    try {
      // 1. Récupérer les infos de la boutique via le produit
      const { data: store, error: storeError } = await supabase
        .from('Store')
        .select('*')
        .eq('id', product.store_id)
        .single();
        
      if (storeError) throw storeError;

      const response = await fetch(`https://${store.shopifyUrl}/admin/api/2024-01/products/${product.shopify_id}.json`, {
        headers: { 'X-Shopify-Access-Token': store.shopifyToken }
      });

      if (!response.ok) throw new Error("Erreur Shopify");
      const { product: shopifyProduct } = await response.json();

      // 2. Mettre à jour Supabase
      const { data: updated, error: upError } = await supabase
        .from('products')
        .update({
          title: shopifyProduct.title,
          description: shopifyProduct.body_html,
          price: shopifyProduct.variants[0].price,
          stock: shopifyProduct.variants[0].inventory_quantity,
          images: shopifyProduct.images.map((img: any) => img.src),
          image_url: shopifyProduct.image?.src || shopifyProduct.images[0]?.src
        })
        .eq('id', id)
        .select()
        .single();

      if (upError) throw upError;
      
      setProduct(updated);
      setTitle(updated.title);
      setDescription(updated.description || '');
      setPrice(updated.price);
      setStock(updated.stock);
      setImageUrls(updated.images || []);
      toast.success("Synchronisé avec Shopify !");
      
    } catch (err: any) {
      toast.error("Échec de la synchronisation : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/shopify/update-product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          description,
          price,
          inventory: stock,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Produit mis à jour avec succès !");
      setIsEditing(false);
      setProduct(data.product);
      
    } catch (err: any) {
      toast.error(sanitizeError(err));
    } finally {
      setSaving(false);
    }
  }

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    if (activeImageIndex >= imageUrls.length - 1) {
      setActiveImageIndex(Math.max(0, imageUrls.length - 2));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Chargement des détails...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/stock')}
            className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <div className="p-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Stock</span>
          </button>
          
          <div className="h-4 w-[2px] bg-slate-100 dark:bg-slate-800" />
          
          <button 
            onClick={refreshFromShopify}
            disabled={saving}
            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sync Shopify</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm relative group">
            <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-10">
              {imageUrls.length > 0 ? (
                <img 
                  src={imageUrls[activeImageIndex]} 
                  alt={product.title} 
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500" 
                />
              ) : (
                <ImageIcon className="w-20 h-20 text-slate-200" />
              )}
            </div>

            {imageUrls.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : imageUrls.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev < imageUrls.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                product.status === 'active' ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200' : 'bg-amber-100/80 text-amber-700 border-amber-200'
              } backdrop-blur-md`}>
                {product.status === 'active' ? 'En vente' : 'Brouillon'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {imageUrls.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {imageUrls.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-2xl border-2 transition-all overflow-hidden ${
                    activeImageIndex === i ? 'border-primary-500 scale-110 shadow-lg' : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Mini images / URL editor if editing */}
          {isEditing && (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gestion des Images (URLs)</h4>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden group">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button 
                      onClick={() => removeImageUrl(i)}
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://image-url.com/..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/10"
                />
                <button 
                  onClick={addImageUrl}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Info & Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="relative z-10 space-y-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Titre du produit</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-2xl font-black outline-none focus:ring-4 focus:ring-primary-500/10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Prix ({product.currency || currency})</label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xl font-black text-primary-600 outline-none focus:ring-4 focus:ring-primary-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Stock disponible</label>
                      <input 
                        type="number" 
                        value={stock}
                        onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xl font-black outline-none focus:ring-4 focus:ring-primary-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description HTML (Shopify)</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant Shopify</p>
                        <p className="text-xs font-bold font-mono">{product.shopify_id || 'Non connecté'}</p>
                      </div>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter leading-[1.1] mb-2 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">{product.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Tag className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Prix de vente</span>
                      </div>
                      <p className="text-3xl font-black text-primary-600">
                        {new Intl.NumberFormat('fr-FR').format(parseInt(String(product.price || '0').replace(/\s/g, '')))} <span className="text-sm">{product.currency || currency}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Layers className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">État du Stock</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <p className={`text-3xl font-black ${product.stock > 10 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {product.stock || 0}
                        </p>
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1.5">unités</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                      <Globe className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Description Produit</span>
                    </div>
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description || '<p className="italic">Aucune description disponible.</p>' }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
