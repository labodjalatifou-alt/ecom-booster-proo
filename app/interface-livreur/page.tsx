"use client";

import React, { useState } from 'react';
import { Truck, MapPin, PhoneForwarded, MoreVertical, MessageSquare, Clock, Edit3, X, CheckCircle2, DollarSign } from 'lucide-react';

const mockDeliveries = [
  { id: 1, client: "Awa Diop", product: "Brosse 5-en-1", price: "25 000 F", address: "Plateau, Abidjan", status: "À Livrer", phone: "+2250707123456" },
  { id: 2, client: "Moussa Traoré", product: "Mini Projecteur", price: "45 000 F", address: "Cocody, Abidjan", status: "Livré", phone: "+2250505123456" },
  { id: 3, client: "Fatou Kane", product: "Montre Connectée", price: "35 000 F", address: "Dakar Plateau", status: "Annulé", phone: "+221770001122" },
  { id: 4, client: "Jean Kouassi", product: "Sac Premium", price: "30 000 F", address: "Marcory, Abidjan", status: "À Livrer", phone: "+2250101123456" },
  { id: 5, client: "Saliou Diallo", product: "Brosse 5-en-1", price: "25 000 F", address: "Bamako Coura", status: "Livré", phone: "+22366001122" },
  { id: 6, client: "Kadiatou B.", product: "Écouteurs Pro", price: "15 000 F", address: "Conakry", status: "À Livrer", phone: "+224622001122" },
  { id: 7, client: "Oumar Sow", product: "Mini Projecteur", price: "45 000 F", address: "Niamey", status: "À Livrer", phone: "+22799001122" },
  { id: 8, client: "Aminata C.", product: "Brosse 5-en-1", price: "25 000 F", address: "Lomé", status: "Livré", phone: "+22890001122" },
  { id: 9, client: "Ibrahim K.", product: "Sac Premium", price: "30 000 F", address: "Ouaga", status: "À Livrer", phone: "+22670001122" },
  { id: 10, client: "Mariam T.", product: "Montre Pro", price: "35 000 F", address: "Cotonou", status: "À Livrer", phone: "+22997001122" },
];

export default function InterfaceLivreurPage() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: string) => { window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank'); };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Tableau de Bord Livreur</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Mes Livraisons</h2>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
          <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[200px]">
             <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
             <span className="text-4xl font-black tracking-tighter">45</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Livraisons</span>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center min-w-[200px]">
             <DollarSign className="w-8 h-8 mb-2 text-emerald-400" />
             <span className="text-3xl font-black tracking-tighter">1 125 000 F</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Cash</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Mobile</th>
                <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Colis / Adresse</th>
                <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {mockDeliveries.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => {
                    setActiveMenu(activeMenu === item.id ? null : item.id);
                    setSelectedRow(item.id);
                  }}
                  className={`transition-all cursor-pointer group relative ${
                    selectedRow === item.id ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className={`px-8 py-4 overflow-hidden relative ${selectedRow === item.id ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary-500 before:z-10' : ''}`}>
                    <div className={`font-black text-sm truncate transition-colors ${selectedRow === item.id ? 'text-primary-600' : ''}`}>{item.client}</div>
                    <div className="text-[11px] font-bold text-primary-500 mt-0.5">{item.phone}</div>
                  </td>
                  <td className="px-8 py-4 overflow-hidden">
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{item.product}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5 uppercase truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {item.address}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === 'Livré' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'Annulé' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right relative">
                    <button className={`p-2 rounded-xl transition-all shadow-sm ${selectedRow === item.id ? 'bg-primary-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === item.id && (
                      <div className="absolute right-8 top-full mt-2 w-56 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[100] overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200">
                        <button onClick={(e) => {e.stopPropagation(); handleCall(item.phone)}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <PhoneForwarded className="w-5 h-5 text-emerald-500" /> Appeler
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); handleWhatsApp(item.phone)}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <MessageSquare className="w-5 h-5 text-green-500" /> WhatsApp
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); setShowScheduleModal(true)}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <Clock className="w-5 h-5 text-blue-500" /> Programmer
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); setShowNotesModal(true)}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-amber-600 hover:bg-amber-50 transition-colors">
                          <Edit3 className="w-5 h-5" /> Notes Livreur
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales Simulées */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowScheduleModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Clock className="w-8 h-8 text-blue-500" /> Programmer Rappel</h3>
             <input type="datetime-local" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mb-6" />
             <button onClick={() => {alert('Rappel programmé !'); setShowScheduleModal(false)}} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Confirmer Rappel</button>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Edit3 className="w-8 h-8 text-amber-500" /> Notes du Livreur</h3>
             <textarea placeholder="Ex: Client ne répond pas..." className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold mb-6 h-32" />
             <button onClick={() => {alert('Note enregistrée !'); setShowNotesModal(false)}} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest">Enregistrer Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
