"use client";

import React from 'react';
import { Users, Search, Filter, Mail, Phone, MoreHorizontal, Star } from 'lucide-react';

const mockClients = [
  { id: 'C-001', name: 'Amina Diaby', email: 'amina.diaby@email.com', phone: '+225 0102030405', totalSpent: '125 000 FCFA', orders: 4, lastOrder: 'Il y a 2 jours', status: 'VIP' },
  { id: 'C-002', name: 'Jean Koffi', email: 'jean.koffi@email.com', phone: '+225 0506070809', totalSpent: '45 000 FCFA', orders: 1, lastOrder: 'Il y a 1 semaine', status: 'Nouveau' },
  { id: 'C-003', name: 'Sarah Koné', email: 'sarah.kone@email.com', phone: '+225 0708091011', totalSpent: '210 000 FCFA', orders: 6, lastOrder: 'Aujourd\'hui', status: 'VIP' },
  { id: 'C-004', name: 'Mamadou Bah', email: 'm.bah@email.com', phone: '+224 622001122', totalSpent: '85 000 FCFA', orders: 2, lastOrder: 'Il y a 1 mois', status: 'Régulier' },
  { id: 'C-005', name: 'Kadiatou Sy', email: 'kadi.sy@email.com', phone: '+221 771234567', totalSpent: '12 000 FCFA', orders: 1, lastOrder: 'Il y a 3 mois', status: 'Inactif' },
];

export default function ClientsPage() {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'VIP': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Nouveau': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Régulier': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            CRM Clients
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gérez vos clients, analysez leur fidélité et optimisez la valeur à vie (LTV).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, téléphone..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full md:w-auto justify-center">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dépensé</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commandes</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockClients.map((client, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 flex items-center justify-center font-bold text-sm">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">{client.name}</span>
                        <span className="text-xs text-slate-500">{client.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {client.email}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {client.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{client.totalSpent}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block">{client.orders} commandes</span>
                    <span className="text-xs text-slate-500">{client.lastOrder}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(client.status)}`}>
                      {client.status === 'VIP' && <Star className="w-3 h-3 fill-current" />}
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
