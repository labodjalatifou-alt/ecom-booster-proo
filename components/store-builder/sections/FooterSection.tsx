import React from 'react';

export default function FooterSection({ settings }: { settings: any }) {
  const logoText = settings?.logoText || "MABOUTIQUE";
  const description = settings?.description || "Nous vous proposons les meilleurs produits du marché avec un service client inégalé. Achetez en toute confiance avec notre paiement sécurisé à la livraison.";
  const bgColor = settings?.bgColor || "#111827";
  const textColor = settings?.textColor || "#ffffff";
  const copyright = settings?.copyright || `© ${new Date().getFullYear()} MABOUTIQUE. Tous droits réservés.`;
  
  return (
    <footer className="w-full pt-16 pb-8 px-4 md:px-8 border-t border-white/10" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black tracking-tighter mb-4">{logoText}</h3>
            <p className="opacity-70 leading-relaxed max-w-sm">
              {description}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-3 opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Boutique</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Suivre ma commande</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Contactez-nous</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Informations Légal</h4>
            <ul className="space-y-3 opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Conditions générales de vente</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Mentions légales</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 opacity-50 text-sm">
          <p>{copyright}</p>
          <div className="flex gap-4">
            <span>Paiement à la livraison 100% sécurisé</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
