import React from 'react';
import { Truck, Shield, Clock, Award } from 'lucide-react';

export default function BenefitsSection({ settings }: { settings: any }) {
  const title = settings?.title || "Pourquoi choisir notre produit ?";
  const bgColor = settings?.bgColor || "#ffffff";
  const layout = settings?.layout || "grid"; // grid, line, cards
  
  const items = settings?.items && settings.items.length > 0 ? settings.items : [
    { icon: "Truck", title: "Livraison Gratuite", text: "Expédition en 24h et livraison gratuite partout en France métropolitaine sans minimum d'achat." },
    { icon: "Shield", title: "Paiement Sécurisé", text: "Vos données sont chiffrées de bout en bout. Nous acceptons les paiements à la livraison." },
    { icon: "Clock", title: "Support 24/7", text: "Une équipe dédiée est disponible pour répondre à toutes vos questions à tout moment." },
    { icon: "Award", title: "Qualité Premium", text: "Garantie satisfait ou remboursé de 30 jours. La qualité est notre priorité absolue." }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-8 h-8" />;
      case 'Shield': return <Shield className="w-8 h-8" />;
      case 'Clock': return <Clock className="w-8 h-8" />;
      case 'Award': return <Award className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  return (
    <section className="w-full py-16 md:py-24 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        
        {title && (
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 tracking-tight mb-16">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
