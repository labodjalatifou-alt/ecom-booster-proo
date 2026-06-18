import React from 'react';
import { ShoppingCart, Menu, Search, Star } from 'lucide-react';

export interface ThemeSettings {
  storeName: string;
  announcementText: string;
  showAnnouncement: boolean;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function StorePreview({ settings }: { settings: ThemeSettings }) {
  return (
    <div className="w-full h-full overflow-y-auto bg-white rounded-xl shadow-2xl relative custom-scrollbar transition-colors duration-300" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      
      {/* Announcement Bar */}
      {settings.showAnnouncement && (
        <div className="w-full py-2.5 text-center text-xs font-bold tracking-widest uppercase transition-colors duration-300" style={{ backgroundColor: settings.primaryColor, color: '#ffffff' }}>
          {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4 w-1/3">
          <Menu className="w-6 h-6 text-gray-800 cursor-pointer hover:opacity-70 transition-opacity" />
          <Search className="w-5 h-5 text-gray-500 hidden sm:block cursor-pointer hover:opacity-70 transition-opacity" />
        </div>
        <div className="w-1/3 text-center">
          <span className="text-3xl font-black tracking-tighter cursor-pointer transition-colors duration-300" style={{ color: settings.primaryColor }}>
            {settings.storeName}
          </span>
        </div>
        <div className="flex items-center justify-end gap-4 w-1/3">
          <div className="hidden sm:block text-sm font-semibold text-gray-500">FR</div>
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingCart className="w-6 h-6 text-gray-800" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
          </div>
        </div>
      </header>

      {/* Product Section */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Images (Left) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center sticky top-24">
              <img src="https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80" alt="Produit" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 1 ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ borderColor: i === 1 ? settings.primaryColor : 'transparent' }}>
                  <img src={`https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=200&q=80&sig=${i}`} alt="Miniature" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info (Right) */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-4" style={{ color: settings.textColor }}>
              La Prise Intelligente: Contrôle tout depuis ton téléphone
            </h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </div>
              <span className="text-sm md:text-base font-bold text-gray-500">4.9 (128 avis)</span>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black" style={{ color: settings.textColor }}>19,90 €</span>
              <span className="text-xl text-gray-400 line-through font-bold mb-1">39,90 €</span>
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-black text-xs mb-2">-50%</span>
            </div>

            <div className="space-y-3 mb-8">
              <button 
                className="w-full py-4 md:py-5 rounded-2xl text-white font-black text-lg md:text-xl uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-3"
                style={{ backgroundColor: settings.primaryColor, boxShadow: `0 15px 30px -5px ${settings.primaryColor}60` }}
              >
                <ShoppingCart className="w-6 h-6" />
                Ajouter au panier
              </button>
              <button className="w-full py-4 rounded-2xl bg-black text-white font-black text-lg hover:bg-gray-900 transition-colors">
                Acheter avec ShopPay
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex items-start gap-4">
               <div className="text-2xl">🚚</div>
               <div>
                 <h4 className="font-bold text-gray-900 text-sm mb-1">Livraison gratuite & rapide</h4>
                 <p className="text-xs text-gray-500">Commandez aujourd'hui et recevez-le demain chez vous avec notre partenaire de livraison express.</p>
               </div>
            </div>

            {/* Description Mock style Shopify */}
            <div className="prose prose-sm md:prose-base max-w-none text-gray-600">
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Tu pars et tu n'es jamais sûr d'avoir tout éteint ?</h2>
              <p className="mb-6 font-medium text-gray-600">Retrouve la paix d'esprit ! Avec cette prise connectée, vérifie en un instant sur ton téléphone si le fer à repasser ou le chauffage est bien éteint. Contrôle tes appareils de n'importe où dans le monde.</p>
              
              <img src="https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80" alt="Usage" className="rounded-2xl shadow-sm mb-8 w-full" />
              
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Ta facture d'électricité va enfin baisser</h2>
              <p className="mb-6 font-medium text-gray-600">Programme tes appareils pour qu'ils ne fonctionnent que lorsque tu en as vraiment besoin. Fini les appareils en veille qui consomment pour rien !</p>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 my-8">
                 <h3 className="font-black text-indigo-900 mb-2">💡 Conseil d'expert</h3>
                 <p className="text-indigo-800 text-sm m-0">Idéal pour programmer la cafetière le matin : réveille-toi avec l'odeur du café frais.</p>
              </div>

              <img src="https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80" alt="App" className="rounded-2xl shadow-sm mb-8 w-full" />

              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Installation en 30 secondes chrono</h2>
              <ol className="font-medium text-gray-600 space-y-2 mb-8">
                <li>Branche la prise dans le mur.</li>
                <li>Télécharge notre application gratuite (iOS & Android).</li>
                <li>Connecte-toi en 1 clic au WiFi. C'est prêt !</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-2xl font-black tracking-tighter" style={{ color: settings.primaryColor }}>
             {settings.storeName}
           </div>
           <div className="text-sm font-semibold text-gray-500">
             © 2026 {settings.storeName}. Tous droits réservés.
           </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}} />
    </div>
  );
}
