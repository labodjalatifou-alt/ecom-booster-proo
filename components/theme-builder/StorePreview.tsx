import React from 'react';
import { ShoppingCart, Menu, Search, Star } from 'lucide-react';

export default function StorePreview({ product, blocks, globalSettings }: { product: any, blocks: any[], globalSettings: any }) {
  
  // Mocks pour le produit par défaut si la DB est vide
  const pTitle = product?.title || "La Prise Intelligente: Contrôle tout depuis ton téléphone";
  const pPrice = product?.price ? `${product.price} FCFA` : "15000 FCFA";
  const pImage = product?.image_url || "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80";
  const pDesc = product?.description || `<h2>Description</h2><p>Ceci est un produit d'exemple. Vous pourrez rédiger la description riche depuis l'onglet Produits.</p>`;
  
  const primaryColor = globalSettings?.primaryColor || '#2b59ff';

  return (
    <div className="w-full h-full bg-white flex flex-col font-sans text-gray-900 overflow-y-auto custom-scrollbar relative">
      
      {/* Header Minimaliste */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 z-20 bg-white/90 backdrop-blur">
         <div className="flex items-center gap-4 w-1/3">
           <Menu className="w-6 h-6 text-gray-800" />
           <Search className="w-5 h-5 text-gray-500 hidden sm:block" />
         </div>
         <div className="w-1/3 text-center">
           <span className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
             MABOUTIQUE
           </span>
         </div>
         <div className="flex items-center justify-end gap-4 w-1/3">
           <ShoppingCart className="w-6 h-6 text-gray-800" />
         </div>
      </header>

      {/* Main Product Info */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* Gauche: Images */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center relative sticky top-24">
              <img src={pImage} alt={pTitle} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 1 ? 'opacity-100' : 'border-transparent opacity-60'}`} style={{ borderColor: i === 1 ? primaryColor : 'transparent' }}>
                  <img src={pImage} alt="Miniature" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Droite: Blocs Dynamiques (Gérés par le builder) */}
          <div className="w-full lg:w-1/2 flex flex-col">
             {blocks.map(block => {
                if (block.hidden) return null;

                switch(block.type) {
                   case 'Titre':
                     return <h1 key={block.id} className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-4">{pTitle}</h1>;
                   case 'Note de produit':
                     return (
                       <div key={block.id} className="flex items-center gap-2 mb-4">
                         <div className="flex text-yellow-400">
                           <Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/>
                         </div>
                         <span className="font-bold text-gray-500">4.9 (128 avis)</span>
                       </div>
                     );
                   case 'Prix':
                     return (
                       <div key={block.id} className="flex items-end gap-3 mb-6">
                         <span className="text-4xl font-black">{pPrice}</span>
                         <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-black text-xs mb-2">-50%</span>
                       </div>
                     );
                   case 'Boutons d\'achat':
                     return (
                       <div key={block.id} className="space-y-3 mb-8">
                         <button className="w-full py-4 rounded-xl text-white font-black text-lg uppercase tracking-widest shadow-xl transition-transform flex justify-center items-center gap-3 hover:scale-[1.02]" style={{ backgroundColor: primaryColor, boxShadow: \`0 15px 30px -5px \${primaryColor}50\` }}>
                           <ShoppingCart className="w-6 h-6" /> Ajouter au panier
                         </button>
                         <button className="w-full py-4 rounded-xl bg-black text-white font-black text-lg hover:bg-gray-900 transition-colors">Acheter avec ShopPay</button>
                       </div>
                     );
                   case 'Description':
                     return (
                       <div key={block.id} className="prose prose-sm md:prose-base max-w-none text-gray-800 mt-6 pt-6 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: pDesc }} />
                     );
                   default:
                     return null;
                }
             })}
          </div>

        </div>
      </main>
    </div>
  )
}
