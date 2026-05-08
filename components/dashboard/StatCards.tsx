"use client";

import React from 'react';
import { DollarSign, Truck, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../StoreProvider';

export default function StatCards() {
  const { currency } = useStore();

  const stats = [
    {
      title: 'CA Livré',
      value: `3 450 000 ${currency}`,
      trend: '+12%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Cash in Transit',
      value: `1 125 000 ${currency}`,
      trend: 'En attente',
      isPositive: null,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      action: "Marquer Reçu"
    },
    {
      title: 'Taux Livraison',
      value: '84%',
      trend: '+2.4%',
      isPositive: true,
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Commandes Shopify',
      value: '142',
      trend: 'À traiter',
      isPositive: null,
      icon: ShoppingBag,
      color: 'bg-primary-100 text-primary-600',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.color} dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              {stat.isPositive !== null && (
                <div className={`flex items-center text-xs font-black uppercase tracking-widest ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.trend}
                </div>
              )}
              {stat.isPositive === null && (
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {stat.trend}
                 </div>
              )}
            </div>
            
            <div className="mt-2">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.title}</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stat.value}</p>
            </div>

            {stat.action && (
              <button 
                onClick={(e) => { e.stopPropagation(); alert('Transfert vers la comptabilité...'); }}
                className="mt-4 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {stat.action}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
