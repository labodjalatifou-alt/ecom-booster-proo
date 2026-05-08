"use client";

import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Eye, MapPin, Phone, DollarSign, Package, X, Globe, User, ArrowRight } from 'lucide-react';

const mockOrders = [
  { id: 1, client: "Awa Diop", phone: "+225 0707123456", product: "Brosse 5-en-1", price: "25 000 F", date: "08 Mai 2026", status: "Confirmé", city: "Abidjan", country: "Côte d'Ivoire", address: "Plateau, Rue des banques, Imm. 5" },
  { id: 2, client: "Moussa Traoré", phone: "+225 0505123456", product: "Mini Projecteur", price: "45 000 F", date: "07 Mai 2026", status: "Livré", city: "Abidjan", country: "Côte d'Ivoire", address: "Cocody Ambassades, Villa 24" },
  { id: 3, client: "Fatou Kane", phone: "+221 770001122", product: "Montre Connectée", price: "35 000 F", date: "07 Mai 2026", status: "À Appeler", city: "Dakar", country: "Sénégal", address: "Plateau, Avenue Maginot" },
];

export default function CommandesPage() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Gestion des Flux</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Toutes les Commandes</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="relative w-full max-w-xs group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
            <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" />
          </div>
          <button className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Mobile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Détails Colis</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {mockOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => {
                    setSelectedOrder(order);
                    setSelectedRow(order.id);
                  }}
                  className={`transition-all cursor-pointer group relative ${
                    selectedRow === order.id ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className={`px-8 py-6 relative ${selectedRow === order.id ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-primary-500' : ''}`}>
                    <div className={`font-black text-base transition-colors ${selectedRow === order.id ? 'text-primary-600' : ''}`}>{order.client}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{order.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200">{order.product}</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary-500 mt-1 uppercase">
                      <MapPin className="w-3 h-3" /> {order.city}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'Livré' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      order.status === 'Annulé' ? 'bg-red-50 text-red-500 border border-red-100' : 
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className={`p-3 rounded-2xl transition-all shadow-sm ${selectedRow === order.id ? 'bg-primary-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de Détails COMPLETE */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary-600 p-8 text-white flex justify-between items-center">
               <h3 className="text-2xl font-black flex items-center gap-3"><ShoppingCart className="w-8 h-8" /> Fiche Commande</h3>
               <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-7 h-7" /></button>
            </div>
            
            <div className="p-10 space-y-8">
               {/* Infos Client */}
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Client</span>
                    <p className="text-lg font-black">{selectedOrder.client}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-end"><Phone className="w-3 h-3" /> Numéro</span>
                    <p className="text-lg font-black text-primary-600">{selectedOrder.phone}</p>
                  </div>
               </div>

               {/* Localisation */}
               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" /> Pays / Ville</span>
                    <span className="text-xs font-black uppercase text-slate-700">{selectedOrder.country} / {selectedOrder.city}</span>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">"{selectedOrder.address}"</p>
                  </div>
               </div>

               {/* Produit & Prix */}
               <div className="flex items-center justify-between p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Package className="w-6 h-6 text-primary-600" /></div>
                    <div>
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block">Produit commandé</span>
                      <p className="text-sm font-black">{selectedOrder.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block">Prix Total</span>
                    <p className="text-xl font-black">{selectedOrder.price}</p>
                  </div>
               </div>

               <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
                  Imprimer le bordereau <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
