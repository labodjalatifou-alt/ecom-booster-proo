import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function TestimonialsSection({ settings }: { settings: any }) {
  const title = settings?.title || "Ce que disent nos clients";
  const subtitle = settings?.subtitle || "Plus de 10 000 clients satisfaits font confiance à nos produits tous les jours.";
  const bgColor = settings?.bgColor || "#ffffff";
  const layout = settings?.layout || "grid"; // grid, masonry, floating
  
  // Mocks s'il n'y a pas d'items configurés
  const items = settings?.items && settings.items.length > 0 ? settings.items : [
    { name: "Marie Dupont", location: "Paris, France", text: "Vraiment impressionnée par la qualité. La livraison a été très rapide et le produit correspond exactement à la description. Je recommande !", rating: 5, date: "Il y a 2 jours", verified: true },
    { name: "Thomas Martin", location: "Lyon, France", text: "Le service client est exceptionnel. J'ai eu une question et on m'a répondu en 5 minutes. Le produit est top.", rating: 5, date: "Il y a 1 semaine", verified: true },
    { name: "Sophie L.", location: "Bordeaux, France", text: "Je n'étais pas sûre au début, mais je ne regrette absolument pas mon achat. C'est devenu indispensable pour moi au quotidien.", rating: 4, date: "Il y a 2 semaines", verified: true }
  ];

  return (
    <section className="w-full py-16 @md:py-24 px-4 @md:px-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl @md:text-5xl font-black text-gray-900 tracking-tight mb-4">{title}</h2>
          {subtitle && <p className="text-lg @md:text-xl text-gray-500">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6 @md:gap-8">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Stars */}
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < item.rating ? 'fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              
              {/* Text */}
              <p className="text-gray-700 leading-relaxed mb-8 flex-1 italic">
                "{item.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-800 font-black text-lg flex-shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    {item.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.location}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
