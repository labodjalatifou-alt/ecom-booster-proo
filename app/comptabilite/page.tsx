"use client";

import React from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Target, Wallet, BarChart3 } from 'lucide-react';
import DatePicker from '@/components/DatePicker';

export default function ComptabilitePage() {
  const stats = [
    { label: "Chiffre d'Affaires", val: "2 450 000 FCFA", sub: "+12.5%", icon: Wallet, color: "emerald", trend: "up" },
    { label: "Dépenses Ads", val: "450 000 FCFA", sub: "18% du CA", icon: Target, color: "blue", trend: "down" },
    { label: "Frais Logistiques", val: "320 000 FCFA", sub: "13% du CA", icon: TrendingDown, color: "amber", trend: "down" },
    { label: "Profit Net", val: "1 680 000 FCFA", sub: "Marge 68%", icon: TrendingUp, color: "purple", trend: "up" },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Calculator className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Trésorerie & Marges</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Comptabilité</h2>
        </div>
        <DatePicker />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-xl font-black tracking-tight">{stat.val}</h3>
              <span className={`text-[10px] font-black flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analyse des Marges */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-600" /> Analyse des Marges
            </h3>
            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Mensuel</span>
          </div>

          <div className="space-y-8 relative z-10">
            {[
              { label: "Bénéfice Brut", val: "85%", color: "bg-emerald-500" },
              { label: "Coût de Vente (COGS)", val: "15%", color: "bg-slate-200 dark:bg-slate-700" },
              { label: "Dépenses Marketing", val: "18%", color: "bg-blue-500" },
              { label: "Logistique & Livraison", val: "12%", color: "bg-amber-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                  <span className="text-lg font-black">{item.val}</span>
                </div>
                <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: item.val }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar ROI */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <PieChart className="absolute top-0 right-0 w-48 h-48 text-white/5 -mr-16 -mt-16 group-hover:rotate-12 transition-transform duration-700" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
              <Target className="w-7 h-7 text-emerald-400" /> ROI Publicitaire
            </h3>
            <div className="text-center relative z-10">
              <div className="text-5xl font-black mb-2 text-emerald-400 tracking-tighter">5.4x</div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Retour sur investissement</p>
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="text-left">
                  <span className="text-[10px] font-black text-white/30 uppercase block mb-1">CPA Moyen</span>
                  <span className="text-sm font-black">1 250 FCFA</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-white/30 uppercase block mb-1">ROAS Global</span>
                  <span className="text-sm font-black">4.82</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
