"use client";

import React, { useState } from 'react';
import { ShieldCheck, Truck, CheckCircle2, Loader2 } from 'lucide-react';

export default function OrderFormSection({ settings }: { settings: any }) {
  const title = settings?.title || "Finaliser la commande";
  const subtitle = settings?.subtitle || "Veuillez remplir vos informations pour la livraison.";
  const btnText = settings?.btnText || "Confirmer la commande";
  const btnColor = settings?.btnColor || "#008060";
  const btnTextColor = settings?.btnTextColor || "#ffffff";
  const successMessage = settings?.successMessage || "Votre commande a été confirmée avec succès !";
  const layout = settings?.layout || "split"; // split, standard, compact
  const bgColor = settings?.bgColor || "#f9fafb";
  const borderRadius = settings?.borderRadius || 16;
  
  // Simulation de l'état de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const FloatingInput = ({ label, type = "text", required = true }: any) => (
    <div className="relative mb-5">
      <input 
        type={type}
        required={required}
        placeholder=" "
        className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer transition-shadow"
      />
      <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );

  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">{title}</h2>
          {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
        </div>

        {isSuccess ? (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl flex flex-col items-center text-center w-full max-w-2xl" style={{ borderRadius: `${borderRadius}px` }}>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Merci pour votre commande !</h3>
            <p className="text-gray-600 mb-8">{successMessage}</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="px-8 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Faire une nouvelle commande
            </button>
          </div>
        ) : (
          <div className={`w-full max-w-6xl ${layout === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12' : 'max-w-3xl flex flex-col'}`}>
            
            {/* Formulaire */}
            <form onSubmit={handleSubmit} className={`bg-white p-6 md:p-8 shadow-xl border border-gray-100 ${layout === 'split' ? 'lg:col-span-7' : 'w-full'}`} style={{ borderRadius: `${borderRadius}px` }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-400" /> Adresse de livraison
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <FloatingInput label="Prénom" />
                <FloatingInput label="Nom" />
              </div>
              <FloatingInput label="Numéro de téléphone" type="tel" />
              <FloatingInput label="Adresse e-mail (optionnel)" type="email" required={false} />
              
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-400" /> Paiement sécurisé
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-4 border-blue-600 bg-white"></div>
                  <span className="font-bold text-gray-800">Paiement à la livraison (Cash on Delivery)</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-7">Payez uniquement lorsque vous recevez le produit entre vos mains. Aucun risque.</p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 text-lg font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: btnColor, color: btnTextColor }}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : btnText}
              </button>
            </form>

            {/* Résumé (Optionnel selon layout) */}
            {layout === 'split' && (
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-gray-50 border border-gray-200 p-6 md:p-8 sticky top-24" style={{ borderRadius: `${borderRadius}px` }}>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Résumé de la commande</h3>
                  
                  {/* Article factice */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src="https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=150&q=80" alt="Produit" className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs flex items-center justify-center rounded-full font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">La Prise Intelligente</h4>
                      <p className="text-gray-500 text-xs">Variante: Blanc</p>
                    </div>
                    <div className="font-bold text-gray-900">15 000 FCFA</div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-bold text-gray-900">15 000 FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expédition</span>
                      <span className="font-bold text-green-600">Gratuite</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
                    <span className="font-black text-gray-900 text-lg">Total</span>
                    <div className="text-right">
                      <span className="font-black text-2xl text-gray-900">15 000 FCFA</span>
                      <p className="text-xs text-gray-500 mt-1">Taxes incluses</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
