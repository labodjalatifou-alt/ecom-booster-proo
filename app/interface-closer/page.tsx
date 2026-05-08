"use client";

import React, { useState } from 'react';
import { Headset, PhoneForwarded, MessageSquare, Clock, CheckCircle2, MoreVertical, MapPin, X, Edit3 } from 'lucide-react';

const mockCalls = [
  { id: 1, client: "Amina Diaby", phone: "+2250707123456", product: "Brosse 5-en-1", city: "Abidjan", status: "À Appeler" },
  { id: 2, client: "Sékou Sangaré", phone: "+22366001122", product: "Mini Projecteur", city: "Bamako", status: "Confirmé" },
  { id: 3, client: "Fatou Dramé", phone: "+221770001122", product: "Montre Connectée", city: "Dakar", status: "Rappel" },
  { id: 4, client: "Koffi Mensah", phone: "+233501234567", product: "Brosse 5-en-1", city: "Accra", status: "À Appeler" },
  { id: 5, client: "Mariam Diallo", phone: "+224622001122", product: "Sac Premium", city: "Conakry", status: "Confirmé" },
  { id: 6, client: "Oumar Sow", phone: "+22799001122", product: "Mini Projecteur", city: "Niamey", status: "À Appeler" },
  { id: 7, client: "Aminata C.", phone: "+22890001122", product: "Brosse 5-en-1", city: "Lomé", status: "Confirmé" },
  { id: 8, client: "Ibrahim K.", phone: "+22670001122", product: "Sac Premium", city: "Ouaga", status: "À Appeler" },
  { id: 9, client: "Mariam T.", phone: "+22997001122", product: "Montre Pro", city: "Cotonou", status: "À Appeler" },
  { id: 10, client: "Saliou D.", phone: "+22366001122", product: "Brosse 5-en-1", city: "Bamako", status: "Confirmé" },
];

export default function InterfaceCloserPage() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (phone: string) => { window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank'); };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Headset className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Centre d'Appels</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Suivi Closer</h2>
        </div>

        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Confirmés</span>
            <span className="text-2xl font-black text-emerald-600">128</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Objectif</span>
            <span className="text-2xl font-black text-primary-600">200</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client & Mobile</th>
                <th className="w-[25%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produit</th>
                <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ville</th>
                <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {mockCalls.map((item) => (
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
                  <td className="px-8 py-4 overflow-hidden font-black text-xs text-slate-600 dark:text-slate-300 truncate">{item.product}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {item.city}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === 'Confirmé' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'Rappel' ? 'bg-amber-100 text-amber-700' : 
                      'bg-primary-100 text-primary-700'
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
                        <button onClick={(e) => {e.stopPropagation(); setShowNotesModal(true)}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50">
                          <Edit3 className="w-5 h-5 text-amber-500" /> Note Closer
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); alert('Commande Confirmée !')}} className="w-full flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase text-primary-600 hover:bg-primary-50 transition-colors">
                          <CheckCircle2 className="w-5 h-5" /> Confirmer
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

      {/* Modale Programmer Rappel */}
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

      {/* Modale Notes Closer */}
      {showNotesModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Edit3 className="w-8 h-8 text-amber-500" /> Notes du Closer</h3>
             <textarea placeholder="Ex: Client hésite, rappellera après avoir discuté avec sa femme..." className="w-full p-6 bg-slate-50 rounded-2xl border-none font-bold mb-6 h-32" />
             <button onClick={() => {alert('Note enregistrée !'); setShowNotesModal(false)}} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest">Enregistrer Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
